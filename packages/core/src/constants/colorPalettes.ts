/**
 * 语义化色板预设
 *
 * 基于 ColorBrewer 推荐，色盲安全。
 * 参考: https://colorbrewer2.org/
 */

export type ColorScheme = 'sequential' | 'diverging' | 'categorical';

/** 顺序色板（蓝）— 适用于单调递增/递减数据 */
export const SEQUENTIAL_COLORS = ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'] as const;

/** 发散色板（红-白-绿）— 适用于有中心点的双向数据 */
export const DIVERGING_COLORS = ['#dc2626', '#fca5a5', '#e5e7eb', '#86efac', '#16a34a'] as const;

/** 分类色板 — 适用于离散类别，色盲安全 */
export const CATEGORICAL_COLORS = ['#2563eb', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'] as const;

/** 根据 colorScheme 获取对应色板 */
export function getColorPalette(scheme: ColorScheme): readonly string[] {
  switch (scheme) {
    case 'diverging':
      return DIVERGING_COLORS;
    case 'categorical':
      return CATEGORICAL_COLORS;
    case 'sequential':
    default:
      return SEQUENTIAL_COLORS;
  }
}
