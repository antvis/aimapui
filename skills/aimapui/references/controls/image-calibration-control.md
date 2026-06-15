# ImageCalibrationControl — 图片配准控件

上传图片并通过拖拽 4 个角点进行地理配准，输出配准坐标和变换后的图片。支持单图导出、网格切片导出和 ZIP 打包下载。

默认位置：`topright`

## 基础用法

```tsx
import { ImageCalibrationControl } from '@antv/aimapui';

<AiMap map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 12 }}>
  <ImageCalibrationControl
    position="topleft"
    onCalibrate={(result) => console.log('配准结果:', result)}
    onExport={(result) => console.log('导出结果:', result)}
  />
</AiMap>
```

## 完整示例

```tsx
import { AiMap, ImageCalibrationControl, ZoomControl } from '@antv/aimapui';

<AiMap map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 12, style: 'light' }}>
  <ImageCalibrationControl
    position="topleft"
    imageSource="https://example.com/aerial-photo.jpg"
    opacity={0.7}
    accept="image/*"
    onCornersChange={(corners) => console.log('角点变化:', corners)}
    onCalibrate={(result) => console.log('配准完成:', result.extent)}
    onExport={(result) => console.log(`导出 ${result.tiles.length} 切片`)}
    onImageLoad={(dims) => console.log('图片尺寸:', dims)}
    onClear={() => console.log('已清除')}
  />
  <ZoomControl position="bottomright" />
</AiMap>
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | 控件位置 |
| `corners` | `GeoCorners` | — | 受控模式：外部传入角点 |
| `defaultCorners` | `GeoCorners` | — | 非受控模式：初始角点 |
| `imageSource` | `string \| File` | — | 图片来源（URL / base64 / File） |
| `opacity` | `number` | `0.7` | 覆盖层透明度 0-1 |
| `accept` | `string` | `'image/*'` | 接受的文件类型 |
| `className` | `string` | — | 额外 CSS 类名 |
| `style` | `CSSProperties` | — | 额外内联样式 |
| `onCornersChange` | `(corners: GeoCorners) => void` | — | 角点变化回调 |
| `onCalibrate` | `(result: CalibrationResult) => void` | — | 确认配准回调 |
| `onExport` | `(result: ExportResult) => void` | — | 导出完成回调（ZIP 下载后触发） |
| `onImageLoad` | `(dims: { width, height }) => void` | — | 图片加载完成回调 |
| `onClear` | `() => void` | — | 清除回调 |

## 配准阶段状态机

控件内部维护三个阶段：

| 阶段 | 说明 |
|------|------|
| `idle` | 初始状态，未上传图片，工具栏按钮禁用 |
| `calibrating` | 已上传图片，可拖拽角点调整位置 |
| `confirmed` | 已确认配准，可重新编辑或导出 |

## 工具栏按钮

控件以竖排工具条形式展示，包含以下按钮（从上到下）：

| 图标 | 功能 | 说明 |
|------|------|------|
| `upload` | 上传图片 | 打开文件选择器，支持更换图片 |
| `fit_screen` | 放置到当前位置 | 将图片四角对齐当前地图视口（留 10% 边距） |
| `check_circle` / `edit` | 确认校准 / 重新校准 | `calibrating` 阶段显示确认，`confirmed` 阶段显示重新编辑 |
| `opacity` | 透明度 | 弹出滑块面板，实时调节图片覆盖层透明度 |
| `download` | 导出 | 打开导出设置弹框 |
| `delete` | 清除 | 移除图片和角点，回到 `idle` 状态 |

> 所有按钮在 `idle` 阶段自动禁用（除上传按钮外）。

## 配准操作流程

1. **上传图片** — 点击上传按钮选择图片，或通过 `imageSource` 属性传入；图片自动居中到当前地图视口
2. **放置到当前位置** — 点击 `fit_screen` 按钮，图片四角自动对齐当前视口范围
3. **调整角点** — 拖拽图片四角的圆形句柄，将角点对齐到地图上的对应地物位置；拖拽期间地图平移/缩放自动禁用
4. **调节透明度** — 点击透明度按钮，弹出滑块面板实时调节
5. **确认配准** — 点击确认按钮，进入 `confirmed` 阶段，触发 `onCalibrate` 回调
6. **导出图片** — 点击导出按钮，打开导出设置弹框
7. **重新校准** — 在 `confirmed` 阶段点击编辑按钮，回到 `calibrating` 阶段继续调整

## 导出弹框

点击导出按钮后弹出模态对话框，包含：

### 设置区域

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| 宽度(px) | `number` | 原图宽度 | 输出图片总宽度，范围 64-8192 |
| 高度(px) | `number` | 原图高度 | 输出图片总高度，范围 64-8192 |
| 切片列数 | `number` | `1` | 水平切分数，范围 1-20 |
| 切片行数 | `number` | `1` | 垂直切分数，范围 1-20 |

### 预览与下载

1. 点击 **生成预览** — 执行透视变换，生成配准后的图片和切片
2. 预览区显示完整图片，切片 >1 时叠加黄色虚线网格
3. 下方列出每个切片的文件名、尺寸和地理范围
4. 点击 **打包下载 ZIP** — 下载包含所有切片 PNG + `tiles.json` 坐标文件的 ZIP 包
5. 下载完成后触发 `onExport` 回调

### tiles.json 结构

```json
{
  "extent": [116.3, 39.8, 116.5, 40.0],
  "outputWidth": 2048,
  "outputHeight": 1536,
  "tiles": [
    {
      "file": "tile_0_0.png",
      "row": 0, "col": 0,
      "width": 1024, "height": 768,
      "extent": [116.3, 39.9, 116.4, 40.0],
      "corners": [[116.3, 40.0], [116.4, 40.0], [116.4, 39.9], [116.3, 39.9]]
    }
  ]
}
```

## 配准结果

```tsx
interface CalibrationResult {
  corners: GeoCorners;                           // 四角地理坐标 [TL, TR, BR, BL]
  extent: [number, number, number, number];      // 地理范围 [minLng, minLat, maxLng, maxLat]
}
```

## 导出配置

```tsx
interface ExportConfig {
  outputWidth?: number;   // 输出图片总宽度(px)，默认原图宽度
  outputHeight?: number;  // 输出图片总高度(px)，默认原图高度
  cols?: number;          // 切片列数，默认 1（不切分）
  rows?: number;          // 切片行数，默认 1（不切分）
  format?: string;        // 图片格式，默认 'image/png'
  quality?: number;       // 图片质量 0-1
}
```

## 导出结果

```tsx
interface ExportResult {
  tiles: TileResult[];                       // 切片列表
  extent: [number, number, number, number];  // 完整图片的总 extent
  previewUrl: string;                        // 完整图片的预览 URL
  blob: Blob;                                // 完整图片 Blob
  outputWidth: number;                       // 输出宽度
  outputHeight: number;                      // 输出高度
}

interface TileResult {
  blob: Blob;                                // 切片 Blob
  previewUrl: string;                        // 切片预览 URL
  row: number;                               // 切片行位置（从0开始）
  col: number;                               // 切片列位置（从0开始）
  extent: [number, number, number, number];  // 切片地理范围
  corners: GeoCorners;                       // 切片四角地理坐标
  width: number;                             // 切片像素宽度
  height: number;                            // 切片像素高度
}
```

## 命令式 API

```tsx
import { useRef } from 'react';
import { ImageCalibrationControl, type ImageCalibrationHandle } from '@antv/aimapui';

const calibRef = useRef<ImageCalibrationHandle>(null);

// 获取当前角点
const corners = calibRef.current?.getCorners();

// 设置角点
calibRef.current?.setCorners([
  [116.3, 40.0],  // TL
  [116.5, 40.0],  // TR
  [116.5, 39.8],  // BR
  [116.3, 39.8],  // BL
]);

// 设置图片（URL / File / base64）
calibRef.current?.setImage('https://example.com/photo.jpg');

// 导出图片（编程式，不走 UI 弹框）
const result = await calibRef.current?.exportImage({
  outputWidth: 2048,
  outputHeight: 1536,
  cols: 2,
  rows: 2,
  format: 'image/png',
  quality: 0.9,
});

// 清除
calibRef.current?.clear();
```

## 编程式导出示例

```tsx
const handleBatchExport = async () => {
  const result = await calibRef.current?.exportImage({
    cols: 3,
    rows: 3,
    format: 'image/png',
  });

  if (!result) return;

  // 逐个下载切片
  for (const tile of result.tiles) {
    const a = document.createElement('a');
    a.href = tile.previewUrl;
    a.download = `tile_${tile.row}_${tile.col}.png`;
    a.click();
  }

  console.log('Extent:', result.extent);
  console.log('Total tiles:', result.tiles.length);
};
```

## Schema 模式

```json
{
  "type": "imageCalibration",
  "position": "topleft",
  "options": {
    "opacity": 0.7,
    "accept": "image/*"
  }
}
```

## 相关文档

- [controls.md](controls.md) — 所有控件概览
- [draw-control.md](draw-control.md) — 绘制控件
