import type { AiMapSchema, LayerSchema, ControlSchema, InteractionSchema, LegendSchema } from '../schema/types';

/**
 * Schema diff 结果
 */
export interface SchemaDiffResult {
  mapChanged: boolean;
  layersAdded: LayerSchema[];
  layersRemoved: string[];
  layersUpdated: { id: string; prev: LayerSchema; next: LayerSchema }[];
  controlsAdded: ControlSchema[];
  controlsRemoved: ControlSchema[];
  controlsUpdated: { index: number; prev: ControlSchema; next: ControlSchema }[];
  interactionsChanged: boolean;
  legendsChanged: boolean;
}

/**
 * 浅比较两个对象是否不同
 */
function shallowChanged(a: unknown, b: unknown): boolean {
  if (a === b) return false;
  if (a == null || b == null) return true;
  if (typeof a !== typeof b) return true;
  if (typeof a !== 'object') return true;
  // 对于对象，做 JSON 序列化比较
  try {
    return JSON.stringify(a) !== JSON.stringify(b);
  } catch {
    return true;
  }
}

/**
 * 对比两个 Schema 的差异，返回需要更新的部分
 */
export function diffSchema(prev: AiMapSchema, next: AiMapSchema): SchemaDiffResult {
  // Map diff
  const mapChanged = shallowChanged(prev.map, next.map);

  // Layers diff
  const prevLayerMap = new Map<string, LayerSchema>();
  (prev.layers ?? []).forEach((l) => {
    if (l.id) prevLayerMap.set(l.id, l);
  });

  const nextLayerMap = new Map<string, LayerSchema>();
  (next.layers ?? []).forEach((l) => {
    if (l.id) nextLayerMap.set(l.id, l);
  });

  const layersAdded: LayerSchema[] = [];
  const layersRemoved: string[] = [];
  const layersUpdated: { id: string; prev: LayerSchema; next: LayerSchema }[] = [];

  // 查找新增和更新
  (next.layers ?? []).forEach((layer, index) => {
    const id = layer.id ?? `__index_${index}`;
    if (!prevLayerMap.has(id)) {
      layersAdded.push(layer);
    } else {
      const prevLayer = prevLayerMap.get(id)!;
      if (shallowChanged(prevLayer, layer)) {
        layersUpdated.push({ id, prev: prevLayer, next: layer });
      }
    }
  });

  // 查找移除
  (prev.layers ?? []).forEach((layer, index) => {
    const id = layer.id ?? `__index_${index}`;
    if (!nextLayerMap.has(id)) {
      layersRemoved.push(id);
    }
  });

  // Controls diff (按 index 匹配)
  const prevControls = prev.controls ?? [];
  const nextControls = next.controls ?? [];
  const controlsAdded: ControlSchema[] = [];
  const controlsRemoved: ControlSchema[] = [];
  const controlsUpdated: { index: number; prev: ControlSchema; next: ControlSchema }[] = [];

  // 简单按 index 对比
  const maxLen = Math.max(prevControls.length, nextControls.length);
  for (let i = 0; i < maxLen; i++) {
    if (i >= prevControls.length) {
      controlsAdded.push(nextControls[i]);
    } else if (i >= nextControls.length) {
      controlsRemoved.push(prevControls[i]);
    } else if (shallowChanged(prevControls[i], nextControls[i])) {
      controlsUpdated.push({ index: i, prev: prevControls[i], next: nextControls[i] });
    }
  }

  // Interactions & Legends 简单做整体变更检测
  const interactionsChanged = shallowChanged(prev.interactions, next.interactions);
  const legendsChanged = shallowChanged(prev.legends, next.legends);

  return {
    mapChanged,
    layersAdded,
    layersRemoved,
    layersUpdated,
    controlsAdded,
    controlsRemoved,
    controlsUpdated,
    interactionsChanged,
    legendsChanged,
  };
}