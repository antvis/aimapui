# 交互功能

aimapkit 支持丰富的交互功能,包括点击、悬停、拖拽等交互效果。

## 图层交互

### 鼠标悬停

当鼠标悬停在图层元素上时,可以高亮显示:

```tsx
const schema = {
  layers: [{
    type: 'point',
    source: [...],
    sourceType: 'json',
    color: '#1890ff',
    size: 10,
    active: {
      color: '#ff4d4f' // 悬停时变为红色
    }
  }]
}
```

### 点击选中

点击图层元素时,可以选中并高亮:

```tsx
const schema = {
  layers: [{
    type: 'point',
    source: [...],
    sourceType: 'json',
    color: '#1890ff',
    size: 10,
    select: {
      color: '#52c41a' // 选中时变为绿色
    }
  }]
}
```

### 信息窗体

点击时显示信息窗体:

```tsx
const schema = {
  layers: [{
    type: 'point',
    source: [
      { lng: 116.397, lat: 39.909, name: '地点1', value: 100 },
      { lng: 116.398, lat: 39.910, name: '地点2', value: 200 }
    ],
    sourceType: 'json',
    color: '#1890ff',
    size: 10,
    enablePopup: true,        // 启用 Popup
    popupFields: ['name', 'value'] // 显示的字段
  }]
}
```

## Marker 标记

添加可拖拽的标记点:

```tsx
const schema = {
  interactions: [{
    type: 'marker',
    longitude: 116.397,
    latitude: 39.909,
    content: '这是一个标记',
    draggable: true // 允许拖拽
  }]
}
```

## Popup 窗体

在指定位置显示信息窗体:

```tsx
const schema = {
  interactions: [{
    type: 'popup',
    longitude: 116.397,
    latitude: 39.909,
    content: '<div>信息内容</div>',
    closeButton: true // 显示关闭按钮
  }]
}
```

## Tooltip 提示

鼠标悬停时显示提示:

```tsx
const schema = {
  interactions: [{
    type: 'tooltip',
    content: '这是提示信息',
    trigger: 'hover' // 'hover' 或 'click'
  }]
}
```

## 事件监听

通过 `onSceneReady` 回调监听地图事件:

```tsx
import { Aimap } from '@antv/aimapkit'
import type { Scene } from '@antv/l7'

function App() {
  const handleSceneReady = (scene: Scene) => {
    // 监听地图点击
    scene.on('click', (e) => {
      console.log('点击位置:', e.lnglat)
    })

    // 监听地图移动
    scene.on('moveend', () => {
      console.log('地图中心:', scene.getCenter())
    })

    // 监听缩放
    scene.on('zoomend', () => {
      console.log('缩放级别:', scene.getZoom())
    })
  }

  return <Aimap schema={schema} onSceneReady={handleSceneReady} />
}
```

## 自定义事件

通过 `events` 配置自定义事件处理:

```tsx
const schema = {
  layers: [{
    type: 'point',
    source: [...]
  }]
}

<Aimap 
  schema={schema}
  events={{
    'layer:click': (e) => {
      console.log('图层点击', e)
    },
    'layer:mouseenter': (e) => {
      console.log('鼠标进入', e)
    }
  }}
/>
```

## 下一步

- [控件配置](/docs/guides/controls) - 添加地图控件
- [图例配置](/docs/guides/legend) - 添加图例说明