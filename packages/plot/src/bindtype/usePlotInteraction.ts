/**
 * usePlotInteraction — 标绘交互状态机
 *
 * 支持：鼠标跟随预览（rubber-band）、控制点拖拽编辑、键盘快捷键
 */
import { useRef, useCallback, useEffect, useState } from 'react';
import type { PlotMode, PlotFeature, PlotState } from './plot-types';
import { createInitialPlotState, generatePlotId } from './plot-types';
import { bindtype, MIN_CONTROL_POINTS, MAX_CONTROL_POINTS } from '../algorithms/bindtype';
import type { PlotAlgorithmType, Point } from '../algorithms/bindtype';
import { distance } from '../algorithms/bindtype-curve';

interface UsePlotInteractionOptions {
  scene: any;
  mapsService: any;
  defaultFeatures?: PlotFeature[];
  features?: PlotFeature[];
  onPlotCreate?: (feature: PlotFeature) => void;
  onPlotUpdate?: (feature: PlotFeature) => void;
  onPlotDelete?: (feature: PlotFeature) => void;
  onPlotSelect?: (feature: PlotFeature | null) => void;
  onModeChange?: (mode: PlotMode) => void;
  onChange?: (features: PlotFeature[]) => void;
}

// ---- 事件坐标提取 ----

function extractLngLat(e: Record<string, unknown>): Point | null {
  const lnglat = (e.lnglat ?? e.lngLat) as Record<string, number> | undefined;
  if (lnglat && typeof lnglat.lng === 'number') return [lnglat.lng, lnglat.lat];
  const coord = e.coordinate as Point | undefined;
  if (coord && typeof coord[0] === 'number') return coord;
  return null;
}

function clientXFromEvent(e: Record<string, unknown>): number {
  const orig = (e.originalEvent ?? e.originEvent ?? e.e) as MouseEvent | undefined;
  return orig?.clientX ?? (e.x as number | undefined) ?? 0;
}

function clientYFromEvent(e: Record<string, unknown>): number {
  const orig = (e.originalEvent ?? e.originEvent ?? e.e) as MouseEvent | undefined;
  return orig?.clientY ?? (e.y as number | undefined) ?? 0;
}

// ---- 像素距离判定控制点命中 ----

function findControlPointAtPixel(
  mapsService: any,
  controlPoints: Point[],
  lngLat: Point,
  threshold = 12,
): number | null {
  if (!mapsService?.lngLatToContainer) return null;
  const curPx = mapsService.lngLatToContainer(lngLat);
  if (!curPx) return null;

  for (let i = 0; i < controlPoints.length; i++) {
    const px = mapsService.lngLatToContainer(controlPoints[i]);
    if (!px) continue;
    const dx = curPx.x - px.x;
    const dy = curPx.y - px.y;
    if (Math.sqrt(dx * dx + dy * dy) < threshold) return i;
  }
  return null;
}

// ---- 点击命中测试：点是否在多边形内（ray-casting） ----

function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function findFeatureAtPoint(features: PlotFeature[], lngLat: Point): PlotFeature | null {
  // 从后往前遍历（后绘制的在上层）
  for (let i = features.length - 1; i >= 0; i--) {
    const f = features[i];
    const coords = f.geometry.coordinates;
    if (coords && coords[0] && pointInPolygon(lngLat, coords[0] as Point[])) {
      return f;
    }
  }
  return null;
}

// ---- tooltip 文案 ----

const TOOLTIP_MESSAGES: Record<string, string[]> = {
  'rectangle': ['单击放置第一个角点', '单击对角完成矩形'],
  'circle': ['单击设定圆心', '单击确定半径'],
  'sector': ['单击设定圆心', '单击扇形第一条边', '单击第二条边完成'],
  'straight-arrow': ['单击箭头起点', '单击箭头终点'],
  'curve-arrow': ['单击箭身左起点', '单击右起点', '单击添加控制点，双击完成'],
};

export function getTooltipText(mode: PlotMode, pointCount: number, hasSelection: boolean): { text: string; shortcuts: string[] } | null {
  if (mode === 'select') {
    return null;
  }
  if (mode === 'edit') {
    if (hasSelection) return { text: '拖拽控制点编辑形状', shortcuts: ['[Del] 删除', '[Esc] 取消'] };
    return { text: '点击图形选中编辑', shortcuts: ['[Esc] 取消'] };
  }
  if (mode === 'none') return null;

  const msgs = TOOLTIP_MESSAGES[mode];
  if (!msgs) return null;

  const idx = Math.min(pointCount, msgs.length - 1);
  const shortcuts = ['[Esc] 取消'];
  if (mode === 'curve-arrow' && pointCount >= 3) shortcuts.unshift('[双击] 完成');
  return { text: msgs[idx], shortcuts };
}

// ============================================================
// Hook
// ============================================================

export function usePlotInteraction(options: UsePlotInteractionOptions) {
  const {
    scene, mapsService, defaultFeatures, features: controlledFeatures,
    onPlotCreate, onPlotUpdate, onPlotDelete, onPlotSelect, onModeChange, onChange,
  } = options;

  const stateRef = useRef<PlotState>(createInitialPlotState(defaultFeatures));
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    if (controlledFeatures !== undefined) {
      stateRef.current.features = controlledFeatures;
      rerender();
    }
  }, [controlledFeatures, rerender]);

  const getFeatures = useCallback((): PlotFeature[] => {
    return controlledFeatures ?? stateRef.current.features;
  }, [controlledFeatures]);

  const commitFeatures = useCallback((features: PlotFeature[]) => {
    if (controlledFeatures === undefined) stateRef.current.features = features;
    onChange?.(features);
    rerender();
  }, [controlledFeatures, onChange, rerender]);

  const setMode = useCallback((mode: PlotMode) => {
    if (stateRef.current.mode === mode) return;
    stateRef.current.currentControlPoints = [];
    stateRef.current.mousePoint = null;
    stateRef.current.isDragging = false;
    stateRef.current.dragControlIndex = null;
    stateRef.current.mode = mode;
    if (mode !== 'select') {
      stateRef.current.selectedFeatureId = null;
      onPlotSelect?.(null);
    }
    onModeChange?.(mode);
    rerender();
  }, [onModeChange, onPlotSelect, rerender]);

  const selectFeature = useCallback((id: string | null) => {
    stateRef.current.selectedFeatureId = id;
    const feature = id ? getFeatures().find((f) => f.id === id) ?? null : null;
    onPlotSelect?.(feature);
    rerender();
  }, [getFeatures, onPlotSelect, rerender]);

  const deleteFeature = useCallback((id: string) => {
    const feature = getFeatures().find((f) => f.id === id);
    if (!feature) return;
    if (stateRef.current.selectedFeatureId === id) {
      stateRef.current.selectedFeatureId = null;
      onPlotSelect?.(null);
    }
    commitFeatures(getFeatures().filter((f) => f.id !== id));
    onPlotDelete?.(feature);
  }, [getFeatures, commitFeatures, onPlotDelete, onPlotSelect]);

  const clearAll = useCallback(() => {
    stateRef.current.selectedFeatureId = null;
    commitFeatures([]);
    onPlotSelect?.(null);
  }, [commitFeatures, onPlotSelect]);

  // 重新计算选中图形的几何体（控制点变化后）
  const rebuildFeatureGeometry = useCallback((featureId: string, newControlPoints: Point[]) => {
    const features = getFeatures();
    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;

    const result = bindtype(feature.properties.plotType, newControlPoints);
    if (!result || result.type !== 'Polygon') return;

    const updated: PlotFeature = {
      ...feature,
      geometry: { type: 'Polygon', coordinates: result.coordinates as Point[][] },
      properties: { ...feature.properties, controlPoints: [...newControlPoints] },
    };

    commitFeatures(features.map((f) => (f.id === featureId ? updated : f)));
    onPlotUpdate?.(updated);
  }, [getFeatures, commitFeatures, onPlotUpdate]);

  // 完成一个标绘图形
  const finishPlot = useCallback((plotType: PlotAlgorithmType, controlPoints: Point[]) => {
    const result = bindtype(plotType, controlPoints);
    if (!result || result.type !== 'Polygon') return;

    const feature: PlotFeature = {
      type: 'Feature',
      id: generatePlotId(),
      geometry: { type: 'Polygon', coordinates: result.coordinates as Point[][] },
      properties: {
        plotType,
        controlPoints: [...controlPoints],
        color: '#3f51b5',
        fillOpacity: 0.3,
        strokeColor: '#3f51b5',
        strokeWidth: 2,
      },
    };

    commitFeatures([...getFeatures(), feature]);
    onPlotCreate?.(feature);

    stateRef.current.currentControlPoints = [];
    stateRef.current.mousePoint = null;
    stateRef.current.selectedFeatureId = feature.id;
    stateRef.current.mode = 'select';
    onModeChange?.('select');
    onPlotSelect?.(feature);
    rerender();
  }, [getFeatures, commitFeatures, onPlotCreate, onPlotSelect, onModeChange, rerender]);

  // ---- 地图事件 ----
  useEffect(() => {
    if (!scene || !mapsService) return;

    // 点击
    const handleClick = (e: Record<string, unknown>) => {
      const state = stateRef.current;
      const lngLat = extractLngLat(e);
      if (!lngLat) return;

      // 拖拽中不处理 click
      if (state.isDragging) return;

      const mode = state.mode;

      // select / edit 模式
      if (mode === 'select' || mode === 'edit') {
        // 已选中时检测是否点到控制点
        if (state.selectedFeatureId) {
          const feature = getFeatures().find((f) => f.id === state.selectedFeatureId);
          if (feature) {
            const hitIdx = findControlPointAtPixel(mapsService, feature.properties.controlPoints, lngLat);
            if (hitIdx !== null) return;
          }
        }
        // 检测是否点击了某个图形
        const hitFeature = findFeatureAtPoint(getFeatures(), lngLat);
        if (hitFeature) {
          selectFeature(hitFeature.id);
          return;
        }
        // 点击空白取消选中
        selectFeature(null);
        return;
      }

      if (mode === 'none') return;

      // 绘制模式 — 放置控制点
      const plotType = mode as PlotAlgorithmType;
      const points = [...state.currentControlPoints, lngLat];
      state.currentControlPoints = points;

      const max = MAX_CONTROL_POINTS[plotType];
      if (max !== undefined && points.length >= max) {
        finishPlot(plotType, points);
        return;
      }

      rerender();
    };

    // 双击
    const handleDblClick = () => {
      const state = stateRef.current;
      const mode = state.mode;
      if (mode === 'select' || mode === 'none') return;

      const plotType = mode as PlotAlgorithmType;
      const min = MIN_CONTROL_POINTS[plotType];
      const max = MAX_CONTROL_POINTS[plotType];

      if (max === undefined && state.currentControlPoints.length >= min) {
        finishPlot(plotType, state.currentControlPoints);
      }
    };

    // mousemove — 跟踪鼠标 + 拖拽控制点 + 整体平移 + rubber-band
    const handleMouseMove = (e: Record<string, unknown>) => {
      const state = stateRef.current;
      const lngLat = extractLngLat(e);
      if (!lngLat) return;

      // 控制点拖拽中
      if (state.isDragging && state.dragControlIndex !== null && state.selectedFeatureId) {
        const feature = getFeatures().find((f) => f.id === state.selectedFeatureId);
        if (feature) {
          const newPoints = [...feature.properties.controlPoints];
          newPoints[state.dragControlIndex] = lngLat;
          rebuildFeatureGeometry(state.selectedFeatureId, newPoints);
        }
        return;
      }

      // 整体平移拖拽中
      if (state.isDragging && state.dragStartLngLat && state.selectedFeatureId) {
        const feature = getFeatures().find((f) => f.id === state.selectedFeatureId);
        if (feature) {
          const dLng = lngLat[0] - state.dragStartLngLat[0];
          const dLat = lngLat[1] - state.dragStartLngLat[1];
          const newPoints = feature.properties.controlPoints.map(
            (p): Point => [p[0] + dLng, p[1] + dLat],
          );
          state.dragStartLngLat = lngLat;
          rebuildFeatureGeometry(state.selectedFeatureId, newPoints);
        }
        return;
      }

      // 绘制模式 — 更新鼠标位置触发 rubber-band 预览
      if (state.mode !== 'select' && state.mode !== 'edit' && state.mode !== 'none') {
        state.mousePoint = lngLat;
        rerender();
      }
    };

    // mousedown — 启动控制点拖拽或整体平移
    const handleMouseDown = (e: Record<string, unknown>) => {
      const state = stateRef.current;
      if (state.mode !== 'select' && state.mode !== 'edit') return;
      if (!state.selectedFeatureId) return;

      const lngLat = extractLngLat(e);
      if (!lngLat) return;

      const feature = getFeatures().find((f) => f.id === state.selectedFeatureId);
      if (!feature) return;

      // 优先检测控制点
      const hitIdx = findControlPointAtPixel(mapsService, feature.properties.controlPoints, lngLat);
      if (hitIdx !== null) {
        state.isDragging = true;
        state.dragControlIndex = hitIdx;
        state.dragStartLngLat = null;
        mapsService.setMapStatus?.({ dragEnable: false, zoomEnable: false });
        rerender();
        return;
      }

      // 检测是否在图形内部 → 整体平移
      const coords = feature.geometry.coordinates;
      if (coords && coords[0] && pointInPolygon(lngLat, coords[0] as Point[])) {
        state.isDragging = true;
        state.dragControlIndex = null;
        state.dragStartLngLat = lngLat;
        mapsService.setMapStatus?.({ dragEnable: false, zoomEnable: false });
        rerender();
      }
    };

    // mouseup — 完成拖拽
    const handleMouseUp = () => {
      const state = stateRef.current;
      if (!state.isDragging) return;

      state.isDragging = false;
      state.dragControlIndex = null;
      state.dragStartLngLat = null;
      mapsService.setMapStatus?.({ dragEnable: true, zoomEnable: true });
      rerender();
    };

    scene.on('click', handleClick);
    scene.on('dblclick', handleDblClick);
    scene.on('mousemove', handleMouseMove);
    scene.on('mousedown', handleMouseDown);
    scene.on('mouseup', handleMouseUp);

    return () => {
      scene.off('click', handleClick);
      scene.off('dblclick', handleDblClick);
      scene.off('mousemove', handleMouseMove);
      scene.off('mousedown', handleMouseDown);
      scene.off('mouseup', handleMouseUp);
    };
  }, [scene, mapsService, finishPlot, getFeatures, selectFeature, rebuildFeatureGeometry, rerender]);

  // 键盘
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { setMode('select'); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && stateRef.current.selectedFeatureId) {
        deleteFeature(stateRef.current.selectedFeatureId);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setMode, deleteFeature]);

  return {
    mode: stateRef.current.mode,
    features: getFeatures(),
    selectedFeatureId: stateRef.current.selectedFeatureId,
    currentControlPoints: stateRef.current.currentControlPoints,
    mousePoint: stateRef.current.mousePoint,
    isDragging: stateRef.current.isDragging,
    setMode,
    selectFeature,
    deleteFeature,
    clearAll,
    getFeatures,
  };
}

export { clientXFromEvent, clientYFromEvent };
