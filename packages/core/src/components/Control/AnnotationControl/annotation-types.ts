/**
 * AnnotationControl 类型定义
 */
import type { Feature, Point, LineString } from 'geojson';
import type { ControlPosition } from '../../../hooks/useMapControl';

// ============================================================
// 标注模式
// ============================================================

export type AnnotationMode =
  | 'marker' | 'highlighter' | 'text' | 'note' | 'link' | 'image' | 'video'
  | 'select' | 'none';

export type AnnotationToolMode = Exclude<AnnotationMode, 'none'>;

export type AnnotationType = 'marker' | 'highlighter' | 'text' | 'note' | 'link' | 'image' | 'video';

// ============================================================
// 标注要素属性
// ============================================================

interface AnnotationPropertiesBase {
  annotationType: AnnotationType;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkerAnnotationProperties extends AnnotationPropertiesBase {
  annotationType: 'marker';
  icon?: string;
  label?: string;
}

export interface HighlighterAnnotationProperties extends AnnotationPropertiesBase {
  annotationType: 'highlighter';
  strokeWidth?: number;
  strokeOpacity?: number;
}

export interface TextAnnotationProperties extends AnnotationPropertiesBase {
  annotationType: 'text';
  text: string;
  fontSize?: number;
}

export interface NoteAnnotationProperties extends AnnotationPropertiesBase {
  annotationType: 'note';
  title: string;
  body?: string;
}

export interface LinkAnnotationProperties extends AnnotationPropertiesBase {
  annotationType: 'link';
  url: string;
  title?: string;
}

export interface ImageAnnotationProperties extends AnnotationPropertiesBase {
  annotationType: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface VideoAnnotationProperties extends AnnotationPropertiesBase {
  annotationType: 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
}

export type AnnotationProperties =
  | MarkerAnnotationProperties
  | HighlighterAnnotationProperties
  | TextAnnotationProperties
  | NoteAnnotationProperties
  | LinkAnnotationProperties
  | ImageAnnotationProperties
  | VideoAnnotationProperties;

// ============================================================
// 标注要素
// ============================================================

export interface AnnotationFeature extends Feature {
  id: string;
  properties: AnnotationProperties;
}

// ============================================================
// 样式配置
// ============================================================

export interface AnnotationStyleConfig {
  marker?: { color?: string; size?: number };
  highlighter?: { color?: string; width?: number; opacity?: number };
  text?: { color?: string; fontSize?: number; fontFamily?: string };
  note?: { color?: string; maxWidth?: number };
  link?: { color?: string };
  image?: { maxWidth?: number; borderRadius?: number };
  video?: { maxWidth?: number };
}

// ============================================================
// Props
// ============================================================

export interface AnnotationControlProps {
  position?: ControlPosition;
  defaultFeatures?: AnnotationFeature[];
  features?: AnnotationFeature[];
  tools?: AnnotationToolMode[];
  styles?: AnnotationStyleConfig;
  onUpload?: (file: File, type: 'image' | 'video') => Promise<string>;
  className?: string;
  style?: React.CSSProperties;
  onAnnotationCreate?: (feature: AnnotationFeature) => void;
  onAnnotationUpdate?: (feature: AnnotationFeature) => void;
  onAnnotationDelete?: (feature: AnnotationFeature) => void;
  onAnnotationSelect?: (feature: AnnotationFeature | null) => void;
  onModeChange?: (mode: AnnotationMode) => void;
  onChange?: (features: AnnotationFeature[]) => void;
}

export interface AnnotationControlHandle {
  setMode: (mode: AnnotationMode) => void;
  addAnnotation: (feature: AnnotationFeature) => void;
  updateAnnotation: (id: string, properties: Partial<AnnotationProperties>) => void;
  deleteAnnotation: (id: string) => void;
  clearAll: () => void;
  getAnnotations: () => AnnotationFeature[];
  selectAnnotation: (id: string | null) => void;
}

// ============================================================
// 内部状态
// ============================================================

export interface AnnotationState {
  mode: AnnotationMode;
  features: AnnotationFeature[];
  selectedFeatureId: string | null;
  isDrawing: boolean;
  currentStrokeVertices: [number, number][];
  editingFeatureId: string | null;
}

export function createInitialAnnotationState(features?: AnnotationFeature[]): AnnotationState {
  return {
    mode: 'select',
    features: features ? [...features] : [],
    selectedFeatureId: null,
    isDrawing: false,
    currentStrokeVertices: [],
    editingFeatureId: null,
  };
}

let _annotationIdCounter = 0;
export function generateAnnotationId(): string {
  return `annotation-${Date.now()}-${++_annotationIdCounter}`;
}
