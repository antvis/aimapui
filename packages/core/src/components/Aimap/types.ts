import type { MapTheme } from '../../context/ThemeContext';
import type { AiMapSchema, MapSchema, LayerEventPayload, MapEventPayload, EventSchema } from '../../schema/types';
import type { Scene } from '@antv/l7';
import type React from 'react';

export interface AiMapProps {
  /**
   * 组件化模式：只传地图配置，图层/控件/交互通过子组件添加
   *
   * ```tsx
   * <AiMap map={{ basemap: 'gaode', center: [116, 39], zoom: 10 }}>
   *   <PointLayer source={data} color="#5B8FF9" size={12} />
   *   <ZoomControl />
   * </AiMap>
   * ```
   */
  map?: MapSchema;

  /**
   * Schema 模式：通过完整 JSON Schema 一次性配置（AI 生成场景）
   *
   * ```tsx
   * <AiMap schema={fullSchema} />
   * ```
   */
  schema?: AiMapSchema;

  /**
   * 主题模式
   * - `'light'`: 亮色主题（默认）
   * - `'dark'`: 暗色主题
   * - `'system'`: 跟随系统 prefers-color-scheme
   */
  theme?: MapTheme;

  /** 场景就绪回调 */
  onSceneReady?: (scene: Scene) => void;

  // ========== 图层事件回调 ==========
  /** 图层点击事件 */
  onLayerClick?: (payload: LayerEventPayload) => void;
  /** 图层鼠标移动事件 */
  onLayerMouseMove?: (payload: LayerEventPayload) => void;
  /** 图层鼠标进入事件 */
  onLayerMouseEnter?: (payload: LayerEventPayload) => void;
  /** 图层鼠标离开事件 */
  onLayerMouseLeave?: (payload: LayerEventPayload) => void;

  // ========== 地图事件回调 ==========
  /** 地图移动事件 */
  onMapMove?: (payload: MapEventPayload) => void;
  /** 地图缩放事件 */
  onMapZoom?: (payload: MapEventPayload) => void;

  /** EventBus 事件监听 */
  events?: Record<string, (...args: unknown[]) => void>;

  /** 子组件（组件化模式下使用） */
  children?: React.ReactNode;

  /** 容器 className */
  className?: string;
  /** 容器 style */
  style?: React.CSSProperties;
}
