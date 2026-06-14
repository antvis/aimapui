# ImageCalibrationControl — 图片配准控件

上传图片并通过拖拽 4 个角点进行地理配准，输出配准坐标和变换后的图片。支持单图导出和网格切片导出。

默认位置：`topright`

## 基础用法

```tsx
import { ImageCalibrationControl } from '@antv/aimapui';

<ImageCalibrationControl
  position="topright"
  onCalibrate={(result) => console.log('配准结果:', result)}
  onExport={(result) => console.log('导出结果:', result)}
/>
```

## 完整示例

```tsx
import { ImageCalibrationControl } from '@antv/aimapui';

<ImageCalibrationControl
  position="topright"
  imageSource="https://example.com/aerial-photo.jpg"
  opacity={0.7}
  accept="image/*"
  onCornersChange={(corners) => console.log('角点变化:', corners)}
  onCalibrate={(result) => console.log('配准完成:', result)}
  onExport={(result) => console.log('导出完成:', result)}
  onImageLoad={(dims) => console.log('图片尺寸:', dims)}
  onClear={() => console.log('已清除')}
/>
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | 控件位置 |
| `corners` | `GeoCorners` | — | 受控模式：外部传入角点 |
| `defaultCorners` | `GeoCorners` | — | 非受控模式：初始角点 |
| `imageSource` | `string \| File` | — | 图片来源（URL/base64/File） |
| `opacity` | `number` | `0.7` | 覆盖层透明度 0-1 |
| `accept` | `string` | `'image/*'` | 接受的文件类型 |
| `className` | `string` | — | 额外 CSS 类名 |
| `style` | `CSSProperties` | — | 额外内联样式 |
| `onCornersChange` | `(corners: GeoCorners) => void` | — | 角点变化回调 |
| `onCalibrate` | `(result: CalibrationResult) => void` | — | 确认配准回调 |
| `onExport` | `(result: ExportResult) => void` | — | 导出完成回调 |
| `onImageLoad` | `(dims: { width, height }) => void` | — | 图片加载完成回调 |
| `onClear` | `() => void` | — | 清除回调 |

## 配准流程

1. **上传图片** — 点击上传按钮选择图片，或通过 `imageSource` 属性传入
2. **调整角点** — 拖拽图片四角的句柄，将角点对齐到地图上的对应位置
3. **确认配准** — 点击确认按钮，触发 `onCalibrate` 回调
4. **导出图片** — 点击导出按钮，触发 `onExport` 回调

## 配准结果

```tsx
interface CalibrationResult {
  corners: GeoCorners;        // 四角地理坐标 [TL, TR, BR, BL]
  extent: [number, number, number, number];  // 地理范围 [minLng, minLat, maxLng, maxLat]
}
```

## 导出配置

```tsx
interface ExportConfig {
  outputWidth?: number;   // 输出图片总宽度(px)
  outputHeight?: number;  // 输出图片总高度(px)
  cols?: number;          // 切片列数，默认 1（不切分）
  rows?: number;          // 切片行数，默认 1（不切分）
  format?: string;        // 图片格式
  quality?: number;       // 图片质量 0-1
}
```

## 导出结果

```tsx
interface ExportResult {
  tiles: TileResult[];    // 切片列表
  extent: [number, number, number, number];  // 完整图片的总 extent
  previewUrl: string;     // 完整图片的预览 URL
  blob: Blob;             // 完整图片 Blob
  outputWidth: number;    // 输出宽度
  outputHeight: number;   // 输出高度
}

interface TileResult {
  blob: Blob;             // 切片 Blob
  previewUrl: string;     // 切片预览 URL
  row: number;            // 切片行位置（从0开始）
  col: number;            // 切片列位置（从0开始）
  extent: [number, number, number, number];  // 切片地理范围
  corners: GeoCorners;    // 切片四角地理坐标
  width: number;          // 切片像素宽度
  height: number;         // 切片像素高度
}
```

## 命令式 API

```tsx
import { useRef } from 'react';
import { ImageCalibrationControl, type ImageCalibrationHandle } from '@antv/aimapui';

const calibRef = useRef<ImageCalibrationHandle>(null);

// 获取角点
const corners = calibRef.current?.getCorners();

// 设置角点
calibRef.current?.setCorners([[116, 39], [117, 39], [117, 40], [116, 40]]);

// 设置图片
calibRef.current?.setImage('https://example.com/photo.jpg');

// 导出图片
const result = await calibRef.current?.exportImage({
  cols: 2,
  rows: 2,
  format: 'image/png',
  quality: 0.9,
});

// 清除
calibRef.current?.clear();
```

## 网格切片导出示例

```tsx
<ImageCalibrationControl
  position="topright"
  onExport={async (result) => {
    // 导出为 2x2 网格切片
    const tiles = await calibRef.current?.exportImage({
      cols: 2,
      rows: 2,
      format: 'image/png',
      quality: 0.9,
    });

    // 下载每个切片
    tiles?.tiles.forEach((tile) => {
      const a = document.createElement('a');
      a.href = tile.previewUrl;
      a.download = `tile-${tile.row}-${tile.col}.png`;
      a.click();
    });
  }}
/>
```

## 相关文档

- [controls.md](controls.md) — 所有控件概览
