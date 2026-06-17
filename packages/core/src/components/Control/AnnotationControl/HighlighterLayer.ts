/**
 * HighlighterLayer — Highlighter 专用 L7 LineLayer 管理
 *
 * 管理高亮笔画的 L7 LineLayer 渲染，支持完成笔画和实时绘制中笔画。
 */
import * as L7 from '@antv/l7';
import type { Scene } from '@antv/l7';
import type { AnnotationFeature } from './annotation-types';

type L7Layer = any;

const PREFIX = 'aimapui-annotation-highlighter-';

export class HighlighterLayer {
  private scene: Scene;
  private completedLayer: L7Layer | null = null;
  private drawingLayer: L7Layer | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  private removeAndDestroy(layer: L7Layer | null): void {
    if (!layer) return;
    try { this.scene.removeLayer(layer); } catch { /* already removed */ }
    try { layer.destroy?.(); } catch { /* */ }
  }

  private addLayerWithRender(layer: L7Layer): void {
    layer.once('inited', () => { try { this.scene.render(); } catch { /* */ } });
    this.scene.addLayer(layer);
  }

  updateCompleted(features: AnnotationFeature[]): void {
    const highlighters = features.filter((f) => f.properties.annotationType === 'highlighter');

    const geoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: highlighters.map((f) => ({
        type: 'Feature' as const,
        geometry: f.geometry,
        properties: {
          id: f.id,
          color: f.properties.color || '#ffeb3b',
          width: (f.properties as any).strokeWidth || 8,
          opacity: (f.properties as any).strokeOpacity || 0.5,
        },
      })),
    };

    if (!this.completedLayer) {
      this.completedLayer = new L7.LineLayer({ name: `${PREFIX}completed`, zIndex: 8 })
        .source(geoJSON)
        .color('color', (v: string) => v)
        .size('width', (v: number) => v)
        .style({ opacity: 0.5, lineType: 'solid', lineCap: 'round', lineJoin: 'round' })
        .shape('line');
      this.addLayerWithRender(this.completedLayer);
    } else {
      this.completedLayer.setData(geoJSON);
    }
  }

  updateDrawing(vertices: [number, number][]): void {
    if (vertices.length < 2) {
      if (this.drawingLayer) {
        this.removeAndDestroy(this.drawingLayer);
        this.drawingLayer = null;
      }
      return;
    }

    const geoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: vertices },
        properties: { color: '#ffeb3b', width: 8, opacity: 0.5 },
      }],
    };

    if (!this.drawingLayer) {
      this.drawingLayer = new L7.LineLayer({ name: `${PREFIX}drawing`, zIndex: 9 })
        .source(geoJSON)
        .color('#ffeb3b')
        .size(8)
        .style({ opacity: 0.5, lineType: 'solid', lineCap: 'round', lineJoin: 'round' })
        .shape('line');
      this.addLayerWithRender(this.drawingLayer);
    } else {
      this.drawingLayer.setData(geoJSON);
    }
  }

  destroy(): void {
    this.removeAndDestroy(this.completedLayer);
    this.removeAndDestroy(this.drawingLayer);
    this.completedLayer = null;
    this.drawingLayer = null;
  }
}
