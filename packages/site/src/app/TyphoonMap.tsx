import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, LineLayer, PointLayer, ImageLayer, Marker, Tooltip, Popup, ZoomControl, MapThemeControl, LegendCategories, SatelliteLayer } from '@antv/aimapui';
import type { LayerEventPayload, PopupAttribute } from '@antv/aimapui';

/* ================================================================
   台风路径地图 — 应用模板 Demo
   设计参考：浙江水利台风实时发布系统 https://typhoon.slt.zj.gov.cn/#/
   - 历史路径按等级分段着色，可开启动画
   - 当前台风眼标记 + 7/10/12 级四象限风圈
   - 多家机构预报路径（中国/日本/美国/中国台湾/中国香港）
   - 台风信息卡片 + 等级/风圈图例
   数据来源：浙江水利台风 API（浏览器 CORS 允许，直接 fetch）
   ================================================================ */

// ── 浙江水利台风 API ─────────────────────────────────────────
const API_BASE = 'https://typhoon.slt.zj.gov.cn/Api';
const API_LIST = (year: number) => `${API_BASE}/TyphoonList/${year}`;
const API_INFO = (tfid: string) => `${API_BASE}/TyphoonInfo/${tfid}`;
const API_ACTIVITY = `${API_BASE}/TyhoonActivity`;

// ── 颜色与等级 ─────────────────────────────────────────────
// 等级顺序（由弱到强），用于颜色渐进与图例排序
type GradeKey = 'TD' | 'TS' | 'STS' | 'TY' | 'STY' | 'SuperTY';
const STRENGTH_TO_KEY: Record<string, GradeKey> = {
  热带低压: 'TD',
  热带风暴: 'TS',
  强热带风暴: 'STS',
  台风: 'TY',
  强台风: 'STY',
  超强台风: 'SuperTY',
};
const GRADE_ORDER: GradeKey[] = ['TD', 'TS', 'STS', 'TY', 'STY', 'SuperTY'];
const GRADE_LABEL: Record<GradeKey, string> = {
  TD: '热带低压', TS: '热带风暴', STS: '强热带风暴',
  TY: '台风', STY: '强台风', SuperTY: '超强台风',
};
// 渐进色：浅蓝 → 深蓝 → 紫 → 红，随强度加深
const GRADE_COLOR: Record<GradeKey, string> = {
  TD: '#7dd3fc', TS: '#38bdf8', STS: '#3b82f6', TY: '#8b5cf6', STY: '#f59e0b', SuperTY: '#ef4444',
};
const GRADE_LABELS = GRADE_ORDER.map(g => GRADE_LABEL[g]);
const GRADE_COLORS = GRADE_ORDER.map(g => GRADE_COLOR[g]);

// 风圈 7/10/12 级配色
const WIND_LEVEL_KEY = ['7', '10', '12'] as const;
const WIND_LEVEL_COLOR: Record<string, string> = { '7': '#3b82f6', '10': '#f59e0b', '12': '#ef4444' };

// 预报机构配色
const AGENCIES = ['中国', '中国台湾', '日本', '中国香港', '美国'] as const;
const AGENCY_COLOR: Record<string, string> = {
  中国: '#22d3ee', 中国台湾: '#34d399', 日本: '#f472b6', 中国香港: '#fbbf24', 美国: '#a78bfa',
};

// ── 类型 ─────────────────────────────────────────────────────
interface TyphoonPoint {
  time: string;
  lng: string;
  lat: string;
  strong: string;
  power: string;
  speed: string;
  pressure: string;
  movespeed?: string;
  movedirection?: string;
  radius7?: string;
  radius10?: string;
  radius12?: string;
  // 真实 API 中,每个历史点内嵌"自此点起的预报路径"(按机构分组)
  forecast?: ForecastAgency[];
}
interface ForecastAgency {
  tm: string;
  forecastpoints: TyphoonPoint[];
}
interface TyphoonInfo {
  tfid: string;
  name: string;
  enname: string;
  isactive?: string;
  starttime?: string;
  endtime?: string;
  warnlevel?: string;
  centerlng?: string;
  centerlat?: string;
  points: TyphoonPoint[];
  land?: unknown[];
}
interface TyphoonListItem {
  tfid: string;
  name: string;
  enname: string;
  starttime: string;
  endtime: string;
  isactive: string;
  warnlevel?: string;
}

// ── 工具：四象限半径解析 ───────────────────────────────────
// "NE|SE|SW|NW" → [ne, se, sw, nw]（单位 km；空串 → 0）
function parseRadii(s: string | undefined | null): [number, number, number, number] {
  if (!s) return [0, 0, 0, 0];
  const parts = s.split('|');
  const n = (v?: string) => {
    const num = Number(v);
    return Number.isFinite(num) && num > 0 ? num : 0;
  };
  return [n(parts[0]), n(parts[1]), n(parts[2]), n(parts[3])];
}

// ── 当前年份 ─────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();

// ── 内联兜底样本（API 失败 / 无活跃台风时使用，保证 Demo 不空白） ──
const FALLBACK_INFO: TyphoonInfo = {
  tfid: '202609', name: '巴威', enname: 'BAVI', isactive: '1',
  starttime: '2026-07-02 08:00:00', endtime: '2026-07-10 08:00:00',
  centerlng: '127.60', centerlat: '20.80', warnlevel: 'white', land: [],
  points: [
    { time: '2026-07-04 02:00:00', lng: '149.00', lat: '14.10', strong: '超强台风', power: '17', speed: '58', pressure: '925', movespeed: '26', movedirection: '西北', radius7: '320|300|300|280', radius10: '120|110|110|100', radius12: '50|45|45|40' },
    { time: '2026-07-06 08:00:00', lng: '144.80', lat: '15.10', strong: '超强台风', power: '17', speed: '60', pressure: '920', movespeed: '20', movedirection: '西北', radius7: '350|320|320|300', radius10: '140|120|120|110', radius12: '60|50|50|45' },
    { time: '2026-07-08 08:00:00', lng: '137.50', lat: '16.80', strong: '超强台风', power: '17', speed: '57', pressure: '925', movespeed: '18', movedirection: '西北', radius7: '400|380|360|350', radius10: '180|150|150|140', radius12: '80|60|60|55' },
    { time: '2026-07-09 11:00:00', lng: '129.50', lat: '18.40', strong: '超强台风', power: '16', speed: '52', pressure: '935', movespeed: '19', movedirection: '西北', radius7: '500|500|500|500', radius10: '300|280|300|280', radius12: '180|120|180|120' },
    { time: '2026-07-10 02:00:00', lng: '128.20', lat: '19.90', strong: '强台风', power: '14', speed: '45', pressure: '945', movespeed: '20', movedirection: '西北', radius7: '500|500|450|480', radius10: '300|280|300|280', radius12: '180|120|180|120' },
    // 最新点内嵌"自此点起的预报"(与真实 API 结构一致)
    { time: '2026-07-10 08:00:00', lng: '127.60', lat: '20.80', strong: '强台风', power: '14', speed: '42', pressure: '955', movespeed: '19', movedirection: '北西', radius7: '500|500|450|480', radius10: '300|280|300|280', radius12: '130|110|130|110',
      forecast: [
        { tm: '中国', forecastpoints: [
          { time: '2026-07-10 08:00:00', lng: '127.60', lat: '20.80', strong: '强台风', power: '14', speed: '42', pressure: '955' },
          { time: '2026-07-10 20:00:00', lng: '126.20', lat: '22.40', strong: '台风', power: '13', speed: '40', pressure: '960' },
          { time: '2026-07-11 08:00:00', lng: '122.80', lat: '24.60', strong: '台风', power: '12', speed: '35', pressure: '970' },
          { time: '2026-07-11 20:00:00', lng: '120.10', lat: '26.90', strong: '强热带风暴', power: '10', speed: '25', pressure: '985' },
        ] },
        { tm: '日本', forecastpoints: [
          { time: '2026-07-10 08:00:00', lng: '127.60', lat: '20.80', strong: '强台风', power: '14', speed: '42', pressure: '955' },
          { time: '2026-07-11 08:00:00', lng: '123.50', lat: '24.00', strong: '台风', power: '12', speed: '33', pressure: '975' },
          { time: '2026-07-12 08:00:00', lng: '119.80', lat: '27.50', strong: '强热带风暴', power: '11', speed: '30', pressure: '980' },
        ] },
        { tm: '美国', forecastpoints: [
          { time: '2026-07-10 08:00:00', lng: '127.60', lat: '20.80', strong: '强台风', power: '14', speed: '42', pressure: '955' },
          { time: '2026-07-11 08:00:00', lng: '124.00', lat: '24.40', strong: '台风', power: '12', speed: '34', pressure: '972' },
        ] },
      ] },
  ],
};
const FALLBACK_LIST: TyphoonListItem[] = [
  { tfid: '202609', name: '巴威', enname: 'BAVI', starttime: '2026-07-02 08:00:00', endtime: '2026-07-10 08:00:00', isactive: '1', warnlevel: 'white' },
];

// ── 派生数据形状 ─────────────────────────────────────────────
// 注意:LineLayer path 数据按 L7 约定写在名为 `path` 的字段(见 sourceConfig.coordinates='path'),
// 故字段名为 path 而非 coordinates,否则 srouce extent 解析会抛 "reading '0'"。
interface TrackSegment { path: [number, number][]; grade: GradeKey; }
interface TrackNode { lng: number; lat: number; grade: GradeKey; time: string; strong: string; power: string; speed: string; pressure: string; index: number; }
interface WindPoint { lng: number; lat: number; level: string; quadrant: string; radius: number; }

// ── 气象图层：浙江水利气象 API ────────────────────────────────
// 复用同一 API_BASE；CORS 直连可取（与台风 API 同域）。
// - 云图  LeastCloud?type=1|3|6  → base64 PNG + 边界(minLat/maxLat/minLng/maxLng)
// - 雷达  LastRadar                → 4 片 base64 PNG(radar0_0/0_1/1_0/1_1) + synTime/radarType
// - 降雨  LeastRain/24            → contours(矢量等值线, latAndLong 为 [lat,lng]) + time
// - 风场  LastWind                 → GRIB2 风场数据(暂作占位, 后续接入 L7 WindLayer)
const API_LEASTCLOUD = (type: number) => `${API_BASE}/LeastCloud?type=${type}`;
const API_LASTRADAR = `${API_BASE}/LastRadar`;
const API_LEASTRAIN = `${API_BASE}/LeastRain/24`;

// 单张大图模式(radarType==='2'):全幅雷达拼图边界 [minLng,minLat,maxLng,maxLat]
// (取自浙江水利站点客户端硬编码, 覆盖东亚)
const RADAR_FULL_EXTENT: [number, number, number, number] =
  [69.85883897374661, 12.17563341623027, 140.09971829625096, 54.338914427211094];
// 四象限 tile→extent 映射(2×2 国家拼图, row0 北 row1 南, col0 西 col1 东)
const RADAR_TILES: { key: 'radar0_0' | 'radar0_1' | 'radar1_0' | 'radar1_1'; extent: [number, number, number, number] }[] = [
  // tile 名 → [westLng, southLat, eastLng, northLat]
  { key: 'radar0_0', extent: [67.5, 36.580247, 104.073486, 55.7766] },       // NW
  { key: 'radar0_1', extent: [67.5, 11.1784, 104.073486, 36.580247] },        // SW
  { key: 'radar1_0', extent: [104.073486, 36.580247, 140.625, 55.7766] },    // NE
  { key: 'radar1_1', extent: [104.073486, 11.1784, 140.625, 36.580247] },    // SE
];

interface CloudData { img: string; time: string; extent: [number, number, number, number]; }
interface RadarTileData { img: string; extent: [number, number, number, number]; }
interface RadarData { tiles: RadarTileData[]; time: string; }
interface RainContourItem { path: [number, number][]; color: string; }
interface RainData { contours: RainContourItem[]; time: string; }

async function fetchCloud(type: 1 | 3 | 6 = 1): Promise<CloudData | null> {
  try {
    const r = await fetch(API_LEASTCLOUD(type), { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json() as {
      cloud1h?: string; cloud3h?: string; cloud6h?: string;
      minLat?: string; maxLat?: string; minLng?: string; maxLng?: string;
      timeStr1h?: string; timeStr3h?: string; timeStr6h?: string;
    };
    const imgKey = `cloud${type}h` as 'cloud1h' | 'cloud3h' | 'cloud6h';
    const img = j[imgKey]?.startsWith('data:image') ? j[imgKey] : (j[imgKey] ? `data:image/png;base64,${j[imgKey]}` : undefined);
    if (!img) return null;
    const minLng = Number(j.minLng), minLat = Number(j.minLat), maxLng = Number(j.maxLng), maxLat = Number(j.maxLat);
    if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
    return { img, time: j[`timeStr${type}h` as 'timeStr1h' | 'timeStr3h' | 'timeStr6h'] ?? '', extent: [minLng, minLat, maxLng, maxLat] };
  } catch { return null; }
}

async function fetchRadar(): Promise<RadarData | null> {
  try {
    const r = await fetch(API_LASTRADAR, { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json() as Record<string, string>;
    const synTime = j.synTime ?? '';
    const radarType = j.radarType ?? '1';
    if (radarType === '2' && j.radar0_0?.startsWith('data:image')) {
      return { tiles: [{ img: j.radar0_0, extent: RADAR_FULL_EXTENT }], time: synTime };
    }
    const tiles: RadarTileData[] = [];
    for (const t of RADAR_TILES) {
      const raw = j[t.key];
      if (!raw) continue;
      const img = raw.startsWith('data:image') ? raw : `data:image/png;base64,${raw}`;
      tiles.push({ img, extent: t.extent });
    }
    if (tiles.length === 0) return null;
    return { tiles, time: synTime };
  } catch { return null; }
}

async function fetchRain(): Promise<RainData | null> {
  try {
    const r = await fetch(API_LEASTRAIN, { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json() as { contours?: string; time?: string };
    // contours 是双重编码的 JSON 字符串
    const raw = typeof j.contours === 'string' ? JSON.parse(j.contours) : j.contours;
    if (!Array.isArray(raw)) return null;
    const contours: RainContourItem[] = [];
    for (const c of raw as Array<{ color?: string; latAndLong?: number[][] }>) {
      const ll = c.latAndLong;
      if (!Array.isArray(ll) || ll.length < 2) continue;
      // latAndLong 每点为 [lat, lng] → 转 [lng, lat] 供 L7
      const path = ll.map(p => {
        const lat = Number(p[0]), lng = Number(p[1]);
        return [Number.isFinite(lng) && Number.isFinite(lat) ? lng : NaN, lat] as [number, number];
      }).filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1])) as [number, number][];
      if (path.length < 2) continue;
      const rgba = String(c.color ?? '120,180,255,255').split(',').map(Number);
      const hex = `#${rgba.slice(0, 3).map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join('')}`;
      contours.push({ path, color: hex });
    }
    if (contours.length === 0) return null;
    return { contours, time: j.time ?? '' };
  } catch { return null; }
}

function pointGrade(p: TyphoonPoint): GradeKey {
  return STRENGTH_TO_KEY[p.strong] ?? 'TS';
}

/** 将路径点转为按等级着色的轨迹段 */
function toTrackSegments(points: TyphoonPoint[]): TrackSegment[] {
  const segs: TrackSegment[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const aLng = Number(a.lng), aLat = Number(a.lat), bLng = Number(b.lng), bLat = Number(b.lat);
    if (![aLng, aLat, bLng, bLat].every(Number.isFinite)) continue;
    segs.push({ path: [[aLng, aLat], [bLng, bLat]], grade: pointGrade(b) });
  }
  return segs;
}
/** 路径节点 */
function toNodes(points: TyphoonPoint[]): TrackNode[] {
  return points
    .map((p, i) => {
      const lng = Number(p.lng), lat = Number(p.lat);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      return { lng, lat, grade: pointGrade(p), time: p.time, strong: p.strong, power: p.power, speed: p.speed, pressure: p.pressure, index: i };
    })
    .filter(Boolean) as TrackNode[];
}
/** 某路径点的 7/10/12 级四象限风圈 → 12 个 PointLayer 数据点（半径单位 km） */
function toWindCircles(p: TyphoonPoint | undefined): WindPoint[] {
  if (!p) return [];
  const lng = Number(p.lng), lat = Number(p.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return [];
  const out: WindPoint[] = [];
  const push = (level: string, radii: [number, number, number, number]) => {
    radii.forEach((r, qi) => { if (r > 0) out.push({ lng, lat, level, quadrant: ['NE', 'SE', 'SW', 'NW'][qi], radius: r }); });
  };
  push('7', parseRadii(p.radius7));
  push('10', parseRadii(p.radius10));
  push('12', parseRadii(p.radius12));
  return out;
}
/** 某机构预报路径段 */
function toForecastSegments(agency: ForecastAgency | undefined): TrackSegment[] {
  if (!agency) return [];
  const pts = agency.forecastpoints;
  const segs: TrackSegment[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const aLng = Number(a.lng), aLat = Number(a.lat), bLng = Number(b.lng), bLat = Number(b.lat);
    if (![aLng, aLat, bLng, bLat].every(Number.isFinite)) continue;
    segs.push({ path: [[aLng, aLat], [bLng, bLat]], grade: pointGrade(b) });
  }
  return segs;
}

// ── 台风眼符号 ───────────────────────────────────────────────
function TyphoonEye({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56 }}>
      {/* 旋转外圈 */}
      <div className="typhoon-spin" style={{
        position: 'absolute', width: 56, height: 56, borderRadius: '50%',
        border: `3px solid ${color}`, borderTopColor: 'transparent', borderRightColor: 'transparent',
        opacity: 0.95,
      }} />
      <div className="typhoon-spin-rev" style={{
        position: 'absolute', width: 38, height: 38, borderRadius: '50%',
        border: `2px solid ${color}`, borderBottomColor: 'transparent', borderLeftColor: 'transparent',
        opacity: 0.7,
      }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }} />
      <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.9)', background: 'rgba(0,0,0,0.55)', padding: '1px 6px', borderRadius: 6 }}>{label}</div>
      <style>{`
        @keyframes typhoon-rot { to { transform: rotate(360deg); } }
        .typhoon-spin { animation: typhoon-rot 6s linear infinite; }
        .typhoon-spin-rev { animation: typhoon-rot 4s linear infinite reverse; }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  主组件
// ══════════════════════════════════════════════════════════════
export default function TyphoonMap() {
  const [list, setList] = useState<TyphoonListItem[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [tfid, setTfid] = useState<string>('');
  const [info, setInfo] = useState<TyphoonInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedAgency, setSelectedAgency] = useState<string>('中国');
  const [selectedPointIdx, setSelectedPointIdx] = useState<number>(-1);

  // 气象图层(单选)+ 透明度。weatherLayer: 'none'|'cloud'|'radar'|'rain'|'satellite'|'wind'
  const [weatherLayer, setWeatherLayer] = useState<'none' | 'cloud' | 'radar' | 'rain' | 'satellite' | 'wind'>('none');
  const [weatherOpacity, setWeatherOpacity] = useState(0.7);
  const [cloudType, setCloudType] = useState<1 | 3 | 6>(1);       // 云图时段 1h/3h/6h
  const [cloud, setCloud] = useState<CloudData | null>(null);
  const [radar, setRadar] = useState<RadarData | null>(null);
  const [rain, setRain] = useState<RainData | null>(null);
  const [satellite, setSatellite] = useState(false);              // 卫星底图开关(复用 SatelliteLayer)
  const weatherLoading = useRef(false);

  // 点击线路 / 节点显示的 Popup(同一时间仅一个)
  interface PopupData {
    lng: number; lat: number;
    title: string; statusLabel: string; statusColor: string;
    attrs: PopupAttribute[];
  }
  const [popup, setPopup] = useState<PopupData | null>(null);

  const sceneRef = useRef<Scene | null>(null);
  const hoverRef = useRef<{ lng: number; lat: number; time: string; strong: string; power: string; speed: string; pressure: string } | null>(null);
  const [tooltip, setTooltip] = useState({ visible: false, lng: 0, lat: 0, time: '', strong: '', power: '', speed: '', pressure: '' });

  // 0. 气象图层按需拉取(切换图层时触发, 同一图层缓存不重复请求)
  useEffect(() => {
    if (weatherLayer === 'cloud' && !cloud) {
      weatherLoading.current = true;
      fetchCloud(cloudType).then(d => { if (d) setCloud(d); });
    } else if (weatherLayer === 'radar' && !radar) {
      weatherLoading.current = true;
      fetchRadar().then(d => { if (d) setRadar(d); });
    } else if (weatherLayer === 'rain' && !rain) {
      weatherLoading.current = true;
      fetchRain().then(d => { if (d) setRain(d); });
    }
  }, [weatherLayer, cloudType, cloud, radar, rain]); // eslint-disable-line react-hooks/exhaustive-deps

  // 云图时段切换(1h/3h/6h) → 重新拉取
  useEffect(() => { if (weatherLayer === 'cloud') setCloud(null); }, [cloudType]);

  // 1. 拉取当年台风列表
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // 活跃台风（用于标记当前活跃项）
      let active: string[] = [];
      try {
        const ar = await fetch(API_ACTIVITY, { cache: 'no-store' });
        if (ar.ok) {
          const aj = await ar.json() as TyphoonListItem[];
          active = (Array.isArray(aj) ? aj : []).map(t => t.tfid);
        }
      } catch { /* ignore */ }
      try {
        const r = await fetch(API_LIST(CURRENT_YEAR), { cache: 'no-store' });
        if (!r.ok) throw new Error('list');
        const j = (await r.json()) as TyphoonListItem[];
        if (cancelled) return;
        const arr = Array.isArray(j) ? j : [];
        if (arr.length === 0) throw new Error('empty');
        setList(arr);
        setActiveIds(active);
        // 默认选中活跃台风；否则按 starttime 最新
        const chosen = active[0] ?? [...arr].sort((a, b) => (b.starttime || '').localeCompare(a.starttime || ''))[0]?.tfid;
        setTfid(chosen ?? arr[0].tfid);
        setError(false);
      } catch {
        if (cancelled) return;
        setList(FALLBACK_LIST);
        setActiveIds(['202609']);
        setTfid('202609');
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 2. 选中 tfid → 拉取详情
  useEffect(() => {
    if (!tfid) return;
    let cancelled = false;
    (async () => {
      // 先用内置样本占位，避免切换瞬间空白
      if (tfid === FALLBACK_INFO.tfid) setInfo(FALLBACK_INFO);
      try {
        const r = await fetch(API_INFO(tfid), { cache: 'no-store' });
        if (!r.ok) throw new Error('info');
        const j = (await r.json()) as TyphoonInfo;
        if (cancelled) return;
        if (j && Array.isArray(j.points) && j.points.length > 0) {
          setInfo(j);
          setError(false);
        } else {
          throw new Error('empty');
        }
      } catch {
        if (cancelled) return;
        setInfo(FALLBACK_INFO);
        setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [tfid]);

  // 3. 派生数据
  const points = info?.points ?? [];
  const trackSegments = useMemo(() => toTrackSegments(points), [points]);
  const nodes = useMemo(() => toNodes(points), [points]);
  const currentIdx = points.length - 1;
  const selectedIdx = selectedPointIdx >= 0 && selectedPointIdx < points.length ? selectedPointIdx : currentIdx;
  const selectedPoint = points[selectedIdx];
  const currentPoint = points[currentIdx];

  const windSource = useMemo(() => toWindCircles(selectedPoint), [selectedPoint]);
  // PointLayer 的 size 需为米（isMeter）；半径 km → 米
  const windSourceMeter = useMemo(() => windSource.map(w => ({ ...w, radiusM: w.radius * 1000 })), [windSource]);

  // 真实 API 的预报挂在"被选中的历史点"上(从此点起的未来路径)。
  // 机构选择用于"高亮"某一家;所有机构路径始终同图显示以便横向对比。
  const forecastSrc = useMemo(
    () => selectedPoint?.forecast ?? currentPoint?.forecast ?? [],
    [selectedPoint, currentPoint],
  );
  const presentAgencies = useMemo(() => new Set(forecastSrc.map(f => f.tm)), [forecastSrc]);
  // 选中机构的预报段(高亮:粗实、本机构色)
  const activeForecastSegs = useMemo(() => {
    const a = forecastSrc.find(f => f.tm === selectedAgency);
    return toForecastSegments(a).map(s => ({ path: s.path, agency: selectedAgency }));
  }, [forecastSrc, selectedAgency]);
  // 其余机构的预报段(淡显:细虚、本机构色半透明)
  const otherForecastSegs = useMemo(() => {
    const out: { path: [number, number][]; agency: string }[] = [];
    for (const a of forecastSrc) {
      if (a.tm === selectedAgency) continue;
      for (const seg of toForecastSegments(a)) out.push({ path: seg.path, agency: a.tm });
    }
    return out;
  }, [forecastSrc, selectedAgency]);

  // 4. scene 控制：切台风时 fitBounds 到轨迹
  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || trackSegments.length === 0) return;
    const coords = points.map(p => [Number(p.lng), Number(p.lat)] as [number, number]).filter(c => Number.isFinite(c[0]) && Number.isFinite(c[1]));
    if (coords.length === 0) return;
    const lngs = coords.map(c => c[0]), lats = coords.map(c => c[1]);
    const pad = 4;
    scene.fitBounds(
      [[Math.min(...lngs) - pad, Math.min(...lats) - pad], [Math.max(...lngs) + pad, Math.max(...lats) + pad]],
      { padding: [80, 80, 80, 80] },
    );
    setSelectedPointIdx(-1);
  }, [tfid, trackSegments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // 5. 节点 hover / click
  const handleNodeHover = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (!f) return;
    hoverRef.current = {
      lng: payload.lng, lat: payload.lat,
      time: String(f.time ?? ''), strong: String(f.strong ?? ''), power: String(f.power ?? ''),
      speed: String(f.speed ?? ''), pressure: String(f.pressure ?? ''),
    };
    setTooltip({ visible: true, ...hoverRef.current });
  }, []);
  const handleNodeLeave = useCallback(() => setTooltip(t => ({ ...t, visible: false })), []);
  const handleNodeClick = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (!f) return;
    if (typeof f.index === 'number') setSelectedPointIdx(f.index);
    const lng = payload.lng, lat = payload.lat;
    const strong = String(f.strong ?? ''), power = String(f.power ?? ''), speed = String(f.speed ?? ''),
      pressure = String(f.pressure ?? ''), time = String(f.time ?? '');
    const key = STRENGTH_TO_KEY[strong] ?? 'TS';
    setPopup({
      lng, lat,
      title: info?.name ?? '台风', statusLabel: strong, statusColor: GRADE_COLOR[key],
      attrs: [
        { label: '时间', value: time.slice(5) || '—' },
        { label: '风力', value: power ? `${power}级` : '—', valueColor: GRADE_COLOR[key] },
        { label: '风速', value: speed ? `${speed}m/s` : '—' },
        { label: '中心气压', value: pressure ? `${pressure}hPa` : '—' },
        { label: '经度', value: `${Number(lng).toFixed(1)}°` },
        { label: '纬度', value: `${Number(lat).toFixed(1)}°` },
      ],
    });
  }, [info]);

  // 预报线路点击 → 显示该机构预报 Popup
  const handleForecastClick = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    const agencyName = String(f?.agency ?? selectedAgency);
    setPopup({
      lng: payload.lng, lat: payload.lat,
      title: `${agencyName} 预报路径`, statusLabel: '预报', statusColor: AGENCY_COLOR[agencyName],
      attrs: [
        { label: '机构', value: agencyName },
        { label: '路径类型', value: '预报(虚线)' },
        { label: '经度', value: `${Number(payload.lng).toFixed(1)}°` },
        { label: '纬度', value: `${Number(payload.lat).toFixed(1)}°` },
      ],
    });
  }, [selectedAgency]);

  // ── UI 颜色常量 ──
  const C = {
    bg: '#0f172a', panel: 'rgba(15,23,42,0.82)', border: 'rgba(56,189,248,0.15)',
    fg: '#e2e8f0', muted: 'rgba(148,163,184,0.7)', accent: '#22d3ee',
  };
  const eyeColor = currentPoint ? GRADE_COLOR[pointGrade(currentPoint)] : C.accent;
  const eyeLng = currentPoint ? Number(currentPoint.lng) : NaN;
  const eyeLat = currentPoint ? Number(currentPoint.lat) : NaN;
  const selectedWind = selectedPoint ? {
    strong: selectedPoint.strong, power: selectedPoint.power,
    lng: Number(selectedPoint.lng), lat: Number(selectedPoint.lat), time: selectedPoint.time,
  } : null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── 地图 ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AiMap
          map={{ basemap: 'gaode', center: [127.6, 20.8], zoom: 4, pitch: 12, style: satellite ? 'light' : 'dark' }}
          onSceneReady={handleSceneReady}
        >
          {/* ⓪ 气象覆盖层(置于最底,zIndex=-1,在台风轨迹之下) */}
          {/* 卫星底图切换:开启时叠加高德影像 */
          satellite && (<SatelliteLayer provider="gaode" zIndex={-2} opacity={0.95} />)}
          {/* 云图(base64 PNG + 边界 extent) */
          weatherLayer === 'cloud' && cloud && (
            <ImageLayer
              source={cloud.img}
              sourceType="image"
              sourceConfig={{ parser: { type: 'image', extent: cloud.extent } }}
              style={{ opacity: weatherOpacity } as Record<string, unknown>}
              zIndex={-1}
            />
          )}
          {/* 雷达(多片拼接, radarType=2 单片) */
          weatherLayer === 'radar' && radar && radar.tiles.map((t, i) => (
            <ImageLayer
              key={`radar-${i}`}
              source={t.img}
              sourceType="image"
              sourceConfig={{ parser: { type: 'image', extent: t.extent } }}
              style={{ opacity: weatherOpacity } as Record<string, unknown>}
              zIndex={-1}
            />
          ))}
          {/* 降雨(矢量等值线, LineLayer path + colorField=color) */
          weatherLayer === 'rain' && rain && (() => {
            const contourColors = [...new Set(rain.contours.map(c => c.color))];
            return (
              <LineLayer
                source={rain.contours as unknown as { path: [number, number][]; color: string }[]}
                sourceType="json"
                sourceConfig={{ coordinates: 'path' }}
                shape="line"
                size={1.2}
                colorField="color"
                colorValues={contourColors}
                style={{ opacity: weatherOpacity } as Record<string, unknown>}
                zIndex={-1}
              />
            );
          })()}
          {/* 风场占位(数据为 GRIB, 暂未接入 L7 WindLayer 粒子) */}

          {/* ① 风圈（公里半径整圆，随缩放自适应） */}
          {windSourceMeter.length > 0 && (
            <PointLayer
              source={windSourceMeter}
              sourceType="json"
              sourceConfig={{ x: 'lng', y: 'lat' }}
              shape="circle"
              sizeField="radiusM"
              colorField="level"
              colorValues={WIND_LEVEL_KEY.map(k => WIND_LEVEL_COLOR[k])}
              style={{ isMeter: true, opacity: 0.85, stroke: '#fff', strokeWidth: 0 } as Record<string, unknown>}
              zIndex={0}
            />
          )}
          {/* ② 历史轨迹段（实线，按等级着色，无动画） */}
          {trackSegments.length > 0 && (
            <LineLayer
              source={trackSegments}
              sourceType="json"
              sourceConfig={{ coordinates: 'path' }}
              shape="line"
              size={2.5}
              colorField="grade"
              colorValues={GRADE_ORDER.map(g => GRADE_COLOR[g])}
              zIndex={1}
            />
          )}
          {/* ③ 其他机构预报路径（全显示，淡色长虚线便于横向对比） */}
          {otherForecastSegs.length > 0 && (
            <LineLayer
              source={otherForecastSegs}
              sourceType="json"
              sourceConfig={{ coordinates: 'path' }}
              shape="line"
              size={3}
              colorField="agency"
              colorValues={AGENCIES.filter(a => a !== selectedAgency).map(a => AGENCY_COLOR[a])}
              style={{ opacity: 0.55, lineType: 'dash', dashArray: [8, 8] } as Record<string, unknown>}
              onClick={handleForecastClick}
              zIndex={1}
            />
          )}
          {/* ③' 选中机构预报路径（粗虚线高亮） */}
          {activeForecastSegs.length > 0 && (
            <LineLayer
              source={activeForecastSegs}
              sourceType="json"
              sourceConfig={{ coordinates: 'path' }}
              shape="line"
              size={4}
              colorField="agency"
              colorValues={[AGENCY_COLOR[selectedAgency]]}
              style={{ opacity: 0.95, lineType: 'dash', dashArray: [12, 8] } as Record<string, unknown>}
              active={{ color: '#fff' }}
              onClick={handleForecastClick}
              zIndex={2}
            />
          )}
          {/* ④ 路径节点（按等级着色） */}
          {nodes.length > 0 && (
            <PointLayer
              source={nodes}
              sourceType="json"
              sourceConfig={{ x: 'lng', y: 'lat' }}
              shape="circle"
              size={5}
              colorField="grade"
              colorValues={GRADE_ORDER.map(g => GRADE_COLOR[g])}
              active={{ color: '#fff' }}
              onMouseMove={handleNodeHover}
              onMouseLeave={handleNodeLeave}
              onClick={handleNodeClick}
              zIndex={2}
            />
          )}

          {/* ⑤ 台风眼 */}
          {Number.isFinite(eyeLng) && Number.isFinite(eyeLat) && (
            <Marker
              longitude={eyeLng}
              latitude={eyeLat}
              anchor="center"
              offsets={[0, -4]}
              content={<TyphoonEye color={eyeColor} label={info?.name ?? ''} />}
            />
          )}

          {/* ⑥ 节点 Tooltip */}
          <Tooltip
            longitude={tooltip.lng}
            latitude={tooltip.lat}
            variant="dark"
            visible={tooltip.visible}
            items={[
              { label: '时间', value: tooltip.time },
              { label: '强度', value: tooltip.strong },
              { label: '风力', value: tooltip.power ? `${tooltip.power}级` : '' },
              { label: '风速', value: tooltip.speed ? `${tooltip.speed}m/s` : '' },
              { label: '气压', value: tooltip.pressure ? `${tooltip.pressure}hPa` : '' },
            ]}
          />

          {/* ⑦ 点击线路 / 节点显示的 Popup(同一时间仅一个) */}
          {popup && (
            <Popup
              longitude={popup.lng}
              latitude={popup.lat}
              size="standard"
              singleton
              closeButton
              visible
              onClose={() => setPopup(null)}
              header={{ title: popup.title, statusLabel: popup.statusLabel, statusColor: popup.statusColor }}
              attributes={popup.attrs}
            />
          )}

          <ZoomControl position="bottomright" showZoom />
          <MapThemeControl position="topright" />
        </AiMap>
      </div>

      {/* ════════ 顶部标题栏 ════════ */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '12px 16px', background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0) 100%)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.accent, pointerEvents: 'auto' }}>cyclone</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>台风路径图</span>
          <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{CURRENT_YEAR} 年 西太平洋</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: C.muted, pointerEvents: 'auto' }}>数据来源:浙江水利 typhoon.slt.zj.gov.cn</span>
          {error && (
            <span style={{ fontSize: 10, color: '#fca5a5', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: 6, pointerEvents: 'auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: 'middle' }}>wifi_off</span> 使用内置样本
            </span>
          )}
        </div>
      </div>

      {/* ════════ 左上：台风信息卡 + 列表 ════════ */}
      <div style={{ position: 'absolute', top: 56, left: 12, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 8, width: 240, maxHeight: 'calc(100% - 80px)' }}>
        {/* 台风信息卡 */}
        {currentPoint && (
          <div style={{
            padding: '12px 14px', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: eyeColor }}>cyclone</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>{info?.name}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{info?.enname} · {info?.tfid}</div>
              </div>
              {info?.isactive === '1' && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: 6 }}>活跃</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: eyeColor, background: `${eyeColor}22`, padding: '3px 8px', borderRadius: 6 }}>{currentPoint.strong}</span>
              <span style={{ fontSize: 10, color: C.muted }}>{currentPoint.power}级 · {currentPoint.speed}m/s</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: 11 }}>
              <Info label="经度" value={`${Number(currentPoint.lng).toFixed(1)}°`} />
              <Info label="纬度" value={`${Number(currentPoint.lat).toFixed(1)}°`} />
              <Info label="中心气压" value={`${currentPoint.pressure}hPa`} />
              <Info label="移速" value={currentPoint.movespeed ? `${currentPoint.movespeed}km/h` : '—'} />
              <Info label="移向" value={currentPoint.movedirection || '—'} />
              <Info label="时间" value={currentPoint.time?.slice(5) || '—'} />
            </div>
          </div>
        )}

        {/* 台风列表选择器 */}
        <div style={{
          padding: '8px 10px', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.border}`, borderRadius: 12, flex: 1, overflowY: 'auto', minHeight: 0,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>format_list_bulleted</span>
            台风列表（{list.length}）
          </div>
          {loading && <div style={{ fontSize: 11, color: C.muted, padding: '4px 0' }}>加载中…</div>}
          {list.map(t => {
            const sel = t.tfid === tfid;
            const actv = activeIds.includes(t.tfid) || t.isactive === '1';
            return (
              <div key={t.tfid} onClick={() => setTfid(t.tfid)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', margin: '2px 0', borderRadius: 6,
                cursor: 'pointer', fontSize: 11,
                background: sel ? 'rgba(34,211,238,0.12)' : 'transparent',
                color: sel ? '#e0f2fe' : 'rgba(203,213,225,0.75)', fontWeight: sel ? 600 : 400,
                transition: 'background 120ms',
              }}
              onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
              onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = 'transparent'; } }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: actv ? '#22c55e' : 'rgba(148,163,184,0.4)', boxShadow: actv ? '0 0 6px #22c55e' : 'none', flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                <span style={{ fontSize: 9, color: C.muted, flexShrink: 0 }}>{t.tfid.slice(-3)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════ 右上：预报机构 + 动画开关 ════════ */}
      <div style={{ position: 'absolute', top: 56, right: 12, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* 预报机构 */}
        <div style={{
          padding: '10px 12px', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: 148,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>预报机构(全部显示)</div>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>点选高亮某一机构</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {AGENCIES.map(a => {
              const sel = a === selectedAgency;
              const present = presentAgencies.has(a);
              return (
                <button key={a} onClick={() => setSelectedAgency(a)} disabled={!present} style={{
                  padding: '4px 8px', borderRadius: 6, border: 'none', cursor: present ? 'pointer' : 'default',
                  fontSize: 11, fontWeight: 500, transition: 'all 0.15s',
                  background: sel ? `${AGENCY_COLOR[a]}22` : 'transparent',
                  color: sel ? AGENCY_COLOR[a] : (present ? 'rgba(148,163,184,0.6)' : 'rgba(148,163,184,0.3)'),
                }}>
                  {a}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════ 右中：气象图层切换 ════════ */}
      <div style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', zIndex: 20 }}>
        <div style={{
          padding: '10px 12px', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: 168,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>气象图层</div>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>单选叠加 · 高德底图</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {([
              { k: 'none', label: '无', icon: 'block' },
              { k: 'cloud', label: '云图', icon: 'cloud' },
              { k: 'radar', label: '雷达', icon: 'radar' },
              { k: 'rain', label: '降雨', icon: 'rainy' },
              { k: 'satellite', label: '卫星', icon: 'satellite_alt' },
              { k: 'wind', label: '风场', icon: 'air', disabled: true },
            ] as { k: typeof weatherLayer; label: string; icon: string; disabled?: boolean }[]).map(o => {
              const sel = weatherLayer === o.k;
              return (
                <button key={o.k} onClick={() => {
                  setWeatherLayer(o.k as typeof weatherLayer);
                  if (o.k === 'satellite') setSatellite(true);
                  else if (o.k !== 'none') setSatellite(false);
                }} title={o.disabled ? '风场(开发中)' : o.label} style={{
                  padding: '6px 2px', borderRadius: 6, border: 'none', cursor: o.disabled ? 'not-allowed' : 'pointer',
                  fontSize: 10, fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  opacity: o.disabled ? 0.35 : 1, transition: 'all 0.15s',
                  background: sel ? 'rgba(34,211,238,0.18)' : 'transparent',
                  color: sel ? C.accent : 'rgba(148,163,184,0.7)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{o.icon}</span>{o.label}
                </button>
              );
            })}
          </div>
          {/* 云图时段切换 */
          weatherLayer === 'cloud' && (
            <div style={{ marginTop: 8, display: 'flex', gap: 4, fontSize: 10 }}>
              {([1, 3, 6] as const).map(h => (
                <button key={h} onClick={() => setCloudType(h)} style={{
                  flex: 1, padding: '3px 0', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 500,
                  background: cloudType === h ? 'rgba(34,211,238,0.18)' : 'transparent',
                  color: cloudType === h ? C.accent : 'rgba(148,163,184,0.7)',
                }}>{h}h</button>
              ))}
            </div>
          )}
          {/* 透明度(非"无"且非卫星底图时) */
          weatherLayer !== 'none' && weatherLayer !== 'satellite' && (
            <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.muted, marginBottom: 4 }}>
                <span>透明度</span><span>{Math.round(weatherOpacity * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={weatherOpacity} onChange={e => setWeatherOpacity(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.accent, height: 4 }} />
            </div>
          )}
          {/* 数据时间 */
          (weatherLayer === 'cloud' && cloud?.time) || (weatherLayer === 'radar' && radar?.time) || (weatherLayer === 'rain' && rain?.time) ? (
            <div style={{ marginTop: 8, fontSize: 9, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: 'middle' }}>schedule</span>{' '}
              {weatherLayer === 'cloud' ? cloud?.time : weatherLayer === 'radar' ? radar?.time : rain?.time}
            </div>
          ) : null}
          {weatherLayer === 'wind' && (
            <div style={{ marginTop: 8, fontSize: 9, color: '#fca5a5' }}>风场粒子层开发中</div>
          )}
        </div>
      </div>

      {/* ════════ 右下：等级 + 风圈图例 ════════ */}
      <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ padding: '10px 12px', background: C.panel, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <LegendCategories type="categories" title="台风等级" labels={GRADE_LABELS} colors={GRADE_COLORS} swatchShape="circle" />
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>风圈等级</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {WIND_LEVEL_KEY.map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: `${WIND_LEVEL_COLOR[k]}33`, border: `1.5px solid ${WIND_LEVEL_COLOR[k]}` }} />
                  <span style={{ fontSize: 11, color: '#cbd5e1' }}>{k} 级风圈</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>机构预报</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {AGENCIES.map(a => {
                const sel = a === selectedAgency;
                const present = presentAgencies.has(a);
                return (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: present ? 1 : 0.3 }}>
                    <div style={{ width: 18, height: 0, borderTop: `${sel ? 3 : 2}px solid ${AGENCY_COLOR[a]}`, opacity: sel ? 1 : 0.5 }} />
                    <span style={{ fontSize: 11, color: sel ? '#e2e8f0' : '#94a3b8', fontWeight: sel ? 600 : 400 }}>{a}{sel ? ' (高亮)' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ════════ 左下：选中历史点提示 ════════ */}
      {selectedWind && selectedIdx !== currentIdx && (
        <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 20, padding: '8px 12px', background: C.panel, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#f59e0b' }}>history</span>
          <span>历史点 · {selectedWind.time.slice(5)} · {selectedWind.strong} {selectedWind.power}级</span>
          <button onClick={() => setSelectedPointIdx(-1)} style={{ marginLeft: 4, padding: 0, border: 'none', background: 'none', color: C.muted, cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── 小信息项 ──
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.6)' }}>{label}</div>
      <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
