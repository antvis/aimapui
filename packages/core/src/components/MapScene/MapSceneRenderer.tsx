import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Scene } from '@antv/l7';
import type { MapSchema, EventSchema, MapEventPayload } from '../../schema/types';
import { applyMapDefaults } from '../../schema/defaults';
import { SceneProvider } from '../../context/SceneContext';
import { createBasemap } from './basemap-factory';
import { useEventBus } from '../../context/EventBusContext';

export interface MapEventHandlers {
  onMove?: (payload: MapEventPayload) => void;
  onZoom?: (payload: MapEventPayload) => void;
}

export interface MapSceneRendererProps {
  mapSchema: MapSchema;
  children?: React.ReactNode;
  onSceneReady?: (scene: Scene) => void;
  mapEventHandlers?: MapEventHandlers;
  events?: EventSchema;
  className?: string;
  style?: React.CSSProperties;
}

export function MapSceneRenderer({
  mapSchema,
  children,
  onSceneReady,
  mapEventHandlers,
  events,
  className,
  style,
}: MapSceneRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const onSceneReadyRef = useRef(onSceneReady);
  onSceneReadyRef.current = onSceneReady;
  const mapEventHandlersRef = useRef(mapEventHandlers);
  mapEventHandlersRef.current = mapEventHandlers;
  const eventBus = useEventBus();

  const applyGestureConfig = useCallback((targetScene: Scene, mapConfig: MapSchema) => {
    if (mapConfig.basemap === 'map') return;

    const dragPan = mapConfig.gestureConfig?.dragPan ?? true;
    const pinchZoom = mapConfig.gestureConfig?.pinchZoom ?? true;
    const dragRotate = mapConfig.gestureConfig?.dragRotate ?? true;

    try {
      // 方式1: 通过 mapService.setMapStatus (L7 内部 API)
      const mapService = (targetScene as unknown as { mapService?: { setMapStatus?: (s: Record<string, boolean>) => void; map?: any } }).mapService;
      if (mapService && typeof mapService.setMapStatus === 'function') {
        mapService.setMapStatus({
          dragEnable: dragPan,
          zoomEnable: pinchZoom,
          rotateEnable: dragRotate,
          doubleClickZoom: pinchZoom,
        });
      }

      // 方式2: 直接操作 L7 Scene 的交互控制器 (更可靠)
      const interactionService = (targetScene as unknown as { interactionService?: any }).interactionService;
      if (interactionService) {
        if (typeof interactionService.enableDrag === 'function') {
          dragPan ? interactionService.enableDrag() : interactionService.disableDrag();
        }
        if (typeof interactionService.enableZoom === 'function') {
          pinchZoom ? interactionService.enableZoom() : interactionService.disableZoom();
        }
        if (typeof interactionService.enableRotate === 'function') {
          dragRotate ? interactionService.enableRotate() : interactionService.disableRotate();
        }
      }

      // Google Maps: setMapStatus 会重新打开原生 zoomControl，
      // 在它之后强制关闭所有原生 UI 控件
      if (mapConfig.basemap === 'google' && mapService?.map) {
        const nativeMap = mapService.map;
        if (typeof nativeMap.setOptions === 'function') {
          nativeMap.setOptions({
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            scaleControl: false,
            rotateControl: false,
            panControl: false,
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);


  // 创建场景
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    const config = applyMapDefaults(mapSchema);

    // engine 注入时同步创建，否则走异步动态 import
    const initScene = (mapInstance: unknown) => {
      if (destroyed || !containerRef.current) return;

      const newScene = new Scene({
        id: containerRef.current,
        map: mapInstance as any,
        logoVisible: false,
      });

      sceneRef.current = newScene;

      newScene.on('loaded', () => {
        if (!destroyed) {
          applyGestureConfig(newScene, config);
          setScene(newScene);
          onSceneReadyRef.current?.(newScene);
          bindMapEvents(newScene);
        }
      });

      if (config.bounds) {
        newScene.on('loaded', () => {
          try {
            const [sw, ne] = config.bounds!;
            (newScene as any).fitBounds([sw[0], sw[1], ne[0], ne[1]]);
          } catch {
            // 某些底图可能不支持
          }
        });
      }
    };

    if (config.engine) {
      // 同步路径 — 外部注入的引擎构造函数
      const commonOptions = {
        center: config.center,
        zoom: config.zoom,
        pitch: config.pitch,
        rotation: config.rotation,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
        style: config.style ?? 'normal',
        token: config.token ?? '',
      };
      const mapInstance = new config.engine(commonOptions as Record<string, unknown>);
      initScene(mapInstance);
    } else {
      const mapInstance = createBasemap(config);
      initScene(mapInstance);
    }

    function bindMapEvents(s: Scene) {
      // 地图移动事件
      s.on('mapmove', () => {
        const payload: MapEventPayload = {
          originalEvent: null,
          center: [s.getCenter().lng, s.getCenter().lat],
          zoom: s.getZoom(),
          pitch: s.getPitch(),
          rotation: s.getRotation(),
        };
        mapEventHandlersRef.current?.onMove?.(payload);
        if (events?.mapMove) {
          eventBus.emit(events.mapMove, payload);
        }
      });

      // 地图缩放事件
      s.on('zoomchange', () => {
        const payload: MapEventPayload = {
          originalEvent: null,
          center: [s.getCenter().lng, s.getCenter().lat],
          zoom: s.getZoom(),
          pitch: s.getPitch(),
          rotation: s.getRotation(),
        };
        mapEventHandlersRef.current?.onZoom?.(payload);
        if (events?.mapZoom) {
          eventBus.emit(events.mapZoom, payload);
        }
      });
    }

    return () => {
      destroyed = true;
      if (sceneRef.current) {
        try {
          sceneRef.current.destroy();
        } catch {
          // 某些底图（如天地图）的 destroy 可能不完整，静默处理
        }
        sceneRef.current = null;
      }
      setScene(null);
    };
    // 只在首次挂载和底图类型/引擎变化时重新创建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapSchema.basemap, mapSchema.engine, applyGestureConfig]);

  // 同步地图属性变化（不重建场景）
  // 使用 JSON.stringify 稳定化数组/对象类型的依赖，避免对象字面量每次 render 产生新引用导致 effect 重复执行
  const centerKey = JSON.stringify(mapSchema.center);
  const gestureKey = JSON.stringify(mapSchema.gestureConfig);
  useEffect(() => {
    if (!scene) return;
    const config = applyMapDefaults(mapSchema);

    try { scene.setCenter(config.center); } catch { /* ignore */ }
    try { scene.setZoom(config.zoom); } catch { /* ignore */ }
    try { scene.setPitch(config.pitch); } catch { /* ignore */ }
    try { scene.setRotation(config.rotation); } catch { /* ignore */ }
    applyGestureConfig(scene, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, centerKey, mapSchema.zoom, mapSchema.pitch, mapSchema.rotation, gestureKey, applyGestureConfig]);

  // 窗口 resize 处理
  const handleResize = useCallback(() => {
    if (sceneRef.current) {
      try {
        const map = sceneRef.current.map;
        if (map && typeof (map as Record<string, unknown>).resize === 'function') {
          (map as Record<string, () => void>).resize();
        }
      } catch {
        // 忽略
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <div
      ref={containerRef}
      className={className ?? 'aimapui-container'}
      style={style ?? { width: '100%', height: '100%' }}
    >
      {scene && (
        <SceneProvider scene={scene}>
          {children}
        </SceneProvider>
      )}
    </div>
  );
}

export default MapSceneRenderer;
