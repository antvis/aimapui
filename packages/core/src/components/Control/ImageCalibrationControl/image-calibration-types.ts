import type { ControlPosition } from '../../../hooks/useMapControl';

/** 4个角点地理坐标 [topLeft, topRight, bottomRight, bottomLeft]，每项 [lng, lat] */
export type GeoCorners = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

/** 配准阶段 */
export type CalibrationPhase = 'idle' | 'calibrating' | 'confirmed';

/** 角点索引 */
export type CornerIndex = 0 | 1 | 2 | 3;

/** 图片来源 */
export type ImageSource = string | File;

/** 裁剪区域（像素坐标，相对于原图） */
export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 裁剪前的预处理结果 */
export interface PreprocessResult {
  /** 裁剪后的图片 Blob */
  croppedBlob: Blob;
  /** 裁剪后的图片 URL (ObjectURL) */
  croppedUrl: string;
  /** 裁剪后图片尺寸 */
  croppedDimensions: { width: number; height: number };
  /** 用户指定的初始坐标（可为空，则使用自动计算） */
  initialCorners: GeoCorners | null;
  /** 裁剪区域的 revokeUrl */
  revokeUrl: () => void;
}

/** 配准结果 */
export interface CalibrationResult {
  corners: GeoCorners;
  extent: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

/** 导出选项（向后兼容） */
export interface ExportOptions {
  maxWidth?: number;
  format?: string;
  quality?: number;
}

/** 导出配置 */
export interface ExportConfig {
  /** 输出图片总宽度(px)，默认原图宽度 */
  outputWidth?: number;
  /** 输出图片总高度(px)，默认原图高度 */
  outputHeight?: number;
  /** 切片列数，默认 1（不切分） */
  cols?: number;
  /** 切片行数，默认 1（不切分） */
  rows?: number;
  /** 图片格式 */
  format?: string;
  /** 图片质量 0-1 */
  quality?: number;
}

/** 单个切片结果 */
export interface TileResult {
  blob: Blob;
  previewUrl: string;
  /** 切片在网格中的行位置（从0开始） */
  row: number;
  /** 切片在网格中的列位置（从0开始） */
  col: number;
  /** 该切片对应的地理范围 [minLng, minLat, maxLng, maxLat] */
  extent: [number, number, number, number];
  /** 四角地理坐标 [TL, TR, BR, BL] */
  corners: GeoCorners;
  /** 切片像素宽度 */
  width: number;
  /** 切片像素高度 */
  height: number;
}

/** 导出结果 */
export interface ExportResult {
  /** 切片列表 */
  tiles: TileResult[];
  /** 完整图片的总 extent */
  extent: [number, number, number, number];
  /** 完整图片的预览 URL */
  previewUrl: string;
  /** 完整图片 Blob */
  blob: Blob;
  /** 输出尺寸 */
  outputWidth: number;
  outputHeight: number;
}

// ============================================================
// 第三方 CDN 集成回调类型
// ============================================================

/** 上传回调返回值：简单 URL 字符串或包含元数据的对象 */
export type UploadResult = string | { url: string; [key: string]: unknown };

/** 文件上传到 CDN 的回调 */
export type OnImageUpload = (file: File) => Promise<UploadResult>;

/** 裁剪后 Blob 上传到 CDN 的回调 */
export type OnCropUpload = (
  blob: Blob,
  dimensions: { width: number; height: number },
) => Promise<UploadResult>;

/** 导出上传数据包 */
export interface ExportUploadData {
  /** 所有瓦片切片 */
  tiles: Array<{
    blob: Blob;
    row: number;
    col: number;
    extent: [number, number, number, number];
    corners: GeoCorners;
    width: number;
    height: number;
  }>;
  /** 完整配准后的图片 Blob */
  fullBlob: Blob;
  /** 完整图片的地理范围 */
  extent: [number, number, number, number];
  /** 输出尺寸 */
  outputWidth: number;
  outputHeight: number;
}

/** 导出上传到 CDN 的回调 */
export type OnExportUpload = (exportData: ExportUploadData) => Promise<void>;

/** ImageCalibrationControl 组件 Props */
export interface ImageCalibrationControlProps {
  /** 控件位置 */
  position?: ControlPosition;
  /** 布局方向，默认 vertical */
  layout?: 'vertical' | 'horizontal';
  /** 受控模式：外部传入角点 */
  corners?: GeoCorners;
  /** 非受控模式：初始角点 */
  defaultCorners?: GeoCorners;
  /** 图片来源 (URL/base64/File) */
  imageSource?: ImageSource;
  /** 覆盖层透明度 0-1，默认 0.7 */
  opacity?: number;
  /** 接受的文件类型，默认 'image/*' */
  accept?: string;
  /** 是否启用图片裁剪功能，默认 true */
  enableCrop?: boolean;
  /** 是否启用初始坐标输入功能，默认 true */
  enableInitialCoords?: boolean;
  /** 额外 className */
  className?: string;
  /** 额外 style */
  style?: React.CSSProperties;
  /** 角点变化回调 */
  onCornersChange?: (imageId: string, corners: GeoCorners) => void;
  /** 确认配准回调 */
  onCalibrate?: (imageId: string, result: CalibrationResult) => void;
  /** 导出完成回调 */
  onExport?: (imageId: string, result: ExportResult) => void;
  /** 图片加载完成回调 */
  onImageLoad?: (imageId: string, dimensions: { width: number; height: number }) => void;
  /** 裁剪预处理完成回调，返回裁剪后的尺寸和可选的初始坐标 */
  onPreprocess?: (imageId: string, result: { croppedDimensions: { width: number; height: number }; initialCorners: GeoCorners | null }) => void;
  /** 清除回调 */
  onClear?: (imageId: string) => void;
  /** 图片列表变化回调 */
  onImagesChange?: (images: RegisteredImage[]) => void;
  /** 切换图片回调 */
  onImageSwitch?: (imageId: string) => void;
  /** 图片重命名回调 */
  onImageRename?: (imageId: string, oldName: string, newName: string) => void;
  /** 图片列表拖拽排序回调 */
  onImagesReorder?: (images: RegisteredImage[]) => void;
  /** 上传新图片回调 */
  onImageAdd?: (image: RegisteredImage) => void;
  /** 删除图片回调 */
  onImageRemove?: (imageId: string) => void;
  /** 文件上传到 CDN 的回调。提供时，组件会将原始 File 传给此回调，用返回的 CDN URL 进入后续流程 */
  onImageUpload?: OnImageUpload;
  /** 裁剪后上传到 CDN 的回调。提供时，裁剪后的 Blob 先传给此回调，返回的 CDN URL 作为最终图片源 */
  onCropUpload?: OnCropUpload;
  /** 导出上传到 CDN 的回调。提供时，导出对话框中展示"上传到云端"按钮，瓦片和完整图片传给此回调 */
  onExportUpload?: OnExportUpload;
}

/** 命令式 Handle */
export interface ImageCalibrationHandle {
  getCorners(): GeoCorners | null;
  setCorners(corners: GeoCorners): void;
  setImage(source: ImageSource, initialCorners?: GeoCorners | null): void;
  exportImage(config?: ExportConfig): Promise<ExportResult>;
  clear(): void;
  /** 获取所有已注册的图片列表 */
  getImages(): RegisteredImage[];
  /** 切换激活图片 */
  switchImage(id: string): void;
  /** 删除指定图片 */
  deleteImage(id: string): void;
  /** 获取当前激活图片 ID */
  getActiveImageId(): string | null;
}

/** 单张配准图片（多图管理） */
export interface RegisteredImage {
  id: string;
  name: string;
  /** 图片来源（File 或 URL），用于重新加载 */
  source: ImageSource;
  /** 缩略图 URL */
  thumbnailUrl: string;
  /** 图片尺寸 */
  dimensions: { width: number; height: number } | null;
  /** 当前阶段 */
  phase: CalibrationPhase;
  /** 当前角点 */
  corners: GeoCorners | null;
  /** 透明度 0-1 */
  opacity: number;
  /** 需要释放的 ObjectURL */
  revokeUrl: (() => void) | null;
  /** 裁剪产生的额外 URL 需要释放 */
  croppedRevokeUrl: (() => void) | null;
}

/** 列表操作类型 */
export type ImageListAction = 'opacity' | 'place-to-view' | 'scale-to' | 'calibrate' | 're-edit' | 'export' | 'delete';

/** 内部状态 */
export interface CalibrationState {
  phase: CalibrationPhase;
  imageUrl: string | null;
  imageDimensions: { width: number; height: number } | null;
  corners: GeoCorners | null;
  draggingCorner: CornerIndex | null;
  opacity: number;
}
