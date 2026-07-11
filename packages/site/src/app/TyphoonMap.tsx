import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, LineLayer, PointLayer, FillLayer, ImageLayer, Marker, Tooltip, Popup, ZoomControl, MapThemeControl, LegendCategories, SatelliteLayer, SatelliteLayerControl } from '@antv/aimapui';
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
interface WindPolygon { coordinates: [number, number][][]; level: string; }

// ── 气象图层：浙江水利气象 API ────────────────────────────────
// 复用同一 API_BASE；CORS 直连可取（与台风 API 同域）。
// - 云图  LeastCloud?type=1|3|6  → base64 PNG + 边界(minLat/maxLat/minLng/maxLng)
// - 雷达  LastRadar                → 4 片 base64 PNG(radar0_0/0_1/1_0/1_1) + synTime/radarType
// - 降雨  LeastRain/24            → contours(矢量等值线, latAndLong 为 [lat,lng]) + time
// - 风场  LastWind                 → GRIB2 风场数据(L7 WindLayer 粒子动画)
const API_LEASTCLOUD = (type: number) => `${API_BASE}/LeastCloud?type=${type}`;
const API_LASTRADAR = `${API_BASE}/LastRadar`;
const API_LEASTRAIN = (hours: number) => `${API_BASE}/LeastRain/${hours}`;
const API_LASTWIND = `${API_BASE}/LastWind`;

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
interface RainFeature { type: 'Feature'; properties: { color: string; symbol: string }; geometry: { type: 'Polygon'; coordinates: [number, number][][] } }
interface RainData { features: RainFeature[]; colors: string[]; time: string; colorToSymbol: Record<string, string>; }

// 风场数据：GRIB2 → 转换为风场图片后供 WindLayer 使用
interface WindData {
  imageUrl: string;       // 风场图片 URL (RGBA 编码 U/V 分量)
  time: string;
  extent: [number, number, number, number];  // [minLng, minLat, maxLng, maxLat]
  uMin: number; uMax: number;  // U 分量范围
  vMin: number; vMax: number;  // V 分量范围
}

async function fetchCloud(type: 0.5 | 1 | 3 | 6 = 1): Promise<CloudData | null> {
  try {
    const r = await fetch(API_LEASTCLOUD(type), { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json() as Record<string, string | undefined>;
    // 0.5h → cloud05h / timeStr05h, 其他 → cloud1h / timeStr1h 等
    const typeKey = type === 0.5 ? '05' : String(type);
    const imgKey = `cloud${typeKey}h`;
    const timeKey = `timeStr${typeKey}h`;
    const img = j[imgKey]?.startsWith('data:image') ? j[imgKey] : (j[imgKey] ? `data:image/png;base64,${j[imgKey]}` : undefined);
    if (!img) return null;
    const minLng = Number(j.minLng), minLat = Number(j.minLat), maxLng = Number(j.maxLng), maxLat = Number(j.maxLat);
    if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
    return { img, time: j[timeKey] ?? '', extent: [minLng, minLat, maxLng, maxLat] };
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

async function fetchRain(hours: number = 24): Promise<RainData | null> {
  try {
    const r = await fetch(API_LEASTRAIN(hours), { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json() as { contours?: string; time?: string };
    // contours 是双重编码的 JSON 字符串
    const raw = typeof j.contours === 'string' ? JSON.parse(j.contours) : j.contours;
    if (!Array.isArray(raw)) return null;
    const features: RainFeature[] = [];
    const colorSet = new Set<string>();
    const colorToSymbol: Record<string, string> = {};
    for (const c of raw as Array<{ color?: string; latAndLong?: number[][]; symbol?: string }>) {
      const ll = c.latAndLong;
      if (!Array.isArray(ll) || ll.length < 3) continue;
      // latAndLong 每点为 [lat, lng] → 转 [lng, lat] 供 L7, 并闭合环
      const ring: [number, number][] = ll.map(p => {
        const lat = Number(p[0]), lng = Number(p[1]);
        return [Number.isFinite(lng) && Number.isFinite(lat) ? lng : NaN, lat] as [number, number];
      }).filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1])) as [number, number][];
      if (ring.length < 3) continue;
      // 闭合多边形(首尾连接, GeoJSON 规范)
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ring.push(ring[0]);
      const rgba = String(c.color ?? '120,180,255,255').split(',').map(Number);
      const hex = `#${rgba.slice(0, 3).map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join('')}`;
      colorSet.add(hex);
      const sym = String(c.symbol ?? '0');
      colorToSymbol[hex] = sym;
      features.push({
        type: 'Feature',
        properties: { color: hex, symbol: sym },
        geometry: { type: 'Polygon', coordinates: [ring] },
      });
    }
    if (features.length === 0) return null;
    return { features, colors: [...colorSet], time: j.time ?? '', colorToSymbol };
  } catch { return null; }
}

// ── 风场：GRIB2 数值 → 风场图片 (RGBA 编码 U/V) ──────────────
// 参考 L7 WindLayer 源码，图片的 RGBA 通道编码风速：
// R → U 分量 (东西向), G → V 分量 (南北向)
// 浙江水利 API 返回 GRIB2 格式：360×181 网格，1° 分辨率，覆盖全球
interface WindGribHeader {
  nx: number; ny: number;      // 网格尺寸
  lo1: number; la1: number;    // 起始经度、纬度
  dx: number; dy: number;      // 步长
  parameterNumberName: string;  // U-component_of_wind / V-component_of_wind
  parameterUnit: string;
}
interface WindGribResponse {
  header: WindGribHeader;
  data: number[];  // 扁平数组 nx * ny 个值
}

/** 将 U/V 数值数组编码为风场图片 (RGBA) */
function windDataToImage(uData: number[], vData: number[], nx: number, ny: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = nx;
  canvas.height = ny;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  const imageData = ctx.createImageData(nx, ny);
  const pixels = imageData.data;

  // 计算 U/V 范围用于归一化
  let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
  for (let i = 0; i < uData.length; i++) {
    const u = uData[i], v = vData[i];
    if (u < uMin) uMin = u;
    if (u > uMax) uMax = u;
    if (v < vMin) vMin = v;
    if (v > vMax) vMax = v;
  }

  const uRange = uMax - uMin || 1;
  const vRange = vMax - vMin || 1;

  // 编码：R = 归一化 U, G = 归一化 V
  for (let i = 0; i < uData.length; i++) {
    const idx = i * 4;
    const uNorm = ((uData[i] - uMin) / uRange) * 255;
    const vNorm = ((vData[i] - vMin) / vRange) * 255;
    pixels[idx] = uNorm;     // R
    pixels[idx + 1] = vNorm; // G
    pixels[idx + 2] = 0;     // B
    pixels[idx + 3] = 255;   // A
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/** 获取风场数据 (U/V 分量) 并转换为图片 */
async function fetchWind(): Promise<WindData | null> {
  try {
    const res = await fetch(API_LASTWIND, { cache: 'no-store' });
    if (!res.ok) return null;

    const json = await res.json();
    const rawWindData = json.windData;

    // windData 是 JSON 字符串，解析后是数组 [U分量, V分量]
    const windArray = typeof rawWindData === 'string' ? JSON.parse(rawWindData) : rawWindData;
    if (!Array.isArray(windArray) || windArray.length < 2) return null;

    const uItem = windArray[0];
    const vItem = windArray[1];
    const uHeader = uItem.header;
    const vHeader = vItem.header;

    // 验证网格一致性
    if (uHeader.nx !== vHeader.nx || uHeader.ny !== vHeader.ny) return null;

    const nx = uHeader.nx;
    const ny = uHeader.ny;

    // 转换为图片
    const imageUrl = windDataToImage(uItem.data, vItem.data, nx, ny);
    if (!imageUrl) return null;

    // 计算 extent (全球风场: 0°~360° 经度, 90°~-90° 纬度)
    const minLng = uHeader.lo1;
    const maxLng = uHeader.lo2;
    const maxLat = uHeader.la1;
    const minLat = uHeader.la2;

    return {
      imageUrl,
      time: json.synTime ?? '',
      extent: [minLng, minLat, maxLng, maxLat],
      uMin: -21.32,
      uMax: 26.8,
      vMin: -21.57,
      vMax: 21.42,
    };
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
/** 某路径点的 7/10/12 级四象限风圈 → GeoJSON Polygon 数组（每个等级一个完整外环） */
function toWindPolygons(p: TyphoonPoint | undefined): WindPolygon[] {
  if (!p) return [];
  const lng = Number(p.lng), lat = Number(p.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return [];
  const out: WindPolygon[] = [];
  // 四象限角度范围（从正北顺时针）: NE=0-90, SE=90-180, SW=180-270, NW=270-360
  const QUADRANT_ANGLES: [number, number][] = [[0, 90], [90, 180], [180, 270], [270, 360]];
  const buildArc = (centerLng: number, centerLat: number, radiusKm: number, startDeg: number, endDeg: number): [number, number][] => {
    const points: [number, number][] = [];
    const steps = Math.max(8, Math.round((endDeg - startDeg) / 5));
    for (let i = 0; i <= steps; i++) {
      const deg = startDeg + (endDeg - startDeg) * (i / steps);
      const rad = (deg - 90) * (Math.PI / 180);
      const dLng = (radiusKm / 111.32) * Math.cos(rad);
      const dLat = (radiusKm / 110.57) * Math.sin(rad);
      points.push([centerLng + dLng, centerLat + dLat]);
    }
    return points;
  };
  const pushLevel = (level: string, radii: [number, number, number, number]) => {
    // 收集四个象限的弧线点，拼接成完整外环
    const ring: [number, number][] = [];
    let hasAny = false;
    for (let qi = 0; qi < 4; qi++) {
      if (radii[qi] > 0) {
        hasAny = true;
        const [startDeg, endDeg] = QUADRANT_ANGLES[qi];
        ring.push(...buildArc(lng, lat, radii[qi], startDeg, endDeg));
      }
    }
    if (!hasAny || ring.length < 3) return;
    // 闭合环
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      ring.push(ring[0]);
    }
    out.push({ coordinates: [ring], level });
  };
  pushLevel('7', parseRadii(p.radius7));
  pushLevel('10', parseRadii(p.radius10));
  pushLevel('12', parseRadii(p.radius12));
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

// ── 警戒线（预报误差锥）───────────────────────────────────────
// 参考浙江水利台风系统实现，根据预报时间差计算误差半径，
// 在预报路径两侧绘制半透明的误差范围多边形。

const EARTH_RADIUS = 6371; // 地球半径 km

// 预报时间(小时) → 误差半径(km) 映射表
const FORECAST_RADII = new Map<number, number>([
  [3, 10], [6, 20], [9, 30], [12, 40], [15, 50], [18, 60],
  [21, 70], [24, 80], [30, 90], [36, 100], [42, 110], [48, 120],
  [60, 160], [72, 200], [96, 300], [120, 400],
]);

/** 根据预报小时数获取误差半径(km) - 使用线性插值 */
function getForecastRadius(hours: number): number | undefined {
  // 直接匹配
  if (FORECAST_RADII.has(hours)) {
    return FORECAST_RADII.get(hours);
  }
  
  // 找到 closest 的两个时间点进行插值
  const sortedKeys = Array.from(FORECAST_RADII.keys()).sort((a, b) => a - b);
  
  // 小于最小时间，返回最小半径
  if (hours <= sortedKeys[0]) {
    return FORECAST_RADII.get(sortedKeys[0]);
  }
  
  // 大于最大时间，返回最大半径
  if (hours >= sortedKeys[sortedKeys.length - 1]) {
    return FORECAST_RADII.get(sortedKeys[sortedKeys.length - 1]);
  }
  
  // 找到上下界进行线性插值
  for (let i = 0; i < sortedKeys.length - 1; i++) {
    const h1 = sortedKeys[i];
    const h2 = sortedKeys[i + 1];
    if (hours > h1 && hours < h2) {
      const r1 = FORECAST_RADII.get(h1)!;
      const r2 = FORECAST_RADII.get(h2)!;
      const t = (hours - h1) / (h2 - h1);
      return Math.round(r1 + (r2 - r1) * t);
    }
  }
  
  return undefined;
}

/**
 * 计算路径点两侧垂直方向的坐标
 * @param lat 当前点纬度
 * @param lng 当前点经度
 * @param prevLat 前一个点纬度
 * @param prevLng 前一个点经度
 * @param radiusKm 误差半径(km)
 * @returns 两侧坐标 [[lat1, lng1], [lat2, lng2]]
 */
function calculatePerpendicularCoordinates(
  lat: number, lng: number, prevLat: number, prevLng: number, radiusKm: number
): [number, number][] {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const prevLatRad = (prevLat * Math.PI) / 180;
  const dLng = ((prevLng * Math.PI) / 180) - lngRad;

  // 计算方位角
  const y = Math.sin(dLng) * Math.cos(prevLatRad);
  const x = Math.cos(latRad) * Math.sin(prevLatRad) - Math.sin(latRad) * Math.cos(prevLatRad) * Math.cos(dLng);
  const bearing = Math.atan2(y, x);

  // 两侧垂直方向（+90° 和 -90°）
  const d1 = bearing + Math.PI / 2;
  const d2 = bearing - Math.PI / 2;

  // 计算两侧点坐标
  const lat1 = Math.asin(
    Math.sin(latRad) * Math.cos(radiusKm / EARTH_RADIUS) +
    Math.cos(latRad) * Math.sin(radiusKm / EARTH_RADIUS) * Math.cos(d1)
  );
  const lng1 = lngRad + Math.atan2(
    Math.sin(d1) * Math.sin(radiusKm / EARTH_RADIUS) * Math.cos(latRad),
    Math.cos(radiusKm / EARTH_RADIUS) - Math.sin(latRad) * Math.sin(lat1)
  );
  const lat2 = Math.asin(
    Math.sin(latRad) * Math.cos(radiusKm / EARTH_RADIUS) +
    Math.cos(latRad) * Math.sin(radiusKm / EARTH_RADIUS) * Math.cos(d2)
  );
  const lng2 = lngRad + Math.atan2(
    Math.sin(d2) * Math.sin(radiusKm / EARTH_RADIUS) * Math.cos(latRad),
    Math.cos(radiusKm / EARTH_RADIUS) - Math.sin(latRad) * Math.sin(lat2)
  );

  return [
    [(lat1 * 180) / Math.PI, (lng1 * 180) / Math.PI],
    [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI],
  ];
}

/**
 * 生成半圆弧上的点列（用于闭合警戒线末端）
 * @param startLat 起点纬度
 * @param startLng 起点经度
 * @param endLat 终点纬度
 * @param endLng 终点经度
 */
function generateSemiCirclePoints(
  startLat: number, startLng: number, endLat: number, endLng: number
): [number, number][] {
  const points: [number, number][] = [];
  const steps = 20;
  // 从起点到终点画半圆弧
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI;
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;
    const dist = Math.sqrt((endLat - startLat) ** 2 + (endLng - startLng) ** 2);
    const r = dist / 2;
    const lat = midLat + r * Math.cos(t);
    const lng = midLng + r * Math.sin(t);
    points.push([lat, lng]);
  }
  return points;
}

/** 计算警戒线多边形坐标 */
interface ConePolygon {
  coordinates: [number, number][][];
}

function toConePolygon(forecastPoints: TyphoonPoint[]): ConePolygon | null {
  if (forecastPoints.length < 2) return null;

  const firstPoint = forecastPoints[0];
  const firstTime = new Date(firstPoint.time).getTime();
  
  // o 数组存储所有垂直点（交替插入：前半部分左侧点，后半部分右侧点）
  const o: [number, number][] = [];  // [lat, lng] 格式
  let lastPerp: [number, number][] | null = null;

  for (let i = 1; i < forecastPoints.length; i++) {
    const pt = forecastPoints[i];
    const lat = Number(pt.lat);
    const lng = Number(pt.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const time = new Date(pt.time).getTime();
    const hours = Math.round((time - firstTime) / (1000 * 60 * 60));
    const radius = getForecastRadius(hours);
    if (!radius) continue;

    const prevPt = forecastPoints[i - 1];
    const prevLat = Number(prevPt.lat);
    const prevLng = Number(prevPt.lng);

    // calculatePerpendicularCoordinates returns [[lat1, lng1], [lat2, lng2]]
    const h = calculatePerpendicularCoordinates(lat, lng, prevLat, prevLng, radius);
    lastPerp = h;
    
    if (o.length > 0) {
      // 在中间插入新点
      o.splice(o.length / 2, 0, ...h);
    } else {
      o.push(...h);
    }
  }

  if (o.length === 0 || !lastPerp) return null;

  // 生成末端半圆
  const v = generateSemiCirclePoints(lastPerp[1][0], lastPerp[1][1], lastPerp[0][0], lastPerp[0][1]);
  
  // 在半圆中间插入
  o.splice(o.length / 2, 0, ...v);

  // 构建最终多边形: [[起点lat, 起点lng], ...所有点]
  const startLat = Number(firstPoint.lat);
  const startLng = Number(firstPoint.lng);
  const ring: [number, number][] = [[startLng, startLat]];
  
  for (const pt of o) {
    ring.push([pt[1], pt[0]]);  // [lat, lng] → [lng, lat]
  }
  
  // 闭合
  ring.push(ring[0]);

  return { coordinates: [ring] };
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
  const [listExpanded, setListExpanded] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [showWindCircles, setShowWindCircles] = useState(true);

  // 气象图层(单选)+ 透明度。weatherLayer: 'none'|'cloud'|'radar'|'rain'|'satellite'
  const [weatherLayer, setWeatherLayer] = useState<'none' | 'cloud' | 'radar' | 'rain' | 'satellite'>('none');
  const [weatherOpacity, setWeatherOpacity] = useState(0.7);
  const [cloudType, setCloudType] = useState<0.5 | 1 | 3 | 6>(1);       // 云图时段 0.5h/1h/3h/6h
  const [rainHours, setRainHours] = useState<24 | 48 | 72>(24);    // 降雨时段 24h/48h/72h
  const [cloud, setCloud] = useState<CloudData | null>(null);
  const [radar, setRadar] = useState<RadarData | null>(null);
  const [rain, setRain] = useState<RainData | null>(null);
  const [satellite, setSatellite] = useState(false);              // 卫星底图开关(复用 SatelliteLayer)
  const [satProvider, setSatProvider] = useState<'gaode' | 'tianditu' | 'google'>('gaode');
  const [satOpacity, setSatOpacity] = useState(0.8);
  const weatherLoading = useRef(false);

  // 点击线路 / 节点显示的 Popup(同一时间仅一个)
  interface PopupData {
    lng: number; lat: number;
    title: string; statusLabel: string; statusColor: string;
    attrs: PopupAttribute[];
  }
  const [popup, setPopup] = useState<PopupData | null>(null);

  // 降雨 symbol(降水量 mm) → 降水等级映射
const RAIN_LEVEL_LABEL: Record<string, string> = {
  '0': '小雨', '2.5': '小雨', '5': '小雨',
  '10': '中雨', '25': '大雨', '50': '暴雨',
  '100': '大暴雨', '250': '特大暴雨',
};
function getRainLevelLabel(symbol: string): string {
  const num = Number(symbol);
  if (!Number.isFinite(num)) return symbol || '—';
  if (num >= 250) return '特大暴雨';
  if (num >= 100) return '大暴雨';
  if (num >= 50) return '暴雨';
  if (num >= 25) return '大雨';
  if (num >= 10) return '中雨';
  return '小雨';
}

const sceneRef = useRef<Scene | null>(null);
  const hoverRef = useRef<{ lng: number; lat: number; time: string; strong: string; power: string; speed: string; pressure: string } | null>(null);
  const [tooltip, setTooltip] = useState({ visible: false, lng: 0, lat: 0, time: '', strong: '', power: '', speed: '', pressure: '' });
  const [rainTooltip, setRainTooltip] = useState<{ visible: boolean; lng: number; lat: number; symbol: string; color: string }>({ visible: false, lng: 0, lat: 0, symbol: '', color: '' });
  const handleRainTooltipLeave = useCallback(() => {
    setRainTooltip((prev) => ({ ...prev, visible: false }));
  }, []);
  const handleRainTooltipMove = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    const symbol = String(f?.symbol ?? '');
    setRainTooltip({
      visible: true,
      lng: payload.lng, lat: payload.lat,
      symbol,
      color: String(f?.color ?? ''),
    });
  }, []);

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
      fetchRain(rainHours).then(d => { if (d) setRain(d); });
    }
  }, [weatherLayer, cloudType, rainHours, cloud, radar, rain]); // eslint-disable-line react-hooks/exhaustive-deps

  // 云图时段切换(1h/3h/6h) → 重新拉取
  useEffect(() => { if (weatherLayer === 'cloud') setCloud(null); }, [cloudType]);

  // 降雨时段切换(6h/12h/24h) → 重新拉取
  useEffect(() => { if (weatherLayer === 'rain') setRain(null); }, [rainHours]);

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

  const windPolygons = useMemo(() => {
    const polygons = toWindPolygons(selectedPoint);
    console.log('[风圈] selectedPoint:', selectedPoint?.time, 'radius7:', selectedPoint?.radius7, 'radius10:', selectedPoint?.radius10, 'radius12:', selectedPoint?.radius12);
    console.log('[风圈] windPolygons 数量:', polygons.length);
    return polygons;
  }, [selectedPoint]);

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

  // 预报路径点位（用于显示预测线路上的点）
  const forecastPoints = useMemo(() => {
    const points: { lng: number; lat: number; agency: string; time: string; strong: string; speed: string; pressure: string }[] = [];
    for (const a of forecastSrc) {
      for (const pt of a.forecastpoints ?? []) {
        const lng = Number(pt.lng), lat = Number(pt.lat);
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          points.push({
            lng, lat, agency: a.tm,
            time: String(pt.time ?? ''),
            strong: String(pt.strong ?? ''),
            speed: String(pt.speed ?? ''),
            pressure: String(pt.pressure ?? ''),
          });
        }
      }
    }
    return points;
  }, [forecastSrc]);

  // 警戒线（预报误差锥）- 基于选中机构预报路径计算
  const conePolygon = useMemo(() => {
    const a = forecastSrc.find(f => f.tm === selectedAgency);
    if (!a || a.forecastpoints.length < 2) {
      return null;
    }
    return toConePolygon(a.forecastpoints);
  }, [forecastSrc, selectedAgency]);
  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    // 降雨图层悬停提示已通过 FillLayer onMouseMove 事件处理
    return () => {};
  }, [rain, weatherLayer]); // eslint-disable-line react-hooks/exhaustive-deps

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
      pressure = String(f.pressure ?? ''), time = String(f.time ?? ''),
      movespeed = String(f.movespeed ?? ''), movedirection = String(f.movedirection ?? ''),
      radius7 = String(f.radius7 ?? ''), radius10 = String(f.radius10 ?? ''), radius12 = String(f.radius12 ?? '');
    const key = STRENGTH_TO_KEY[strong] ?? 'TS';
    // 解析风圈半径（格式如 "350|300|300|280" → 取范围）
    const formatRadius = (r: string) => {
      if (!r || r === 'undefined') return '—';
      const vals = r.split('|').map(Number).filter(Number.isFinite);
      if (vals.length === 0) return '—';
      const min = Math.min(...vals), max = Math.max(...vals);
      return min === max ? `${min}公里` : `${min}-${max}公里`;
    };
    setPopup({
      lng, lat,
      title: info?.name ? `${info.name}(${info.enname})` : '台风',
      statusLabel: strong,
      statusColor: GRADE_COLOR[key],
      attrs: [
        { label: '时间', value: time.slice(0, 16).replace('T', ' ') || '—' },
        { label: '中心位置', value: `${Number(lng).toFixed(2)}° / ${Number(lat).toFixed(2)}°` },
        { label: '风速风力', value: speed && power ? `${speed}米/秒，${power}级(${strong})` : '—', valueColor: GRADE_COLOR[key] },
        { label: '中心气压', value: pressure ? `${pressure}百帕` : '—' },
        { label: '移速移向', value: movespeed && movedirection ? `${movespeed}公里/小时，${movedirection}` : '—' },
        { label: '七级半径', value: formatRadius(radius7) },
        { label: '十级半径', value: formatRadius(radius10) },
        { label: '十二级半径', value: formatRadius(radius12) },
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

  // 预报点位悬停 → Tooltip
  const handleForecastPointHover = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (!f) return;
    hoverRef.current = {
      lng: payload.lng, lat: payload.lat,
      time: String(f.time ?? ''), strong: String(f.strong ?? ''), power: '',
      speed: String(f.speed ?? ''), pressure: String(f.pressure ?? ''),
    };
    setTooltip({ visible: true, ...hoverRef.current });
  }, []);
  const handleForecastPointLeave = useCallback(() => setTooltip(t => ({ ...t, visible: false })), []);
  // 预报点位点击 → Popup
  const handleForecastPointClick = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (!f) return;
    const agencyName = String(f.agency ?? '');
    const time = String(f.time ?? ''), strong = String(f.strong ?? ''),
      speed = String(f.speed ?? ''), pressure = String(f.pressure ?? '');
    setPopup({
      lng: payload.lng, lat: payload.lat,
      title: `${agencyName} 预报点`, statusLabel: strong || '预报', statusColor: AGENCY_COLOR[agencyName] ?? '#22d3ee',
      attrs: [
        { label: '机构', value: agencyName },
        { label: '时间', value: time.slice(0, 16).replace('T', ' ') || '—' },
        { label: '中心位置', value: `${Number(payload.lng).toFixed(2)}° / ${Number(payload.lat).toFixed(2)}°` },
        { label: '风速', value: speed ? `${speed}米/秒` : '—' },
        { label: '强度', value: strong || '—' },
        { label: '中心气压', value: pressure ? `${pressure}百帕` : '—' },
      ],
    });
  }, []);

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
      {/* L7 控件暗色主题覆盖 */}
      <style>{`
        .l7-control-zoom, .l7-control-theme, .l7-map-theme-control { background: rgba(15,23,42,0.9) !important; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(148,163,184,0.12) !important; border-radius: 12px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important; padding: 4px !important; }
        .l7-control-zoom a, .l7-control-zoom button, .l7-control-theme a, .l7-control-theme button, .l7-map-theme-control a, .l7-map-theme-control button { color: #e2e8f0 !important; background: transparent !important; border: none !important; width: 28px !important; height: 28px !important; line-height: 28px !important; font-size: 16px !important; border-radius: 8px !important; transition: background 0.15s !important; }
        .l7-control-zoom a:hover, .l7-control-zoom button:hover, .l7-control-theme a:hover, .l7-control-theme button:hover, .l7-map-theme-control a:hover, .l7-map-theme-control button:hover { background: rgba(34,211,238,0.15) !important; color: #22d3ee !important; }
        .l7-control-zoom .l7-zoom-number { color: #cbd5e1 !important; background: transparent !important; border-top: 1px solid rgba(148,163,184,0.1) !important; border-bottom: 1px solid rgba(148,163,184,0.1) !important; font-size: 11px !important; font-weight: 600 !important; height: 28px !important; line-height: 28px !important; }
        .l7-map-theme-control img, .l7-map-theme-control svg { filter: brightness(0) invert(0.9) !important; }
      `}</style>
      {/* ── 地图 ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AiMap
          map={{ basemap: 'gaode', center: [127.6, 20.8], zoom: 4, pitch: 12, style: satellite ? 'light' : 'dark' }}
          onSceneReady={handleSceneReady}
        >
          {/* ⓪ 气象覆盖层(置于最底,zIndex=-1,在台风轨迹之下) */}
          {/* 卫星底图切换:开启时叠加高德影像 */}
          {satellite && (<SatelliteLayer provider={satProvider} zIndex={-2} opacity={satOpacity} visible={satellite} />)}
          {/* 云图(base64 PNG + 边界 extent) */}
          {weatherLayer === 'cloud' && cloud && (
            <ImageLayer
              source={cloud.img}
              sourceType="image"
              sourceConfig={{ parser: { type: 'image', extent: cloud.extent } }}
              style={{ opacity: weatherOpacity } as Record<string, unknown>}
              zIndex={-1}
            />
          )}
          {/* 雷达(多片拼接, radarType=2 单片) */}
          {weatherLayer === 'radar' && radar && radar.tiles.map((t, i) => (
            <ImageLayer
              key={`radar-${i}`}
              source={t.img}
              sourceType="image"
              sourceConfig={{ parser: { type: 'image', extent: t.extent } }}
              style={{ opacity: weatherOpacity } as Record<string, unknown>}
              zIndex={-1}
            />
          ))}
          {/* 降雨(等值面填充, GeoJSON Polygon, 每个 feature 自带 color + symbol 属性) */}
          {weatherLayer === 'rain' && rain && (
            <FillLayer
              source={{ type: 'FeatureCollection', features: rain.features }}
              sourceType="geojson"
              colorField="color"
              colorValues={rain.colors}
              style={{ opacity: weatherOpacity } as Record<string, unknown>}
              zIndex={-1}
              hoverEffect={false}
              clickEffect={false}
              tooltipEffect={false}
              onMouseMove={handleRainTooltipMove}
              onMouseLeave={handleRainTooltipLeave}
            />
          )}

          {/* 风圈（四象限扇形 Polygon，填充+描边） */}
          {showWindCircles ? (
            <>
              {windPolygons.length > 0 && (
                <>
                  <FillLayer
                    source={{ type: 'FeatureCollection', features: windPolygons.map(w => ({ type: 'Feature' as const, properties: { level: w.level }, geometry: { type: 'Polygon' as const, coordinates: w.coordinates } })) }}
                    sourceType="geojson"
                    shape="fill"
                    colorField="level"
                    colorValues={WIND_LEVEL_KEY.map(k => WIND_LEVEL_COLOR[k])}
                    style={{ opacity: 0.25 } as Record<string, unknown>}
                    zIndex={0}
                  />
                  <LineLayer
                    source={{ type: 'FeatureCollection', features: windPolygons.map(w => ({ type: 'Feature' as const, properties: { level: w.level }, geometry: { type: 'Polygon' as const, coordinates: w.coordinates } })) }}
                    sourceType="geojson"
                    shape="line"
                    size={1}
                    colorField="level"
                    colorValues={WIND_LEVEL_KEY.map(k => WIND_LEVEL_COLOR[k])}
                    style={{ opacity: 0.8 } as Record<string, unknown>}
                    zIndex={2}
                  />
                </>
              )}
            </>
          ) : null}          {/* ② 历史轨迹段（实线，按等级着色，无动画） */}
          {trackSegments.length > 0 && (
            <LineLayer
              source={trackSegments}
              sourceType="json"
              sourceConfig={{ coordinates: 'path' }}
              shape="line"
              size={1.5}
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
              size={2}
              colorField="agency"
              colorValues={AGENCIES.filter(a => a !== selectedAgency).map(a => AGENCY_COLOR[a])}
              style={{ opacity: 0.55, lineType: 'dash', dashArray: [8, 8] } as Record<string, unknown>}
              active={{ color: '#fff' }}
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
              size={2.5}
              colorField="agency"
              colorValues={[AGENCY_COLOR[selectedAgency]]}
              style={{ opacity: 0.95, lineType: 'dash', dashArray: [12, 8] } as Record<string, unknown>}
              active={{ color: '#fff' }}
              onClick={handleForecastClick}
              zIndex={2}
            />
          )}
          {/* ③'' 预报路径点位 */}
          {forecastPoints.length > 0 && (
            <PointLayer
              source={forecastPoints}
              sourceType="json"
              sourceConfig={{ x: 'lng', y: 'lat' }}
              shape="circle"
              size={3}
              colorField="agency"
              colorValues={AGENCIES.map(a => AGENCY_COLOR[a])}
              style={{ opacity: 0.7, stroke: '#fff', strokeWidth: 0.5 } as Record<string, unknown>}
              active={{ color: '#fff' }}
              onMouseMove={handleForecastPointHover}
              onMouseLeave={handleForecastPointLeave}
              onClick={handleForecastPointClick}
              zIndex={7}
            />
          )}
          {/* ③''' 警戒线（预报误差锥）- 半透明填充多边形 */}
          {conePolygon && (
            <FillLayer
              source={{ type: 'FeatureCollection' as const, features: [{ type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: conePolygon.coordinates } }] }}
              sourceType="geojson"
              shape="fill"
              color={AGENCY_COLOR[selectedAgency] ?? '#22d3ee'}
              showStroke={true}
              strokeColor={AGENCY_COLOR[selectedAgency] ?? '#22d3ee'}
              strokeWidth={1}
              style={{ opacity: 0.2 } as Record<string, unknown>}
              zIndex={1}
            />
          )}
          {/* 警戒线描边 */}
          {conePolygon && (
            <LineLayer
              source={{ type: 'FeatureCollection' as const, features: [{ type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: conePolygon.coordinates } }] }}
              sourceType="geojson"
              shape="line"
              size={2}
              color={AGENCY_COLOR[selectedAgency] ?? '#22d3ee'}
              style={{ opacity: 0.8 } as Record<string, unknown>}
              zIndex={11}
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
              zIndex={6}
            />
          )}

          {/* ⑤ 台风眼（GIF 动画） */}
          {Number.isFinite(eyeLng) && Number.isFinite(eyeLat) && (
            <Marker
              longitude={eyeLng}
              latitude={eyeLat}
              anchor="center"
              offsets={[0, 0]}
              content={
                <img
                  src="https://mdn.alipayobjects.com/huamei_b5qxsh/afts/img/A*OT11QYzVNCcAAAAAQCAAAAgAerZ5AQ/original"
                  alt="台风眼"
                  style={{ width: 64, height: 64, pointerEvents: 'none' }}
                />
              }
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

          {/* ⑥' 降雨图层 Tooltip */}
          <Tooltip
            longitude={rainTooltip.lng}
            latitude={rainTooltip.lat}
            variant="dark"
            visible={rainTooltip.visible}
            items={[
              { label: '降水等级', value: getRainLevelLabel(rainTooltip.symbol) },
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

          <ZoomControl position="bottomleft" showZoom />
          <MapThemeControl position="bottomleft" defaultValue="dark" />
        </AiMap>
      </div>

      {/* ════════ 顶部导航条（与左侧面板同宽） ════════ */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 264, zIndex: 1000, padding: '12px 16px', background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0) 100%)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: C.accent, pointerEvents: 'auto' }}>cyclone</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>台风路径图</span>
          <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{CURRENT_YEAR} 年 西太平洋</span>
          {error && (
            <span style={{ fontSize: 10, color: '#fca5a5', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: 6, pointerEvents: 'auto', marginLeft: 'auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: 'middle' }}>wifi_off</span> 使用内置样本
            </span>
          )}
        </div>
      </div>

      {/* ════════ 左上：台风信息卡 + 列表 ════════ */}
      <div style={{ position: 'absolute', top: 48, left: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8, width: 240, maxHeight: 'calc(100% - 80px)' }}>
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
          border: `1px solid ${C.border}`, borderRadius: 12, overflowY: 'auto', minHeight: 0,
        }}>
          <div
            onClick={() => setListExpanded(!listExpanded)}
            style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{listExpanded ? 'expand_less' : 'expand_more'}</span>
            台风列表（{list.length}）
          </div>
          {loading && <div style={{ fontSize: 11, color: C.muted, padding: '4px 0' }}>加载中…</div>}
          {[...list].reverse().slice(0, listExpanded ? list.length : 3).map(t => {
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
          {!listExpanded && list.length > 3 && (
            <div onClick={() => setListExpanded(true)} style={{ fontSize: 10, color: C.accent, textAlign: 'center', padding: '4px 0', cursor: 'pointer' }}>
              展开全部（{list.length}）
            </div>
          )}
        </div>
      </div>

      {/* ════════ 顶部右侧：气象图层工具条 ════════ */}
      <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 1000 }}>
        <div style={{
          padding: '8px 14px', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          {/* 图层切换按钮组 */}
          <div style={{ display: 'flex', gap: 2 }}>
            {([
              { k: 'none', label: '无', icon: 'block' },
              { k: 'cloud', label: '云图', icon: 'cloud' },
              { k: 'radar', label: '雷达', icon: 'radar' },
              { k: 'rain', label: '降雨', icon: 'rainy' },
              { k: 'satellite', label: '卫星', icon: 'satellite_alt' },
            ] as { k: typeof weatherLayer; label: string; icon: string }[]).map(o => {
              const sel = weatherLayer === o.k;
              return (
                <button key={o.k} onClick={() => {
                  setWeatherLayer(o.k as typeof weatherLayer);
                  if (o.k === 'satellite') setSatellite(true);
                  else if (o.k !== 'none') setSatellite(false);
                }} title={o.label} style={{
                  padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3,
                  transition: 'all 0.15s',
                  background: sel ? 'rgba(34,211,238,0.18)' : 'transparent',
                  color: sel ? C.accent : 'rgba(148,163,184,0.7)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{o.icon}</span>{o.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* 下方按需显示：云图时段 / 降雨时段 / 透明度 / 数据时间 */}
        {(() => {
          const wl = weatherLayer;
          if (wl === 'none') return null;
          const showTime = (wl === 'cloud' && cloud?.time) || (wl === 'radar' && radar?.time) || (wl === 'rain' && rain?.time);
          const timeStr = wl === 'cloud' ? cloud?.time : wl === 'radar' ? radar?.time : wl === 'rain' ? rain?.time : undefined;
          return (
            <div style={{ marginTop: 4, padding: '6px 12px', background: C.panel, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', alignSelf: 'flex-end' }}>
              {wl === 'cloud' && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {([0.5, 1, 3, 6] as const).map(h => (
                    <button key={h} onClick={() => setCloudType(h)} style={{
                      padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 500,
                      background: cloudType === h ? 'rgba(34,211,238,0.18)' : 'transparent',
                      color: cloudType === h ? C.accent : 'rgba(148,163,184,0.7)',
                    }}>{h < 1 ? '30m' : `${h}h`}</button>
                  ))}
                </div>
              )}
              {wl === 'rain' && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {([24, 48, 72] as const).map(h => (
                    <button key={h} onClick={() => setRainHours(h)} style={{
                      padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 500,
                      background: rainHours === h ? 'rgba(34,211,238,0.18)' : 'transparent',
                      color: rainHours === h ? C.accent : 'rgba(148,163,184,0.7)',
                    }}>{h}h</button>
                  ))}
                </div>
              )}
              {wl !== 'satellite' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, color: C.muted }}>透明度</span>
                  <input type="range" min={0} max={1} step={0.05} value={weatherOpacity} onChange={e => setWeatherOpacity(Number(e.target.value))}
                    style={{ width: 60, accentColor: C.accent, height: 3 }} />
                  <span style={{ fontSize: 9, color: C.muted, minWidth: 24 }}>{Math.round(weatherOpacity * 100)}%</span>
                </div>
              )}
              {showTime && timeStr && (
                <div style={{ fontSize: 9, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>
                  {timeStr}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ════════ 右下：图例 + 选中历史点提示 ════════ */}
      <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* 图例容器（支持展开收起） */}
        <div style={{ padding: '10px 12px', background: C.panel, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, borderRadius: 10, maxHeight: legendExpanded ? 320 : 40, overflowY: 'auto', transition: 'max-height 0.3s' }}>
          <div onClick={() => setLegendExpanded(!legendExpanded)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', paddingBottom: legendExpanded ? 8 : 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>图例</span>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: C.muted, transition: 'transform 0.3s', transform: legendExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
          </div>
          {legendExpanded && (
            <>
              {/* 风圈开关 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>风圈</span>
                <input type="checkbox" checked={showWindCircles} onChange={e => setShowWindCircles(e.target.checked)} style={{ accentColor: C.accent, cursor: 'pointer' }} />
              </div>
              {/* 登陆点 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>登陆点</span>
              </div>
              {/* 预报台 */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>预报台</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {AGENCIES.map(a => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>
                      <div style={{ width: 12, height: 0, borderTop: `2px dashed ${AGENCY_COLOR[a]}`, opacity: 0.8 }} />
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 台风等级 */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
                <LegendCategories type="categories" title="台风等级" labels={GRADE_LABELS} colors={GRADE_COLORS} swatchShape="circle" className="[&_span.text-on-surface]:!text-[#e2e8f0]" />
              </div>
              {/* 风圈等级 */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
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
              {/* 降雨等级 */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>降雨等级</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                  {[
                    { label: '0-10', color: '#a5d6a7' }, { label: '10-25', color: '#66bb6a' },
                    { label: '25-50', color: '#42a5f5' }, { label: '50-100', color: '#1e88e5' },
                    { label: '100-250', color: '#e040fb' }, { label: '>250', color: '#c62828' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 12, height: 12, background: r.color }} />
                      <span style={{ fontSize: 10, color: '#cbd5e1' }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 雷达反射率 */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>雷达反射率 dBZ</div>
                <div style={{ display: 'flex', gap: 1 }}>
                  {['#00bcd4', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#f44336', '#e91e63', '#9c27b0', '#673ab7'].map((c, i) => (
                    <div key={i} style={{ flex: 1, height: 8, background: c }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 9, color: C.muted }}>10</span>
                  <span style={{ fontSize: 9, color: C.muted }}>70</span>
                </div>
              </div>
            </>
          )}
        </div>
        {/* 选中历史点提示 */}
        {selectedWind && selectedIdx !== currentIdx && (
          <div style={{ padding: '8px 12px', background: C.panel, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#f59e0b' }}>history</span>
            <span>历史点 · {selectedWind.time.slice(5)} · {selectedWind.strong} {selectedWind.power}级</span>
            <button onClick={() => setSelectedPointIdx(-1)} style={{ marginLeft: 4, padding: 0, border: 'none', background: 'none', color: C.muted, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
            </button>
          </div>
        )}
        {/* 数据来源 */}
        <div style={{ fontSize: 9, color: C.muted, padding: '4px 0', textAlign: 'center' }}>数据来源:浙江水利 typhoon.slt.zj.gov.cn</div>
      </div>
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
