/* ================================================================
   台风路径地图 — 常量、配色与兜底数据
   ================================================================ */

// ── API ─────────────────────────────────────────────────────────
export const API_BASE = 'https://typhoon.slt.zj.gov.cn/Api';
export const API_LIST = (year: number) => `${API_BASE}/TyphoonList/${year}`;
export const API_INFO = (tfid: string) => `${API_BASE}/TyphoonInfo/${tfid}`;
export const API_ACTIVITY = `${API_BASE}/TyhoonActivity`;

// ── 气象 API ────────────────────────────────────────────────────
export const API_LEASTCLOUD = (type: number) => `${API_BASE}/LeastCloud?type=${type}`;
export const API_LASTRADAR = `${API_BASE}/LastRadar`;
export const API_LEASTRAIN = (hours: number) => `${API_BASE}/LeastRain/${hours}`;
export const API_LASTWIND = `${API_BASE}/LastWind`;

// ── 等级系统 ─────────────────────────────────────────────────────
export type GradeKey = 'TD' | 'TS' | 'STS' | 'TY' | 'STY' | 'SuperTY';

export const STRENGTH_TO_KEY: Record<string, GradeKey> = {
  热带低压: 'TD',
  热带风暴: 'TS',
  强热带风暴: 'STS',
  台风: 'TY',
  强台风: 'STY',
  超强台风: 'SuperTY',
};

export const GRADE_ORDER: GradeKey[] = ['TD', 'TS', 'STS', 'TY', 'STY', 'SuperTY'];

export const GRADE_LABEL: Record<GradeKey, string> = {
  TD: '热带低压', TS: '热带风暴', STS: '强热带风暴',
  TY: '台风', STY: '强台风', SuperTY: '超强台风',
};

export const GRADE_COLOR: Record<GradeKey, string> = {
  TD: '#7dd3fc', TS: '#38bdf8', STS: '#3b82f6', TY: '#8b5cf6', STY: '#f59e0b', SuperTY: '#ef4444',
};

export const GRADE_LABELS = GRADE_ORDER.map(g => GRADE_LABEL[g]);
export const GRADE_COLORS = GRADE_ORDER.map(g => GRADE_COLOR[g]);

// ── 风圈配色 ─────────────────────────────────────────────────────
export const WIND_LEVEL_KEY = ['7', '10', '12'] as const;
export const WIND_LEVEL_COLOR: Record<string, string> = { '7': '#3b82f6', '10': '#f59e0b', '12': '#ef4444' };

// ── 预报机构配色 ──────────────────────────────────────────────────
export const AGENCIES = ['中国', '中国台湾', '日本', '中国香港', '美国'] as const;
export const AGENCY_COLOR: Record<string, string> = {
  中国: '#22d3ee', 中国台湾: '#34d399', 日本: '#f472b6', 中国香港: '#fbbf24', 美国: '#a78bfa',
};

// ── 警戒线坐标 ────────────────────────────────────────────────────
export const WARNING_LINE_24H: [number, number][] = [
  [127, 34], [127, 22], [119, 18], [119, 11], [113, 4.5], [105, 0],
];

export const WARNING_LINE_48H: [number, number][] = [
  [132, 34], [132, 15], [120, 0], [105, 0],
];

export const WARNING_LINE_COLORS = {
  '24h': '#ef4444',
  '48h': '#f59e0b',
};

// ── 雷达瓦片 ──────────────────────────────────────────────────────
export const RADAR_FULL_EXTENT: [number, number, number, number] =
  [69.85883897374661, 12.17563341623027, 140.09971829625096, 54.338914427211094];

export const RADAR_TILES: { key: 'radar0_0' | 'radar0_1' | 'radar1_0' | 'radar1_1'; extent: [number, number, number, number] }[] = [
  { key: 'radar0_0', extent: [67.5, 36.580247, 104.073486, 55.7766] },
  { key: 'radar0_1', extent: [67.5, 11.1784, 104.073486, 36.580247] },
  { key: 'radar1_0', extent: [104.073486, 36.580247, 140.625, 55.7766] },
  { key: 'radar1_1', extent: [104.073486, 11.1784, 140.625, 36.580247] },
];

// ── 降雨等级 ──────────────────────────────────────────────────────
export const RAIN_LEVEL_LABEL: Record<string, string> = {
  '0': '小雨', '2.5': '小雨', '5': '小雨',
  '10': '中雨', '25': '大雨', '50': '暴雨',
  '100': '大暴雨', '250': '特大暴雨',
};

export function getRainLevelLabel(symbol: string): string {
  const num = Number(symbol);
  if (!Number.isFinite(num)) return symbol || '—';
  if (num >= 250) return '特大暴雨';
  if (num >= 100) return '大暴雨';
  if (num >= 50) return '暴雨';
  if (num >= 25) return '大雨';
  if (num >= 10) return '中雨';
  return '小雨';
}

// ── 兜底数据 ──────────────────────────────────────────────────────
import type { TyphoonInfo, TyphoonListItem } from './types';

export const CURRENT_YEAR = new Date().getFullYear();

export const FALLBACK_INFO: TyphoonInfo = {
  tfid: '202609', name: '巴威', enname: 'BAVI', isactive: '1',
  starttime: '2026-07-02 08:00:00', endtime: '2026-07-10 08:00:00',
  centerlng: '127.60', centerlat: '20.80', warnlevel: 'white', land: [],
  points: [
    { time: '2026-07-04 02:00:00', lng: '149.00', lat: '14.10', strong: '超强台风', power: '17', speed: '58', pressure: '925', movespeed: '26', movedirection: '西北', radius7: '320|300|300|280', radius10: '120|110|110|100', radius12: '50|45|45|40' },
    { time: '2026-07-06 08:00:00', lng: '144.80', lat: '15.10', strong: '超强台风', power: '17', speed: '60', pressure: '920', movespeed: '20', movedirection: '西北', radius7: '350|320|320|300', radius10: '140|120|120|110', radius12: '60|50|50|45' },
    { time: '2026-07-08 08:00:00', lng: '137.50', lat: '16.80', strong: '超强台风', power: '17', speed: '57', pressure: '925', movespeed: '18', movedirection: '西北', radius7: '400|380|360|350', radius10: '180|150|150|140', radius12: '80|60|60|55' },
    { time: '2026-07-09 11:00:00', lng: '129.50', lat: '18.40', strong: '超强台风', power: '16', speed: '52', pressure: '935', movespeed: '19', movedirection: '西北', radius7: '500|500|500|500', radius10: '300|280|300|280', radius12: '180|120|180|120' },
    { time: '2026-07-10 02:00:00', lng: '128.20', lat: '19.90', strong: '强台风', power: '14', speed: '45', pressure: '945', movespeed: '20', movedirection: '西北', radius7: '500|500|450|480', radius10: '300|280|300|280', radius12: '180|120|180|120' },
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

export const FALLBACK_LIST: TyphoonListItem[] = [
  { tfid: '202609', name: '巴威', enname: 'BAVI', starttime: '2026-07-02 08:00:00', endtime: '2026-07-10 08:00:00', isactive: '1', warnlevel: 'white' },
];

// ── UI 颜色常量 ────────────────────────────────────────────────────
export const C = {
  bg: '#0f172a',
  panel: 'rgba(15,23,42,0.82)',
  border: 'rgba(56,189,248,0.15)',
  fg: '#e2e8f0',
  muted: 'rgba(148,163,184,0.7)',
  accent: '#22d3ee',
};