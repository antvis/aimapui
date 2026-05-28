/**
 * @antv/aimapui Schema 类型定义
 * 纯可序列化 Schema，面向 AI 生成优化
 */

// ============================================================
// 地图底图
// ============================================================

export type BasemapType = 'gaode' | 'mapbox' | 'maplibre' | 'tianditu' | 'tencent' | 'baidu' | 'map';

export type MapStylePreset = 'light' | 'dark' | 'normal' | 'darkblue' | 'satellite';

export interface GestureConfig {
  dragPan?: boolean;
  pinchZoom?: boolean;
  dragRotate?: boolean;
}

export interface MapSchema {
  basemap: BasemapType;
  token?: string;
  style?: MapStylePreset | string;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  rotation?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: [[number, number], [number, number]];
  gestureConfig?: GestureConfig;
}

// ============================================================
// 图层
// ============================================================

export type LayerType = 'point' | 'line' | 'polygon' | 'heatmap' | 'raster' | 'image';

export type SourceType = 'geojson' | 'json' | 'csv' | 'raster' | 'rasterTile' | 'image';

export interface SourceConfig {
  x?: string;
  y?: string;
  x1?: string;
  y1?: string;
  coordinates?: string;
  parser?: Record<string, unknown>;
  transforms?: Array<Record<string, unknown>>;
}

export interface AnimateConfig {
  enable: boolean;
  speed?: number;
  duration?: number;
  trailLength?: number;
  repeat?: number;
}

export type ActiveConfig = boolean | { color: string };
export type SelectConfig = boolean | { color: string };

export interface LayerSchema {
  id?: string;
  type: LayerType;
  name?: string;
  visible?: boolean;
  zIndex?: number;
  minZoom?: number;
  maxZoom?: number;
  autoFit?: boolean;

  // 数据源
  source: unknown;
  sourceType?: SourceType;
  sourceConfig?: SourceConfig;

  // 视觉映射 — Field/Values 模式对
  color?: string;
  colorField?: string;
  colorValues?: string[] | string;

  size?: number;
  sizeField?: string;
  sizeValues?: number[];

  shape?: string;
  shapeField?: string;
  shapeValues?: string[] | string;

  style?: Record<string, unknown>;

  /** 图层整体不透明度，0~1，默认 1 */
  opacity?: number;
  /** 图层混合模式，对齐 CSS mix-blend-mode */
  blend?: 'normal' | 'additive' | 'subtractive' | 'max';

  // 过滤 / 动画 / 交互
  filterField?: string;
  filterValues?: unknown[];
  animate?: AnimateConfig;
  active?: ActiveConfig;
  select?: SelectConfig;

  // 图层事件（声明式 — Schema 可序列化）
  events?: LayerEventSchema;
}

/** 图层级别事件配置 */
export interface LayerEventSchema {
  /** 点击事件标识符，触发时通过 EventBus 广播 */
  click?: EventIdentifier;
  /** 鼠标悬浮事件标识符 */
  mousemove?: EventIdentifier;
  /** 鼠标移入事件标识符 */
  mouseenter?: EventIdentifier;
  /** 鼠标移出事件标识符 */
  mouseleave?: EventIdentifier;
  /** 是否启用内置 Popup（点击显示数据） */
  enablePopup?: boolean;
  /** Popup 触发方式，默认 click */
  popupTrigger?: 'click' | 'hover';
  /** Popup 显示的字段，不设则显示所有字段 */
  popupFields?: string[];
  /** Popup 模板，支持 {{field}} 占位符 */
  popupTemplate?: string;
}

// ============================================================
// 控件
// ============================================================

export type ControlType =
  | 'zoom'
  | 'scale'
  | 'fullscreen'
  | 'geoLocate'
  | 'mapTheme'
  | 'mouseLocation'
  | 'exportImage'
  | 'layerSwitch';

export type ControlPosition =
  | 'topleft'
  | 'topright'
  | 'bottomleft'
  | 'bottomright'
  | 'topcenter'
  | 'bottomcenter'
  | 'lefttop'
  | 'leftbottom'
  | 'righttop'
  | 'rightbottom';

export interface ControlSchema {
  type: ControlType;
  position?: ControlPosition;
  options?: Record<string, unknown>;
}

// ============================================================
// 交互元素（Marker / Popup / Tooltip）
// ============================================================

export interface MarkerSchema {
  type: 'marker';
  longitude: number;
  latitude: number;
  /** 标注内容，支持纯文本 / HTML 字符串 */
  content?: string;
  draggable?: boolean;
}

export interface PopupSchema {
  type: 'popup';
  longitude: number;
  latitude: number;
  /** 弹窗内容，支持纯文本 / HTML 字符串 */
  content: string;
  closeButton?: boolean;
  /** 尺寸变体 */
  size?: 'compact' | 'standard' | 'detailed';
  /** 弹出位置，默认 auto */
  placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  /** 弹出框偏移量（像素），默认 8 */
  offset?: number;
  /** 是否启用互斥模式 */
  singleton?: boolean;
}

export interface TooltipSchema {
  type: 'tooltip';
  content: string;
  trigger?: 'hover' | 'click';
  /** 视觉变体 */
  variant?: 'dark' | 'glass' | 'light';
  /** 经度（地图定位模式） */
  longitude?: number;
  /** 纬度（地图定位模式） */
  latitude?: number;
  /** 方向 */
  placement?: 'top' | 'right' | 'bottom' | 'left';
  /** 偏移距离 */
  offset?: number;
}

export type InteractionSchema = MarkerSchema | PopupSchema | TooltipSchema;

// ============================================================
// 图例
// ============================================================

/** 分类图例色块形状 */
export type LegendSwatchShape = 'square' | 'circle';

export interface LegendCategoriesSchema {
  type: 'categories';
  title?: string;
  labels: string[];
  colors: string[];
  /** 色块形状，默认 'square' */
  swatchShape?: LegendSwatchShape;
  /** 是否使用两列网格布局，默认 false */
  grid?: boolean;
}

export interface LegendRampSchema {
  type: 'ramp';
  title?: string;
  labels: string[];
  colors: string[];
  /** 连续渐变 vs 分段色块，默认 false（分段） */
  isContinuous?: boolean;
  /** 是否显示刻度线 */
  showTicks?: boolean;
  /** 是否启用范围刷选 */
  brushable?: boolean;
}

/** 发散图例：双极渐变（如 红→灰→绿） */
export interface LegendDivergingSchema {
  type: 'diverging';
  title?: string;
  /** 渐变色列表，从左到右（如 ['#ef4444','#ccc','#10b981']） */
  colors: string[];
  /** [左端标签, 右端标签] */
  labels: [string, string];
  /** 中间值标签（如 '0' 或 'Avg'） */
  middleLabel?: string;
}

/** 阈值图例：自定义分段垂直列表 */
export interface LegendThresholdSchema {
  type: 'threshold';
  title?: string;
  /** 区间定义 [min, max)，从上到下排列 */
  ranges: [number | string, number | string][];
  /** 每个区间对应的颜色 */
  colors: string[];
}

/** 比例大小图例：圆形大小映射 */
export interface LegendSizeSchema {
  type: 'size';
  title?: string;
  /** 填充色 */
  fillColor?: string;
  /** 大小项：圆直径 (px) + 标签 */
  items: Array<{ size: number; label: string }>;
}

/** 线宽图例 */
export interface LegendLineWidthSchema {
  type: 'lineWidth';
  title?: string;
  /** 线条颜色 */
  color?: string;
  /** 线宽项 */
  items: Array<{ width: number; label: string }>;
}

export interface LegendProportionSchema {
  type: 'proportion';
  title?: string;
  labels: [number, number][];
  fillColor?: string;
}

export interface LegendIconItem {
  icon: string;
  label: string;
}

export interface LegendIconSchema {
  type: 'icon';
  title?: string;
  items: LegendIconItem[];
}

export type LegendSchema =
  | LegendCategoriesSchema
  | LegendRampSchema
  | LegendDivergingSchema
  | LegendThresholdSchema
  | LegendSizeSchema
  | LegendLineWidthSchema
  | LegendProportionSchema
  | LegendIconSchema;

/** 图例交互回调 */
export interface LegendInteractionCallbacks {
  /** 悬停高亮：传入图例项索引，-1 表示取消 */
  onHover?: (index: number) => void;
  /** 点击切换显隐：传入图例项索引 */
  onToggle?: (index: number) => void;
  /** 范围刷选：连续型图例的数据范围 [min, max] */
  onBrush?: (range: [number, number]) => void;
}

// ============================================================
// 响应式
// ============================================================

export interface MobileControlConfig {
  position?: string;
  scale?: number;
  hide?: string[];
}

export interface MobileLayerOverrides {
  [id: string]: Partial<LayerSchema>;
}

export interface MobileLegendConfig {
  compact?: boolean;
  position?: string;
}

export interface MobileToolbarConfig {
  items: string[];
  position: 'bottom' | 'top';
}

export interface MobileConfig {
  controls?: MobileControlConfig;
  layers?: MobileLayerOverrides | { '*': Partial<LayerSchema> };
  legends?: MobileLegendConfig;
  toolbar?: MobileToolbarConfig;
}

export interface ResponsiveSchema {
  breakpoint?: number;
  mobile?: MobileConfig;
}

// ============================================================
// 事件
// ============================================================

export type EventIdentifier = string;

/** L7 图层事件回调参数 */
export interface LayerEventPayload {
  /** 触发事件的图层 ID（schema.id 或自动生成） */
  layerId: string;
  /** 图层类型 */
  layerType: LayerType;
  /** L7 原始事件对象 */
  originalEvent: unknown;
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 命中的数据属性 */
  feature?: Record<string, unknown>;
}

/** 地图事件回调参数 */
export interface MapEventPayload {
  /** L7 原始事件对象 */
  originalEvent: unknown;
  /** 当前中心点 */
  center: [number, number];
  /** 当前缩放级别 */
  zoom: number;
  /** 当前俯仰角 */
  pitch: number;
  /** 当前旋转角 */
  rotation: number;
}

export interface EventSchema {
  /** 地图移动事件标识符 */
  mapMove?: EventIdentifier;
  /** 地图缩放事件标识符 */
  mapZoom?: EventIdentifier;
  /** Marker 拖拽结束事件标识符 */
  markerDragEnd?: EventIdentifier;
}

// ============================================================
// 顶层 Schema
// ============================================================

export interface AiMapSchema {
  map: MapSchema;
  layers: LayerSchema[];
  controls?: ControlSchema[];
  interactions?: InteractionSchema[];
  legends?: LegendSchema[];
  responsive?: ResponsiveSchema;
  events?: EventSchema;
}
