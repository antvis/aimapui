import type { ThemeOption } from '@antv/aimapui';

/**
 * 百度地图主题样式 JSON 集合
 *
 * 使用 BMapGL 原生 setMapStyleV2({ styleJson }) 接口，
 * 通过 styleJson 数组定义元素级别的视觉规则，无需在百度后台申请 styleId 即可生效。
 *
 * 每条规则结构：
 *   - featureType: 元素类型（all/land/water/road/...）
 *   - elementType: 元素子类型（all/geometry/labels/...）
 *   - stylers: 视觉属性（color/visibility/weight/...）
 */

/** 标准样式 — 还原百度默认风格 */
const NORMAL_STYLE = [
  { featureType: 'all', elementType: 'all', stylers: { visibility: 'on' } },
];

/** 灰阶样式 — 黑白灰渲染，常用于数据可视化背景 */
const GRAYSCALE_STYLE = [
  { featureType: 'all', elementType: 'geometry', stylers: { color: '#dededeff' } },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: { color: '#666666ff' } },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: { color: '#ffffffff' } },
  { featureType: 'land', elementType: 'geometry.fill', stylers: { color: '#f5f5f5ff' } },
  { featureType: 'water', elementType: 'geometry.fill', stylers: { color: '#d0d0d0ff' } },
  { featureType: 'highway', elementType: 'geometry.fill', stylers: { color: '#cccccc' } },
  { featureType: 'arterial', elementType: 'geometry.fill', stylers: { color: '#dddddd' } },
  { featureType: 'local', elementType: 'geometry.fill', stylers: { color: '#e8e8e8' } },
  { featureType: 'building', elementType: 'geometry', stylers: { color: '#eaeaeaff' } },
  { featureType: 'green', elementType: 'geometry', stylers: { color: '#e0e0e0ff' } },
  { featureType: 'poilabel', elementType: 'all', stylers: { visibility: 'off' } },
];

/** 暗黑样式 — 深蓝灰底色，适合大屏与暗色主题 */
const DARK_STYLE = [
  { featureType: 'all', elementType: 'geometry', stylers: { color: '#1f2937ff' } },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: { color: '#9ca3afff' } },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: { color: '#0f172aff' } },
  { featureType: 'land', elementType: 'geometry.fill', stylers: { color: '#0f172aff' } },
  { featureType: 'water', elementType: 'geometry.fill', stylers: { color: '#1e293bff' } },
  { featureType: 'highway', elementType: 'geometry.fill', stylers: { color: '#374151ff' } },
  { featureType: 'highway', elementType: 'geometry.stroke', stylers: { color: '#4b5563ff' } },
  { featureType: 'arterial', elementType: 'geometry.fill', stylers: { color: '#2d3748ff' } },
  { featureType: 'arterial', elementType: 'geometry.stroke', stylers: { color: '#374151ff' } },
  { featureType: 'local', elementType: 'geometry.fill', stylers: { color: '#1f2937ff' } },
  { featureType: 'building', elementType: 'geometry', stylers: { color: '#1e293bff' } },
  { featureType: 'green', elementType: 'geometry', stylers: { color: '#15302aff' } },
  { featureType: 'subwaystation', elementType: 'all', stylers: { visibility: 'off' } },
  { featureType: 'poilabel', elementType: 'all', stylers: { visibility: 'off' } },
];

/** 蓝调样式 — 海洋蓝主调，适合气象/海事可视化 */
const BLUISH_STYLE = [
  { featureType: 'all', elementType: 'geometry', stylers: { color: '#cfe4f5ff' } },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: { color: '#2c5282ff' } },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: { color: '#ffffffff' } },
  { featureType: 'land', elementType: 'geometry.fill', stylers: { color: '#e6f3fbff' } },
  { featureType: 'water', elementType: 'geometry.fill', stylers: { color: '#5890c8ff' } },
  { featureType: 'highway', elementType: 'geometry.fill', stylers: { color: '#a8c8e8ff' } },
  { featureType: 'arterial', elementType: 'geometry.fill', stylers: { color: '#c0d8eaff' } },
  { featureType: 'local', elementType: 'geometry.fill', stylers: { color: '#d8e8f3ff' } },
  { featureType: 'building', elementType: 'geometry', stylers: { color: '#c8def0ff' } },
  { featureType: 'green', elementType: 'geometry', stylers: { color: '#b8d6e8ff' } },
  { featureType: 'poilabel', elementType: 'all', stylers: { visibility: 'off' } },
];

/** value → styleJson 的映射，handleThemeChange 时通过 value 拿到对应 JSON */
export const BAIDU_STYLE_MAP: Record<string, unknown[]> = {
  normal: NORMAL_STYLE,
  grayscale: GRAYSCALE_STYLE,
  dark: DARK_STYLE,
  bluish: BLUISH_STYLE,
};

export const BAIDU_THEME_OPTIONS: ThemeOption[] = [
  {
    text: '标准',
    value: 'normal',
    preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)',
  },
  {
    text: '灰阶',
    value: 'grayscale',
    preview: 'linear-gradient(135deg, #f5f5f5 0%, #c8c8c8 40%, #888888 100%)',
  },
  {
    text: '暗色',
    value: 'dark',
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #1f2937 100%)',
  },
  {
    text: '蓝调',
    value: 'bluish',
    preview: 'linear-gradient(135deg, #cfe4f5 0%, #88b8e0 40%, #5890c8 100%)',
  },
];
