/**
 * 文档导航数据配置
 * id 对应 src/demos/docs/content/ 下的 md 文件路径（去掉 .md 后缀）
 */

export interface DocNavItem {
  id: string;
  name: string;
  icon: string;
}

export interface DocNavGroup {
  title: string;
  items: DocNavItem[];
}

export const docsNav: DocNavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { id: 'getting-started', name: 'Getting Started', icon: 'rocket_launch' },
    ],
  },
  {
    title: '容器组件',
    items: [
      { id: 'container/aimap', name: 'AiMap', icon: 'map' },
    ],
  },
  {
    title: '基础图层',
    items: [
      { id: 'layers/point-layer', name: 'PointLayer', icon: 'circle' },
      { id: 'layers/line-layer', name: 'LineLayer', icon: 'timeline' },
      { id: 'layers/polygon-layer', name: 'PolygonLayer', icon: 'format_shapes' },
      { id: 'layers/heatmap-layer', name: 'HeatmapLayer', icon: 'local_fire_department' },
      { id: 'layers/raster-layer', name: 'RasterLayer', icon: 'grid_view' },
      { id: 'layers/image-layer', name: 'ImageLayer', icon: 'image' },
    ],
  },
  {
    title: '复合图层',
    items: [
      { id: 'composite-layers/arc-flow-layer', name: 'ArcFlowLayer', icon: 'south_east' },
      { id: 'composite-layers/bubble-layer', name: 'BubbleLayer', icon: 'bubble_chart' },
      { id: 'composite-layers/china-district', name: 'ChinaDistrict', icon: 'public' },
      { id: 'composite-layers/fill-layer', name: 'FillLayer', icon: 'stacked_bar_chart' },
      { id: 'composite-layers/hexagon-layer', name: 'HexagonLayer', icon: 'hexagon' },
      { id: 'composite-layers/icon-font-layer', name: 'IconFontLayer', icon: 'font_download' },
      { id: 'composite-layers/icon-image-layer', name: 'IconImageLayer', icon: 'label' },
      { id: 'composite-layers/marker-cluster-layer', name: 'MarkerClusterLayer', icon: 'scatter_plot' },
      { id: 'composite-layers/route-layer', name: 'RouteLayer', icon: 'route' },
      { id: 'composite-layers/satellite-layer', name: 'SatelliteLayer', icon: 'satellite_alt' },
      { id: 'composite-layers/tiff-raster-layer', name: 'TiffRasterLayer', icon: 'terrain' },
    ],
  },
  {
    title: '交互组件',
    items: [
      { id: 'interaction/marker', name: 'Marker', icon: 'location_on' },
      { id: 'interaction/popup', name: 'Popup', icon: 'chat_bubble' },
      { id: 'interaction/tooltip', name: 'Tooltip', icon: 'info' },
    ],
  },
  {
    title: '控件',
    items: [
      { id: 'controls/zoom-control', name: 'ZoomControl', icon: 'zoom_in' },
      { id: 'controls/scale-control', name: 'ScaleControl', icon: 'straighten' },
      { id: 'controls/fullscreen-control', name: 'FullscreenControl', icon: 'fullscreen' },
      { id: 'controls/geo-locate-control', name: 'GeoLocateControl', icon: 'my_location' },
      { id: 'controls/map-theme-control', name: 'MapThemeControl', icon: 'palette' },
      { id: 'controls/mouse-location-control', name: 'MouseLocationControl', icon: 'pin_drop' },
      { id: 'controls/export-image-control', name: 'ExportImageControl', icon: 'photo_camera' },
      { id: 'controls/layer-switch-control', name: 'LayerSwitchControl', icon: 'layers' },
    ],
  },
  {
    title: '图例',
    items: [
      { id: 'legends/legend-categories', name: 'LegendCategories', icon: 'grid_view' },
      { id: 'legends/legend-ramp', name: 'LegendRamp', icon: 'gradient' },
      { id: 'legends/legend-diverging', name: 'LegendDiverging', icon: 'compare_arrows' },
      { id: 'legends/legend-threshold', name: 'LegendThreshold', icon: 'format_line_spacing' },
      { id: 'legends/legend-size', name: 'LegendSize', icon: 'radio_button_unchecked' },
      { id: 'legends/legend-line-width', name: 'LegendLineWidth', icon: 'linear_scale' },
      { id: 'legends/legend-proportion', name: 'LegendProportion', icon: 'donut_large' },
      { id: 'legends/legend-icon', name: 'LegendIcon', icon: 'label' },
    ],
  },
  {
    title: '移动端',
    items: [
      { id: 'mobile/bottom-sheet', name: 'BottomSheet', icon: 'bottom_navigation' },
      { id: 'mobile/mobile-toolbar', name: 'MobileToolbar', icon: 'toolbar' },
      { id: 'mobile/mobile-sheet-legend', name: 'MobileSheetLegend', icon: 'legend_toggle' },
      { id: 'mobile/search-bar', name: 'SearchBar', icon: 'search' },
    ],
  },
  {
    title: 'Hooks',
    items: [
      { id: 'hooks/use-responsive', name: 'useResponsive', icon: 'devices' },
    ],
  },
];