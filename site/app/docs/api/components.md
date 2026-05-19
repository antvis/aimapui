# Aimap 组件

`Aimap` 是 aimapkit 的主入口组件,通过 Schema 配置即可渲染完整地图。

## 基本用法

```tsx
import { Aimap } from '@antv/aimapkit'
import '@antv/aimapkit/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397, 39.909],
    zoom: 10
  },
  layers: [...]
}

function App() {
  return <Aimap schema={schema} />
}
```

## Props

```tsx
interface AimapProps {
  /** Schema 配置 */
  schema: AimapSchema
  
  /** 场景就绪回调 */
  onSceneReady?: (scene: Scene) => void
  
  /** 自定义事件处理 */
  events?: Record<string, (...args: unknown[]) => void>
  
  /** 容器 className */
  className?: string
  
  /** 容器 style */
  style?: React.CSSProperties
}
```

## schema

必填项,完整的地图配置 Schema:

```tsx
const schema: AimapSchema = {
  map: {
    basemap: 'gaode',
    center: [116.397, 39.909],
    zoom: 10
  },
  layers: [{
    type: 'point',
    source: [...]
  }],
  controls: [...],
  legend: {...}
}

<Aimap schema={schema} />
```

## onSceneReady

场景就绪后回调,返回 L7 Scene 对象:

```tsx
import type { Scene } from '@antv/l7'

<Aimap 
  schema={schema}
  onSceneReady={(scene: Scene) => {
    console.log('地图场景就绪')
    
    // 获取地图中心
    const center = scene.getCenter()
    
    // 监听事件
    scene.on('click', (e) => {
      console.log('点击位置:', e.lnglat)
    })
  }}
/>
```

## events

自定义事件处理:

```tsx
<Aimap 
  schema={schema}
  events={{
    'layer:click': (e) => {
      console.log('图层点击', e.feature)
    },
    'layer:mouseenter': (e) => {
      console.log('鼠标进入图层')
    }
  }}
/>
```

## className & style

容器样式配置:

```tsx
<Aimap 
  schema={schema}
  className="my-map-container"
  style={{
    width: '100%',
    height: '500px',
    border: '1px solid #ccc'
  }}
/>
```

## 动态更新 Schema

Schema 支持动态更新,会自动触发重绘:

```tsx
const [schema, setSchema] = useState(initialSchema)

// 更新中心点
setSchema(prev => ({
  ...prev,
  map: {
    ...prev.map,
    center: [121.473, 31.230]
  }
}))

// 更新图层
setSchema(prev => ({
  ...prev,
  layers: [...prev.layers, newLayer]
}))
```

## 完整示例

```tsx
import { Aimap } from '@antv/aimapkit'
import '@antv/aimapkit/style.css'
import type { Scene } from '@antv/l7'

function MapApp() {
  const schema = {
    map: {
      basemap: 'gaode',
      token: 'YOUR_KEY',
      center: [116.397, 39.909],
      zoom: 10
    },
    layers: [{
      type: 'point',
      source: [
        { lng: 116.397, lat: 39.909, value: 100 }
      ],
      sourceType: 'json',
      color: '#1890ff',
      size: 10
    }],
    controls: [
      { type: 'zoom', position: 'topright' }
    ]
  }

  const handleSceneReady = (scene: Scene) => {
    scene.on('click', (e) => {
      console.log('点击:', e.lnglat)
    })
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Aimap 
        schema={schema}
        onSceneReady={handleSceneReady}
      />
    </div>
  )
}
```

## 相关 API

- [Schema 类型](/docs/api/schema-types) - Schema 类型定义
- [图层组件](/docs/api/layers) - 图层 API
- [控件组件](/docs/api/controls) - 控件 API