/**
 * useDrawInteraction — 绘制/编辑交互状态机 Hook
 *
 * 管理绘制控件的完整交互逻辑：模式切换、地图事件捕获、
 * 要素创建/编辑/删除、临时反馈图层更新。
 *
 * 编辑模式支持：
 * - 选中要素 → 点击要素选中，空白取消选中
 * - 移动要素 → 拖拽选中的要素体
 * - 移动顶点 → 拖拽顶点句柄
 * - 添加顶点 → 双击 LineString/Polygon 的边中点插入新顶点
 * - 删除顶点 → 右键点击顶点删除（LineString 至少留2顶点，Polygon 至少留3顶点）
 */
import { useEffect, useRef, useCallback, useMemo } from 'react';
import type { DrawFeature, DrawMode, DrawState, DrawStyleConfig, DrawGeometryMode } from './draw-types';
import { createInitialDrawState } from './draw-types';
import { DrawLayerManager } from './DrawLayerManager';
import { mergeDrawStyles } from './draw-styles';
import {
  generateFeatureId,
  createDrawFeature,
  coordinatesToPoint,
  verticesToLineString,
  verticesToPolygon,
  rectangleToPolygon,
  circleToPolygon,
  haversineDistance,
  pixelDistance,
  translateFeature,
  moveVertex,
  extractLngLatFromEvent,
  getVertices,
  mergePolygons,
  splitPolygonWithLine,
} from './draw-geometry';
import type { DrawSnapConfig } from './draw-types';
import { findSnapTarget, resolveSnapConfig, type SnapResult } from './draw-snap';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapsService = any;

export interface UseDrawInteractionParams {
  scene: ReturnType<typeof import('../../../context/SceneContext').useScene>;
  mapsService: MapsService;
  styles?: DrawStyleConfig;
  snap?: DrawSnapConfig | boolean;
  defaultFeatures?: DrawFeature[];
  features?: DrawFeature[];
  onDrawCreate?: (features: DrawFeature[]) => void;
  onDrawUpdate?: (feature: DrawFeature) => void;
  onDrawDelete?: (feature: DrawFeature) => void;
  onDrawSelect?: (feature: DrawFeature | null) => void;
  onModeChange?: (mode: DrawMode) => void;
  onChange?: (features: DrawFeature[]) => void;
}

export interface UseDrawInteractionResult {
  mode: DrawMode;
  features: DrawFeature[];
  selectedFeatureId: string | null;
  setMode: (mode: DrawMode) => void;
  addFeatures: (features: DrawFeature[]) => void;
  deleteFeature: (id: string) => void;
  deleteSelectedFeature: () => void;
  clearAll: () => void;
  getFeatures: () => DrawFeature[];
  selectFeature: (id: string | null) => void;
  layerManager: DrawLayerManager | null;
}

/** 最小像素距离阈值 */
const MIN_PIXEL_DISTANCE = 5;

/** 从地图事件中提取客户端坐标 */
function clientX_fromEvent(e: Record<string, unknown>): number {
  const origEvent = (e.originalEvent ?? e.originEvent ?? e.e) as MouseEvent | undefined;
  return origEvent?.clientX ?? (e.x as number | undefined) ?? 0;
}
function clientY_fromEvent(e: Record<string, unknown>): number {
  const origEvent = (e.originalEvent ?? e.originEvent ?? e.e) as MouseEvent | undefined;
  return origEvent?.clientY ?? (e.y as number | undefined) ?? 0;
}

/** 从地图事件中检测点击位置最近的要素（使用像素距离判定） */
function findFeatureAtPixel(
  e: Record<string, unknown>,
  features: DrawFeature[],
  lngLatToPixel: (lngLat: [number, number]) => { x: number; y: number } | null,
): DrawFeature | null {
  const lngLat = extractLngLatFromEvent(e);
  if (!lngLat) return null;

  const clickPixel = lngLatToPixel(lngLat);
  if (!clickPixel) {
    // 无法获取像素坐标时，降级使用经纬度判定（仅用于 Polygon 射线法检测）
    for (const f of features) {
      if (f.geometry.type === 'Polygon') {
        if (isPointInPolygon(lngLat, f.geometry.coordinates[0] as [number, number][])) return f;      }
    }
    return null;
  }

  const HIT_TOLERANCE_PX = 8; // 像素命中容差

  for (const f of features) {
    if (f.geometry.type === 'Polygon') {
      // 面要素：优先用射线法判断点在面内，再用像素距离判断是否靠近边界
      if (isPointInPolygon(lngLat, f.geometry.coordinates[0] as [number, number][])) return f;      // 点不在面内时，检测是否靠近面的边界线段
      const ring = f.geometry.coordinates[0] as [number, number][];
      for (let i = 0; i < ring.length - 1; i++) {
        const distPx = pixelDistToSegment(clickPixel, ring[i], ring[i + 1], lngLatToPixel);
        if (distPx <= HIT_TOLERANCE_PX) return f;
      }
    } else if (f.geometry.type === 'Point') {
      const pt = f.geometry.coordinates as [number, number];
      const ptPixel = lngLatToPixel(pt);
      if (ptPixel) {
        const dx = ptPixel.x - clickPixel.x;
        const dy = ptPixel.y - clickPixel.y;
        if (Math.sqrt(dx * dx + dy * dy) <= HIT_TOLERANCE_PX) return f;
      }
    } else if (f.geometry.type === 'LineString') {
      const coords = f.geometry.coordinates as [number, number][];
      for (let i = 0; i < coords.length - 1; i++) {
        const distPx = pixelDistToSegment(clickPixel, coords[i], coords[i + 1], lngLatToPixel);
        if (distPx <= HIT_TOLERANCE_PX) return f;
      }
    }
  }
  return null;
}

/** 计算点到线段的像素距离（将线段端点转为像素后计算） */
function pixelDistToSegment(
  clickPixel: { x: number; y: number },
  segA: [number, number],
  segB: [number, number],
  lngLatToPixel: (lngLat: [number, number]) => { x: number; y: number } | null,
): number {
  const aPixel = lngLatToPixel(segA);
  const bPixel = lngLatToPixel(segB);
  if (!aPixel || !bPixel) return Infinity;

  // 线段为零长度时直接返回点到端点的距离
  const dx = bPixel.x - aPixel.x;
  const dy = bPixel.y - aPixel.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const d0x = clickPixel.x - aPixel.x;
    const d0y = clickPixel.y - aPixel.y;
    return Math.sqrt(d0x * d0x + d0y * d0y);
  }

  // 投影参数 t，限制在 [0,1] 内
  const t = Math.max(0, Math.min(1,
    ((clickPixel.x - aPixel.x) * dx + (clickPixel.y - aPixel.y) * dy) / lenSq));
  const projX = aPixel.x + t * dx;
  const projY = aPixel.y + t * dy;
  const ddx = clickPixel.x - projX;
  const ddy = clickPixel.y - projY;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}

/** 判断点是否在多边形内（射线法） */
function isPointInPolygon(point: [number, number], ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * 找到线段上距离指定点最近的点（投影点），返回投影坐标和在线段上的参数 t
 * 如果 t 在 [0,1] 范围内说明投影落在线段上
 */
function projectPointOnSegment(
  p: [number, number],
  a: [number, number],
  b: [number, number],
): { point: [number, number]; t: number; dist: number } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const d = Math.sqrt((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2);
    return { point: a, t: 0, dist: d };
  }
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const proj: [number, number] = [a[0] + t * dx, a[1] + t * dy];
  const dist = Math.sqrt((p[0] - proj[0]) ** 2 + (p[1] - proj[1]) ** 2);
  return { point: proj, t, dist };
}

/**
 * 在 LineString 的指定边索引处插入新顶点
 */
function insertVertexOnLine(feature: DrawFeature, edgeIndex: number, newCoord: [number, number]): DrawFeature | null {
  if (feature.geometry.type !== 'LineString') return null;
  const coords = [...feature.geometry.coordinates.map((c) => [...c] as [number, number])];
  if (edgeIndex < 0 || edgeIndex >= coords.length - 1) return null;
  coords.splice(edgeIndex + 1, 0, newCoord);
  return {
    ...feature,
    geometry: { type: 'LineString', coordinates: coords },
    properties: { ...feature.properties },
  };
}

/**
 * 在 Polygon 外环的指定边索引处插入新顶点
 */
function insertVertexOnPolygon(feature: DrawFeature, edgeIndex: number, newCoord: [number, number]): DrawFeature | null {
  if (feature.geometry.type !== 'Polygon') return null;
  const rings = feature.geometry.coordinates.map((ring) => ring.map((c) => [...c] as [number, number]));
  const outerRing = rings[0];

  // 计算唯一顶点数（不含闭合尾点）
  const uniqueCount = outerRing.length > 1 &&
    outerRing[0][0] === outerRing[outerRing.length - 1][0] &&
    outerRing[0][1] === outerRing[outerRing.length - 1][1]
    ? outerRing.length - 1
    : outerRing.length;

  if (edgeIndex < 0 || edgeIndex >= uniqueCount) return null;

  // 在 edgeIndex 和 edgeIndex+1 之间插入
  const insertAt = edgeIndex + 1;
  outerRing.splice(insertAt, 0, newCoord);

  // 如果有闭合顶点，保持闭合
  if (outerRing[0][0] === outerRing[outerRing.length - 2][0] &&
      outerRing[0][1] === outerRing[outerRing.length - 2][1]) {
    // 不需要额外操作，闭合会自动在下一次读取时生效
  }
  // 更新闭合顶点
  outerRing[outerRing.length - 1] = [outerRing[0][0], outerRing[0][1]];

  return {
    ...feature,
    geometry: { type: 'Polygon', coordinates: rings },
    properties: { ...feature.properties },
  };
}

/**
 * 删除 LineString 的指定顶点，保证最少 2 顶点
 */
function removeVertexFromLine(feature: DrawFeature, vertexIndex: number): DrawFeature | null {
  if (feature.geometry.type !== 'LineString') return null;
  const coords = feature.geometry.coordinates.map((c) => [...c] as [number, number]);
  if (coords.length <= 2) return null; // 不允许少于 2 顶点
  if (vertexIndex < 0 || vertexIndex >= coords.length) return null;
  coords.splice(vertexIndex, 1);
  return {
    ...feature,
    geometry: { type: 'LineString', coordinates: coords },
    properties: { ...feature.properties },
  };
}

/**
 * 删除 Polygon 外环的指定顶点，保证最少 3 顶点
 */
function removeVertexFromPolygon(feature: DrawFeature, vertexIndex: number): DrawFeature | null {
  if (feature.geometry.type !== 'Polygon') return null;
  const rings = feature.geometry.coordinates.map((ring) => ring.map((c) => [...c] as [number, number]));
  const outerRing = rings[0];

  const uniqueCount = outerRing.length > 1 &&
    outerRing[0][0] === outerRing[outerRing.length - 1][0] &&
    outerRing[0][1] === outerRing[outerRing.length - 1][1]
    ? outerRing.length - 1
    : outerRing.length;

  if (uniqueCount <= 3) return null; // 不允许少于 3 顶点
  if (vertexIndex < 0 || vertexIndex >= uniqueCount) return null;

  outerRing.splice(vertexIndex, 1);

  // 更新闭合顶点
  outerRing[outerRing.length - 1] = [outerRing[0][0], outerRing[0][1]];

  return {
    ...feature,
    geometry: { type: 'Polygon', coordinates: rings },
    properties: { ...feature.properties },
  };
}

export function useDrawInteraction(params: UseDrawInteractionParams): UseDrawInteractionResult {
  const {
    scene,
    mapsService,
    styles,
    snap,
    defaultFeatures,
    features: controlledFeatures,
    onDrawCreate,
    onDrawUpdate,
    onDrawDelete,
    onDrawSelect,
    onModeChange,
    onChange,
  } = params;

  const stateRef = useRef<DrawState>(createInitialDrawState(defaultFeatures));
  const layerManagerRef = useRef<DrawLayerManager | null>(null);
  const mergedStyles = useMemo(() => mergeDrawStyles(styles), [styles]);
  const snapConfig = useMemo(() => resolveSnapConfig(snap), [snap]);
  const callbacksRef = useRef({ onDrawCreate, onDrawUpdate, onDrawDelete, onDrawSelect, onModeChange, onChange });
  callbacksRef.current = { onDrawCreate, onDrawUpdate, onDrawDelete, onDrawSelect, onModeChange, onChange };

  const modeRef = useRef<DrawMode>('none');
  const featuresRef = useRef<DrawFeature[]>(defaultFeatures ? [...defaultFeatures] : []);
  const selectedIdRef = useRef<string | null>(null);

  const isControlled = controlledFeatures !== undefined;

  // 拖拽时记录上一帧的鼠标经纬度，用于计算要素平移增量
  const lastDragLngLatRef = useRef<[number, number] | null>(null);
  const dragStartPixelRef = useRef<{ x: number; y: number } | null>(null);
  const lastSnapRef = useRef<SnapResult | null>(null);

  // 吸附辅助：经纬度转像素
  const lngLatToPixel = useCallback((lngLat: [number, number]): { x: number; y: number } | null => {
    if (!mapsService) return null;
    try {
      const pixel = mapsService.lngLatToContainer?.([lngLat[0], lngLat[1]]);
      if (pixel) return { x: pixel.x ?? pixel[0], y: pixel.y ?? pixel[1] };
    } catch { /* */ }
    return null;
  }, [mapsService]);

  // ---- 内部状态更新辅助 ----

  const updateFeatures = useCallback((newFeatures: DrawFeature[]) => {
    featuresRef.current = newFeatures;
    stateRef.current.features = newFeatures;
    layerManagerRef.current?.updateFeatures(newFeatures);
    callbacksRef.current.onChange?.(newFeatures);
  }, []);

  const updateSelectedId = useCallback((id: string | null) => {
    selectedIdRef.current = id;
    stateRef.current.selectedFeatureId = id;
    const feature = id ? featuresRef.current.find((f) => f.id === id) ?? null : null;
    callbacksRef.current.onDrawSelect?.(feature);
  }, []);

  // ---- 初始化图层管理器 ----
  useEffect(() => {
    if (!scene) return;
    const manager = new DrawLayerManager(scene, mergedStyles, mapsService);
    layerManagerRef.current = manager;
    if (featuresRef.current.length > 0) {
      manager.updateFeatures(featuresRef.current);
    }
    return () => {
      manager.destroy();
      layerManagerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // ---- 地图事件处理器 ----

  const handleMapClick = useCallback((e: Record<string, unknown>) => {
    const state = stateRef.current;
    const lngLat = extractLngLatFromEvent(e);
    if (!lngLat) return;
    const manager = layerManagerRef.current;
    if (!manager) return;

    // 使用吸附结果（如果有）
    const snap = lastSnapRef.current;
    const lng = snap?.snapped ? snap.lng : lngLat[0];
    const lat = snap?.snapped ? snap.lat : lngLat[1];

    const mode = modeRef.current as DrawMode;

    if (mode === 'point') {
      const feature = createDrawFeature(coordinatesToPoint([lng, lat]), 'point');
      const newFeatures = [...featuresRef.current, feature];
      updateFeatures(newFeatures);
      callbacksRef.current.onDrawCreate?.([feature]);
      return;
    }

    if (mode === 'polyline') {
      state.currentVertices.push([lng, lat]);
      state.isDrawing = true;
      manager.showDrawingFeedback(state.currentVertices, state.mousePoint, mode, state.startPoint);
      return;
    }

    if (mode === 'polygon') {
      state.currentVertices.push([lng, lat]);
      state.isDrawing = true;
      manager.showDrawingFeedback(state.currentVertices, state.mousePoint, mode, state.startPoint);
      return;
    }

    if (mode === 'circle') {
      if (!state.startPoint) {
        state.startPoint = [lng, lat];
        state.isDrawing = true;
      } else {
        const radius = haversineDistance(state.startPoint, [lng, lat]);
        if (radius > 0.5) {
          const polygon = circleToPolygon(state.startPoint, radius);
          const feature = createDrawFeature(polygon, 'circle');
          const newFeatures = [...featuresRef.current, feature];
          updateFeatures(newFeatures);
          callbacksRef.current.onDrawCreate?.([feature]);
        }
        state.startPoint = null;
        state.isDrawing = false;
        manager.clearDrawingFeedback();
      }
      return;
    }

    if (mode === 'merge') {
      // 合并模式：点击面要素累积选中
      // 检查是否点击了已有的面要素
      const clickedFeature = findFeatureAtPixel(e, featuresRef.current, lngLatToPixel);
      if (clickedFeature && (clickedFeature.geometry.type === 'Polygon' || clickedFeature.properties.drawType === 'circle')) {
        const id = clickedFeature.id;
        const selectedIds = [...state.mergeSelectedIds];
        const existingIndex = selectedIds.indexOf(id);
        if (existingIndex >= 0) {
          // 已选中则取消选中
          selectedIds.splice(existingIndex, 1);
        } else {
          // 未选中则加入
          selectedIds.push(id);
        }
        state.mergeSelectedIds = selectedIds;
        manager.highlightMergeSelected(selectedIds, featuresRef.current);
        if (selectedIds.length >= 2) {
          manager.showTooltip(`已选中 ${selectedIds.length} 个面，双击合并`, clientX_fromEvent(e), clientY_fromEvent(e), ['[ESC] 取消']);
        } else if (selectedIds.length === 1) {
          manager.showTooltip('继续点击选中更多面', clientX_fromEvent(e), clientY_fromEvent(e), ['[ESC] 取消']);
        }
      } else {
        // 点击空白区域，取消所有选中
        state.mergeSelectedIds = [];
        manager.highlightMergeSelected([], featuresRef.current);
        manager.showTooltip('点击面要素选中', clientX_fromEvent(e), clientY_fromEvent(e), ['[ESC] 取消']);
      }
      return;
    }

    if (mode === 'split') {
      // 切分模式：先选目标面，然后绘制切线
      if (!state.splitTargetId) {
        // 还未选择目标面，点击选择
        const clickedFeature = findFeatureAtPixel(e, featuresRef.current, lngLatToPixel);
        if (clickedFeature && (clickedFeature.geometry.type === 'Polygon' || clickedFeature.properties.drawType === 'circle')) {
          state.splitTargetId = clickedFeature.id;
          manager.highlightSplitTarget(clickedFeature.id, featuresRef.current);
          manager.showTooltip('已选目标面，单击绘制切线起点', clientX_fromEvent(e), clientY_fromEvent(e), ['[ESC] 取消']);
        } else {
          manager.showTooltip('先点击选择要切分的面', clientX_fromEvent(e), clientY_fromEvent(e), ['[ESC] 取消']);
        }
        return;
      }
      // 已选中目标面，绘制切线（类似 polyline）
      state.currentVertices.push([lng, lat]);
      state.isDrawing = true;
      manager.showDrawingFeedback(state.currentVertices, state.mousePoint, 'polyline', state.startPoint);
      if (state.currentVertices.length === 1) {
        manager.showTooltip('单击继续绘制切线，双击完成切分', clientX_fromEvent(e), clientY_fromEvent(e), ['[ESC] 取消']);
      } else {
        manager.showTooltip(`切线 ${state.currentVertices.length} 个顶点，双击完成切分`, clientX_fromEvent(e), clientY_fromEvent(e), ['[ESC] 取消']);
      }
      return;
    }

    if (mode === 'edit') {
      // 编辑模式下的点击由图层事件和空白检测处理
      return;
    }
  }, [updateFeatures, lngLatToPixel]);

  const handleMapDblClick = useCallback((e: Record<string, unknown>) => {
    const state = stateRef.current;
    const mode = modeRef.current as DrawMode;
    const manager = layerManagerRef.current;
    if (!manager) return;

    // 编辑模式：双击边线添加顶点
    if (mode === 'edit' && selectedIdRef.current) {
      const lngLat = extractLngLatFromEvent(e);
      if (lngLat) {
        // 此功能通过 mousedown 在边上检测实现，dblclick 暂不处理
      }
      return;
    }

    if (e.originalEvent) {
      (e.originalEvent as Event).preventDefault?.();
      (e.originalEvent as Event).stopPropagation?.();
    }

    // merge 模式：双击执行合并
    if (mode === 'merge') {
      if (state.mergeSelectedIds.length >= 2) {
        const selectedFeatures = featuresRef.current.filter((f) => state.mergeSelectedIds.includes(f.id));
        const merged = mergePolygons(selectedFeatures);
        if (merged) {
          // 删除原始要素，添加合并后的要素
          const remaining = featuresRef.current.filter((f) => !state.mergeSelectedIds.includes(f.id));
          const newFeatures = [...remaining, merged];
          updateFeatures(newFeatures);
          callbacksRef.current.onDrawCreate?.([merged]);
          callbacksRef.current.onDrawDelete?.(selectedFeatures[0]);
        }
        state.mergeSelectedIds = [];
        manager.highlightMergeSelected([], featuresRef.current);
        manager.hideTooltip();
      }
      return;
    }

    // split 模式：双击完成切线绘制，执行分割
    if (mode === 'split' && state.splitTargetId && state.currentVertices.length >= 2) {
      const targetFeature = featuresRef.current.find((f) => f.id === state.splitTargetId);
      if (targetFeature) {
        const results = splitPolygonWithLine(targetFeature, state.currentVertices as [number, number][]);
        if (results) {
          // 删除原始面要素，添加分割后的两个面要素
          const remaining = featuresRef.current.filter((f) => f.id !== state.splitTargetId);
          const newFeatures = [...remaining, ...results];
          updateFeatures(newFeatures);
          callbacksRef.current.onDrawCreate?.(results);
          callbacksRef.current.onDrawDelete?.(targetFeature);
        }
      }
      state.currentVertices = [];
      state.isDrawing = false;
      state.mousePoint = null;
      state.splitTargetId = null;
      manager.clearDrawingFeedback();
      manager.clearSplitHighlight();
      manager.hideTooltip();
      return;
    }

    if (mode === 'polyline' && state.currentVertices.length >= 2) {
      const lineGeo = verticesToLineString(state.currentVertices);
      const feature = createDrawFeature(lineGeo, 'polyline');
      const newFeatures = [...featuresRef.current, feature];
      updateFeatures(newFeatures);
      callbacksRef.current.onDrawCreate?.([feature]);
      state.currentVertices = [];
      state.isDrawing = false;
      state.mousePoint = null;
      manager.clearDrawingFeedback();
      return;
    }

    if (mode === 'polygon' && state.currentVertices.length >= 3) {
      const polyGeo = verticesToPolygon(state.currentVertices as [number, number][]);
      const feature = createDrawFeature(polyGeo, 'polygon');
      const newFeatures = [...featuresRef.current, feature];
      updateFeatures(newFeatures);
      callbacksRef.current.onDrawCreate?.([feature]);
      state.currentVertices = [];
      state.isDrawing = false;
      state.mousePoint = null;
      manager.clearDrawingFeedback();
      return;
    }

    if (mode === 'polyline' || mode === 'polygon') {
      state.currentVertices = [];
      state.isDrawing = false;
      state.mousePoint = null;
      manager.clearDrawingFeedback();
    }
  }, [updateFeatures]);

  const handleMapMouseMove = useCallback((e: Record<string, unknown>) => {
    const state = stateRef.current;
    const lngLat = extractLngLatFromEvent(e);
    if (!lngLat) return;
    const [lng, lat] = lngLat;
    const manager = layerManagerRef.current;
    const mode = modeRef.current as DrawMode;

    // 获取鼠标像素位置（L7 事件可能叫 originalEvent、originEvent 或 e）
    const origEvent = (e.originalEvent ?? e.originEvent ?? e.e) as MouseEvent | undefined;
    const clientX = origEvent?.clientX ?? (e.x as number | undefined) ?? 0;
    const clientY = origEvent?.clientY ?? (e.y as number | undefined) ?? 0;

    state.mousePoint = [lng, lat];

    // 鼠标跟随提示（GeoEditor Pro Tooltip Spec v2.0）
    if (manager && (clientX || clientY)) {
      // 吸附态优先显示吸附提示
      const snapResult = lastSnapRef.current;
      const isDrawingMode = mode === 'point' || mode === 'polyline' || mode === 'polygon' || mode === 'circle' || mode === 'rectangle';
      if (isDrawingMode && snapResult?.snapped && snapResult.type !== 'none') {
        manager.showSnapTooltip(snapResult.type, snapResult.lng, snapResult.lat, clientX, clientY);
      } else if (mode === 'point') {
        manager.showTooltip('单击放置点', clientX, clientY, ['[ESC] 取消']);
      } else if (mode === 'polyline') {
        if (!state.isDrawing) {
          manager.showTooltip('单击开始绘制线', clientX, clientY, ['[ESC] 取消']);
        } else {
          manager.showTooltip('单击添加顶点，双击结束', clientX, clientY, ['[ESC] 取消']);
        }
      } else if (mode === 'polygon') {
        if (!state.isDrawing) {
          manager.showTooltip('单击开始绘制面', clientX, clientY, ['[ESC] 取消']);
        } else if (state.currentVertices.length < 3) {
          manager.showTooltip('单击添加顶点', clientX, clientY, ['[ESC] 取消']);
        } else {
          manager.showTooltip('单击继续，双击闭合', clientX, clientY, ['[ESC] 取消']);
        }
      } else if (mode === 'rectangle') {
        if (!state.isDragging) {
          manager.showTooltip('按住拖拽绘制矩形', clientX, clientY, ['[SHIFT] 正方形', '[ESC] 取消']);
        }
      } else if (mode === 'circle') {
        if (!state.startPoint) {
          manager.showTooltip('单击设定圆心', clientX, clientY, ['[ESC] 取消']);
        } else {
          const radius = haversineDistance(state.startPoint, [lng, lat]);
          const label = radius > 1000 ? `${(radius / 1000).toFixed(1)} km` : `${Math.round(radius)} m`;
          manager.showTooltip(`半径 ${label}，单击完成`, clientX, clientY, ['[ESC] 取消']);
        }
      } else if (mode === 'merge') {
        if (state.mergeSelectedIds.length >= 2) {
          manager.showTooltip(`已选中 ${state.mergeSelectedIds.length} 个面，双击合并`, clientX, clientY, ['[ESC] 取消']);
        } else if (state.mergeSelectedIds.length === 1) {
          manager.showTooltip('继续点击选中更多面', clientX, clientY, ['[ESC] 取消']);
        } else {
          manager.showTooltip('点击面要素选中', clientX, clientY, ['[ESC] 取消']);
        }
      } else if (mode === 'split') {
        if (!state.splitTargetId) {
          manager.showTooltip('先点击选择要切分的面', clientX, clientY, ['[ESC] 取消']);
        } else if (!state.isDrawing) {
          manager.showTooltip('单击绘制切线起点', clientX, clientY, ['[ESC] 取消']);
        } else {
          manager.showTooltip(`切线 ${state.currentVertices.length} 个顶点，双击完成切分`, clientX, clientY, ['[ESC] 取消']);
        }
      } else if (mode === 'edit') {
        // 编辑模式 tooltip 由图层 hover 事件（vertex/midpoint/feature mouseenter/leave）驱动
        // mousemove 中不主动设置，避免与图层事件冲突导致闪烁
      } else {
        manager.hideTooltip();
      }
    }

    // 吸附检测（绘制模式下）
    const isDrawingMode = mode === 'point' || mode === 'polyline' || mode === 'polygon' || mode === 'circle';
    if (isDrawingMode && snapConfig.enabled && manager) {
      const snapResult = findSnapTarget([lng, lat], featuresRef.current, snapConfig, lngLatToPixel);
      lastSnapRef.current = snapResult;
      if (snapResult.snapped && snapResult.type !== 'none') {
        manager.showSnapIndicator(snapResult.lng, snapResult.lat, snapResult.type);
        state.mousePoint = [snapResult.lng, snapResult.lat];
      } else {
        manager.hideSnapIndicator();
      }
    } else {
      lastSnapRef.current = null;
      manager?.hideSnapIndicator();
    }

    // 绘制模式 rubber-band
    if ((mode === 'polyline' || mode === 'polygon') && state.isDrawing) {
      manager?.showDrawingFeedback(state.currentVertices, state.mousePoint, mode, state.startPoint);
      return;
    }

    if (mode === 'circle' && state.startPoint && state.isDrawing) {
      manager?.showDrawingFeedback(state.currentVertices, state.mousePoint, mode, state.startPoint);
      return;
    }

    if (mode === 'rectangle' && state.isDragging && state.startPoint) {
      manager?.showDrawingFeedback(state.currentVertices, state.mousePoint, mode, state.startPoint);
      return;
    }

    // 编辑模式：顶点拖拽
    if (mode === 'edit' && state.isDragging && state.selectedFeatureId && state.dragVertexIndex !== null && lastDragLngLatRef.current) {
      const feature = featuresRef.current.find((f) => f.id === state.selectedFeatureId);
      if (feature) {
        const updated = moveVertex(feature, state.dragVertexIndex, lng, lat);
        const newFeatures = featuresRef.current.map((f) => (f.id === updated.id ? updated : f));
        updateFeatures(newFeatures);
        manager?.updateVertexHandles(updated);
        manager?.updateSelectionHighlight(updated);
        lastDragLngLatRef.current = [lng, lat];
      }
      return;
    }

    // 编辑模式：要素整体移动
    if (mode === 'edit' && state.isDragging && state.selectedFeatureId && state.dragVertexIndex === null && lastDragLngLatRef.current) {
      const [prevLng, prevLat] = lastDragLngLatRef.current;
      const dLng = lng - prevLng;
      const dLat = lat - prevLat;

      if (Math.abs(dLng) > 1e-10 || Math.abs(dLat) > 1e-10) {
        const feature = featuresRef.current.find((f) => f.id === state.selectedFeatureId);
        if (feature) {
          const updated = translateFeature(feature, dLng, dLat);
          const newFeatures = featuresRef.current.map((f) => (f.id === updated.id ? updated : f));
          updateFeatures(newFeatures);
          manager?.updateVertexHandles(updated);
          manager?.updateSelectionHighlight(updated);
          lastDragLngLatRef.current = [lng, lat];
        }
      }
      return;
    }
  }, [updateFeatures]);

  // ---- 鼠标按下/松起（矩形绘制 + 编辑拖拽）----

  const handleMapMouseDown = useCallback((e: MouseEvent) => {
    const state = stateRef.current;
    const mode = modeRef.current as DrawMode;
    if (!mapsService) return;

    // 矩形模式
    if (mode === 'rectangle') {
      const container = mapsService.getContainer?.();
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const lngLat = mapsService.containerToLngLat?.([x, y]);
      if (!lngLat) return;

      state.startPoint = [lngLat.lng, lngLat.lat];
      state.isDragging = true;
      dragStartPixelRef.current = { x: e.clientX, y: e.clientY };
      mapsService.setMapStatus({ dragEnable: false, zoomEnable: false });
      return;
    }

    // 编辑模式：不在 DOM 层面启动拖拽
    // 拖拽启动完全由 L7 图层事件驱动：
    // - vertex mousedown → 顶点拖拽（zIndex=16，优先触发）
    // - feature mousedown → 整体移动（zIndex=10）
    // DOM mousedown 先于 L7 事件执行，无法区分两者，因此跳过
  }, [mapsService]);

  const handleDocumentMouseUp = useCallback((e: MouseEvent) => {
    const state = stateRef.current;
    const mode = modeRef.current as DrawMode;
    const manager = layerManagerRef.current;
    if (!mapsService) return;

    // 矩形模式完成
    if (mode === 'rectangle' && state.isDragging && state.startPoint) {
      const container = mapsService.getContainer?.();
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const lngLat = mapsService.containerToLngLat?.([x, y]);

        const startPixel = dragStartPixelRef.current;
        const dist = startPixel ? pixelDistance(startPixel, { x: e.clientX, y: e.clientY }) : Infinity;

        if (lngLat && dist > MIN_PIXEL_DISTANCE) {
          const endCoord: [number, number] = [lngLat.lng, lngLat.lat];
          const polyGeo = rectangleToPolygon(state.startPoint, endCoord);
          const feature = createDrawFeature(polyGeo, 'rectangle');
          const newFeatures = [...featuresRef.current, feature];
          updateFeatures(newFeatures);
          callbacksRef.current.onDrawCreate?.([feature]);
        }
      }

      state.startPoint = null;
      state.isDragging = false;
      state.mousePoint = null;
      dragStartPixelRef.current = null;
      manager?.clearDrawingFeedback();
      mapsService.setMapStatus({ dragEnable: true, zoomEnable: true });
      return;
    }

    // 编辑模式结束拖拽
    if (mode === 'edit' && state.isDragging && state.selectedFeatureId) {
      mapsService.setMapStatus({ dragEnable: true, zoomEnable: true });

      const feature = featuresRef.current.find((f) => f.id === state.selectedFeatureId);
      if (feature) {
        callbacksRef.current.onDrawUpdate?.(feature);
      }

      state.isDragging = false;
      state.dragVertexIndex = null;
      lastDragLngLatRef.current = null;
      return;
    }
  }, [mapsService, updateFeatures]);

  // ---- 编辑模式事件处理 ----

  const handleFeatureClick = useCallback((featureId: string) => {
    if (modeRef.current !== 'edit') return;

    const feature = featuresRef.current.find((f) => f.id === featureId) ?? null;
    if (feature) {
      updateSelectedId(featureId);
      layerManagerRef.current?.hideFeatureFromStatic(featureId);
      layerManagerRef.current?.updateSelectionHighlight(feature);
      layerManagerRef.current?.updateVertexHandles(feature);
    }
  }, [updateSelectedId]);

  const handleVertexClick = useCallback((vertexIndex: number) => {
    if (modeRef.current !== 'edit') return;
    if (!mapsService) return;
    if (!selectedIdRef.current) return;

    const state = stateRef.current;
    const feature = featuresRef.current.find((f) => f.id === selectedIdRef.current);
    if (!feature) return;

    // 拿到当前顶点的经纬度作为拖拽初始位置
    const vertices = getVertices(feature);
    if (vertexIndex >= 0 && vertexIndex < vertices.length) {
      lastDragLngLatRef.current = vertices[vertexIndex];
    }

    state.isDragging = true;
    state.dragVertexIndex = vertexIndex;
    mapsService.setMapStatus({ dragEnable: false, zoomEnable: false });
  }, [mapsService]);

  // feature 图层 mousedown — 启动整体移动
  // vertex zIndex=16 > feature zIndex=10~12，vertex mousedown 先触发
  // 如果 vertex 已设置 isDragging=true，则整体移动不启动
  const handleFeatureMouseDown = useCallback((featureId: string, lngLat: [number, number]) => {
    if (modeRef.current !== 'edit') return;
    const state = stateRef.current;
    // vertex mousedown 先触发（zIndex更高），如果已经设置了 isDragging，则跳过
    if (state.isDragging) return;

    const feature = featuresRef.current.find((f) => f.id === featureId);
    if (!feature) return;

    // 必须先选中要素才能拖拽
    if (state.selectedFeatureId !== featureId) return;

    state.isDragging = true;
    state.dragVertexIndex = null; // null = 整体移动
    lastDragLngLatRef.current = lngLat;
    mapsService.setMapStatus({ dragEnable: false, zoomEnable: false });
  }, [mapsService]);

  // 右键删除顶点
  const handleVertexRightClick = useCallback((vertexIndex: number) => {
    if (modeRef.current !== 'edit') return;
    if (!selectedIdRef.current) return;

    const feature = featuresRef.current.find((f) => f.id === selectedIdRef.current);
    if (!feature) return;

    let updated: DrawFeature | null = null;

    if (feature.geometry.type === 'LineString') {
      updated = removeVertexFromLine(feature, vertexIndex);
    } else if (feature.geometry.type === 'Polygon') {
      updated = removeVertexFromPolygon(feature, vertexIndex);
    }

    if (updated) {
      const newFeatures = featuresRef.current.map((f) => (f.id === updated!.id ? updated! : f));
      updateFeatures(newFeatures);
      callbacksRef.current.onDrawUpdate?.(updated);
      layerManagerRef.current?.updateVertexHandles(updated);
      layerManagerRef.current?.updateSelectionHighlight(updated);
    }
  }, [updateFeatures]);

  // 双击边线添加顶点
  const handleEdgeDoubleClick = useCallback((lngLat: [number, number]) => {
    if (modeRef.current !== 'edit') return;
    if (!selectedIdRef.current) return;

    const feature = featuresRef.current.find((f) => f.id === selectedIdRef.current);
    if (!feature) return;

    const vertices = getVertices(feature);
    let updated: DrawFeature | null = null;

    if (feature.geometry.type === 'LineString' && vertices.length >= 2) {
      // 找到最近的边
      let bestEdge = -1;
      let bestDist = Infinity;
      for (let i = 0; i < vertices.length - 1; i++) {
        const { dist } = projectPointOnSegment(lngLat, vertices[i], vertices[i + 1]);
        if (dist < bestDist) {
          bestDist = dist;
          bestEdge = i;
        }
      }
      if (bestEdge >= 0 && bestDist < 0.001) { // ~100m 经纬度阈值
        updated = insertVertexOnLine(feature, bestEdge, lngLat);
      }
    } else if (feature.geometry.type === 'Polygon' && vertices.length >= 3) {
      // 闭合多边形的边
      let bestEdge = -1;
      let bestDist = Infinity;
      for (let i = 0; i < vertices.length; i++) {
        const next = (i + 1) % vertices.length;
        const { dist } = projectPointOnSegment(lngLat, vertices[i], vertices[next]);
        if (dist < bestDist) {
          bestDist = dist;
          bestEdge = i;
        }
      }
      if (bestEdge >= 0 && bestDist < 0.001) {
        updated = insertVertexOnPolygon(feature, bestEdge, lngLat);
      }
    }

    if (updated) {
      const newFeatures = featuresRef.current.map((f) => (f.id === updated!.id ? updated! : f));
      updateFeatures(newFeatures);
      callbacksRef.current.onDrawUpdate?.(updated);
      layerManagerRef.current?.updateVertexHandles(updated);
      layerManagerRef.current?.updateSelectionHighlight(updated);
    }
  }, [updateFeatures]);

  // 中点点击添加顶点
  const handleMidpointClick = useCallback((edgeIndex: number, coord: [number, number]) => {
    if (modeRef.current !== 'edit') return;
    if (!selectedIdRef.current) return;

    const feature = featuresRef.current.find((f) => f.id === selectedIdRef.current);
    if (!feature) return;

    let updated: DrawFeature | null = null;

    if (feature.geometry.type === 'LineString') {
      updated = insertVertexOnLine(feature, edgeIndex, coord);
    } else if (feature.geometry.type === 'Polygon') {
      updated = insertVertexOnPolygon(feature, edgeIndex, coord);
    }

    if (updated) {
      const newFeatures = featuresRef.current.map((f) => (f.id === updated!.id ? updated! : f));
      updateFeatures(newFeatures);
      callbacksRef.current.onDrawUpdate?.(updated);
      layerManagerRef.current?.updateVertexHandles(updated);
      layerManagerRef.current?.updateSelectionHighlight(updated);
    }
  }, [updateFeatures]);

  const handleMapClickForEdit = useCallback(() => {
    if (modeRef.current === 'edit' && selectedIdRef.current) {
      updateSelectedId(null);
      layerManagerRef.current?.showAllFeatures();
      layerManagerRef.current?.clearSelectionHighlight();
      layerManagerRef.current?.clearVertexHandles();
    }
  }, [updateSelectedId]);

  // ---- 模式切换 ----
  const setMode = useCallback((newMode: DrawMode) => {
    const prevMode = modeRef.current;
    if (prevMode === newMode) return;

    const state = stateRef.current;
    const manager = layerManagerRef.current;

    // 清理当前绘制状态
    if (state.isDrawing) {
      state.currentVertices = [];
      state.startPoint = null;
      state.mousePoint = null;
      state.isDrawing = false;
      manager?.clearDrawingFeedback();
      manager?.removeDrawingLayers();
    }

    // 退出 merge/split 模式
    if (prevMode === 'merge') {
      state.mergeSelectedIds = [];
      manager?.clearMergeHighlight();
      manager?.hideTooltip();
    }
    if (prevMode === 'split') {
      state.splitTargetId = null;
      state.currentVertices = [];
      state.isDrawing = false;
      manager?.clearDrawingFeedback();
      manager?.clearSplitHighlight();
      manager?.hideTooltip();
    }

    // 退出编辑模式
    if (prevMode === 'edit') {
      updateSelectedId(null);
      manager?.showAllFeatures();
      manager?.clearSelectionHighlight();
      manager?.clearVertexHandles();
      manager?.removeSelectionLayers();
      manager?.removeVertexLayer();
      manager?.removeEditClickHandlers();
      manager?.clearEditCursors();
      manager?.hideTooltip();
      if (mapsService) {
        mapsService.setMapStatus({ doubleClickZoom: true });
      }
    }

    // 退出绘制模式（merge/split 有专用退出分支，这里只处理纯绘制模式）
    if (prevMode !== 'edit' && prevMode !== 'none' && prevMode !== 'merge' && prevMode !== 'split') {
      manager?.removeDrawingLayers();
      manager?.hideTooltip();
      if (mapsService) {
        mapsService.setMapStatus({ doubleClickZoom: true });
      }
      const container = mapsService?.getContainer?.();
      if (container) {
        container.classList.remove('l7-draw-cursor-crosshair');
      }
    }

    modeRef.current = newMode;
    state.mode = newMode;

    // 进入新模式
    if (newMode === 'merge') {
      state.mergeSelectedIds = [];
      const container = mapsService?.getContainer?.();
      if (container) {
        container.classList.add('l7-draw-cursor-crosshair');
      }
    } else if (newMode === 'split') {
      state.splitTargetId = null;
      state.currentVertices = [];
      state.isDrawing = false;
      if (mapsService) {
        mapsService.setMapStatus({ doubleClickZoom: false });
      }
      const container = mapsService?.getContainer?.();
      if (container) {
        container.classList.add('l7-draw-cursor-crosshair');
      }
    } else if (newMode === 'edit') {
      manager?.setupEditClickHandlers(handleFeatureClick, handleVertexClick, handleMapClickForEdit, handleVertexRightClick, handleMidpointClick, handleFeatureMouseDown);
      // 编辑态图层在 updateSelectionHighlight/updateVertexHandles 中按需创建
      if (mapsService) {
        mapsService.setMapStatus({ doubleClickZoom: false });
      }
    } else if (newMode !== 'none') {
      // drawing 图层在 showDrawingFeedback 中按需创建
      if (mapsService && (newMode === 'polyline' || newMode === 'polygon')) {
        mapsService.setMapStatus({ doubleClickZoom: false });
      }
      const container = mapsService?.getContainer?.();
      if (container) {
        container.classList.add('l7-draw-cursor-crosshair');
      }
    } else {
      const container = mapsService?.getContainer?.();
      if (container) {
        container.classList.remove('l7-draw-cursor-crosshair');
      }
    }

    callbacksRef.current.onModeChange?.(newMode);
  }, [mapsService, handleFeatureClick, handleVertexClick, handleMapClickForEdit, updateSelectedId]);

  // ---- 键盘事件 ----
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const state = stateRef.current;
    const mode = modeRef.current;
    const manager = layerManagerRef.current;

    if (e.key === 'Escape') {
      if (state.isDrawing) {
        state.currentVertices = [];
        state.startPoint = null;
        state.mousePoint = null;
        state.isDrawing = false;
        manager?.clearDrawingFeedback();
      }
      if (selectedIdRef.current) {
        updateSelectedId(null);
        manager?.showAllFeatures();
        manager?.clearSelectionHighlight();
        manager?.clearVertexHandles();
      }
      manager?.hideTooltip();
      return;
    }

    // Delete / Backspace：删除选中要素（编辑模式）
    if ((e.key === 'Delete' || e.key === 'Backspace') && mode === 'edit' && selectedIdRef.current) {
      e.preventDefault();
      const id = selectedIdRef.current;
      const feature = featuresRef.current.find((f) => f.id === id);
      if (feature) {
        const newFeatures = featuresRef.current.filter((f) => f.id !== id);
        updateFeatures(newFeatures);
        callbacksRef.current.onDrawDelete?.(feature);
        updateSelectedId(null);
        manager?.showAllFeatures();
        manager?.clearSelectionHighlight();
        manager?.clearVertexHandles();
      }
      return;
    }
  }, [updateFeatures, updateSelectedId]);

  // ---- 绑定/解绑地图事件 ----
  useEffect(() => {
    if (!scene || !mapsService) return;

    const onClick = (e: Record<string, unknown>) => handleMapClick(e);
    const onDblClick = (e: Record<string, unknown>) => handleMapDblClick(e);
    const onMouseMove = (e: Record<string, unknown>) => handleMapMouseMove(e);

    const container = mapsService.getContainer?.() as HTMLElement | undefined;

    mapsService.on('click', onClick);
    mapsService.on('dblclick', onDblClick);
    mapsService.on('mousemove', onMouseMove);

    if (container) {
      container.addEventListener('mousedown', handleMapMouseDown);
    }
    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    // 右键菜单（用于编辑模式删除顶点）
    const handleContextMenu = (e: MouseEvent) => {
      if (modeRef.current !== 'edit') return;
      // 阻止默认右键菜单
      e.preventDefault();
    };
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      mapsService.off('click', onClick);
      mapsService.off('dblclick', onDblClick);
      mapsService.off('mousemove', onMouseMove);
      if (container) {
        container.removeEventListener('mousedown', handleMapMouseDown);
        container.removeEventListener('contextmenu', handleContextMenu);
      }
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('keydown', handleKeyDown);

      try {
        mapsService.setMapStatus({ dragEnable: true, zoomEnable: true, doubleClickZoom: true });
      } catch {
        // 忽略
      }
      if (container) {
        container.classList.remove('l7-draw-cursor-crosshair');
      }
    };
  }, [scene, mapsService, handleMapClick, handleMapDblClick, handleMapMouseMove, handleMapMouseDown, handleDocumentMouseUp, handleKeyDown]);

  // ---- 受控模式同步 ----
  useEffect(() => {
    if (isControlled && controlledFeatures) {
      featuresRef.current = [...controlledFeatures];
      stateRef.current.features = [...controlledFeatures];
      layerManagerRef.current?.updateFeatures(controlledFeatures);
    }
  }, [isControlled, controlledFeatures]);

  // ---- 命令式 API ----

  const addFeatures = useCallback((newFeatures: DrawFeature[]) => {
    if (isControlled) return;
    const allFeatures = [...featuresRef.current, ...newFeatures];
    updateFeatures(allFeatures);
    callbacksRef.current.onDrawCreate?.(newFeatures);
  }, [isControlled, updateFeatures]);

  const deleteFeature = useCallback((id: string) => {
    if (isControlled) return;
    const feature = featuresRef.current.find((f) => f.id === id);
    if (!feature) return;
    const newFeatures = featuresRef.current.filter((f) => f.id !== id);
    updateFeatures(newFeatures);
    callbacksRef.current.onDrawDelete?.(feature);
    if (selectedIdRef.current === id) {
      updateSelectedId(null);
      layerManagerRef.current?.showAllFeatures();
      layerManagerRef.current?.clearSelectionHighlight();
      layerManagerRef.current?.clearVertexHandles();
    }
  }, [isControlled, updateFeatures, updateSelectedId]);

  const deleteSelectedFeature = useCallback(() => {
    if (selectedIdRef.current) {
      deleteFeature(selectedIdRef.current);
    }
  }, [deleteFeature]);

  const clearAll = useCallback(() => {
    if (isControlled) return;
    updateFeatures([]);
    updateSelectedId(null);
    layerManagerRef.current?.showAllFeatures();
    layerManagerRef.current?.clearSelectionHighlight();
    layerManagerRef.current?.clearVertexHandles();
  }, [isControlled, updateFeatures, updateSelectedId]);

  const getFeatures = useCallback(() => {
    return [...featuresRef.current];
  }, []);

  const selectFeature = useCallback((id: string | null) => {
    if (modeRef.current !== 'edit') return;
    if (id) {
      const feature = featuresRef.current.find((f) => f.id === id) ?? null;
      updateSelectedId(id);
      if (feature) {
        layerManagerRef.current?.hideFeatureFromStatic(id);
        layerManagerRef.current?.updateSelectionHighlight(feature);
        layerManagerRef.current?.updateVertexHandles(feature);
      }
    } else {
      updateSelectedId(null);
      layerManagerRef.current?.showAllFeatures();
      layerManagerRef.current?.clearSelectionHighlight();
      layerManagerRef.current?.clearVertexHandles();
    }
  }, [updateSelectedId]);

  return {
    mode: modeRef.current,
    features: featuresRef.current,
    selectedFeatureId: selectedIdRef.current,
    setMode,
    addFeatures,
    deleteFeature,
    deleteSelectedFeature,
    clearAll,
    getFeatures,
    selectFeature,
    layerManager: layerManagerRef.current,
  };
}