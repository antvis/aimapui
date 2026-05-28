import { useEffect, useRef, useCallback } from 'react';
import type { Scene } from '@antv/l7';

export interface ScreenPosition {
  x: number;
  y: number;
}

type PositionCallback = (x: number, y: number) => void;

/**
 * 高性能地图位置同步 Hook
 *
 * 参考 L7 Marker/Popup 的直接 DOM 操作方式：
 * - 不使用 setState 避免渲染延迟
 * - 通过回调函数直接更新 DOM style
 * - 使用 mapsService 事件监听地图变化
 * - RAF 节流合并高频更新
 *
 * 用法：
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useMapPosition(scene, lng, lat, (x, y) => {
 *   if (ref.current) {
 *     ref.current.style.left = x + 'px';
 *     ref.current.style.top = y + 'px';
 *   }
 * });
 * ```
 */
export function useMapPosition(
  scene: Scene | null,
  longitude: number,
  latitude: number,
  onPositionUpdate: PositionCallback,
): void {
  const lngRef = useRef(longitude);
  const latRef = useRef(latitude);
  lngRef.current = longitude;
  latRef.current = latitude;

  const callbackRef = useRef(onPositionUpdate);
  callbackRef.current = onPositionUpdate;

  const rafIdRef = useRef<number | null>(null);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  const updatePosition = useCallback(() => {
    const s = sceneRef.current;
    if (!s) return;
    try {
      const mapsService = (s as any).mapService;
      if (mapsService) {
        const pos = mapsService.lngLatToContainer([lngRef.current, latRef.current]);
        if (pos) {
          callbackRef.current(pos.x, pos.y);
        }
      } else {
        const pos = s.lngLatToContainer([lngRef.current, latRef.current]);
        if (pos) {
          callbackRef.current(pos.x, pos.y);
        }
      }
    } catch {
      // 场景可能未初始化
    }
  }, []);

  // 同步更新位置 — 移除 RAF 节流以避免 Marker 跟随延迟
  // 对于需要高频更新的场景（如地图拖拽），直接同步更新比 RAF 更流畅
  const scheduleUpdate = useCallback(() => {
    updatePosition();
  }, [updatePosition]);

  // 初始计算 — 使用 setTimeout 确保 DOM 已挂载后再计算位置
  useEffect(() => {
    if (!scene) return;

    const doInit = () => {
      // 延迟一帧，确保 marker 的 DOM 已挂载到 container
      setTimeout(() => updatePosition(), 0);
    };

    if ((scene as any).loaded) {
      doInit();
    } else {
      scene.on('loaded', doInit);
    }

    return () => {
      scene.off('loaded', doInit);
    };
  }, [scene, updatePosition]);

  // longitude/latitude 变化时立即更新
  useEffect(() => {
    updatePosition();
  }, [longitude, latitude, updatePosition]);

  // 监听地图相机变化事件 — 参考 L7 只监听核心事件
  useEffect(() => {
    if (!scene) return;

    try {
      const mapsService = (scene as any).mapService;
      if (mapsService) {
        mapsService.on('camerachange', scheduleUpdate);
        mapsService.on('viewchange', scheduleUpdate);
        return () => {
          mapsService.off('camerachange', scheduleUpdate);
          mapsService.off('viewchange', scheduleUpdate);
        };
      }
    } catch {
      // mapsService 可能不可用
    }

    // 降级：使用 Scene 事件
    scene.on('camerachange', scheduleUpdate);
    scene.on('resize', scheduleUpdate);
    return () => {
      scene.off('camerachange', scheduleUpdate);
      scene.off('resize', scheduleUpdate);
    };
  }, [scene, scheduleUpdate]);

  // 清理 RAF
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);
}

/**
 * React State 版本 — 用于需要位置数据的场景
 * 注意：此版本有 setState 延迟，优先使用回调版本
 */
export function useMapPositionState(
  scene: Scene | null,
  longitude: number,
  latitude: number,
): ScreenPosition {
  const [position, setPosition] = React.useState<ScreenPosition>({ x: -9999, y: -9999 });

  useMapPosition(scene, longitude, latitude, (x, y) => {
    setPosition({ x, y });
  });

  return position;
}

import React from 'react';