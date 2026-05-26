export interface ExampleConfig {
  id: string
  title: string
  category: 'basic' | 'layer' | 'interaction' | 'mobile'
  description: string
  thumbnail: string
  schema: any // AimapSchema
  code: string
}

// ============================================================
// 基础数据 — 北京区域随机点
// ============================================================
const BEIJING_POINTS = Array.from({ length: 50 }, (_, i) => ({
  lng: 116.2 + Math.random() * 0.6,
  lat: 39.75 + Math.random() * 0.4,
  value: Math.round(Math.random() * 500),
  name: `地点${i + 1}`
}))

const SHANGHAI_POINTS = Array.from({ length: 40 }, (_, i) => ({
  lng: 121.3 + Math.random() * 0.5,
  lat: 31.1 + Math.random() * 0.3,
  value: Math.round(Math.random() * 400),
  name: `地点${i + 1}`
}))

// OD 流向线数据
const FLOW_LINES = Array.from({ length: 20 }, (_, i) => ({
  lng: 116.397,
  lat: 39.909,
  lng1: 116.397 + (Math.random() - 0.5) * 0.3,
  lat1: 39.909 + (Math.random() - 0.5) * 0.2,
  value: Math.round(Math.random() * 200 + 10)
}))

const CHOROPLETH_REGIONS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: '北区', value: 80, ratio: 24.2 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[116.22, 40.0], [116.36, 40.0], [116.36, 39.9], [116.22, 39.9], [116.22, 40.0]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '西区', value: 45, ratio: 13.6 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[116.22, 39.9], [116.36, 39.9], [116.36, 39.78], [116.22, 39.78], [116.22, 39.9]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '东区', value: 120, ratio: 36.4 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[116.36, 39.9], [116.52, 39.9], [116.52, 39.78], [116.36, 39.78], [116.36, 39.9]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: '南区', value: 85, ratio: 25.8 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[116.36, 39.78], [116.52, 39.78], [116.52, 39.68], [116.36, 39.68], [116.36, 39.78]]]
      }
    }
  ]
} as const

const CHOROPLETH_LABELS = [
  { lng: 116.29, lat: 39.95, name: '北区' },
  { lng: 116.29, lat: 39.84, name: '西区' },
  { lng: 116.44, lat: 39.84, name: '东区' },
  { lng: 116.44, lat: 39.73, name: '南区' }
]

export const examples: ExampleConfig[] = [
  // ============================================================
  // 基础功能 (basic)
  // ============================================================
  {
    id: 'basic-point',
    title: '基础点图层',
    category: 'basic',
    description: '展示最简单的点图层可视化，使用固定颜色和尺寸',
    thumbnail: '/images/examples/basic-point.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [{
        type: 'point',
        source: BEIJING_POINTS.slice(0, 5),
        sourceType: 'json',
        color: '#1890ff',
        size: 12
      }]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{
    type: 'point',
    source: [
      { lng: 116.397, lat: 39.909, value: 100 },
      { lng: 116.408, lat: 39.920, value: 200 },
      { lng: 116.385, lat: 39.900, value: 150 }
    ],
    sourceType: 'json',
    color: '#1890ff',
    size: 12
  }]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'basic-map-config',
    title: '地图底图配置',
    category: 'basic',
    description: '展示不同底图、中心点、缩放级别和旋转角度的配置方式',
    thumbnail: '/images/examples/basic-map-config.png',
    schema: {
      map: {
        basemap: 'gaode',
        style: 'dark',
        center: [121.473701, 31.230416],
        zoom: 11,
        pitch: 45,
        rotation: 30
      },
      layers: []
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',    // 支持 gaode / mapbox / tencent / baidu / tianditu / map
    style: 'dark',        // 支持 light / dark / normal / darkblue / satellite
    center: [121.47, 31.23], // 上海
    zoom: 11,
    pitch: 45,            // 俯仰角
    rotation: 30          // 旋转角
  },
  layers: []
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'basic-controls',
    title: '地图控件',
    category: 'basic',
    description: '展示缩放、比例尺、全屏、定位、鼠标坐标等各类控件',
    thumbnail: '/images/examples/basic-controls.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [{
        type: 'point',
        source: BEIJING_POINTS.slice(0, 10),
        sourceType: 'json',
        color: '#5B8FF9',
        size: 8
      }],
      controls: [
        { type: 'zoom', position: 'topright' },
        { type: 'scale', position: 'bottomleft' },
        { type: 'fullscreen', position: 'topright' },
        { type: 'geoLocate', position: 'topright' },
        { type: 'mouseLocation', position: 'bottomright' },
        { type: 'mapTheme', position: 'topright' },
        { type: 'exportImage', position: 'topright' },
        { type: 'layerSwitch', position: 'topright' }
      ]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{ type: 'point', source: points, sourceType: 'json', color: '#5B8FF9', size: 8 }],
  controls: [
    { type: 'zoom', position: 'topright' },         // 缩放
    { type: 'scale', position: 'bottomleft' },       // 比例尺
    { type: 'fullscreen', position: 'topright' },    // 全屏
    { type: 'geoLocate', position: 'topright' },     // 定位
    { type: 'mouseLocation', position: 'bottomright' }, // 鼠标坐标
    { type: 'mapTheme', position: 'topright' },      // 主题切换
    { type: 'exportImage', position: 'topright' },   // 导出图片
    { type: 'layerSwitch', position: 'topright' }    // 图层开关
  ]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },

  // ============================================================
  // 图层类型 (layer)
  // ============================================================
  {
    id: 'heatmap',
    title: '热力图',
    category: 'layer',
    description: '展示密度分布的热力图可视化',
    thumbnail: '/images/examples/heatmap.png',
    schema: {
      map: {
        basemap: 'gaode',
        style: 'dark',
        center: [116.397428, 39.90923],
        zoom: 11
      },
      layers: [{
        type: 'heatmap',
        source: BEIJING_POINTS,
        sourceType: 'json',
        size: 30,
        style: {
          intensity: 1,
          radius: 20,
          opacity: 0.8
        }
      }]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    style: 'dark',
    center: [116.397428, 39.90923],
    zoom: 11
  },
  layers: [{
    type: 'heatmap',
    source: heatmapData,
    sourceType: 'json',
    size: 30,
    style: { intensity: 1, radius: 20, opacity: 0.8 }
  }]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'choropleth',
    title: '分级统计图',
    category: 'layer',
    description: '区域分级统计图，默认包含 hover 提示、边界高亮和点击选中反馈',
    thumbnail: '/images/examples/choropleth.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.37, 39.84],
        zoom: 10.3
      },
      layers: [
        {
          type: 'polygon',
          source: CHOROPLETH_REGIONS,
          sourceType: 'geojson',
          colorField: 'value',
          colorValues: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'],
          active: { color: '#ffffff' },
          select: { color: '#0f172a' },
          events: {
            enablePopup: true,
            popupTrigger: 'hover',
            popupTemplate: '<div style="min-width:160px"><div style="font-weight:700;margin-bottom:6px">{{name}}</div><table style="font-size:12px"><tr><td style="padding-right:8px;color:#64748b">指标</td><td style="font-weight:600">{{value}}</td></tr><tr><td style="padding-right:8px;color:#64748b">占比</td><td style="font-weight:600">{{ratio}}%</td></tr></table></div>'
          },
          style: { opacity: 0.8 }
        },
        {
          type: 'line',
          source: CHOROPLETH_REGIONS,
          sourceType: 'geojson',
          color: 'rgba(255,255,255,0.3)',
          size: 0.5,
          zIndex: 2
        },
        {
          type: 'point',
          source: CHOROPLETH_LABELS,
          sourceType: 'json',
          sourceConfig: { x: 'lng', y: 'lat' },
          shapeField: 'name',
          shapeValues: 'text',
          color: '#0f172a',
          size: 11,
          style: {
            stroke: '#ffffff',
            strokeWidth: 2,
            textAllowOverlap: false
          }
        }
      ],
      legends: [{
        type: 'ramp',
        title: 'Value',
        labels: ['低值', '高值'],
        colors: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']
      }]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const regions = {
  type: 'FeatureCollection',
  features: [
    // ... GeoJSON Polygon 要素，含 name/value/ratio 属性
  ]
}

const labels = [
  // 文本标注点，来自区域中心点
]

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.37, 39.84],
    zoom: 10.3
  },
  layers: [
    {
      type: 'polygon',
      source: regions,
      sourceType: 'geojson',
      colorField: 'value',
      colorValues: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'],
      active: { color: '#ffffff' },
      select: { color: '#0f172a' },
      events: {
        enablePopup: true,
        popupTrigger: 'hover'
      },
      style: { opacity: 0.8 }
    },
    {
      type: 'line',
      source: regions,
      sourceType: 'geojson',
      color: 'rgba(255,255,255,0.3)',
      size: 0.5,
      zIndex: 2
    },
    {
      type: 'point',
      source: labels,
      sourceType: 'json',
      sourceConfig: { x: 'lng', y: 'lat' },
      shapeField: 'name',
      shapeValues: 'text',
      color: '#0f172a',
      size: 11,
      style: { stroke: '#fff', strokeWidth: 2, textAllowOverlap: false }
    }
  ],
  legends: [{
    type: 'ramp',
    title: 'Value',
    labels: ['低值', '高值'],
    colors: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']
  }]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'flow-map',
    title: 'OD 流向图',
    category: 'layer',
    description: '起终点流向的弧线可视化，支持动画效果',
    thumbnail: '/images/examples/flow-map.png',
    schema: {
      map: {
        basemap: 'gaode',
        style: 'dark',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [{
        type: 'line',
        source: FLOW_LINES,
        sourceType: 'json',
        sourceConfig: { x: 'lng', y: 'lat', x1: 'lng1', y1: 'lat1' },
        color: '#5B8FF9',
        size: 2,
        animate: { enable: true, duration: 4, trailLength: 2 }
      }]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    style: 'dark',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{
    type: 'line',
    source: flowData,
    sourceType: 'json',
    sourceConfig: { x: 'lng', y: 'lat', x1: 'lng1', y1: 'lat1' },
    color: '#5B8FF9',
    size: 2,
    animate: { enable: true, duration: 4, trailLength: 2 }
  }]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'color-mapping',
    title: '颜色映射',
    category: 'layer',
    description: '使用 colorField/colorValues 模式对实现数据驱动的颜色映射',
    thumbnail: '/images/examples/color-mapping.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [{
        type: 'point',
        source: BEIJING_POINTS,
        sourceType: 'json',
        colorField: 'value',
        colorValues: ['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B'],
        size: 16
      }],
      legends: [{
        type: 'ramp',
        title: '数值分布',
        labels: ['0', '100', '200', '300', '400', '500'],
        colors: ['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B'],
        isContinuous: true
      }]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{
    type: 'point',
    source: points,
    sourceType: 'json',
    colorField: 'value',           // 映射字段
    colorValues: [                 // 色板
      '#2166AC', '#67A9CF', '#D1E5F0',
      '#FDDBC7', '#EF8A62', '#B2182B'
    ],
    size: 16
  }],
  legends: [{
    type: 'ramp',
    title: '数值分布',
    labels: ['0', '100', '200', '300', '400', '500'],
    colors: ['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B'],
    isContinuous: true
  }]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'size-mapping',
    title: '气泡图（大小映射）',
    category: 'layer',
    description: '使用 sizeField/sizeValues 模式对实现数据驱动的气泡尺寸映射',
    thumbnail: '/images/examples/size-mapping.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [121.473701, 31.230416],
        zoom: 10
      },
      layers: [{
        type: 'point',
        source: SHANGHAI_POINTS,
        sourceType: 'json',
        color: '#5B8FF9',
        sizeField: 'value',
        sizeValues: [6, 30]
      }],
      legends: [{
        type: 'proportion',
        title: '数据量级',
        labels: [[0, 100], [100, 300], [300, 500]],
        fillColor: '#5B8FF9'
      }]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [121.473701, 31.230416],
    zoom: 10
  },
  layers: [{
    type: 'point',
    source: points,
    sourceType: 'json',
    color: '#5B8FF9',
    sizeField: 'value',       // 尺寸映射字段
    sizeValues: [6, 30]       // 尺寸范围 [最小, 最大]
  }],
  legends: [{
    type: 'proportion',
    title: '数据量级',
    labels: [[0, 100], [100, 300], [300, 500]],
    fillColor: '#5B8FF9'
  }]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'multi-layer',
    title: '多图层叠加',
    category: 'layer',
    description: '点图层与线图层叠加展示，搭配图例说明',
    thumbnail: '/images/examples/multi-layer.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [
        {
          type: 'line',
          source: FLOW_LINES.slice(0, 10),
          sourceType: 'json',
          sourceConfig: { x: 'lng', y: 'lat', x1: 'lng1', y1: 'lat1' },
          color: '#5B8FF9',
          size: 1.5,
          animate: { enable: true, duration: 3, trailLength: 1 },
          zIndex: 0
        },
        {
          type: 'point',
          source: BEIJING_POINTS.slice(0, 5),
          sourceType: 'json',
          color: '#F6BD16',
          size: 10,
          zIndex: 1
        }
      ],
      legends: [
        { type: 'categories', title: '图层说明', labels: ['流向线', '关键节点'], colors: ['#5B8FF9', '#F6BD16'] }
      ]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [
    {
      type: 'line',
      source: flowData,
      sourceType: 'json',
      sourceConfig: { x: 'lng', y: 'lat', x1: 'lng1', y1: 'lat1' },
      color: '#5B8FF9',
      size: 1.5,
      animate: { enable: true, duration: 3, trailLength: 1 },
      zIndex: 0
    },
    {
      type: 'point',
      source: keyPoints,
      sourceType: 'json',
      color: '#F6BD16',
      size: 10,
      zIndex: 1
    }
  ],
  legends: [
    { type: 'categories', title: '图层说明', labels: ['流向线', '关键节点'], colors: ['#5B8FF9', '#F6BD16'] }
  ]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },

  // ============================================================
  // 交互功能 (interaction)
  // ============================================================
  {
    id: 'marker-popup',
    title: 'Marker 标注与 Popup 弹窗',
    category: 'interaction',
    description: '使用 Schema 声明式添加标注和弹窗，支持拖拽',
    thumbnail: '/images/examples/marker-popup.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 11
      },
      layers: [],
      interactions: [
        {
          type: 'marker',
          longitude: 116.397428,
          latitude: 39.90923,
          content: '天安门',
          draggable: true
        },
        {
          type: 'marker',
          longitude: 116.407,
          latitude: 39.915,
          content: '王府井'
        },
        {
          type: 'popup',
          longitude: 116.391,
          latitude: 39.907,
          content: '<strong>故宫博物院</strong><br/>开放时间：8:30-17:00',
          closeButton: true
        }
      ]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 11
  },
  layers: [],
  interactions: [
    {
      type: 'marker',
      longitude: 116.397428,
      latitude: 39.90923,
      content: '天安门',
      draggable: true          // 支持拖拽
    },
    {
      type: 'marker',
      longitude: 116.407,
      latitude: 39.915,
      content: '王府井'
    },
    {
      type: 'popup',
      longitude: 116.391,
      latitude: 39.907,
      content: '<strong>故宫博物院</strong><br/>开放时间：8:30-17:00',
      closeButton: true
    }
  ]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'layer-legend',
    title: '图例配置',
    category: 'interaction',
    description: '展示分类图例、渐变色带、比例圆等不同图例类型',
    thumbnail: '/images/examples/layer-legend.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [{
        type: 'point',
        source: BEIJING_POINTS.slice(0, 20),
        sourceType: 'json',
        colorField: 'value',
        colorValues: ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A', '#6DC8EC'],
        sizeField: 'value',
        sizeValues: [6, 24]
      }],
      legends: [
        {
          type: 'categories',
          title: '区域分类',
          labels: ['中心城区', '近郊区', '远郊区', '新城', '生态区'],
          colors: ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A', '#6DC8EC']
        },
        {
          type: 'ramp',
          title: '数值渐变',
          labels: ['低', '中', '高'],
          colors: ['#2166AC', '#F7F7F7', '#B2182B'],
          isContinuous: true
        },
        {
          type: 'proportion',
          title: '量级',
          labels: [[0, 100], [100, 300], [300, 500]],
          fillColor: '#5B8FF9'
        }
      ]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{ /* ... */ }],
  legends: [
    // 分类图例
    {
      type: 'categories',
      title: '区域分类',
      labels: ['中心城区', '近郊区', '远郊区', '新城', '生态区'],
      colors: ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A', '#6DC8EC']
    },
    // 渐变色带图例
    {
      type: 'ramp',
      title: '数值渐变',
      labels: ['低', '中', '高'],
      colors: ['#2166AC', '#F7F7F7', '#B2182B'],
      isContinuous: true
    },
    // 比例圆图例
    {
      type: 'proportion',
      title: '量级',
      labels: [[0, 100], [100, 300], [300, 500]],
      fillColor: '#5B8FF9'
    }
  ]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'layer-active-select',
    title: '图层高亮与选中',
    category: 'interaction',
    description: '鼠标悬浮高亮、点击选中交互',
    thumbnail: '/images/examples/layer-active-select.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [{
        type: 'point',
        source: BEIJING_POINTS.slice(0, 15),
        sourceType: 'json',
        color: '#5B8FF9',
        size: 12,
        active: { color: '#F6BD16' },
        select: { color: '#E8684A' }
      }]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{
    type: 'point',
    source: points,
    sourceType: 'json',
    color: '#5B8FF9',
    size: 12,
    active: { color: '#F6BD16' },   // 悬浮高亮色
    select: { color: '#E8684A' }     // 点击选中色
  }]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },

  // ============================================================
  // 移动端 (mobile)
  // ============================================================
  {
    id: 'mobile-responsive',
    title: '移动端响应式',
    category: 'mobile',
    description: '配置响应式断点，自动切换移动端布局和底部工具栏',
    thumbnail: '/images/examples/mobile-responsive.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [{
        type: 'point',
        source: BEIJING_POINTS.slice(0, 10),
        sourceType: 'json',
        color: '#5B8FF9',
        size: 10
      }],
      controls: [
        { type: 'zoom', position: 'topright' },
        { type: 'scale', position: 'bottomleft' },
        { type: 'geoLocate', position: 'topright' }
      ],
      legends: [{
        type: 'categories',
        title: '区域分类',
        labels: ['一类', '二类', '三类'],
        colors: ['#5B8FF9', '#5AD8A6', '#F6BD16']
      }],
      responsive: {
        breakpoint: 768,
        mobile: {
          controls: {
            position: 'bottomcenter',
            scale: 0.85,
            hide: ['mouseLocation', 'exportImage']
          },
          legends: {
            compact: true,
            position: 'bottom'
          },
          toolbar: {
            items: ['zoomIn', 'zoomOut', 'locate', 'reset', 'layers'],
            position: 'bottom'
          }
        }
      }
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{ /* ... */ }],
  controls: [ /* ... */ ],
  legends: [ /* ... */ ],
  responsive: {
    breakpoint: 768,           // 响应式断点
    mobile: {
      controls: {
        position: 'bottomcenter',
        scale: 0.85,            // 控件缩放
        hide: ['mouseLocation', 'exportImage']  // 隐藏控件
      },
      legends: {
        compact: true,          // 紧凑模式
        position: 'bottom'
      },
      toolbar: {
        items: ['zoomIn', 'zoomOut', 'locate', 'reset', 'layers'],
        position: 'bottom'
      }
    }
  }
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'mobile-toolbar',
    title: '移动端工具栏',
    category: 'mobile',
    description: '移动端专属底部工具栏，支持缩放、定位、重置等操作',
    thumbnail: '/images/examples/mobile-toolbar.png',
    schema: {
      map: {
        basemap: 'gaode',
        center: [116.397428, 39.90923],
        zoom: 10
      },
      layers: [{
        type: 'point',
        source: BEIJING_POINTS.slice(0, 10),
        sourceType: 'json',
        color: '#E8684A',
        size: 10
      }],
      responsive: {
        breakpoint: 768,
        mobile: {
          toolbar: {
            items: ['zoomIn', 'zoomOut', 'locate', 'reset'],
            position: 'bottom'
          }
        }
      }
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{ /* ... */ }],
  responsive: {
    breakpoint: 768,
    mobile: {
      toolbar: {
        items: ['zoomIn', 'zoomOut', 'locate', 'reset'],
        position: 'bottom'   // 工具栏位置：top / bottom
      }
    }
  }
}

export default function App() {
  return <Aimap schema={schema} />
}`
  },
  {
    id: 'l7-map',
    title: 'L7 内置底图',
    category: 'basic',
    description: '使用 L7 内置的 Map 底图，无需任何 Token 即可运行',
    thumbnail: '/images/examples/l7-map.png',
    schema: {
      map: {
        basemap: 'map',
        center: [105, 35],
        zoom: 4,
        style: 'light'
      },
      layers: [{
        type: 'point',
        source: [
          { lng: 116.4, lat: 39.9, name: '北京', value: 100 },
          { lng: 121.5, lat: 31.2, name: '上海', value: 90 },
          { lng: 113.3, lat: 23.1, name: '广州', value: 80 },
          { lng: 114.1, lat: 22.5, name: '深圳', value: 85 },
          { lng: 104.1, lat: 30.6, name: '成都', value: 70 },
          { lng: 106.6, lat: 29.6, name: '重庆', value: 75 },
          { lng: 120.2, lat: 30.3, name: '杭州', value: 65 },
          { lng: 114.3, lat: 30.6, name: '武汉', value: 60 }
        ],
        sourceType: 'json',
        colorField: 'value',
        colorValues: ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A'],
        size: 14
      }]
    },
    code: `import { Aimap } from '@antv/aimapui'
import '@antv/aimapui/style.css'

// 无需 Token，使用 L7 内置底图
const schema = {
  map: {
    basemap: 'map',       // L7 内置底图
    center: [105, 35],
    zoom: 4,
    style: 'light'
  },
  layers: [{
    type: 'point',
    source: [
      { lng: 116.4, lat: 39.9, name: '北京', value: 100 },
      { lng: 121.5, lat: 31.2, name: '上海', value: 90 },
      // ... 更多城市
    ],
    sourceType: 'json',
    colorField: 'value',
    colorValues: ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A'],
    size: 14
  }]
}

export default function App() {
  return <Aimap schema={schema} />
}`
  }
]

export function getExampleById(id: string): ExampleConfig | undefined {
  return examples.find(e => e.id === id)
}

export function getExamplesByCategory(category: ExampleConfig['category']): ExampleConfig[] {
  return examples.filter(e => e.category === category)
}