/**
 * PlotLayerManager — L7 图层管理 + tooltip
 */
import * as L7 from '@antv/l7';
import type { Scene } from '@antv/l7';
import type { PlotFeature } from './plot-types';
import type { Point } from '../algorithms/bindtype';
import { bindtype } from '../algorithms/bindtype';
import { distance, angle } from '../algorithms/bindtype-curve';

type L7Layer = any;

export class PlotLayerManager {
  private scene: Scene;
  private fillLayer: L7Layer | null = null;
  private strokeLayer: L7Layer | null = null;
  private previewFillLayer: L7Layer | null = null;
  private previewStrokeLayer: L7Layer | null = null;
  private controlPointLayer: L7Layer | null = null;
  private tooltipEl: HTMLDivElement | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.initTooltip();
  }

  private removeAndDestroy(layer: L7Layer | null): void {
    if (!layer) return;
    try { this.scene.removeLayer(layer); } catch { /* */ }
    try { layer.destroy?.(); } catch { /* */ }
  }

  private addLayer(layer: L7Layer): void {
    layer.once('inited', () => { try { this.scene.render(); } catch { /* */ } });
    this.scene.addLayer(layer);
  }

  // ---- Tooltip ----

  private initTooltip(): void {
    const el = document.createElement('div');
    el.style.cssText = [
      'position:fixed', 'pointer-events:none', 'z-index:9999',
      'padding:6px 10px', 'border-radius:4px',
      'background:rgba(26,27,34,0.92)', 'color:#f2eff9',
      'font:500 11px/16px "JetBrains Mono",monospace',
      'letter-spacing:0.02em', 'white-space:nowrap',
      'display:none', 'flex-direction:column', 'gap:2px',
      'box-shadow:0 2px 8px rgba(0,0,0,0.3)',
    ].join(';');
    document.body.appendChild(el);
    this.tooltipEl = el;
  }

  showTooltip(primary: string, clientX: number, clientY: number, shortcuts?: string[]): void {
    if (!this.tooltipEl) return;
    this.tooltipEl.innerHTML = '';

    const mainLine = document.createElement('div');
    mainLine.textContent = primary;
    mainLine.style.cssText = 'color:#f2eff9;font-size:11px;line-height:16px;';
    this.tooltipEl.appendChild(mainLine);

    if (shortcuts && shortcuts.length > 0) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;';
      for (const sc of shortcuts) {
        const badge = document.createElement('span');
        badge.textContent = sc;
        badge.style.cssText = 'font-size:9px;line-height:12px;color:#ffc107;font-weight:600;';
        row.appendChild(badge);
      }
      this.tooltipEl.appendChild(row);
    }

    this.tooltipEl.style.display = 'flex';
    this.tooltipEl.style.left = `${clientX + 16}px`;
    this.tooltipEl.style.top = `${clientY - 8}px`;
  }

  hideTooltip(): void {
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
  }

  // ---- 已完成图形 ----

  updateFeatures(features: PlotFeature[], selectedId: string | null): void {
    const geoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: features.map((f) => ({
        type: 'Feature' as const,
        geometry: f.geometry,
        properties: {
          id: f.id,
          color: f.properties.color || '#3f51b5',
          fillOpacity: f.properties.fillOpacity ?? 0.3,
          strokeColor: f.properties.strokeColor || '#3f51b5',
          strokeWidth: f.properties.strokeWidth ?? 2,
          selected: f.id === selectedId ? 1 : 0,
        },
      })),
    };

    if (!this.fillLayer) {
      this.fillLayer = new L7.PolygonLayer({ name: 'plot-fill', zIndex: 5 })
        .source(geoJSON)
        .color('color', (v: string) => v)
        .style({ opacity: 0.3 })
        .shape('fill');
      this.addLayer(this.fillLayer);
    } else {
      this.fillLayer.setData(geoJSON);
    }

    if (!this.strokeLayer) {
      this.strokeLayer = new L7.LineLayer({ name: 'plot-stroke', zIndex: 6 })
        .source(geoJSON)
        .color('strokeColor', (v: string) => v)
        .size('strokeWidth', (v: number) => v)
        .shape('line')
        .style({ opacity: 1 });
      this.addLayer(this.strokeLayer);
    } else {
      this.strokeLayer.setData(geoJSON);
    }

    // 选中要素的控制点
    if (selectedId) {
      const sel = features.find((f) => f.id === selectedId);
      if (sel) { this.updateControlPoints(sel.properties.controlPoints, sel.properties.plotType); return; }
    }
    this.updateControlPoints([], undefined);
  }

  // ---- 绘制预览（rubber-band）----

  updatePreview(plotType: string, controlPoints: Point[], mousePoint: Point | null): void {
    // 将已放置的控制点 + 当前鼠标位置拼成预览控制点
    const previewPoints = mousePoint ? [...controlPoints, mousePoint] : controlPoints;

    if (previewPoints.length < 2 || !plotType) {
      this.clearPreview();
      return;
    }

    const result = bindtype(plotType as any, previewPoints);
    if (!result || result.type !== 'Polygon') {
      this.clearPreview();
      return;
    }

    const geoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: result.coordinates as number[][][] },
        properties: {},
      }],
    };

    // 半透明填充
    if (!this.previewFillLayer) {
      this.previewFillLayer = new L7.PolygonLayer({ name: 'plot-preview-fill', zIndex: 8 })
        .source(geoJSON)
        .color('#3f51b5')
        .style({ opacity: 0.12 })
        .shape('fill');
      this.addLayer(this.previewFillLayer);
    } else {
      this.previewFillLayer.setData(geoJSON);
    }

    // 虚线描边
    if (!this.previewStrokeLayer) {
      this.previewStrokeLayer = new L7.LineLayer({ name: 'plot-preview-stroke', zIndex: 9 })
        .source(geoJSON)
        .color('#3f51b5')
        .size(2)
        .shape('line')
        .style({ opacity: 0.6, lineType: 'dash', dashArray: [6, 4] });
      this.addLayer(this.previewStrokeLayer);
    } else {
      this.previewStrokeLayer.setData(geoJSON);
    }
  }

  private clearPreview(): void {
    if (this.previewFillLayer) {
      this.removeAndDestroy(this.previewFillLayer);
      this.previewFillLayer = null;
    }
    if (this.previewStrokeLayer) {
      this.removeAndDestroy(this.previewStrokeLayer);
      this.previewStrokeLayer = null;
    }
  }

  // ---- 控制点 ----

  private updateControlPoints(rawPoints: Point[], plotType?: string): void {
    if (rawPoints.length === 0) {
      if (this.controlPointLayer) {
        this.removeAndDestroy(this.controlPointLayer);
        this.controlPointLayer = null;
      }
      return;
    }

    // 扇形：将 p2 控制点投影到弧线上（与扇形算法同一坐标空间）
    let points = rawPoints;
    if (plotType === 'sector' && rawPoints.length === 3) {
      const [center, p1, p2] = rawPoints;
      const latRad = (center[1] * Math.PI) / 180;
      const cosLat = Math.cos(latRad);
      // 在 cosLat 修正空间计算
      const dx1 = (p1[0] - center[0]) * cosLat;
      const dy1 = p1[1] - center[1];
      const r = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const dx2 = (p2[0] - center[0]) * cosLat;
      const dy2 = p2[1] - center[1];
      const a2 = Math.atan2(dy2, dx2);
      const projP2: Point = [
        center[0] + (r * Math.cos(a2)) / cosLat,
        center[1] + r * Math.sin(a2),
      ];
      points = [center, p1, projP2];
    }

    const geoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: points.map((p, i) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: p },
        properties: { index: i },
      })),
    };

    if (!this.controlPointLayer) {
      this.controlPointLayer = new L7.PointLayer({ name: 'plot-control-points', zIndex: 10 })
        .source(geoJSON)
        .color('#ffffff')
        .size(8)
        .shape('circle')
        .style({ stroke: '#3f51b5', strokeWidth: 2.5, opacity: 1 });
      this.addLayer(this.controlPointLayer);
    } else {
      this.controlPointLayer.setData(geoJSON);
    }
  }

  // ---- 清理 ----

  destroy(): void {
    this.removeAndDestroy(this.fillLayer);
    this.removeAndDestroy(this.strokeLayer);
    this.removeAndDestroy(this.previewFillLayer);
    this.removeAndDestroy(this.previewStrokeLayer);
    this.removeAndDestroy(this.controlPointLayer);
    this.fillLayer = null;
    this.strokeLayer = null;
    this.previewFillLayer = null;
    this.previewStrokeLayer = null;
    this.controlPointLayer = null;
    if (this.tooltipEl) {
      this.tooltipEl.parentElement?.removeChild(this.tooltipEl);
      this.tooltipEl = null;
    }
  }
}
