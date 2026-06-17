/**
 * useAnnotationInteraction — 标注交互状态机
 *
 * 管理标注的放置、选中、拖拽、编辑、删除等交互逻辑。
 */
import { useRef, useCallback, useEffect, useState } from 'react';
import type {
  AnnotationMode,
  AnnotationFeature,
  AnnotationProperties,
  AnnotationState,
  AnnotationStyleConfig,
} from './annotation-types';
import { createInitialAnnotationState, generateAnnotationId } from './annotation-types';
import { extractLngLatFromEvent, pixelDistance } from '../DrawControl/draw-geometry';

// ============================================================
// 类型
// ============================================================

interface UseAnnotationInteractionOptions {
  scene: any;
  mapsService: any;
  defaultFeatures?: AnnotationFeature[];
  features?: AnnotationFeature[];
  styles?: AnnotationStyleConfig;
  onUpload?: (file: File, type: 'image' | 'video') => Promise<string>;
  onAnnotationCreate?: (feature: AnnotationFeature) => void;
  onAnnotationUpdate?: (feature: AnnotationFeature) => void;
  onAnnotationDelete?: (feature: AnnotationFeature) => void;
  onAnnotationSelect?: (feature: AnnotationFeature | null) => void;
  onModeChange?: (mode: AnnotationMode) => void;
  onChange?: (features: AnnotationFeature[]) => void;
  /** 面板中活跃的样式设置，新建标注时继承 */
  activeColor?: string;
  activeOpacity?: number;
  activeStrokeWidth?: number;
  activeFontSize?: number;
}

interface UseAnnotationInteractionResult {
  mode: AnnotationMode;
  features: AnnotationFeature[];
  selectedFeatureId: string | null;
  editingFeatureId: string | null;
  isDrawing: boolean;
  currentStrokeVertices: [number, number][];
  setMode: (mode: AnnotationMode) => void;
  addFeature: (feature: AnnotationFeature) => void;
  updateFeature: (id: string, properties: Partial<AnnotationProperties>) => void;
  deleteFeature: (id: string) => void;
  selectFeature: (id: string | null) => void;
  clearAll: () => void;
  getFeatures: () => AnnotationFeature[];
  openEditor: (id: string) => void;
  closeEditor: () => void;
  moveFeature: (id: string, lng: number, lat: number) => void;
}

// ============================================================
// Douglas-Peucker 简化
// ============================================================

function simplifyPath(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPath(points.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

function perpendicularDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number],
): number {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ex = point[0] - lineStart[0];
    const ey = point[1] - lineStart[1];
    return Math.sqrt(ex * ex + ey * ey);
  }
  const t = ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / lenSq;
  const projX = lineStart[0] + t * dx;
  const projY = lineStart[1] + t * dy;
  const ex = point[0] - projX;
  const ey = point[1] - projY;
  return Math.sqrt(ex * ex + ey * ey);
}

// ============================================================
// Hook
// ============================================================

export function useAnnotationInteraction(
  options: UseAnnotationInteractionOptions,
): UseAnnotationInteractionResult {
  const {
    scene, mapsService,
    defaultFeatures, features: controlledFeatures,
    onAnnotationCreate, onAnnotationUpdate, onAnnotationDelete,
    onAnnotationSelect, onModeChange, onChange, onUpload,
    activeColor, activeOpacity, activeStrokeWidth, activeFontSize,
  } = options;

  const stateRef = useRef<AnnotationState>(createInitialAnnotationState(defaultFeatures));
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  // 受控模式同步
  useEffect(() => {
    if (controlledFeatures !== undefined) {
      stateRef.current.features = controlledFeatures;
      rerender();
    }
  }, [controlledFeatures, rerender]);

  // 获取当前要素（受控 vs 非受控）
  const getFeatures = useCallback((): AnnotationFeature[] => {
    return controlledFeatures ?? stateRef.current.features;
  }, [controlledFeatures]);

  // 更新要素并触发回调
  const commitFeatures = useCallback((features: AnnotationFeature[]) => {
    if (controlledFeatures === undefined) {
      stateRef.current.features = features;
    }
    onChange?.(features);
    rerender();
  }, [controlledFeatures, onChange, rerender]);

  // ---- 模式切换 ----
  const setMode = useCallback((mode: AnnotationMode) => {
    const prev = stateRef.current.mode;
    if (prev === mode) return;

    // 退出高亮模式时清理
    if (prev === 'highlighter' && stateRef.current.isDrawing) {
      stateRef.current.isDrawing = false;
      stateRef.current.currentStrokeVertices = [];
      mapsService?.setMapStatus?.({ dragEnable: true });
    }

    stateRef.current.mode = mode;
    stateRef.current.editingFeatureId = null;

    // 非 select 模式取消选中
    if (mode !== 'select') {
      stateRef.current.selectedFeatureId = null;
      onAnnotationSelect?.(null);
    }

    onModeChange?.(mode);
    rerender();
  }, [mapsService, onModeChange, onAnnotationSelect, rerender]);

  // ---- 要素操作 ----
  const addFeature = useCallback((feature: AnnotationFeature) => {
    const features = [...getFeatures(), feature];
    commitFeatures(features);
    onAnnotationCreate?.(feature);
  }, [getFeatures, commitFeatures, onAnnotationCreate]);

  const updateFeature = useCallback((id: string, properties: Partial<AnnotationProperties>) => {
    const features = getFeatures().map((f) => {
      if (f.id !== id) return f;
      const updated: AnnotationFeature = {
        ...f,
        properties: {
          ...f.properties,
          ...properties,
          updatedAt: new Date().toISOString(),
        } as AnnotationFeature['properties'],
      };
      onAnnotationUpdate?.(updated);
      return updated;
    });
    commitFeatures(features);
  }, [getFeatures, commitFeatures, onAnnotationUpdate]);

  const deleteFeature = useCallback((id: string) => {
    const feature = getFeatures().find((f) => f.id === id);
    if (!feature) return;
    const features = getFeatures().filter((f) => f.id !== id);
    if (stateRef.current.selectedFeatureId === id) {
      stateRef.current.selectedFeatureId = null;
      onAnnotationSelect?.(null);
    }
    if (stateRef.current.editingFeatureId === id) {
      stateRef.current.editingFeatureId = null;
    }
    commitFeatures(features);
    onAnnotationDelete?.(feature);
  }, [getFeatures, commitFeatures, onAnnotationDelete, onAnnotationSelect]);

  const selectFeature = useCallback((id: string | null) => {
    stateRef.current.selectedFeatureId = id;
    const feature = id ? getFeatures().find((f) => f.id === id) ?? null : null;
    onAnnotationSelect?.(feature);
    rerender();
  }, [getFeatures, onAnnotationSelect, rerender]);

  const clearAll = useCallback(() => {
    stateRef.current.selectedFeatureId = null;
    stateRef.current.editingFeatureId = null;
    commitFeatures([]);
    onAnnotationSelect?.(null);
  }, [commitFeatures, onAnnotationSelect]);

  const moveFeature = useCallback((id: string, lng: number, lat: number) => {
    const features = getFeatures().map((f) => {
      if (f.id !== id) return f;
      const updated: AnnotationFeature = {
        ...f,
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          ...f.properties,
          updatedAt: new Date().toISOString(),
        } as AnnotationFeature['properties'],
      };
      onAnnotationUpdate?.(updated);
      return updated;
    });
    commitFeatures(features);
  }, [getFeatures, commitFeatures, onAnnotationUpdate]);

  const openEditor = useCallback((id: string) => {
    stateRef.current.editingFeatureId = id;
    rerender();
  }, [rerender]);

  const closeEditor = useCallback(() => {
    stateRef.current.editingFeatureId = null;
    rerender();
  }, [rerender]);

  // ---- 创建标注辅助函数 ----
  const createAnnotationAtPoint = useCallback((
    lng: number, lat: number, type: AnnotationFeature['properties']['annotationType'],
  ): AnnotationFeature => {
    const now = new Date().toISOString();
    const base = {
      type: 'Feature' as const,
      id: generateAnnotationId(),
      geometry: { type: 'Point' as const, coordinates: [lng, lat] },
    };

    switch (type) {
      case 'marker':
        return { ...base, properties: { annotationType: 'marker', color: activeColor, createdAt: now } };
      case 'text':
        return { ...base, properties: { annotationType: 'text', text: '', color: activeColor, fontSize: activeFontSize, createdAt: now } };
      case 'note':
        return { ...base, properties: { annotationType: 'note', title: '', body: '', color: activeColor, createdAt: now } };
      case 'link':
        return { ...base, properties: { annotationType: 'link', url: '', title: '', color: activeColor, createdAt: now } };
      case 'image':
        return { ...base, properties: { annotationType: 'image', src: '', createdAt: now } };
      case 'video':
        return { ...base, properties: { annotationType: 'video', url: '', createdAt: now } };
      default:
        return { ...base, properties: { annotationType: 'marker', color: activeColor, createdAt: now } };
    }
  }, [activeColor, activeFontSize]);

  // ---- 地图事件处理 ----
  useEffect(() => {
    if (!scene || !mapsService) return;

    // 点击事件：放置标注 / 选中标注
    const handleClick = (e: Record<string, unknown>) => {
      const state = stateRef.current;
      const lngLat = extractLngLatFromEvent(e);
      if (!lngLat) return;
      const [lng, lat] = lngLat;

      const mode = state.mode;

      if (mode === 'select' || mode === 'none') {
        // select 模式下点击空白取消选中（标注本身的点击由 Renderer 处理）
        return;
      }

      if (mode === 'highlighter') {
        // highlighter 由 mousedown/mousemove/mouseup 处理
        return;
      }

      // 点击放置各类标注
      if (mode === 'marker' || mode === 'text' || mode === 'note' || mode === 'link' || mode === 'image' || mode === 'video') {
        const feature = createAnnotationAtPoint(lng, lat, mode);
        addFeature(feature);

        // 切到 select 并选中新标注 + 打开编辑器
        stateRef.current.mode = mode;
        stateRef.current.selectedFeatureId = feature.id;
        onAnnotationSelect?.(feature);

        // 对需要内容输入的类型打开编辑器
        if (mode !== 'marker') {
          stateRef.current.editingFeatureId = feature.id;
        }

        // marker 模式保持当前模式以便连续放置
        // 其他模式放置后切回 select
        if (mode !== 'marker') {
          stateRef.current.mode = 'select';
          onModeChange?.('select');
        }

        rerender();
      }
    };

    // Highlighter: mousedown 开始
    const handleMouseDown = (e: Record<string, unknown>) => {
      const state = stateRef.current;
      if (state.mode !== 'highlighter') return;

      const lngLat = extractLngLatFromEvent(e);
      if (!lngLat) return;

      state.isDrawing = true;
      state.currentStrokeVertices = [lngLat];
      mapsService.setMapStatus?.({ dragEnable: false });
      rerender();
    };

    // Highlighter: mousemove 累积点
    const handleMouseMove = (e: Record<string, unknown>) => {
      const state = stateRef.current;
      if (!state.isDrawing || state.mode !== 'highlighter') return;

      const lngLat = extractLngLatFromEvent(e);
      if (!lngLat) return;

      const verts = state.currentStrokeVertices;
      if (verts.length > 0) {
        const last = verts[verts.length - 1];
        const lastPx = mapsService.lngLatToContainer?.(last) ?? { x: 0, y: 0 };
        const curPx = mapsService.lngLatToContainer?.(lngLat) ?? { x: 0, y: 0 };
        if (pixelDistance(lastPx, curPx) < 4) return;
      }

      // 创建新数组引用以确保 useEffect deps 变化触发高亮层更新
      state.currentStrokeVertices = [...verts, lngLat];
      rerender();
    };

    // Highlighter: mouseup 完成笔画
    const handleMouseUp = () => {
      const state = stateRef.current;
      if (!state.isDrawing || state.mode !== 'highlighter') return;

      state.isDrawing = false;
      mapsService.setMapStatus?.({ dragEnable: true });

      const verts = state.currentStrokeVertices;
      if (verts.length < 2) {
        state.currentStrokeVertices = [];
        rerender();
        return;
      }

      // Douglas-Peucker 简化
      const simplified = simplifyPath(verts, 0.00005);
      state.currentStrokeVertices = [];

      const feature: AnnotationFeature = {
        type: 'Feature',
        id: generateAnnotationId(),
        geometry: { type: 'LineString', coordinates: simplified },
        properties: {
          annotationType: 'highlighter',
          color: activeColor,
          strokeWidth: activeStrokeWidth,
          strokeOpacity: activeOpacity,
          createdAt: new Date().toISOString(),
        },
      };

      addFeature(feature);
      rerender();
    };

    scene.on('click', handleClick);
    scene.on('mousedown', handleMouseDown);
    scene.on('mousemove', handleMouseMove);
    scene.on('mouseup', handleMouseUp);

    return () => {
      scene.off('click', handleClick);
      scene.off('mousedown', handleMouseDown);
      scene.off('mousemove', handleMouseMove);
      scene.off('mouseup', handleMouseUp);
    };
  }, [
    scene, mapsService, addFeature, createAnnotationAtPoint,
    onAnnotationSelect, onModeChange, rerender,
  ]);

  // ---- 键盘事件 ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框内的按键
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;

      if (e.key === 'Escape') {
        setMode('select');
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedId = stateRef.current.selectedFeatureId;
        if (selectedId) {
          deleteFeature(selectedId);
        }
        return;
      }

      const keyMap: Record<string, AnnotationMode> = {
        m: 'marker', h: 'highlighter', t: 'text',
        n: 'note', k: 'link', i: 'image', v: 'video',
      };
      const mode = keyMap[e.key.toLowerCase()];
      if (mode) {
        setMode(mode);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setMode, deleteFeature]);

  return {
    mode: stateRef.current.mode,
    features: getFeatures(),
    selectedFeatureId: stateRef.current.selectedFeatureId,
    editingFeatureId: stateRef.current.editingFeatureId,
    isDrawing: stateRef.current.isDrawing,
    currentStrokeVertices: stateRef.current.currentStrokeVertices,
    setMode,
    addFeature,
    updateFeature,
    deleteFeature,
    selectFeature,
    clearAll,
    getFeatures,
    openEditor,
    closeEditor,
    moveFeature,
  };
}
