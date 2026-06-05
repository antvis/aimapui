/**
 * @antv/aimapui
 * Schema/DSL 驱动的 React 地图可视化组件库
 */

// 样式
import './styles/tailwind.css';

// 主入口组件
export { AiMap } from './components/AiMap';
export type { AiMapProps } from './components/AiMap/types';

// Schema 类型
export type {
  AiMapSchema,
  MapSchema,
  BasemapType,
  MapStylePreset,
  GestureConfig,
  LayerSchema,
  LayerType,
  SourceType,
  SourceConfig,
  AnimateConfig,
  ActiveConfig,
  SelectConfig,
  ControlSchema,
  ControlType,
  ControlPosition,
  InteractionSchema,
  MarkerSchema,
  PopupSchema,
  TooltipSchema,
  LegendSchema,
  LegendCategoriesSchema,
  LegendRampSchema,
  LegendDivergingSchema,
  LegendThresholdSchema,
  LegendSizeSchema,
  LegendLineWidthSchema,
  LegendProportionSchema,
  LegendIconSchema,
  LegendIconItem,
  LegendSwatchShape,
  LegendInteractionCallbacks,
  ResponsiveSchema,
  MobileConfig,
  MobileControlConfig,
  MobileLayerOverrides,
  MobileLegendConfig,
  MobileToolbarConfig,
  EventSchema,
  LayerEventSchema,
  LayerEventPayload,
  MapEventPayload,
} from './schema/types';

// Schema 工具
export { applySchemaDefaults, applyMapDefaults, applyLayerDefaults, applyControlDefaults } from './schema/defaults';
export { parseSchema, validateSchema } from './core/parser';
export { diffSchema } from './core/diff';
export type { SchemaDiffResult } from './core/diff';
export { validateAiMapSchema } from './schema/validator';
export type { ValidationError } from './schema/validator';
export { AiMapJSONSchema } from './schema/json-schema';

// 事件总线
export { EventBus, createEventBus } from './core/event-bus';

// Context
export { SceneProvider, useScene } from './context/SceneContext';
export { SchemaProvider, useSchema } from './context/SchemaContext';
export { ResponsiveProvider, useResponsive } from './context/ResponsiveContext';
export { EventBusProvider, useEventBus } from './context/EventBusContext';
export { ThemeProvider, useTheme } from './context/ThemeContext';
export type { MapTheme, ThemeProviderProps } from './context/ThemeContext';

// Hooks
export { useMapPosition } from './hooks/useMapPosition';
export type { ScreenPosition } from './hooks/useMapPosition';
export { useMapControl } from './hooks/useMapControl';
export type { ControlPosition as L7ControlPosition, ControlProps } from './hooks/useMapControl';

// 底图工厂（内部使用，不推荐直接调用）
/** @internal */
export { createBasemap } from './components/MapScene/basemap-factory';

// 组件
/** @internal */
export { MapSceneRenderer } from './components/MapScene/MapSceneRenderer';
export { LayerRenderer } from './components/Layer/LayerRenderer';
export type { LayerEventHandlers } from './components/Layer/SchemaLayer';
export { ControlRenderer } from './components/Control/ControlRenderer';
export { ControlContainer, ControlRegistry, useControlContainer } from './components/Control/ControlContainer';
export { InteractionRenderer } from './components/Interaction/InteractionRenderer';
export { LegendRenderer } from './components/Legend/LegendRenderer';

// 图层组件（组件化 API）
export { PointLayer } from './components/Layer/PointLayer';
export type { PointLayerProps } from './components/Layer/PointLayer';
export { LineLayer } from './components/Layer/LineLayer';
export type { LineLayerProps } from './components/Layer/LineLayer';
export { PolygonLayer } from './components/Layer/PolygonLayer';
export type { PolygonLayerProps } from './components/Layer/PolygonLayer';
export { HeatmapLayer } from './components/Layer/HeatmapLayer';
export type { HeatmapLayerProps } from './components/Layer/HeatmapLayer';
export { HexagonLayer } from './components/CompositeLayer/HexagonLayer';
export type { HexagonLayerProps } from './components/CompositeLayer/HexagonLayer';
/** @deprecated 使用 HexagonLayer 替代 */
export { HexagonLayer as HeatmapHexagonLayer } from './components/CompositeLayer/HexagonLayer';
/** @deprecated 使用 HexagonLayerProps 替代 */
export type { HexagonLayerProps as HeatmapHexagonLayerProps } from './components/CompositeLayer/HexagonLayer';
export { RasterLayer } from './components/Layer/RasterLayer';
export type { RasterLayerProps } from './components/Layer/RasterLayer';
export { ImageLayer } from './components/Layer/ImageLayer';
export type { ImageLayerProps } from './components/Layer/ImageLayer';
export { BubbleLayer } from './components/CompositeLayer/BubbleLayer';
export type { BubbleLayerProps } from './components/CompositeLayer/BubbleLayer';
export { MarkerClusterLayer } from './components/CompositeLayer/MarkerClusterLayer';
export type { MarkerClusterLayerProps } from './components/CompositeLayer/MarkerClusterLayer';
export { FillLayer } from './components/CompositeLayer/FillLayer';
export type { FillLayerProps } from './components/CompositeLayer/FillLayer';
export { ChinaDistrict, ADMIN_SEQUENTIAL_COLORS, DEFAULT_PROVINCE_SOURCE, DEFAULT_CITY_SOURCE, DEFAULT_DISTRICT_SOURCE } from './components/CompositeLayer/ChinaDistrict';
export type { ChinaDistrictProps, ChinaDistrictHandle, AdministrativeLevel, DrillPathNode, BusinessDataItem } from './components/CompositeLayer/ChinaDistrict';
export { GlyphLayer } from './components/CompositeLayer/GlyphLayer';
export type { GlyphLayerProps, LabelAnchor } from './components/CompositeLayer/GlyphLayer';
export { IconLayer } from './components/CompositeLayer/IconLayer';
export type { IconLayerProps, IconAnchor } from './components/CompositeLayer/IconLayer';
export { SatelliteLayer, SATELLITE_PROVIDER_NAMES } from './components/CompositeLayer/SatelliteLayer';
export type { SatelliteLayerProps, SatelliteProvider } from './components/CompositeLayer/SatelliteLayer';
export { ArcFlowLayer } from './components/CompositeLayer/ArcFlowLayer';
export type { ArcFlowLayerProps, ArcFlowDataItem, ArcShape, ArcColorMode } from './components/CompositeLayer/ArcFlowLayer';
export { RouteLayer } from './components/CompositeLayer/RouteLayer';
export type { RouteLayerProps, RouteStop, RouteSegment } from './components/CompositeLayer/RouteLayer';
export { TiffRasterLayer } from './components/CompositeLayer/TiffRasterLayer';
export type { TiffRasterLayerProps, RampColors, RasterRenderMode } from './components/CompositeLayer/TiffRasterLayer';

// Control 组件
export { ZoomControl } from './components/Control/ZoomControl';
export type { ZoomControlProps } from './components/Control/ZoomControl';
export { ScaleControl } from './components/Control/ScaleControl';
export type { ScaleControlProps } from './components/Control/ScaleControl';
export { FullscreenControl } from './components/Control/FullscreenControl';
export type { FullscreenControlProps } from './components/Control/FullscreenControl';
export { GeoLocateControl } from './components/Control/GeoLocateControl';
export type { GeoLocateControlProps } from './components/Control/GeoLocateControl';
export { MapThemeControl, GAODE_THEME_PRESETS, OPENFREEMAP_THEME_PRESETS, INDEPENDENT_MAP_THEME_PRESETS } from './components/Control/MapThemeControl';
export type { MapThemeControlProps, ThemeOption } from './components/Control/MapThemeControl';
export { MouseLocationControl } from './components/Control/MouseLocationControl';
export type { MouseLocationControlProps } from './components/Control/MouseLocationControl';
export { ExportImageControl } from './components/Control/ExportImageControl';
export type { ExportImageControlProps } from './components/Control/ExportImageControl';
export { LayerSwitchControl } from './components/Control/LayerSwitchControl';
export type { LayerSwitchControlProps, LayerItem } from './components/Control/LayerSwitchControl';
export { LegendControl } from './components/Control/LegendControl';
export type { LegendControlProps } from './components/Control/LegendControl';
export { LogoControl } from './components/Control/LogoControl';
export type { LogoControlProps, LogoItem } from './components/Control/LogoControl';

// Interaction 组件
export { Marker } from './components/Interaction/Marker';
export type { MarkerProps, MarkerVariant, MarkerColor } from './components/Interaction/Marker';
export { MAKI_ICONS, MAKI_ICON_NAMES, makiIconUrl, createMakiIconMap, makiPinUrl, createMakiPinMap } from './components/Interaction/maki-icons';
export type { MakiIconName } from './components/Interaction/maki-icons';
export { Popup } from './components/Interaction/Popup';
export type { PopupProps, PopupSize, PopupPlacement, PopupHeader, PopupAttribute, PopupAction } from './components/Interaction/Popup';
export { Tooltip } from './components/Interaction/Tooltip';
export type { TooltipProps, TooltipVariant, TooltipPlacement, TooltipItem } from './components/Interaction/Tooltip';

// Legend 组件
export { LegendCategories } from './components/Legend/LegendCategories';
export { LegendRamp } from './components/Legend/LegendRamp';
export { LegendDiverging } from './components/Legend/LegendDiverging';
export { LegendThreshold } from './components/Legend/LegendThreshold';
export { LegendSize } from './components/Legend/LegendSize';
export { LegendLineWidth } from './components/Legend/LegendLineWidth';
export { LegendProportion } from './components/Legend/LegendProportion';
export { LegendIcon } from './components/Legend/LegendIcon';

// Mobile 组件
export { MobileToolbar } from './components/Mobile/MobileToolbar';
export { MobileSheetLegend } from './components/Mobile/MobileSheetLegend';
export { BottomSheet } from './components/Mobile/BottomSheet';
export type { BottomSheetProps, BottomSheetSnap } from './components/Mobile/BottomSheet';
export { SearchBar } from './components/Mobile/SearchBar';
export type { SearchBarProps } from './components/Mobile/SearchBar';

// 图层适配器
export { adaptPointLayer } from './components/Layer/adapters/point';
export { adaptLineLayer } from './components/Layer/adapters/line';
export { adaptPolygonLayer } from './components/Layer/adapters/polygon';
export { adaptHeatmapLayer } from './components/Layer/adapters/heatmap';
export { adaptRasterLayer } from './components/Layer/adapters/raster';
export { adaptImageLayer } from './components/Layer/adapters/image';

// 工具函数
export { deepMerge, applyResponsiveOverrides } from './utils/deep-merge';
export { cx, hexToRgba } from './utils/style';

// 错误边界
export { ErrorBoundary } from './components/ErrorBoundary';
