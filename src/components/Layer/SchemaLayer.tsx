import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { adaptPointLayer } from './adapters/point';
import { adaptLineLayer } from './adapters/line';
import { adaptPolygonLayer } from './adapters/polygon';
import { adaptHeatmapLayer } from './adapters/heatmap';
import { adaptRasterLayer } from './adapters/raster';
import { adaptImageLayer } from './adapters/image';
import { useEventBus } from '../../context/EventBusContext';
import { Popup } from '../Interaction/Popup';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type L7Layer = any;

interface LayerAdapter {
  type: string;
  sourceConfig: { data: unknown; options?: Record<string, unknown> };
  visual: {
    color?: { field?: string; values?: string[] | string };
    size?: { field?: string; values?: number[] | number };
    shape?: { field?: string; values?: string[] | string };
    style?: Record<string, unknown>;
  };
  schema: LayerSchema;
}

/** 图层事件回调集合 */
export interface LayerEventHandlers {
  onClick?: (payload: LayerEventPayload) => void;
  onMouseMove?: (payload: LayerEventPayload) => void;
  onMouseEnter?: (payload: LayerEventPayload) => void;
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

/**
 * 将 LayerSchema 创建为 L7 Layer 实例
 */
export function createL7Layer(schema: LayerSchema, scene: Scene): L7Layer | null {
  let adapter: LayerAdapter;
  switch (schema.type) {
    case 'point':
      adapter = adaptPointLayer(schema) as LayerAdapter;
      break;
    case 'line':
      adapter = adaptLineLayer(schema) as LayerAdapter;
      break;
    case 'polygon':
      adapter = adaptPolygonLayer(schema) as LayerAdapter;
      break;
    case 'heatmap':
      adapter = adaptHeatmapLayer(schema) as LayerAdapter;
      break;
    case 'raster':
      adapter = adaptRasterLayer(schema) as LayerAdapter;
      break;
    case 'image':
      adapter = adaptImageLayer(schema) as LayerAdapter;
      break;
    default:
      console.warn(`[AimapKit] Unknown layer type: ${schema.type}`);
      return null;
  }

  return buildLayer(adapter, scene);
}

async function buildLayer(adapter: LayerAdapter, _scene: Scene): Promise<L7Layer> {
  const l7 = await import('@antv/l7');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LayerClass = (l7 as Record<string, any>)[adapter.type] as new (...args: any[]) => any;

  if (!LayerClass) {
    throw new Error(`[AimapKit] L7 layer class "${adapter.type}" not found`);
  }

  const layer = new LayerClass({
    ...(adapter.schema.zIndex !== undefined ? { zIndex: adapter.schema.zIndex } : {}),
    // 传入 name 用于调试和事件标识
    ...(adapter.schema.name ? { name: adapter.schema.name } : {}),
  });

  // ========== 数据源 ==========
  const { data, options } = adapter.sourceConfig;
  if (options) {
    layer.source(data, options);
  } else {
    layer.source(data);
  }

  // ========== 视觉映射（使用 L7 链式 API） ==========
  const { color: colorConfig, size: sizeConfig, shape: shapeConfig, style: styleConfig } = adapter.visual;

  if (colorConfig) {
    if (colorConfig.field && colorConfig.values) {
      layer.color(colorConfig.field, colorConfig.values);
    } else if (colorConfig.values) {
      layer.color(colorConfig.values);
    }
  }

  if (sizeConfig) {
    if (sizeConfig.field && sizeConfig.values) {
      layer.size(sizeConfig.field, sizeConfig.values);
    } else if (sizeConfig.values !== undefined) {
      layer.size(sizeConfig.values);
    }
  }

  if (shapeConfig) {
    if (shapeConfig.field && shapeConfig.values) {
      layer.shape(shapeConfig.field, shapeConfig.values);
    } else if (shapeConfig.values) {
      layer.shape(shapeConfig.values);
    }
  }

  if (styleConfig && Object.keys(styleConfig).length > 0) {
    layer.style(styleConfig);
  }

  // ========== 默认 shape ==========
  if (adapter.type === 'PointLayer' && !shapeConfig) {
    layer.shape('circle');
  }
  if (adapter.type === 'LineLayer' && !shapeConfig) {
    layer.shape('line');
  }

  // ========== 过滤 ==========
  if (adapter.schema.filterField && adapter.schema.filterValues) {
    const field = adapter.schema.filterField;
    const values = adapter.schema.filterValues;
    layer.filter(field, (v: unknown) => values.includes(v));
  }

  // ========== 动画 ==========
  if (adapter.schema.animate?.enable) {
    layer.animate(true, adapter.schema.animate);
  }

  // ========== 高亮 ==========
  if (adapter.schema.active) {
    layer.active(adapter.schema.active);
  }

  // ========== 选中 ==========
  if (adapter.schema.select) {
    layer.select(adapter.schema.select);
  }

  // ========== 可见性 ==========
  if (adapter.schema.visible === false) {
    layer.hide();
  }

  // ========== minZoom / maxZoom ==========
  if (adapter.schema.minZoom !== undefined) {
    layer.minZoom(adapter.schema.minZoom);
  }
  if (adapter.schema.maxZoom !== undefined) {
    layer.maxZoom(adapter.schema.maxZoom);
  }

  return layer;
}

/**
 * 从 L7 图层事件对象中提取 payload
 */
function extractLayerPayload(
  layerId: string,
  layerType: string,
  evt: unknown,
): LayerEventPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = evt as any;
  const lng = Number.isFinite(e?.lnglat?.lng) ? e.lnglat.lng
            : Number.isFinite(e?.lngLat?.lng) ? e.lngLat.lng
            : Number.isFinite(e?.coordinate?.lng) ? e.coordinate.lng
            : 0;
  const lat = Number.isFinite(e?.lnglat?.lat) ? e.lnglat.lat
            : Number.isFinite(e?.lngLat?.lat) ? e.lngLat.lat
            : Number.isFinite(e?.coordinate?.lat) ? e.coordinate.lat
            : 0;
  const feature = e?.feature?.properties ?? e?.data?.properties ?? undefined;

  return {
    layerId,
    layerType: layerType as LayerSchema['type'],
    originalEvent: evt,
    lng,
    lat,
    feature,
  };
}

/**
 * 单个 SchemaLayer 渲染组件
 */
export interface SchemaLayerProps {
  schema: LayerSchema;
  scene: Scene;
  eventHandlers?: LayerEventHandlers;
}

export function SchemaLayer({ schema, scene, eventHandlers }: SchemaLayerProps) {
  const layerRef = useRef<L7Layer | null>(null);
  const eventBus = useEventBus();
  const eventHandlersRef = useRef(eventHandlers);
  eventHandlersRef.current = eventHandlers;
  const schemaSignature = useMemo(() => stableStringify(schema), [schema]);

  // Popup 状态管理（使用 React 状态）
  const [popupState, setPopupState] = useState<{
    visible: boolean;
    lng: number;
    lat: number;
    content: string;
  }>({
    visible: false,
    lng: 0,
    lat: 0,
    content: '',
  });

  useEffect(() => {
    let destroyed = false;

    createL7Layer(schema, scene)?.then((layer: L7Layer) => {
      if (destroyed) return;
      layerRef.current = layer;

      const layerId = schema.id ?? schema.name ?? `layer-${schema.type}`;
      const layerEvents = schema.events;

      // ========== 绑定图层事件 ==========
      const popupEnabled = Boolean(layerEvents?.enablePopup);
      const popupTrigger = layerEvents?.popupTrigger ?? 'click';

      // 使用统一的 Popup 组件，简化逻辑
      const showPopup = (payload: LayerEventPayload) => {
        if (!popupEnabled) return;
        const feature = payload.feature;
        if (!feature) return;

        const content = formatPopupContent(feature, layerEvents?.popupFields, layerEvents?.popupTemplate);
        setPopupState({
          visible: true,
          lng: payload.lng,
          lat: payload.lat,
          content,
        });
      };

      const hidePopup = () => {
        setPopupState((prev) => ({ ...prev, visible: false }));
      };

      const needsClick = Boolean(eventHandlersRef.current?.onClick || layerEvents?.click || (popupEnabled && popupTrigger === 'click'));
      const needsMouseMove = Boolean(eventHandlersRef.current?.onMouseMove || layerEvents?.mousemove || (popupEnabled && popupTrigger === 'hover'));
      const needsMouseEnter = Boolean(eventHandlersRef.current?.onMouseEnter || layerEvents?.mouseenter);
      const needsMouseLeave = Boolean(eventHandlersRef.current?.onMouseLeave || layerEvents?.mouseleave || (popupEnabled && popupTrigger === 'hover'));

      // L7 click 事件
      if (needsClick) {
        layer.on('click', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);

          // 1. 直接回调
          eventHandlersRef.current?.onClick?.(payload);

          // 2. EventBus 广播（Schema 事件标识符）
          if (layerEvents?.click) {
            eventBus.emit(layerEvents.click, payload);
          }

          // 3. 内置 Popup（click）
          if (popupTrigger === 'click') {
            showPopup(payload);
          }
        });
      }

      // L7 mousemove 事件
      if (needsMouseMove) {
        layer.on('mousemove', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);
          eventHandlersRef.current?.onMouseMove?.(payload);
          if (popupTrigger === 'hover') {
            showPopup(payload);
          }
          if (layerEvents?.mousemove) {
            eventBus.emit(layerEvents.mousemove, payload);
          }
        });
      }

      // L7 mouseenter 事件
      if (needsMouseEnter) {
        layer.on('mouseenter', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);
          eventHandlersRef.current?.onMouseEnter?.(payload);
          if (layerEvents?.mouseenter) {
            eventBus.emit(layerEvents.mouseenter, payload);
          }
        });
      }

      // L7 mouseleave 事件
      if (needsMouseLeave) {
        layer.on('mouseleave', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);
          eventHandlersRef.current?.onMouseLeave?.(payload);
          if (popupTrigger === 'hover') {
            hidePopup();
          }
          if (layerEvents?.mouseleave) {
            eventBus.emit(layerEvents.mouseleave, payload);
          }
        });
      }

      // 添加到场景
      scene.addLayer(layer);

      // autoFit
      if (schema.autoFit) {
        layer.on('inited', () => {
          scene.fitBounds(layer.getBounds());
        });
      }
    });

    return () => {
      destroyed = true;
      if (layerRef.current) {
        try {
          scene.removeLayer(layerRef.current);
        } catch {
          // layer 可能已被销毁
        }
        layerRef.current = null;
      }

      // 组件卸载时清理 Popup 状态（确保 popup 消失）
      setPopupState((prev) => ({ ...prev, visible: false }));
    };
  }, [schemaSignature, scene, eventBus]);

  // 同步属性变更
  useEffect(() => {
    if (!layerRef.current) return;

    if (schema.visible === false) {
      layerRef.current.hide();
    } else {
      layerRef.current.show();
    }

    if (schema.zIndex !== undefined) {
      layerRef.current.zIndex(schema.zIndex);
    }
  }, [schema.visible, schema.zIndex]);

  // 渲染统一的 Popup 组件
  // 注意：hover trigger 下，由于 Popup 设置了 pointerEvents: 'auto'，鼠标移到 Popup 上会触发图层的 mouseleave
  // 这是预期的交互行为，与大多数地图库一致（如 Mapbox GL JS、Leaflet 等）
  return popupState.visible ? (
    <Popup
      longitude={popupState.lng}
      latitude={popupState.lat}
      content={popupState.content}
      closeButton={true}
      size="compact"
      onClose={() => setPopupState((prev) => ({ ...prev, visible: false }))}
    />
  ) : null;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const next: Record<string, unknown> = {};
    sortedKeys.forEach((key) => {
      next[key] = sortValue(obj[key]);
    });
    return next;
  }

  return value;
}

/**
 * 格式化 Popup 内容
 */
function formatPopupContent(
  feature: Record<string, unknown>,
  fields?: string[],
  template?: string,
): string {
  if (template) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      String(feature[key] ?? ''),
    );
  }

  const displayFields = fields ?? Object.keys(feature).filter(
    (k) => !['_id', 'id', 'geometry', 'coordinates'].includes(k),
  );

  const rows = displayFields
    .map((key) => `<tr><td style="font-weight:600;padding-right:8px">${key}</td><td>${feature[key] ?? ''}</td></tr>`)
    .join('');

  return `<table style="font-size:12px">${rows}</table>`;
}
