import { useCallback, useMemo } from 'react';
import type { Scene } from '@antv/l7';
import { useScene } from '../context/SceneContext';

/**
 * 控件位置类型，与 L7 PositionType 一致
 */
export type ControlPosition =
  | 'topleft'
  | 'topright'
  | 'bottomleft'
  | 'bottomright'
  | 'topcenter'
  | 'bottomcenter'
  | 'lefttop'
  | 'leftbottom'
  | 'righttop'
  | 'rightbottom';

/**
 * 控件公共属性
 */
export interface ControlProps {
  /** 控件位置，默认各控件有各自的默认值 */
  position?: ControlPosition;
  /** 额外 className */
  className?: string;
  /** 额外 style */
  style?: React.CSSProperties;
}

/**
 * Hook: 提供 mapsService 访问 + 控件位置计算
 *
 * 遵循 L7 的 Control 规范：
 * - 通过 mapsService 获取地图服务实例
 * - 通过 scene 获取场景实例
 * - 提供 position → 定位 CSS 类名的映射
 */
export function useMapControl(position?: ControlPosition) {
  const scene = useScene();

  const mapsService = useMemo(() => {
    if (!scene) return null;
    try {
      return (scene as any).mapService ?? null;
    } catch {
      return null;
    }
  }, [scene]);

  /**
   * 获取地图容器
   */
  const getMapContainer = useCallback(() => {
    if (!scene) return null;
    try {
      if (mapsService && typeof mapsService.getContainer === 'function') {
        return mapsService.getContainer();
      }
      return scene.getContainer?.() ?? null;
    } catch {
      return null;
    }
  }, [scene, mapsService]);

  /**
   * 获取控件位置对应的 L7 CSS 类名
   * 用于外层 wrapper 的定位
   */
  const positionClassName = useMemo(() => {
    const { vSide, hSide, direction } = getPositionDir(position ?? 'topright');
    return `l7-${vSide} l7-${hSide} l7-${direction}`;
  }, [position]);

  return {
    scene,
    mapsService,
    getMapContainer,
    positionClassName,
  };
}

/**
 * 根据 L7 的 position 规范返回方向信息
 */
export function getPositionDir(position: ControlPosition): {
  vSide: string;
  hSide: string;
  direction: string;
} {
  switch (position) {
    case 'topleft':      return { vSide: 'top', hSide: 'left', direction: 'column' };
    case 'topright':     return { vSide: 'top', hSide: 'right', direction: 'column' };
    case 'bottomleft':   return { vSide: 'bottom', hSide: 'left', direction: 'column' };
    case 'bottomright':  return { vSide: 'bottom', hSide: 'right', direction: 'column' };
    case 'topcenter':    return { vSide: 'top', hSide: 'left', direction: 'row' };
    case 'bottomcenter': return { vSide: 'bottom', hSide: 'left', direction: 'row' };
    case 'lefttop':      return { vSide: 'top', hSide: 'left', direction: 'row' };
    case 'leftbottom':   return { vSide: 'bottom', hSide: 'left', direction: 'row' };
    case 'righttop':     return { vSide: 'top', hSide: 'right', direction: 'row' };
    case 'rightbottom':  return { vSide: 'bottom', hSide: 'right', direction: 'row' };
    default:             return { vSide: 'top', hSide: 'right', direction: 'column' };
  }
}

/**
 * @deprecated 使用 getPositionDir 代替
 */
export function getPositionClasses(position: ControlPosition) {
  return getPositionDir(position);
}