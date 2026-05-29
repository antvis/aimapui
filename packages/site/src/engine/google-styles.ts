import type { ThemeOption } from '@antv/aimapui';

/**
 * Google 地图主题选项 — 对应 Google Maps mapTypeId
 *
 * 4 种内置类型开箱即用：
 * - roadmap: 标准路图
 * - satellite: 纯卫星影像
 * - hybrid: 卫星 + 道路标注
 * - terrain: 地形渲染
 *
 * 通过 nativeMap.setMapTypeId(value) 切换
 */
export const GOOGLE_THEME_OPTIONS: ThemeOption[] = [
  {
    text: '路图',
    value: 'roadmap',
    preview: 'linear-gradient(135deg, #f1f3f4 0%, #c8d8e8 40%, #a8c8d8 100%)',
  },
  {
    text: '卫星',
    value: 'satellite',
    preview: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 40%, #1d4a2d 100%)',
  },
  {
    text: '混合',
    value: 'hybrid',
    preview: 'linear-gradient(135deg, #1a3a2a 0%, #3d6a3d 40%, #2d5a3d 100%)',
  },
  {
    text: '地形',
    value: 'terrain',
    preview: 'linear-gradient(135deg, #c8b88a 0%, #a8c878 40%, #98b868 100%)',
  },
];
