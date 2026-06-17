import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { AiMapProps } from './types';
import type { AiMapSchema, MapSchema, LayerSchema, LayerEventPayload, MapEventPayload } from '../../schema/types';
import { parseSchema } from '../../core/parser';
import { applySchemaDefaults } from '../../schema/defaults';
import { SchemaProvider } from '../../context/SchemaContext';
import { EventBusProvider } from '../../context/EventBusContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { ResponsiveProvider } from '../../components/Responsive/useBreakpoint';
import { MapSceneRenderer } from '../../components/MapScene/MapSceneRenderer';
import { LayerRenderer } from '../../components/Layer/LayerRenderer';
import { ControlRenderer } from '../../components/Control/ControlRenderer';
import { ControlContainer, ControlRegistry } from '../../components/Control/ControlContainer';
import { InteractionRenderer } from '../../components/Interaction/InteractionRenderer';
import { LegendRenderer } from '../../components/Legend/LegendRenderer';
import { useResponsive } from '../../context/ResponsiveContext';
import { MobileToolbar } from '../../components/Mobile/MobileToolbar';
import { MobileSheetLegend } from '../../components/Mobile/MobileSheetLegend';
import { useScene } from '../../context/SceneContext';
import type { Scene } from '@antv/l7';

/**
 * AiMap 主入口组件
 *
 * 支持两种使用模式：
 *
 * 1. 组件化模式（推荐 — 开发者友好，自由组合）
 * ```tsx
 * <AiMap map={{ basemap: 'gaode', center: [116, 39], zoom: 10 }}>
 *   <PointLayer source={data} color="#5B8FF9" size={12} onClick={handleClick} />
 *   <LineLayer source={flowData} color="#F6BD16" />
 *   <ZoomControl position="topright" />
 *   <Marker longitude={116.4} latitude={39.9} content="北京" />
 * </AiMap>
 * ```
 *
 * 2. Schema 模式（AI 生成、JSON 配置）
 * ```tsx
 * <AiMap schema={fullSchema} />
 * ```
 */
export function AiMap({
  map,
  schema,
  theme = 'light',
  onSceneReady,
  onLayerClick,
  onLayerMouseMove,
  onLayerMouseEnter,
  onLayerMouseLeave,
  onMapMove,
  onMapZoom,
  autoFit,
  events,
  children,
  className,
  style,
}: AiMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 两种模式互斥：优先 schema，否则从 map prop 构建
  const resolvedSchema = useMemo(() => {
    if (schema) {
      return applySchemaDefaults(parseSchema(schema));
    }
    // 组件化模式：map prop 生成最小 schema，layers/controls 等由子组件提供
    const mapConfig = map ?? { basemap: 'gaode' as const };
    // engine 存在时不强制 basemap 默认值
    if (!mapConfig.basemap && !mapConfig.engine) {
      mapConfig.basemap = 'gaode';
    }
    return {
      map: applyMapOnlyDefaults(mapConfig),
      layers: [], // 子组件自行添加
      controls: [],
      interactions: [],
      legends: [],
    } as AiMapSchema;
  }, [schema, map]);

  const isComposableMode = !schema && !!map;

  // 图层事件回调
  const layerEventHandlers = useMemo(() => ({
    onClick: onLayerClick,
    onMouseMove: onLayerMouseMove,
    onMouseEnter: onLayerMouseEnter,
    onMouseLeave: onLayerMouseLeave,
  }), [onLayerClick, onLayerMouseMove, onLayerMouseEnter, onLayerMouseLeave]);

  // 地图事件回调
  const mapEventHandlers = useMemo(() => ({
    onMove: onMapMove,
    onZoom: onMapZoom,
  }), [onMapMove, onMapZoom]);

  // 包装 onSceneReady
  const handleSceneReady = useCallback((scene: Scene) => {
    onSceneReady?.(scene);
  }, [onSceneReady]);

  return (
    <ThemeProvider defaultTheme={theme} target="container">
      <SchemaProvider schema={resolvedSchema}>
        <EventBusProvider events={events}>
          <ResponsiveProvider responsive={resolvedSchema.responsive}>
            <AiMapCore
              schema={resolvedSchema}
              isComposableMode={isComposableMode}
              autoFit={autoFit}
              onSceneReady={handleSceneReady}
              layerEventHandlers={layerEventHandlers}
              mapEventHandlers={mapEventHandlers}
              containerRef={containerRef}
              className={className}
              style={style}
            >
              {children}
            </AiMapCore>
          </ResponsiveProvider>
        </EventBusProvider>
      </SchemaProvider>
    </ThemeProvider>
  );
}

/**
 * 自动缩放到所有图层数据范围的 effect 组件。
 * 渲染在 MapSceneRenderer 内部，通过 useScene() 获取 scene。
 * 监听所有图层的 inited 事件，聚合 source.extent 后调用 fitBounds。
 */
function AutoFitEffect() {
  const scene = useScene();

  useEffect(() => {
    if (!scene) return;

    let fitted = false;
    let fitTimer: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    const knownLayers = new Set<unknown>();

    const computeAndFit = () => {
      if (fitted) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layers = (scene as any).getLayers?.() ?? [];
      if (layers.length === 0) return;

      let minLng = Infinity;
      let minLat = Infinity;
      let maxLng = -Infinity;
      let maxLat = -Infinity;
      let hasValid = false;

      for (const layer of layers) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const source = (layer as any).getSource?.();
          const extent: [number, number, number, number] | undefined = source?.extent;
          if (!extent || !Array.isArray(extent) || extent.length < 4) continue;
          const [eLngMin, eLatMin, eLngMax, eLatMax] = extent;
          if (!isFinite(eLngMin) || !isFinite(eLatMin) || !isFinite(eLngMax) || !isFinite(eLatMax)) continue;
          if (eLngMin >= eLngMax || eLatMin >= eLatMax) continue;

          minLng = Math.min(minLng, eLngMin);
          minLat = Math.min(minLat, eLatMin);
          maxLng = Math.max(maxLng, eLngMax);
          maxLat = Math.max(maxLat, eLatMax);
          hasValid = true;
        } catch {
          // skip
        }
      }

      if (!hasValid || minLng >= maxLng || minLat >= maxLat) return;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (scene as any).fitBounds([[minLng, minLat], [maxLng, maxLat]]);
        fitted = true;
      } catch {
        // fitBounds may throw on unsupported basemaps
      }
    };

    const debouncedFit = () => {
      if (fitted) return;
      if (fitTimer) clearTimeout(fitTimer);
      fitTimer = setTimeout(computeAndFit, 200);
    };

    let attempts = 0;
    const maxAttempts = 50;

    const poll = () => {
      if (fitted) return;
      attempts += 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layers = (scene as any).getLayers?.() ?? [];
      for (const layer of layers) {
        if (!knownLayers.has(layer)) {
          knownLayers.add(layer);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const layerInited = (layer as any).inited;
          if (layerInited) {
            debouncedFit();
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof (layer as any).on === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (layer as any).on('inited', debouncedFit);
          }
        }
      }

      if (!fitted && attempts < maxAttempts) {
        pollTimer = setTimeout(poll, 100);
      }
    };

    pollTimer = setTimeout(poll, 100);

    return () => {
      if (fitTimer) clearTimeout(fitTimer);
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [scene]);

  return null;
}

/** 仅对 map 配置应用默认值（组件化模式） */
function applyMapOnlyDefaults(map: MapSchema): MapSchema & {
  basemap: NonNullable<MapSchema['basemap']>;
  center: NonNullable<MapSchema['center']>;
  zoom: NonNullable<MapSchema['zoom']>;
  pitch: NonNullable<MapSchema['pitch']>;
  rotation: NonNullable<MapSchema['rotation']>;
} {
  return {
    basemap: map.basemap ?? (map.engine ? undefined : 'gaode'),
    engine: map.engine,
    token: map.token,
    style: map.style,
    center: map.center ?? [105, 35],
    zoom: map.zoom ?? 4,
    pitch: map.pitch ?? 0,
    rotation: map.rotation ?? 0,
    minZoom: map.minZoom,
    maxZoom: map.maxZoom,
    bounds: map.bounds,
    gestureConfig: map.gestureConfig,
  } as any;
}

// ===== 内部组件 =====

interface LayerEventHandlers {
  onClick?: (payload: LayerEventPayload) => void;
  onMouseMove?: (payload: LayerEventPayload) => void;
  onMouseEnter?: (payload: LayerEventPayload) => void;
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

interface MapEventHandlers {
  onMove?: (payload: MapEventPayload) => void;
  onZoom?: (payload: MapEventPayload) => void;
}

interface AiMapCoreProps {
  schema: AiMapSchema;
  isComposableMode: boolean;
  autoFit?: boolean;
  onSceneReady?: (scene: Scene) => void;
  layerEventHandlers: LayerEventHandlers;
  mapEventHandlers: MapEventHandlers;
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function AiMapCore({
  schema,
  isComposableMode,
  autoFit,
  onSceneReady,
  layerEventHandlers,
  mapEventHandlers,
  containerRef,
  className,
  style,
  children,
}: AiMapCoreProps) {
  const { isMobile } = useResponsive();
  const [layers, setLayers] = useState<LayerSchema[]>(schema.layers ?? []);

  // 响应式图层覆盖（仅 Schema 模式）
  const effectiveLayers = useMemo(() => {
    if (isComposableMode) return schema.layers;
    if (!isMobile || !schema.responsive?.mobile?.layers) return schema.layers;

    const overrides = schema.responsive.mobile.layers;
    if ('*' in overrides) {
      const wildcard = overrides['*'];
      return schema.layers.map((layer) => ({
        ...layer,
        ...wildcard,
        id: layer.id,
      }));
    }
    return schema.layers.map((layer) => {
      if (layer.id && overrides[layer.id]) {
        return { ...layer, ...overrides[layer.id], id: layer.id };
      }
      return layer;
    });
  }, [schema.layers, schema.responsive, isMobile, isComposableMode]);

  const effectiveControls = useMemo(() => {
    const controls = schema.controls ?? [];
    if (!isMobile || !schema.responsive?.mobile?.controls) return controls;
    const mobileConfig = schema.responsive.mobile.controls;
    if (mobileConfig.hide) {
      return controls.filter((c) => !mobileConfig.hide!.includes(c.type));
    }
    return controls;
  }, [schema.controls, schema.responsive, isMobile]);

  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible } : l)),
    );
  }, []);

  return (
    <div
      ref={containerRef as React.Ref<HTMLDivElement>}
      className={className ?? 'aimapui-container'}
      style={style ?? { width: '100%', height: '100%' }}
    >
      <MapSceneRenderer
        mapSchema={schema.map}
        onSceneReady={onSceneReady}
        mapEventHandlers={mapEventHandlers}
        events={schema.events}
        style={{ width: '100%', height: '100%' }}
      >
        {autoFit && <AutoFitEffect />}
        {/* Schema 模式：通过 schema.layers 渲染 */}
        {!isComposableMode && effectiveLayers.length > 0 && (
          <LayerRenderer layers={effectiveLayers} eventHandlers={layerEventHandlers} />
        )}

        {/* Schema 模式：控件 */}
        {!isComposableMode && (
          <ControlRenderer
            controls={effectiveControls}
            layers={effectiveLayers}
            onLayerToggle={handleLayerToggle}
            containerRef={containerRef}
          />
        )}

        {/* Schema 模式：交互元素 */}
        {!isComposableMode && schema.interactions && schema.interactions.length > 0 && (
          <InteractionRenderer interactions={schema.interactions} />
        )}

        {/* Schema 模式：图例 */}
        {!isComposableMode && (
          isMobile ? (
            schema.legends && schema.legends.length > 0 && (
              <MobileSheetLegend legends={schema.legends} />
            )
          ) : (
            <LegendRenderer legends={schema.legends ?? []} />
          )
        )}

        {/* Schema 模式：移动端工具栏 */}
        {!isComposableMode && isMobile && schema.responsive?.mobile?.toolbar && (
          <MobileToolbar config={schema.responsive.mobile.toolbar} />
        )}

        {/* 组件化模式：children 包裹在 ControlContainer 中自动排列控件 */}
        {isComposableMode ? (
          <ControlContainerAutoWrap>{children}</ControlContainerAutoWrap>
        ) : null}
      </MapSceneRenderer>
    </div>
  );
}

/**
 * 组合模式下的控件容器自动包裹组件
 *
 * 遍历 children，将控件组件（有 position prop 或已注册的控件类型）
 * 包裹在 ControlContainer 中按 position 分组自动排列，
 * 非控件组件保持原样渲染。
 */
function ControlContainerAutoWrap({ children }: { children?: React.ReactNode }) {
  // 分离控件和非控件 children
  const { controls, others } = useMemo(() => {
    const controls: React.ReactElement[] = [];
    const others: React.ReactNode[] = [];
    React.Children.forEach(children, (child, index) => {
      if (React.isValidElement(child) && ControlRegistry.check(child)) {
        controls.push(child);
      } else {
        others.push(child);
      }
    });
    return { controls, others };
  }, [children]);

  return (
    <>
      {/* 控件用 ControlContainer 包裹，按 position 分组自动排列 */}
      {controls.length > 0 && (
        <ControlContainer>{controls}</ControlContainer>
      )}
      {/* 非控件子组件（如 Marker、Layer 等）原样渲染 */}
      {others}
    </>
  );
}

export default AiMap;
