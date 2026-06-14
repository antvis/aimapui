/**
 * DrawControl 类型定义
 *
 * 地图绘制控件的 TypeScript 类型、接口和常量
 */
import type { Feature, Point, LineString, Polygon } from 'geojson';
import type { ControlPosition } from '../../../hooks/useMapControl';

// ============================================================
// 绘制模式
// ============================================================

/** 绘制模式 */
export type DrawMode =
  | 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle'
  | 'edit' | 'split' | 'merge'
  | 'none';

/** 基础绘制模式（产生要素的模式） */
export type DrawBasicMode = 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle';

/** 高级操作模式（GIS 操作） */
export type DrawAdvancedMode = 'edit' | 'split' | 'merge';

/** 工具栏显示的绘制模式（不含 none） */
export type DrawToolMode = Exclude<DrawMode, 'none'>;

/** 绘制模式对应的绘制类型（仅产生要素的模式） */
export type DrawGeometryMode = DrawBasicMode;

// ============================================================
// 绘制要素
// ============================================================

/** 绘制要素（扩展 GeoJSON Feature，携带 id 和 drawType） */
export interface DrawFeature extends Feature {
  id: string;
  properties: {
    /** 创建该要素的绘制模式 */
    drawType: DrawGeometryMode;
    [key: string]: unknown;
  };
}

// ============================================================
// 样式配置
// ============================================================

/** 点要素样式 */
export interface DrawPointStyle {
  color?: string;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

/** 线要素样式 */
export interface DrawLineStyle {
  color?: string;
  size?: number;
  opacity?: number;
}

/** 面要素样式 */
export interface DrawPolygonStyle {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
}

/** 绘制中的临时图形（rubber-band）样式 */
export interface DrawDrawingStyle {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  /** 虚线（橡皮筋引导线）颜色 */
  dashStroke?: string;
  /** 虚线宽度 */
  dashWidth?: number;
  /** 虚线 dash-array 模式 */
  dashArray?: [number, number];
}

/** 选中要素高亮样式 */
export interface DrawSelectedStyle {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  /** 选中边框虚线模式（编辑态） */
  dashArray?: [number, number];
}

/** 编辑模式顶点句柄样式 */
export interface DrawVertexStyle {
  /** 固定点填充色（白色） */
  color?: string;
  /** 固定点半径 */
  size?: number;
  /** 固定点描边色 */
  strokeColor?: string;
  /** 固定点描边宽度 */
  strokeWidth?: number;
  /** 活动点（选中/拖拽）颜色 */
  activeColor?: string;
  /** 活动点半径 */
  activeSize?: number;
}

/** 绘制控件完整样式配置 */
export interface DrawStyleConfig {
  point?: DrawPointStyle;
  line?: DrawLineStyle;
  polygon?: DrawPolygonStyle;
  drawing?: DrawDrawingStyle;
  selected?: DrawSelectedStyle;
  vertex?: DrawVertexStyle;
}

/** 吸附配置 */
export interface DrawSnapConfig {
  /** 是否启用吸附，默认 true */
  enabled?: boolean;
  /** 吸附像素阈值，默认 8px */
  threshold?: number;
  /** 是否启用顶点吸附，默认 true */
  vertex?: boolean;
  /** 是否启用边吸附，默认 true */
  edge?: boolean;
}

// ============================================================
// DrawControl Props
// ============================================================

/** DrawControl 组件 Props */
export interface DrawControlProps {
  /** 控件位置，默认 topright */
  position?: ControlPosition;
  /** 初始要素（非受控模式） */
  defaultFeatures?: DrawFeature[];
  /** 受控要素 */
  features?: DrawFeature[];
  /** 工具栏显示的模式，默认全部显示 */
  modes?: DrawToolMode[];
  /** 是否显示删除/清除按钮，默认 true */
  showDelete?: boolean;
  /** 自定义样式配置 */
  styles?: DrawStyleConfig;
  /** 吸附配置 */
  snap?: DrawSnapConfig | boolean;
  className?: string;
  style?: React.CSSProperties;
  /** 创建要素回调 */
  onDrawCreate?: (features: DrawFeature[]) => void;
  /** 更新要素回调（移动/编辑顶点） */
  onDrawUpdate?: (feature: DrawFeature) => void;
  /** 删除要素回调 */
  onDrawDelete?: (feature: DrawFeature) => void;
  /** 选中/取消选中要素回调 */
  onDrawSelect?: (feature: DrawFeature | null) => void;
  /** 模式切换回调 */
  onModeChange?: (mode: DrawMode) => void;
  /** 要素集合变化回调 */
  onChange?: (features: DrawFeature[]) => void;
}

// ============================================================
// 内部状态
// ============================================================

/** 绘制交互内部状态 */
export interface DrawState {
  /** 当前模式 */
  mode: DrawMode;
  /** 已完成要素集合 */
  features: DrawFeature[];
  /** 当前选中要素 ID */
  selectedFeatureId: string | null;
  /** 是否正在绘制中 */
  isDrawing: boolean;
  /** 正在绘制的顶点列表 */
  currentVertices: [number, number][];
  /** 矩形/圆的起始点 */
  startPoint: [number, number] | null;
  /** 当前鼠标位置（用于 rubber-band） */
  mousePoint: [number, number] | null;
  /** 编辑模式拖拽顶点索引 */
  dragVertexIndex: number | null;
  /** 是否正在拖拽 */
  isDragging: boolean;
}

/** 创建初始绘制状态 */
export function createInitialDrawState(features?: DrawFeature[]): DrawState {
  return {
    mode: 'none',
    features: features ? [...features] : [],
    selectedFeatureId: null,
    isDrawing: false,
    currentVertices: [],
    startPoint: null,
    mousePoint: null,
    dragVertexIndex: null,
    isDragging: false,
  };
}