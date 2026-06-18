/**
 * PlotControl 类型定义
 */
import type { Feature, Polygon } from 'geojson';
import type { PlotAlgorithmType, Point } from '../algorithms/bindtype';

export type PlotMode = PlotAlgorithmType | 'select' | 'edit' | 'none';
export type PlotToolMode = PlotAlgorithmType | 'select' | 'edit';

export interface PlotFeature extends Feature {
  id: string;
  geometry: Polygon;
  properties: {
    plotType: PlotAlgorithmType;
    controlPoints: Point[];
    color?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
    [key: string]: unknown;
  };
}

export interface PlotStyleConfig {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  selectedFill?: string;
  selectedStroke?: string;
  controlPointColor?: string;
  controlPointSize?: number;
}

export interface PlotControlProps {
  position?: string;
  defaultFeatures?: PlotFeature[];
  features?: PlotFeature[];
  tools?: PlotToolMode[];
  styles?: PlotStyleConfig;
  className?: string;
  style?: React.CSSProperties;
  onPlotCreate?: (feature: PlotFeature) => void;
  onPlotUpdate?: (feature: PlotFeature) => void;
  onPlotDelete?: (feature: PlotFeature) => void;
  onPlotSelect?: (feature: PlotFeature | null) => void;
  onModeChange?: (mode: PlotMode) => void;
  onChange?: (features: PlotFeature[]) => void;
}

export interface PlotControlHandle {
  setMode: (mode: PlotMode) => void;
  addFeature: (feature: PlotFeature) => void;
  deleteFeature: (id: string) => void;
  clearAll: () => void;
  getFeatures: () => PlotFeature[];
  selectFeature: (id: string | null) => void;
}

export interface PlotState {
  mode: PlotMode;
  features: PlotFeature[];
  selectedFeatureId: string | null;
  currentControlPoints: Point[];
  editingControlIndex: number | null;
  mousePoint: Point | null;
  isDragging: boolean;
  dragControlIndex: number | null;
  /** 整体拖拽起始坐标 */
  dragStartLngLat: Point | null;
}

export function createInitialPlotState(features?: PlotFeature[]): PlotState {
  return {
    mode: 'select',
    features: features ? [...features] : [],
    selectedFeatureId: null,
    currentControlPoints: [],
    editingControlIndex: null,
    mousePoint: null,
    isDragging: false,
    dragControlIndex: null,
    dragStartLngLat: null,
  };
}

let _plotIdCounter = 0;
export function generatePlotId(): string {
  return `plot-${Date.now()}-${++_plotIdCounter}`;
}
