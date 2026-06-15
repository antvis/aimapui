/**
 * 构建后静态 HTML 生成脚本
 * 为每个 demo 路由生成独立的 HTML 文件，包含 SEO meta 信息
 * 浏览器加载后由 React SPA 接管渲染
 */
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://aimapui.antv.vision';
const SITE_NAME = '@antv/aimapui';
const SITE_DESCRIPTION = '开箱即用的 React 地图可视化组件库。Schema 驱动 · 组件化 API · 多引擎支持 · 主题定制。基于 AntV L7 构建。';

// Demo 路由列表（与 src/main.tsx 中的 demos 数组保持同步）
const demoRoutes: Array<{ file: string; name: string; group: string; description?: string }> = [
  // 应用模板
  { file: 'app/MobileApp', name: 'MobileApp 移动端应用', group: '应用模板', description: '开箱即用的移动端地图应用模板' },
  { file: 'app/CheckInMap', name: 'CheckInMap 打卡地图', group: '应用模板', description: '地点打卡签到地图组件' },
  { file: 'app/FootprintMap', name: 'FootprintMap 足迹地图', group: '应用模板', description: '旅行足迹记录地图' },
  { file: 'app/TravelStatsMap', name: 'TravelStatsMap 旅行统计', group: '应用模板', description: '旅行数据统计可视化' },
  { file: 'app/PcApp', name: 'PcApp PC端应用', group: '应用模板', description: '完整的桌面端地图应用模板' },
  { file: 'app/ImmersiveTravelMap', name: 'ImmersiveTravelMap 沉浸式旅游', group: '应用模板', description: '沉浸式旅游足迹地图体验' },
  { file: 'app/InterestMap', name: 'InterestMap 兴趣地图', group: '应用模板', description: '兴趣点标注地图' },
  { file: 'app/FlightRouteMap', name: 'FlightRouteMap 航线地图', group: '应用模板', description: '航班飞行路线可视化' },
  { file: 'app/DarkThemeMap', name: 'DarkThemeMap 暗色主题', group: '应用模板', description: '暗色主题地图模板' },
  // 复合图层
  { file: 'composite/BubbleLayer', name: 'BubbleLayer 气泡图', group: '复合图层', description: '数据驱动的气泡标注可视化' },
  { file: 'composite/IconLabel', name: 'IconLabel 图片标注', group: '复合图层', description: '自定义图片标注图层' },
  { file: 'composite/IconFontLabel', name: 'IconFontLabel 字体标注', group: '复合图层', description: '字体图标标注图层' },
  { file: 'composite/ChoroplethMap', name: 'ChoroplethMap 分级统计', group: '复合图层', description: '行政区域数据映射渲染' },
  { file: 'composite/HexagonHeatmap', name: 'HexagonHeatmap 蜂窝热力', group: '复合图层', description: '六边形聚合空间热力可视化' },
  { file: 'composite/SatelliteLayer', name: 'SatelliteLayer 卫星影像', group: '复合图层', description: '卫星影像图层叠加' },
  { file: 'composite/MarkerCluster', name: 'MarkerCluster 聚合标注', group: '复合图层', description: '标注点聚合展示' },
  { file: 'composite/ArcFlowLayer', name: 'ArcFlowLayer 弧线流向', group: '复合图层', description: 'OD 弧线数据流向可视化' },
  { file: 'composite/RouteLayer', name: 'RouteLayer 路径地图', group: '复合图层', description: '路径路线规划展示' },
  { file: 'composite/TiffRasterLayer', name: 'TiffRasterLayer TIFF栅格', group: '复合图层', description: 'GeoTIFF 栅格数据渲染' },
  // Marker 标注
  { file: 'marker/Marker', name: 'Marker 标记点', group: 'Marker 标注', description: '地图标注点组件' },
  { file: 'marker/MarkerTest', name: 'MarkerTest 标记测试', group: 'Marker 标注', description: 'Marker 功能测试' },
  { file: 'marker/MarkerDrag', name: 'MarkerDrag 拖拽标记', group: 'Marker 标注', description: '支持拖拽交互的标注' },
  { file: 'marker/Popup', name: 'Popup 弹窗', group: 'Marker 标注', description: '地图信息弹出窗口' },
  { file: 'marker/Tooltip', name: 'Tooltip 提示框', group: 'Marker 标注', description: '悬浮轻提示信息展示' },
  // 控件
  { file: 'control/ZoomControl', name: 'ZoomControl 缩放控件', group: '控件', description: '地图缩放控制组件' },
  { file: 'control/FullscreenControl', name: 'FullscreenControl 全屏控件', group: '控件', description: '地图全屏切换控件' },
  { file: 'control/GeoLocateControl', name: 'GeoLocateControl 定位控件', group: '控件', description: '用户地理定位控件' },
  { file: 'control/MapThemeControl', name: 'MapThemeControl 主题切换', group: '控件', description: '地图底图样式切换' },
  { file: 'control/MouseLocationControl', name: 'MouseLocationControl 鼠标坐标', group: '控件', description: '鼠标位置坐标显示' },
  { file: 'control/ExportImageControl', name: 'ExportImageControl 导出图片', group: '控件', description: '地图截图导出功能' },
  { file: 'control/ThemeToggle', name: 'ThemeToggle 主题切换', group: '控件', description: '亮暗主题切换控件' },
  // 地图引擎
  { file: 'engine/GaodeMap', name: 'GaodeMap 高德地图', group: '地图引擎', description: '高德地图引擎集成' },
  { file: 'engine/MaplibreMap', name: 'MaplibreMap Maplibre', group: '地图引擎', description: 'Maplibre GL 开源地图引擎' },
  { file: 'engine/MapboxMap', name: 'MapboxMap Mapbox', group: '地图引擎', description: 'Mapbox GL 地图引擎' },
  { file: 'engine/TiandituMap', name: 'TiandituMap 天地图', group: '地图引擎', description: '天地图底图引擎' },
  { file: 'engine/TencentMap', name: 'TencentMap 腾讯地图', group: '地图引擎', description: '腾讯地图引擎集成' },
  { file: 'engine/BaiduMap', name: 'BaiduMap 百度地图', group: '地图引擎', description: '百度地图引擎集成' },
  { file: 'engine/GoogleMap', name: 'GoogleMap 谷歌地图', group: '地图引擎', description: 'Google Maps 引擎集成' },
  { file: 'engine/IndependentMap', name: 'IndependentMap 独立引擎', group: '地图引擎', description: '独立地图实例管理' },
  // 基础图层
  { file: 'layer/PointLayer', name: 'PointLayer 点图层', group: '基础图层', description: '基础点数据渲染图层' },
  { file: 'layer/GeometricPoint', name: 'GeometricPoint 几何点位', group: '基础图层', description: '几何形状点位图层' },
  { file: 'layer/ColumnLayer', name: 'ColumnLayer 3D柱图', group: '基础图层', description: '三维柱状数据可视化' },
  { file: 'layer/ColorMapping', name: 'ColorMapping 颜色映射', group: '基础图层', description: '数据到颜色的映射渲染' },
  { file: 'layer/SizeMapping', name: 'SizeMapping 大小映射', group: '基础图层', description: '数据到大小的映射渲染' },
  { file: 'layer/LineLayer', name: 'LineLayer 线图层', group: '基础图层', description: '基础线数据渲染图层' },
  { file: 'layer/PathMap', name: 'PathMap 路径地图', group: '基础图层', description: '路径轨迹数据展示' },
  { file: 'layer/LineAnimate', name: 'LineAnimate 线动画', group: '基础图层', description: '线条动画效果图层' },
  { file: 'layer/ArcMap', name: 'ArcMap 弧线地图', group: '基础图层', description: '弧线连接数据展示' },
  { file: 'layer/FlowMap', name: 'FlowMap 流向图', group: '基础图层', description: '数据流向可视化' },
  { file: 'layer/IsolineMap', name: 'IsolineMap 等值线', group: '基础图层', description: '等值线数据渲染' },
  { file: 'layer/FillLayer', name: 'FillLayer 填充图层', group: '基础图层', description: '面数据填充图层' },
  { file: 'layer/AdministrativeMap', name: 'AdministrativeMap 行政区划', group: '基础图层', description: '行政区划数据可视化' },
  { file: 'layer/Fill3DLayer', name: 'Fill3DLayer 3D填充', group: '基础图层', description: '三维面数据拉伸渲染' },
  { file: 'layer/HeatmapLayer', name: 'HeatmapLayer 热力图', group: '基础图层', description: '热力密度数据渲染' },
  { file: 'layer/HeatmapClassic', name: 'HeatmapClassic 经典热力', group: '基础图层', description: '经典样式热力渲染' },
  { file: 'layer/ImageLayer', name: 'ImageLayer 图片图层', group: '基础图层', description: '图片叠加图层' },
  { file: 'layer/RasterTileLayer', name: 'RasterTileLayer 栅格瓦片', group: '基础图层', description: '瓦片栅格数据图层' },
  { file: 'layer/MultiLayer', name: 'MultiLayer 多图层', group: '基础图层', description: '多个图层组合叠加' },
  { file: 'layer/LayerEvents', name: 'LayerEvents 图层事件', group: '基础图层', description: '图层交互事件监听' },
  { file: 'layer/MapEvents', name: 'MapEvents 地图事件', group: '基础图层', description: '地图交互事件监听' },
];

function generateHtml(
  templateHtml: string,
  route: { file?: string; name: string; description: string; path: string }
): string {
  const title = route.file
    ? `${route.name} - ${SITE_NAME} 地图可视化组件`
    : `${SITE_NAME} - Beautiful Maps, Made Simple`;
  const description = route.description || SITE_DESCRIPTION;
  const canonicalUrl = `${SITE_URL}${route.path}`;

  // 注入 SEO meta 到 <head> 中
  const seoMeta = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <!-- 结构化数据 -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "${SITE_NAME}",
      "description": "${description}",
      "url": "${canonicalUrl}",
      "applicationCategory": "DeveloperApplication"
    }
    </script>`;

  // 生成 SSR-friendly 的 HTML 骨架内容（给爬虫看的）
  const skeletonContent = route.file
    ? `<noscript>
        <h1>${route.name}</h1>
        <p>${description}</p>
        <p>此页面需要 JavaScript 运行。请启用 JavaScript 以查看交互式地图 Demo。</p>
        <a href="/">返回首页</a>
      </noscript>`
    : `<noscript>
        <h1>${SITE_NAME} - Beautiful Maps, Made Simple</h1>
        <p>${SITE_DESCRIPTION}</p>
        <h2>组件分类</h2>
        <ul>
          <li><a href="/demo/app/MobileApp">应用模板</a></li>
          <li><a href="/demo/composite/BubbleLayer">复合图层</a></li>
          <li><a href="/demo/marker/Marker">Marker 标注</a></li>
          <li><a href="/demo/control/ZoomControl">控件</a></li>
          <li><a href="/demo/engine/GaodeMap">地图引擎</a></li>
          <li><a href="/demo/layer/PointLayer">基础图层</a></li>
        </ul>
      </noscript>`;

  // 替换 template
  let html = templateHtml;
  // 替换 <title>
  html = html.replace(/<title>.*?<\/title>/, '');
  // 在 </head> 前注入 SEO meta
  html = html.replace('</head>', `${seoMeta}\n  </head>`);
  // 在 <div id="root"> 后注入骨架内容
  html = html.replace('<div id="root"></div>', `<div id="root">${skeletonContent}</div>`);

  return html;
}

function main() {
  const distDir = resolve(__dirname, '../dist-site');
  const templatePath = resolve(distDir, 'index.html');

  let templateHtml: string;
  try {
    templateHtml = readFileSync(templatePath, 'utf-8');
  } catch {
    console.error('❌ dist-site/index.html not found. Run `pnpm build:site` first.');
    process.exit(1);
  }

  // 生成首页
  const homeHtml = generateHtml(templateHtml, {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: '/',
  });
  writeFileSync(resolve(distDir, 'index.html'), homeHtml);
  console.log('✅ / (homepage)');

  // 为每个 demo 路由生成 HTML
  for (const route of demoRoutes) {
    const routePath = `/demo/${route.file}`;
    const html = generateHtml(templateHtml, {
      file: route.file,
      name: route.name,
      description: route.description || `${route.name} - ${route.group} Demo`,
      path: routePath,
    });

    const outputPath = resolve(distDir, `demo/${route.file}/index.html`);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);
    console.log(`✅ ${routePath}`);
  }

  // 生成 sitemap.xml
  const sitemapEntries = [
    `  <url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>`,
    ...demoRoutes.map(
      (r) => `  <url><loc>${SITE_URL}/demo/${r.file}</loc><priority>0.7</priority></url>`
    ),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</urlset>`;
  writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap);
  console.log('✅ sitemap.xml');

  // 生成 robots.txt
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;
  writeFileSync(resolve(distDir, 'robots.txt'), robots);
  console.log('✅ robots.txt');

  console.log(`\n🎉 Static HTML generation complete! ${demoRoutes.length + 1} pages generated.`);
}

main();
