/**
 * 文档导航数据配置
 * id 对应 src/docs/content/ 下的 md 文件路径（去掉 .md 后缀）
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
    title: 'Getting Started 快速开始',
    items: [
      { id: 'getting-started', name: 'Getting Started 快速开始', icon: 'rocket_launch' },
    ],
  },
  {
    title: 'Container 容器',
    items: [
      { id: 'container/aimap', name: 'AiMap 地图容器', icon: 'map' },
    ],
  },
  {
    title: 'Map Engines 地图引擎',
    items: [
      { id: 'engines/gaode', name: 'Gaode 高德地图', icon: 'map' },
      { id: 'engines/maplibre', name: 'MapLibre', icon: 'public' },
      { id: 'engines/mapbox', name: 'Mapbox', icon: 'travel_explore' },
      { id: 'engines/tianditu', name: 'Tianditu 天地图', icon: 'flag' },
      { id: 'engines/tencent', name: 'Tencent 腾讯地图', icon: 'chat' },
      { id: 'engines/baidu', name: 'Baidu 百度地图', icon: 'explore' },
      { id: 'engines/google', name: 'Google 谷歌地图', icon: 'language' },
      { id: 'engines/independent', name: 'Independent 独立引擎', icon: 'developer_board' },
    ],
  },
  {
    title: 'Base Layers 基础图层',
    items: [
      { id: 'layers/point-layer', name: 'PointLayer 点图层', icon: 'circle' },
      { id: 'layers/line-layer', name: 'LineLayer 线图层', icon: 'timeline' },
      { id: 'layers/polygon-layer', name: 'PolygonLayer 面图层', icon: 'format_shapes' },
      { id: 'layers/heatmap-layer', name: 'HeatmapLayer 热力图', icon: 'local_fire_department' },
      { id: 'layers/raster-layer', name: 'RasterLayer 栅格图层', icon: 'grid_view' },
      { id: 'layers/image-layer', name: 'ImageLayer 图片图层', icon: 'image' },
    ],
  },
  {
    title: 'Point Markers 点标记',
    items: [
      { id: 'composite-layers/icon-layer', name: 'IconLayer 图标图层', icon: 'label' },
      { id: 'composite-layers/builtin-icons', name: 'Builtin Icons 内置图标', icon: 'emoji_symbols' },
      { id: 'composite-layers/glyph-layer', name: 'GlyphLayer 字形图层', icon: 'font_download' },
      { id: 'composite-layers/builtin-glyphs', name: 'Builtin Glyphs 内置字形', icon: 'text_fields' },
      { id: 'interaction/marker', name: 'Marker 标记点', icon: 'location_on' },
    ],
  },
  {
    title: 'Composite Layers 复合图层',
    items: [
      { id: 'composite-layers/marker-cluster-layer', name: 'MarkerClusterLayer 聚合图层', icon: 'scatter_plot' },
      { id: 'composite-layers/route-layer', name: 'RouteLayer 路径图层', icon: 'route' },
      { id: 'composite-layers/bubble-layer', name: 'BubbleLayer 气泡图层', icon: 'bubble_chart' },
      { id: 'composite-layers/fill-layer', name: 'FillLayer 填充图层', icon: 'stacked_bar_chart' },
      { id: 'composite-layers/china-district', name: 'ChinaDistrict 中国行政区', icon: 'public' },
      { id: 'composite-layers/hexagon-layer', name: 'HexagonLayer 六边形图层', icon: 'hexagon' },
      { id: 'composite-layers/arc-flow-layer', name: 'ArcFlowLayer 弧线流向', icon: 'south_east' },
      { id: 'composite-layers/satellite-layer', name: 'SatelliteLayer 卫星图层', icon: 'satellite_alt' },
      { id: 'composite-layers/tiff-raster-layer', name: 'TiffRasterLayer TIFF栅格', icon: 'terrain' },
    ],
  },
  {
    title: 'Interaction 交互',
    items: [
      { id: 'interaction/popup', name: 'Popup 弹窗', icon: 'chat_bubble' },
      { id: 'interaction/tooltip', name: 'Tooltip 提示框', icon: 'info' },
    ],
  },
  {
    title: 'Controls 控件',
    items: [
      { id: 'controls/zoom-control', name: 'ZoomControl 缩放控件', icon: 'zoom_in' },
      { id: 'controls/scale-control', name: 'ScaleControl 比例尺', icon: 'straighten' },
      { id: 'controls/fullscreen-control', name: 'FullscreenControl 全屏控件', icon: 'fullscreen' },
      { id: 'controls/geo-locate-control', name: 'GeoLocateControl 定位控件', icon: 'my_location' },
      { id: 'controls/map-theme-control', name: 'MapThemeControl 主题切换', icon: 'palette' },
      { id: 'controls/mouse-location-control', name: 'MouseLocationControl 鼠标坐标', icon: 'pin_drop' },
      { id: 'controls/export-image-control', name: 'ExportImageControl 导出图片', icon: 'photo_camera' },
      { id: 'controls/layer-switch-control', name: 'LayerSwitchControl 图层切换', icon: 'layers' },
      { id: 'controls/draw-control', name: 'DrawControl 绘制控件', icon: 'edit' },
      { id: 'controls/image-calibration-control', name: 'ImageCalibrationControl 地图校准', icon: 'image' },
    ],
  },
  {
    title: 'Legends 图例',
    items: [
      { id: 'legends/legend-categories', name: 'LegendCategories 分类图例', icon: 'grid_view' },
      { id: 'legends/legend-ramp', name: 'LegendRamp 渐变图例', icon: 'gradient' },
      { id: 'legends/legend-diverging', name: 'LegendDiverging 发散图例', icon: 'compare_arrows' },
      { id: 'legends/legend-threshold', name: 'LegendThreshold 阈值图例', icon: 'format_line_spacing' },
      { id: 'legends/legend-size', name: 'LegendSize 尺寸图例', icon: 'radio_button_unchecked' },
      { id: 'legends/legend-line-width', name: 'LegendLineWidth 线宽图例', icon: 'linear_scale' },
      { id: 'legends/legend-proportion', name: 'LegendProportion 比例图例', icon: 'donut_large' },
      { id: 'legends/legend-icon', name: 'LegendIcon 图标图例', icon: 'label' },
    ],
  },
  {
    title: 'Mobile 移动端',
    items: [
      { id: 'mobile/bottom-sheet', name: 'BottomSheet 底部面板', icon: 'bottom_navigation' },
      { id: 'mobile/mobile-toolbar', name: 'MobileToolbar 移动端工具栏', icon: 'toolbar' },
      { id: 'mobile/mobile-sheet-legend', name: 'MobileSheetLegend 移动端图例', icon: 'legend_toggle' },
      { id: 'mobile/search-bar', name: 'SearchBar 搜索栏', icon: 'search' },
    ],
  },
  {
    title: 'Hooks 钩子',
    items: [
      { id: 'hooks/use-responsive', name: 'useResponsive 响应式钩子', icon: 'devices' },
    ],
  },
];
