/**
 * DrawLayerManager — 管理 L7 图层实例，渲染 DrawControl 的绘制要素
 *
 * 所有图层统一使用 destroy+rebuild 策略：
 * 每次数据变化时销毁旧图层、用新数据创建新图层并 addLayer，
 * 通过 layer.once('inited', () => scene.render()) 确保渲染。
 */
import * as L7 from '@antv/l7';
import type { Scene } from '@antv/l7';
import type { DrawFeature, DrawMode, DrawStyleConfig } from './draw-types';
import { DEFAULT_DRAW_STYLES } from './draw-styles';
import {
  getVertices,
  circleToPolygon,
  rectangleToPolygon,
  verticesToPolygon,
  verticesToLineString,
  featuresToLineGeoJSON,
  featuresToPolygonGeoJSON,
} from './draw-geometry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type L7Layer = any;

const EMPTY_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

const PREFIX = 'aimap-draw-';

export class DrawLayerManager {
  private scene: Scene;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapsService: any;
  private styles: { [K in keyof DrawStyleConfig]-?: NonNullable<DrawStyleConfig[K]> };

  // 完成态要素图层
  private featurePointLayer: L7Layer | null = null;
  private featureLineLayer: L7Layer | null = null;
  private featurePolygonLayer: L7Layer | null = null;
  private featurePolygonOutlineLayer: L7Layer | null = null;

  // 绘制态临时图层
  private drawingLineLayer: L7Layer | null = null;
  private drawingDashLineLayer: L7Layer | null = null;
  private drawingPolygonLayer: L7Layer | null = null;
  private drawingPointLayer: L7Layer | null = null;

  // 编辑态图层
  private selectionPolygonLayer: L7Layer | null = null;
  private selectionLineLayer: L7Layer | null = null;
  private selectionPointLayer: L7Layer | null = null;
  private vertexLayer: L7Layer | null = null;
  private midpointLayer: L7Layer | null = null;

  // 鼠标跟随提示 DOM
  private tooltipEl: HTMLDivElement | null = null;
  private containerEl: HTMLElement | null = null;

  // 当前编辑中隐藏的要素 ID
  private hiddenFeatureId: string | null = null;
  private allFeatures: DrawFeature[] = [];

  // 事件回调
  private onFeatureClick: ((featureId: string) => void) | null = null;
  private onVertexClick: ((vertexIndex: number) => void) | null = null;
  private onVertexRightClick: ((vertexIndex: number) => void) | null = null;
  private onEmptyClick: (() => void) | null = null;
  private onMidpointClick: ((edgeIndex: number, coord: [number, number]) => void) | null = null;
  private editClickHandlersBound = false;

  constructor(scene: Scene, styles?: DrawStyleConfig, mapsService?: any) {
    this.scene = scene;
    this.mapsService = mapsService;
    this.styles = {
      point: { ...DEFAULT_DRAW_STYLES.point, ...styles?.point },
      line: { ...DEFAULT_DRAW_STYLES.line, ...styles?.line },
      polygon: { ...DEFAULT_DRAW_STYLES.polygon, ...styles?.polygon },
      drawing: { ...DEFAULT_DRAW_STYLES.drawing, ...styles?.drawing },
      selected: { ...DEFAULT_DRAW_STYLES.selected, ...styles?.selected },
      vertex: { ...DEFAULT_DRAW_STYLES.vertex, ...styles?.vertex },
    };
    try { this.initTooltip(); } catch { /* container may not be ready */ }
  }

  // ============================================================
  // 通用工具
  // ============================================================

  /** 从 scene 移除并销毁图层 */
  private removeAndDestroy(layer: L7Layer | null): void {
    if (!layer) return;
    try { this.scene.removeLayer(layer); } catch { /* already removed */ }
    try { layer.destroy?.(); } catch { /* */ }
  }

  /** 创建图层并添加到 scene，绑定 inited 回调触发重绘 */
  private addLayerWithRender(layer: L7Layer): void {
    layer.once('inited', () => { try { this.scene.render(); } catch { /* */ } });
    this.scene.addLayer(layer);
  }

  // ============================================================
  // 鼠标跟随提示
  // ============================================================

  private initTooltip(): void {
    // 注意：不能修改 L7 容器的 style.position 或往容器内直接插入 DOM，
    // 否则会破坏 L7 的 canvas 定位和渲染管线。
    // 因此 tooltip 使用固定定位（fixed），直接挂到 document.body 上。
    const el = document.createElement('div');
    el.style.cssText = [
      'position:fixed', 'pointer-events:none', 'z-index:9999',
      'padding:4px 8px', 'border-radius:3px', 'background:rgba(0,0,0,0.75)',
      'color:#fff', 'font:11px Inter,JetBrains Mono,monospace',
      'white-space:nowrap', 'display:none',
    ].join(';');
    document.body.appendChild(el);
    this.tooltipEl = el;
    this.containerEl = null;
  }

  showTooltip(text: string, clientX: number, clientY: number): void {
    if (!this.tooltipEl) return;
    this.tooltipEl.textContent = text;
    this.tooltipEl.style.display = 'block';
    this.tooltipEl.style.left = `${clientX + 14}px`;
    this.tooltipEl.style.top = `${clientY - 10}px`;
  }

  hideTooltip(): void {
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
  }

  private destroyTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.parentElement?.removeChild(this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  // ============================================================
  // 完成态要素更新（destroy+rebuild）
  // ============================================================

  updateFeatures(features: DrawFeature[]): void {
    if (!this.scene) return;
    this.allFeatures = features;
    this.renderFeatures();
  }

  hideFeatureFromStatic(featureId: string): void {
    this.hiddenFeatureId = featureId;
    this.renderFeatures();
  }

  showAllFeatures(): void {
    this.hiddenFeatureId = null;
    this.renderFeatures();
  }

  private renderFeatures(): void {
    const features = this.hiddenFeatureId
      ? this.allFeatures.filter((f) => f.id !== this.hiddenFeatureId)
      : this.allFeatures;
    const s = this.styles;

    // --- 点图层 ---
    this.removeAndDestroy(this.featurePointLayer);
    const pointData = features
      .filter((f) => f.geometry.type === 'Point')
      .map((f) => {
        const coords = (f.geometry as GeoJSON.Point).coordinates;
        return { lng: coords[0], lat: coords[1], id: f.id, drawType: f.properties.drawType };
      });
    this.featurePointLayer = new L7.PointLayer({ name: `${PREFIX}feature-point`, zIndex: 12 })
      .source(pointData, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle')
      .color(s.point.color!)
      .size(s.point.size!)
      .style({ stroke: s.point.strokeColor!, strokeWidth: s.point.strokeWidth! });
    this.addLayerWithRender(this.featurePointLayer);

    // --- 线图层 ---
    this.removeAndDestroy(this.featureLineLayer);
    this.featureLineLayer = new L7.LineLayer({ name: `${PREFIX}feature-line`, zIndex: 11 })
      .source(featuresToLineGeoJSON(features))
      .shape('line')
      .color(s.line.color!)
      .size(s.line.size!)
      .style({ opacity: s.line.opacity! });
    this.addLayerWithRender(this.featureLineLayer);

    // --- 面图层 ---
    this.removeAndDestroy(this.featurePolygonLayer);
    this.featurePolygonLayer = new L7.PolygonLayer({ name: `${PREFIX}feature-polygon`, zIndex: 10 })
      .source(featuresToPolygonGeoJSON(features))
      .shape('fill')
      .color(s.polygon.fill!)
      .style({ opacity: s.polygon.fillOpacity! });
    this.addLayerWithRender(this.featurePolygonLayer);

    // --- 面描边图层 ---
    this.removeAndDestroy(this.featurePolygonOutlineLayer);
    const polygonFeatures = features.filter((f) => f.geometry.type === 'Polygon');
    const outlineData = polygonFeatures.length > 0
      ? {
          type: 'FeatureCollection' as const,
          features: polygonFeatures.map((f) => ({
            type: 'Feature' as const,
            geometry: { type: 'LineString' as const, coordinates: (f.geometry as GeoJSON.Polygon).coordinates[0] },
            properties: f.properties,
          })),
        }
      : EMPTY_GEOJSON;
    this.featurePolygonOutlineLayer = new L7.LineLayer({ name: `${PREFIX}feature-polygon-outline`, zIndex: 10 })
      .source(outlineData)
      .shape('line')
      .color(s.polygon.stroke!)
      .size(s.polygon.strokeWidth!)
      .style({ opacity: 1 });
    this.addLayerWithRender(this.featurePolygonOutlineLayer);

    // 重新绑定编辑点击事件（因为图层被重建了）
    if (this.editClickHandlersBound) {
      this.rebindEditClickHandlers();
    }
  }

  // ============================================================
  // 绘制态反馈（destroy+rebuild）
  // ============================================================

  showDrawingFeedback(
    currentVertices: [number, number][],
    mousePoint: [number, number] | null,
    mode: DrawMode,
    startPoint: [number, number] | null,
  ): void {
    if (!this.scene) return;

    // === 诊断：检查 Scene 渲染管线状态 ===
    if (currentVertices.length > 0 && !(this as any)._diagDone) {
      (this as any)._diagDone = true;
      const s = this.scene as any;
      const container = s.getContainer?.();
      const canvases = container?.querySelectorAll?.('canvas');
      console.log('[DIAG] scene.loaded:', s.loaded);
      console.log('[DIAG] scene.rendererService:', !!s.rendererService);
      console.log('[DIAG] scene.layerService:', !!s.layerService);
      console.log('[DIAG] container:', container?.tagName, container?.id, container?.className);
      console.log('[DIAG] container size:', container?.offsetWidth, 'x', container?.offsetHeight);
      console.log('[DIAG] canvas count:', canvases?.length);
      canvases?.forEach((c: HTMLCanvasElement, i: number) => {
        console.log(`[DIAG] canvas[${i}]:`, c.width, 'x', c.height, 'zIndex:', c.style.zIndex, 'display:', getComputedStyle(c).display, 'visibility:', getComputedStyle(c).visibility, 'opacity:', getComputedStyle(c).opacity);
      });
      console.log('[DIAG] scene.map:', !!s.map, 'map type:', s.map?.constructor?.name);
      console.log('[DIAG] layers:', s.getLayers?.()?.map((l: any) => `${l.name}(${l.type})`).join(', '));
      console.log('[DIAG] layerService:', !!s.layerService, 'layerService.layers:', s.layerService?.layers?.length);
      console.log('[DIAG] rendererService:', !!s.rendererService, 'renderer type:', s.rendererService?.constructor?.name);
      // 尝试直接通过 layerService 添加
      // 用 SchemaLayer 完全相同的方式创建测试图层
      const testLayer3 = new L7.PointLayer({ name: 'draw-test-schema-style', zIndex: 99 });
      testLayer3.source([{ lng: currentVertices[0][0], lat: currentVertices[0][1] }], { parser: { type: 'json', x: 'lng', y: 'lat' } });
      testLayer3.shape('circle');
      testLayer3.color('#00ff00');
      testLayer3.size(30);
      s.addLayer(testLayer3);
      testLayer3.on('inited', () => {
        console.log('[DIAG] schema-style test layer inited!');
        try { s.render(); } catch { /* */ }
      });
      console.log('[DIAG] schema-style test layer added, getLayers:', s.getLayers?.()?.length);
    }

    // 销毁旧 drawing 图层

    if (mode === 'point') return;

    const s = this.styles;

    // 计算各图层数据
    let lineData: GeoJSON.FeatureCollection = EMPTY_GEOJSON;
    let dashData: GeoJSON.FeatureCollection = EMPTY_GEOJSON;
    let polyData: GeoJSON.FeatureCollection = EMPTY_GEOJSON;
    let pointData: Array<{ lng: number; lat: number; vertexIndex: number; isFirst?: boolean }> = [];

    if (mode === 'rectangle' && startPoint && mousePoint) {
      const rectPoly = rectangleToPolygon(startPoint, mousePoint);
      polyData = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: rectPoly, properties: {} }] };
      lineData = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: rectPoly.coordinates[0] }, properties: {} }] };
    } else if (mode === 'circle' && startPoint && mousePoint) {
      const R = 6371000;
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const dLat = toRad(mousePoint[1] - startPoint[1]);
      const dLng = toRad(mousePoint[0] - startPoint[0]);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(startPoint[1])) * Math.cos(toRad(mousePoint[1])) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const radiusMeters = R * c;
      const circlePoly = circleToPolygon(startPoint, Math.max(radiusMeters, 1));
      polyData = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: circlePoly, properties: {} }] };
      lineData = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: circlePoly.coordinates[0] }, properties: {} }] };
      pointData = [{ lng: startPoint[0], lat: startPoint[1], vertexIndex: 0 }];
    } else if ((mode === 'polyline' || mode === 'polygon') && currentVertices.length > 0) {
      if (currentVertices.length >= 2) {
        lineData = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: verticesToLineString(currentVertices), properties: {} }] };
      }
      if (mousePoint && currentVertices.length >= 1) {
        const last = currentVertices[currentVertices.length - 1];
        const dashFeats: GeoJSON.Feature[] = [
          { type: 'Feature', geometry: { type: 'LineString', coordinates: [[last[0], last[1]], [mousePoint[0], mousePoint[1]]] }, properties: {} },
        ];
        if (mode === 'polygon' && currentVertices.length >= 2) {
          dashFeats.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[mousePoint[0], mousePoint[1]], [currentVertices[0][0], currentVertices[0][1]]] }, properties: {} });
        }
        dashData = { type: 'FeatureCollection', features: dashFeats };
      }
      if (mode === 'polygon' && currentVertices.length >= 2 && mousePoint) {
        const allVerts = [...currentVertices, mousePoint] as [number, number][];
        if (allVerts.length >= 3) {
          polyData = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: verticesToPolygon(allVerts), properties: {} }] };
        }
      }
      pointData = currentVertices.map(([lng, lat], i) => ({ lng, lat, vertexIndex: i, isFirst: i === 0 }));
    }

    // 重建线图层
    this.drawingLineLayer = new L7.LineLayer({ name: `${PREFIX}drawing-line`, zIndex: 13 })
      .source(lineData).shape('line').color(s.drawing.stroke!).size(s.drawing.strokeWidth!).style({ opacity: 1 });
    this.addLayerWithRender(this.drawingLineLayer);

    // 重建虚线图层
    const dashArray = s.drawing.dashArray ?? [4, 4];
    const dashStroke = s.drawing.dashStroke ?? s.drawing.stroke!;
    const dashWidth = s.drawing.dashWidth ?? 1.5;
    this.drawingDashLineLayer = new L7.LineLayer({ name: `${PREFIX}drawing-dash-line`, zIndex: 14 })
      .source(dashData).shape('line').color(dashStroke).size(dashWidth)
      .style({ opacity: 1, lineType: 'dash', dashArray });
    this.addLayerWithRender(this.drawingDashLineLayer);

    // 重建面图层
    this.drawingPolygonLayer = new L7.PolygonLayer({ name: `${PREFIX}drawing-polygon`, zIndex: 13 })
      .source(polyData).shape('fill').color(s.drawing.fill!).style({ opacity: s.drawing.fillOpacity! });
    this.addLayerWithRender(this.drawingPolygonLayer);

    // 重建点图层
    this.drawingPointLayer = new L7.PointLayer({ name: `${PREFIX}drawing-point`, zIndex: 15 })
      .source(pointData, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle').color(s.vertex.color!).size(s.vertex.size!)
      .style({ stroke: s.vertex.strokeColor!, strokeWidth: s.vertex.strokeWidth! });
    this.addLayerWithRender(this.drawingPointLayer);
  }

  clearDrawingFeedback(): void {
    this.removeAndDestroy(this.drawingLineLayer);
    this.removeAndDestroy(this.drawingDashLineLayer);
    this.removeAndDestroy(this.drawingPolygonLayer);
    this.removeAndDestroy(this.drawingPointLayer);
    this.drawingLineLayer = null;
    this.drawingDashLineLayer = null;
    this.drawingPolygonLayer = null;
    this.drawingPointLayer = null;
  }

  removeDrawingLayers(): void {
    this.clearDrawingFeedback();
  }

  // ============================================================
  // 编辑态：选中高亮（destroy+rebuild）
  // ============================================================

  updateSelectionHighlight(feature: DrawFeature | null): void {
    if (!this.scene) return;
    const s = this.styles;

    // 销毁旧选中图层
    this.removeAndDestroy(this.selectionPolygonLayer);
    this.removeAndDestroy(this.selectionLineLayer);
    this.removeAndDestroy(this.selectionPointLayer);

    if (!feature) {
      this.selectionPolygonLayer = null;
      this.selectionLineLayer = null;
      this.selectionPointLayer = null;
      return;
    }

    const fc: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [feature as GeoJSON.Feature] };
    const selDash = s.selected.dashArray ?? [6, 3];

    if (feature.geometry.type === 'Point') {
      this.selectionPointLayer = new L7.PointLayer({ name: `${PREFIX}selection-point`, zIndex: 15 })
        .source([{ lng: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1], id: feature.id }], { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('circle').color(s.selected.stroke!).size((s.point.size ?? 6) + 4)
        .style({ stroke: s.selected.stroke!, strokeWidth: s.selected.strokeWidth! });
      this.addLayerWithRender(this.selectionPointLayer);
    } else if (feature.geometry.type === 'LineString') {
      this.selectionLineLayer = new L7.LineLayer({ name: `${PREFIX}selection-line`, zIndex: 15 })
        .source(fc).shape('line').color(s.selected.stroke!).size(s.selected.strokeWidth!)
        .style({ opacity: 1, lineType: 'dash', dashArray: selDash });
      this.addLayerWithRender(this.selectionLineLayer);
    } else if (feature.geometry.type === 'Polygon') {
      this.selectionPolygonLayer = new L7.PolygonLayer({ name: `${PREFIX}selection-polygon`, zIndex: 15 })
        .source(fc).shape('fill').color(s.selected.fill!).style({ opacity: s.selected.fillOpacity! });
      this.addLayerWithRender(this.selectionPolygonLayer);

      const outlineFC: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: (feature.geometry as GeoJSON.Polygon).coordinates[0] }, properties: {} }],
      };
      this.selectionLineLayer = new L7.LineLayer({ name: `${PREFIX}selection-line`, zIndex: 15 })
        .source(outlineFC).shape('line').color(s.selected.stroke!).size(s.selected.strokeWidth!)
        .style({ opacity: 1, lineType: 'dash', dashArray: selDash });
      this.addLayerWithRender(this.selectionLineLayer);
    }
  }

  clearSelectionHighlight(): void {
    this.removeAndDestroy(this.selectionPolygonLayer);
    this.removeAndDestroy(this.selectionLineLayer);
    this.removeAndDestroy(this.selectionPointLayer);
    this.selectionPolygonLayer = null;
    this.selectionLineLayer = null;
    this.selectionPointLayer = null;
  }

  removeSelectionLayers(): void {
    this.clearSelectionHighlight();
  }

  // ============================================================
  // 编辑态：顶点句柄 + 中点句柄（destroy+rebuild）
  // ============================================================

  updateVertexHandles(feature: DrawFeature | null): void {
    if (!this.scene) return;
    const s = this.styles;

    this.removeAndDestroy(this.vertexLayer);
    this.removeAndDestroy(this.midpointLayer);

    if (!feature) {
      this.vertexLayer = null;
      this.midpointLayer = null;
      return;
    }

    const vertices = getVertices(feature);
    if (vertices.length === 0) {
      this.vertexLayer = null;
      this.midpointLayer = null;
      return;
    }

    // 固定点句柄
    const vertexData = vertices.map(([lng, lat], index) => ({
      lng, lat, vertexIndex: index, featureId: feature.id,
    }));
    this.vertexLayer = new L7.PointLayer({ name: `${PREFIX}vertex-handles`, zIndex: 16 })
      .source(vertexData, { parser: { type: 'json', x: 'lng', y: 'lat' } })
      .shape('circle').color(s.vertex.color!).size(s.vertex.size!)
      .style({ stroke: s.vertex.strokeColor!, strokeWidth: s.vertex.strokeWidth! });
    this.addLayerWithRender(this.vertexLayer);

    // 中点句柄
    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'Polygon') {
      const midpointData: { lng: number; lat: number; edgeIndex: number }[] = [];
      const edgeCount = feature.geometry.type === 'Polygon' ? vertices.length : vertices.length - 1;
      for (let i = 0; i < edgeCount; i++) {
        const next = (i + 1) % vertices.length;
        midpointData.push({
          lng: (vertices[i][0] + vertices[next][0]) / 2,
          lat: (vertices[i][1] + vertices[next][1]) / 2,
          edgeIndex: i,
        });
      }
      this.midpointLayer = new L7.PointLayer({ name: `${PREFIX}midpoint-handles`, zIndex: 16 })
        .source(midpointData, { parser: { type: 'json', x: 'lng', y: 'lat' } })
        .shape('circle').color(s.vertex.strokeColor!).size(s.vertex.size! - 1)
        .style({ stroke: s.vertex.strokeColor!, strokeWidth: 0.5, opacity: 0.4 });
      this.addLayerWithRender(this.midpointLayer);
    } else {
      this.midpointLayer = null;
    }
  }

  clearVertexHandles(): void {
    this.removeAndDestroy(this.vertexLayer);
    this.removeAndDestroy(this.midpointLayer);
    this.vertexLayer = null;
    this.midpointLayer = null;
  }

  removeVertexLayer(): void {
    this.clearVertexHandles();
  }

  // ============================================================
  // 编辑模式点击事件
  // ============================================================

  setupEditClickHandlers(
    onFeatureClick: (featureId: string) => void,
    onVertexClick: (vertexIndex: number) => void,
    onEmptyClick: () => void,
    onVertexRightClick?: (vertexIndex: number) => void,
    onMidpointClick?: (edgeIndex: number, coord: [number, number]) => void,
  ): void {
    this.onFeatureClick = onFeatureClick;
    this.onVertexClick = onVertexClick;
    this.onEmptyClick = onEmptyClick;
    this.onVertexRightClick = onVertexRightClick ?? null;
    this.onMidpointClick = onMidpointClick ?? null;
    this.editClickHandlersBound = true;
    this.rebindEditClickHandlers();
  }

  /** 重新绑定编辑点击事件到当前图层实例 */
  private rebindEditClickHandlers(): void {
    const featureClickHandler = (e: Record<string, unknown>) => {
      const feature = e.feature as Record<string, unknown> | undefined;
      if (feature) {
        const id = (feature.properties as Record<string, unknown>)?.id ?? (feature as Record<string, unknown>).id;
        if (id && this.onFeatureClick) {
          this.onFeatureClick(String(id));
        }
      }
    };

    this.featurePointLayer?.on('click', featureClickHandler);
    this.featureLineLayer?.on('click', featureClickHandler);
    this.featurePolygonLayer?.on('click', featureClickHandler);
    this.featurePolygonOutlineLayer?.on('click', featureClickHandler);

    this.vertexLayer?.on('click', (e: Record<string, unknown>) => {
      const feature = e.feature as Record<string, unknown> | undefined;
      if (feature && this.onVertexClick) {
        const props = feature.properties as Record<string, unknown> | undefined;
        const vertexIndex = props?.vertexIndex as number | undefined;
        if (vertexIndex !== undefined) this.onVertexClick(vertexIndex);
      }
    });

    this.vertexLayer?.on('contextmenu', (e: Record<string, unknown>) => {
      const feature = e.feature as Record<string, unknown> | undefined;
      if (feature && this.onVertexRightClick) {
        const props = feature.properties as Record<string, unknown> | undefined;
        const vertexIndex = props?.vertexIndex as number | undefined;
        if (vertexIndex !== undefined) {
          (e.originalEvent as Event)?.preventDefault?.();
          this.onVertexRightClick(vertexIndex);
        }
      }
    });

    this.midpointLayer?.on('click', (e: Record<string, unknown>) => {
      const feature = e.feature as Record<string, unknown> | undefined;
      if (feature && this.onMidpointClick) {
        const props = feature.properties as Record<string, unknown> | undefined;
        const edgeIndex = props?.edgeIndex as number | undefined;
        const lng = props?.lng as number | undefined;
        const lat = props?.lat as number | undefined;
        if (edgeIndex !== undefined && lng !== undefined && lat !== undefined) {
          this.onMidpointClick(edgeIndex, [lng, lat]);
        }
      }
    });
  }

  removeEditClickHandlers(): void {
    this.onFeatureClick = null;
    this.onVertexClick = null;
    this.onVertexRightClick = null;
    this.onEmptyClick = null;
    this.onMidpointClick = null;
    this.editClickHandlersBound = false;
  }

  // ============================================================
  // 销毁
  // ============================================================

  destroy(): void {
    this.removeEditClickHandlers();
    this.destroyTooltip();

    const layersToRemove: L7Layer[] = [
      this.featurePointLayer, this.featureLineLayer,
      this.featurePolygonLayer, this.featurePolygonOutlineLayer,
      this.drawingLineLayer, this.drawingDashLineLayer,
      this.drawingPolygonLayer, this.drawingPointLayer,
      this.selectionPolygonLayer, this.selectionLineLayer, this.selectionPointLayer,
      this.vertexLayer, this.midpointLayer,
    ];

    for (const layer of layersToRemove) {
      this.removeAndDestroy(layer);
    }

    this.featurePointLayer = null;
    this.featureLineLayer = null;
    this.featurePolygonLayer = null;
    this.featurePolygonOutlineLayer = null;
    this.drawingLineLayer = null;
    this.drawingDashLineLayer = null;
    this.drawingPolygonLayer = null;
    this.drawingPointLayer = null;
    this.selectionPolygonLayer = null;
    this.selectionLineLayer = null;
    this.selectionPointLayer = null;
    this.vertexLayer = null;
    this.midpointLayer = null;
  }
}
