import { useEffect, useMemo, useRef, useState } from 'react';
import * as L7 from '@antv/l7';
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
import { Tooltip } from '../Interaction/Tooltip';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type L7Layer = any;

interface LayerAdapter {
  type: string;
  sourceConfig: { data: unknown; options?: Record<string, unknown> };
  visual: {
    color?: { field?: string; values?: string[] | string };
    size?: { field?: string; values?: number[] | number; range?: [number, number] };
    shape?: { field?: string; values?: string[] | string };
    style?: Record<string, unknown>;
  };
  schema: LayerSchema;
}

/** 图层事件回调集合 */
export interface LayerEventHandlers {
  onClick?: (payload: LayerEventPayload) => void;
  onDblclick?: (payload: LayerEventPayload) => void;
  onUndblclick?: (payload: LayerEventPayload) => void;
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
      console.warn(`[aimapui] Unknown layer type: ${schema.type}`);
      return null;
  }

  return buildLayer(adapter, scene);
}

function buildLayer(adapter: LayerAdapter, _scene: Scene): L7Layer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LayerClass = (L7 as Record<string, any>)[adapter.type] as new (...args: any[]) => any;

  if (!LayerClass) {
    throw new Error(`[aimapui] L7 layer class "${adapter.type}" not found`);
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
    if (sizeConfig.field && sizeConfig.range) {
      layer.size(sizeConfig.field, sizeConfig.range);
    } else if (sizeConfig.field && sizeConfig.values) {
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

  // ========== 不透明度 ==========
  if (adapter.schema.opacity !== undefined) {
    layer.style({ opacity: adapter.schema.opacity });
  }

  // ========== 混合模式 ==========
  if (adapter.schema.blend) {
    layer.blend(adapter.schema.blend);
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
  const feature = e?.feature?.properties ?? e?.feature ?? e?.data?.properties ?? e?.data ?? undefined;

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
  onLayerCreated?: (layer: L7Layer) => void;
}

export function SchemaLayer({ schema, scene, eventHandlers, onLayerCreated }: SchemaLayerProps) {
  const layerRef = useRef<L7Layer | null>(null);
  const eventBus = useEventBus();
  const eventHandlersRef = useRef(eventHandlers);
  eventHandlersRef.current = eventHandlers;
  // 计算字符串签名 — 跳过 source 字段（栅格数据可能是巨大的 TypedArray）
  const schemaSignature = useMemo(() => {
    const { source, ...rest } = schema;
    // 对 source 只取引用标识：TypedArray 用长度，其他用 JSON
    let sourceKey: string;
    if (ArrayBuffer.isView(source)) {
      sourceKey = `TypedArray:${(source as unknown as { length: number }).length}`;
    } else if (source && typeof source === 'object' && 'width' in (source as object)) {
      // geotiff readRasters 返回值（带 width/height 的类数组）
      const rasters = source as { width?: number; height?: number; length?: number };
      sourceKey = `Rasters:${rasters.width}x${rasters.height}:${rasters.length}`;
    } else if (typeof source === 'string') {
      sourceKey = source;
    } else {
      try {
        sourceKey = JSON.stringify(source);
      } catch {
        sourceKey = String(source);
      }
    }
    return sourceKey + '|' + stableStringify(rest);
  }, [schema]);

  // Popup/Tooltip 状态管理（使用 React 状态）
  const [popupState, setPopupState] = useState<{
    visible: boolean;
    lng: number;
    lat: number;
    content: string;
    trigger: 'click' | 'hover';
  }>({
    visible: false,
    lng: 0,
    lat: 0,
    content: '',
    trigger: 'click',
  });

  useEffect(() => {
    const layer = createL7Layer(schema, scene);
    if (!layer) {
      return;
    }
    let destroyed = false;
    layerRef.current = layer;

    const layerId = schema.id ?? schema.name ?? `layer-${schema.type}`;
    const layerEvents = schema.events;

      // ========== 绑定图层事件 ==========
      const popupEnabled = Boolean(layerEvents?.enablePopup);
      const popupTrigger = layerEvents?.popupTrigger ?? 'click';

      // 使用统一的 Popup/Tooltip 组件，简化逻辑
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
          trigger: popupTrigger,
        });
      };

      const hidePopup = () => {
        setPopupState((prev) => ({ ...prev, visible: false }));
      };

      const needsClick = Boolean(eventHandlersRef.current?.onClick || layerEvents?.click || (popupEnabled && popupTrigger === 'click'));
      const needsDblclick = Boolean(eventHandlersRef.current?.onDblclick);
      const needsUndblclick = Boolean(eventHandlersRef.current?.onUndblclick);
      const needsMouseMove = Boolean(eventHandlersRef.current?.onMouseMove || layerEvents?.mousemove || (popupEnabled && popupTrigger === 'hover'));
      const needsMouseEnter = Boolean(eventHandlersRef.current?.onMouseEnter || layerEvents?.mouseenter);
      const needsMouseLeave = Boolean(eventHandlersRef.current?.onMouseLeave || layerEvents?.mouseleave || (popupEnabled && popupTrigger === 'hover'));

      // L7 click 事件（普通单击，与 dblclick/undblclick 互斥）
      if (needsClick) {
        layer.on('click', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);
          eventHandlersRef.current?.onClick?.(payload);
          if (layerEvents?.click) {
            eventBus.emit(layerEvents.click, payload);
          }
          if (popupEnabled && popupTrigger === 'click') {
            showPopup(payload);
          }
        });
      }

      // L7 dblclick 事件（双击）
      if (needsDblclick) {
        layer.on('dblclick', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);
          eventHandlersRef.current?.onDblclick?.(payload);
        });
      }

      // L7 undblclick 事件（双击取消后的单击确认，与 click/dblclick 互斥）
      if (needsUndblclick) {
        layer.on('undblclick', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);
          eventHandlersRef.current?.onUndblclick?.(payload);
        });
      }

      // L7 mousemove 事件
      if (needsMouseMove) {
        layer.on('mousemove', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);
          eventHandlersRef.current?.onMouseMove?.(payload);
          if (popupTrigger === 'hover') showPopup(payload);
          if (layerEvents?.mousemove) eventBus.emit(layerEvents.mousemove, payload);
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
          if (popupTrigger === 'hover') hidePopup();
          if (layerEvents?.mouseleave) eventBus.emit(layerEvents.mouseleave, payload);
        });
      }

      // 兜底：L7 unmousemove 事件（鼠标移出图层要素时触发）
      // 当 mouseleave 未触发时，unmousemove 可作为可靠的离开信号
      if (needsMouseLeave && needsMouseMove) {
        layer.on('unmousemove', (evt: unknown) => {
          const payload = extractLayerPayload(layerId, schema.type, evt);
          eventHandlersRef.current?.onMouseLeave?.(payload);
          if (popupTrigger === 'hover') hidePopup();
          if (layerEvents?.mouseleave) eventBus.emit(layerEvents.mouseleave, payload);
        });
      }
      // 添加到场景
      scene.addLayer(layer);
      onLayerCreated?.(layer);

      // 图层初始化完成后强制触发一次重绘，确保图层立即可见
      layer.on('inited', () => {
        if (destroyed) return;
        // autoFit
        if (schema.autoFit) {
          const extent = layer.getSource?.()?.extent;
          if (extent && Array.isArray(extent) && extent.length >= 4) {
            const [minLng, minLat, maxLng, maxLat] = extent;
            if (isFinite(minLng) && isFinite(minLat) && isFinite(maxLng) && isFinite(maxLat) && minLng < maxLng && minLat < maxLat) {
              scene.fitBounds([[minLng, minLat], [maxLng, maxLat]]);
            }
          }
        }
        // 强制 scene 重绘，修复异步初始化导致图层首帧不可见的问题
        scene.render();
      });

    return () => {
      destroyed = true;
      if (layerRef.current) {
        try { scene.removeLayer(layerRef.current); } catch { /* ignore */ }
        layerRef.current = null;
      }
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
      layerRef.current.zIndex = schema.zIndex;
    }
  }, [schema.visible, schema.zIndex]);

  if (!popupState.visible) return null;

  if (popupState.trigger === 'hover') {
    return (
      <Tooltip
        longitude={popupState.lng}
        latitude={popupState.lat}
        content={popupState.content}
        variant="dark"
        placement="top"
        visible={true}
      />
    );
  }

  return (
    <Popup
      longitude={popupState.lng}
      latitude={popupState.lat}
      content={popupState.content}
      closeButton={true}
      size="compact"
      onClose={() => setPopupState((prev) => ({ ...prev, visible: false }))}
    />
  );
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value, new WeakSet()));
}

function sortValue(value: unknown, seen: WeakSet<object>): unknown {
  // TypedArray / ArrayBuffer 不递归，用长度做签名
  if (ArrayBuffer.isView(value)) {
    return `[TypedArray:${(value as unknown as { length: number }).length}]`;
  }
  if (value instanceof ArrayBuffer) {
    return `[ArrayBuffer:${value.byteLength}]`;
  }

  if (Array.isArray(value)) {
    // 对于超大数组（栅格数据），只取长度作为签名
    if (value.length > 1000) {
      return `[Array:${value.length}]`;
    }
    return value.map((item) => sortValue(item, seen));
  }

  if (value && typeof value === 'object') {
    // 循环引用检测：避免无限递归导致栈溢出
    if (seen.has(value as object)) {
      return '[Circular]';
    }
    seen.add(value as object);

    const obj = value as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const next: Record<string, unknown> = {};
    sortedKeys.forEach((key) => {
      next[key] = sortValue(obj[key], seen);
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
    // 宽松匹配占位符 key：兼容中文、空格、括号、百分号等字段名（如 "GDP (亿元)"、"增速 (%)"），
    // 仅排除花括号本身以避免跨占位符误匹配。
    return template.replace(/\{\{([^{}]+)\}\}/g, (_, key) =>
      String(feature[key.trim()] ?? ''),
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
