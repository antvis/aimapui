import React, { useEffect, useRef } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { useScene } from '../../context/SceneContext';
import type { MarkerSchema } from '../../schema/types';

export interface MarkerProps extends Omit<MarkerSchema, 'type' | 'content'> {
  content?: React.ReactNode;
  className?: string;
  overlayContainer?: HTMLElement | null;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragEnd?: (lng: number, lat: number) => void;
  onDragging?: (lng: number, lat: number) => void;
  onDragStart?: (lng: number, lat: number) => void;
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  offsets?: [number, number];
  overflowHide?: boolean;
}

// Anchor 定位转换
const anchorTranslate: Record<string, string> = {
  center: 'translate(-50%, -50%)',
  top: 'translate(-50%, 0)',
  bottom: 'translate(-50%, -100%)',
  left: 'translate(0, -50%)',
  right: 'translate(-100%, -50%)',
  'top-left': 'translate(0, 0)',
  'top-right': 'translate(-100%, 0)',
  'bottom-left': 'translate(0, -100%)',
  'bottom-right': 'translate(-100%, -100%)',
};

const DEFAULT_OFFSETS: [number, number] = [0, 0];

export function Marker({
  longitude,
  latitude,
  content,
  draggable = false,
  className,
  overlayContainer,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDoubleClick,
  onDragEnd,
  onDragging,
  onDragStart,
  anchor = 'bottom',
  offsets = DEFAULT_OFFSETS,
  overflowHide = true,
}: MarkerProps) {
  const scene = useScene();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const lngLatRef = useRef({ lng: longitude, lat: latitude });
  const mapSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const offsetX = offsets[0] ?? 0;
  const offsetY = offsets[1] ?? 0;
  const handlersRef = useRef<{
    updatePosition: () => void;
    handleDragStart: (e: any) => void;
    handleDragMove: (e: any) => void;
    handleDragEnd: () => void;
  } | null>(null);

  // 更新 Marker 位置（同步，使用 transform 替代 left/top 避免重排）
  const updatePositionSync = (mapsService: any) => {
    const element = elementRef.current;
    if (!element || !mapsService) return;

    const { lng, lat } = lngLatRef.current;
    const pos = mapsService.lngLatToContainer([lng, lat]);
    if (!pos) return;

    const x = pos.x + offsetX;
    const y = pos.y - offsetY;

    // 使用 transform 定位：translate3d(x, y, 0) 负责位置，anchor 偏移合并为第二个 translate
    // 相比 left/top，transform 只触发 Composite 合成层，不触发 Layout 重排，
    // translate3d 强制 GPU 合成层，与地图 WebGL 渲染同帧完成，消除视觉延迟
    const anchorValue = anchorTranslate[anchor] || anchorTranslate.bottom;
    element.style.left = '0';
    element.style.top = '0';
    element.style.transform = `translate3d(${x}px, ${y}px, 0) ${anchorValue}`;
    element.style.willChange = 'transform';

    // 边界检查（用 visibility 代替 display:none，避免回流）
    if (overflowHide) {
      const { width, height } = mapSizeRef.current;
      element.style.visibility =
        x < 0 || x > width || y < 0 || y > height ? 'hidden' : 'visible';
    }
  };

  // 初始化 Marker - 立即注册事件监听，避免延迟
  useEffect(() => {
    if (!scene) return;
    let isCancelled = false;

    const mapsService = (scene as any).mapService;
    if (!mapsService) {
      console.error('[Marker] mapService not available');
      return;
    }

    const refreshMapSize = () => {
      const container = mapsService.getContainer?.();
      if (!container) return;
      mapSizeRef.current = {
        width: container.scrollWidth || container.clientWidth || 0,
        height: container.scrollHeight || container.clientHeight || 0,
      };
    };

    // 立即注册地图事件监听器（在 Marker 创建之前就注册）
    const handleUpdate = () => {
      if (elementRef.current) {
        updatePositionSync(mapsService);
      }
    };

    const registerEvent = (target: any, event: string, handler: () => void) => {
      try {
        target?.on?.(event, handler);
      } catch {
        // ignore unsupported event
      }
    };

    const unregisterEvent = (target: any, event: string, handler: () => void) => {
      try {
        target?.off?.(event, handler);
      } catch {
        // ignore unsupported event
      }
    };

    refreshMapSize();

    // 参考 L7 MarkerService 的事件注册策略：
    // - camerachange: 主事件，AMap 1.x 原生事件 / AMap 2.x 通过 AMapEventMapV2 映射为 viewchange
    // - viewchange: AMap 2.x 原生事件，某些地图类型下与 camerachange 不同
    //   注意：在 AMap 2.x 中，camerachange 和 viewchange 都映射到原生 viewchange，
    //   会导致 handleUpdate 被调用两次，但这是 L7 自身的做法，保持兼容
    registerEvent(mapsService, 'camerachange', handleUpdate);
    registerEvent(mapsService, 'viewchange', handleUpdate);
    registerEvent(scene, 'resize', refreshMapSize);

    const initMarker = async () => {
      // 等待 Scene 加载完成
      if (!(scene as any).loaded) {
        await new Promise<void>((resolve) => {
          scene.once('loaded', () => resolve());
        });
      }
      if (isCancelled) return;

      // 创建 DOM 元素
      const element = document.createElement('div');
      element.className = className || 'aimapkit-marker';
      element.style.position = 'absolute';
      element.style.left = '0';
      element.style.top = '0';
      element.style.whiteSpace = 'nowrap';
      element.style.pointerEvents = 'auto';
      element.style.willChange = 'transform';
      // 使用 translate3d 强制提升为 GPU 合成层，与地图 WebGL 同帧渲染
      element.style.transform = 'translate3d(0, 0, 0)';
      elementRef.current = element;

      // 添加到 Marker 容器
      const markerContainer = overlayContainer ?? mapsService.getMarkerContainer?.();
      if (markerContainer) {
        markerContainer.appendChild(element);
      } else {
        console.error('[Marker] getMarkerContainer not available');
        return;
      }

      // 初始定位
      updatePositionSync(mapsService);

      // 拖拽相关
      let isDragging = false;
      let preLngLat = { lng: 0, lat: 0 };

      const handleDragStart = (e: any) => {
        if (!draggable) return;
        isDragging = true;
        
        // 禁用地图拖拽
        mapsService.setMapStatus({ dragEnable: false, zoomEnable: false });
        
        // 记录初始位置
        const container = mapsService.getContainer();
        const rect = container?.getClientRects()?.[0];
        if (rect) {
          const containerX = rect.left;
          const containerY = rect.top;
          const clickX = e.x || e.clientX;
          const clickY = e.y || e.clientY;
          preLngLat = mapsService.containerToLngLat([clickX - containerX, clickY - containerY]);
        }

        mapsService.on('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        
        if (onDragStart) {
          onDragStart(lngLatRef.current.lng, lngLatRef.current.lat);
        }
      };

      const handleDragMove = (e: any) => {
        if (!isDragging) return;
        
        const lngLat = e.lngLat || e.lnglat;
        const { lng: preLng, lat: preLat } = preLngLat;
        const { lng: curLng, lat: curLat } = lngLat;
        
        const newLngLat = {
          lng: lngLatRef.current.lng + curLng - preLng,
          lat: lngLatRef.current.lat + curLat - preLat,
        };
        
        lngLatRef.current = newLngLat;
        preLngLat = lngLat;
        
        updatePositionSync(mapsService);
        
        if (onDragging) {
          onDragging(newLngLat.lng, newLngLat.lat);
        }
      };

      const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        // 恢复地图拖拽
        mapsService.setMapStatus({ dragEnable: true, zoomEnable: true });
        mapsService.off('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        
        if (onDragEnd) {
          onDragEnd(lngLatRef.current.lng, lngLatRef.current.lat);
        }
      };

      // 绑定事件
      if (onClick) {
        element.addEventListener('click', (e: any) => onClick(e));
      }
      if (onMouseEnter) {
        element.addEventListener('mouseenter', (e: any) => onMouseEnter(e));
      }
      if (onMouseLeave) {
        element.addEventListener('mouseleave', (e: any) => onMouseLeave(e));
      }
      if (onDoubleClick) {
        element.addEventListener('dblclick', (e: any) => onDoubleClick(e));
      }
      
      if (draggable) {
        element.addEventListener('mousedown', handleDragStart);
      }

      handlersRef.current = {
        updatePosition: handleUpdate,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
      };
    };

    initMarker();

    // 清理函数
    return () => {
      isCancelled = true;
      
      // 清理地图事件监听
      unregisterEvent(mapsService, 'camerachange', handleUpdate);
      unregisterEvent(mapsService, 'viewchange', handleUpdate);
      unregisterEvent(scene, 'resize', refreshMapSize);
      
      const handlers = handlersRef.current;
      if (handlers && draggable) {
        mapsService.setMapStatus({ dragEnable: true, zoomEnable: true });
      }

      // 卸载 React 组件并移除 DOM 元素
      if (elementRef.current) {
        unmountComponentAtNode(elementRef.current);
        if (elementRef.current.parentNode) {
          elementRef.current.parentNode.removeChild(elementRef.current);
        }
        elementRef.current = null;
      }
      
      handlersRef.current = null;
    };
  }, [scene, className, anchor, offsetX, offsetY, overflowHide, draggable, overlayContainer]);

  // 渲染内容
  useEffect(() => {
    if (!elementRef.current) return;
    const element = elementRef.current;

    const renderContent = content || (
      <svg display="block" height="48px" width="48px" viewBox="0 0 1024 1024">
        <path 
          d="M512 490.666667C453.12 490.666667 405.333333 442.88 405.333333 384 405.333333 325.12 453.12 277.333333 512 277.333333 570.88 277.333333 618.666667 325.12 618.666667 384 618.666667 442.88 570.88 490.666667 512 490.666667M512 85.333333C346.88 85.333333 213.333333 218.88 213.333333 384 213.333333 608 512 938.666667 512 938.666667 512 938.666667 810.666667 608 810.666667 384 810.666667 218.88 677.12 85.333333 512 85.333333Z"
          fill="var(--color-primary, #004ac6)"
        />
      </svg>
    );

    render(<>{renderContent}</>, element);
  }, [content]);

  // 更新经纬度
  useEffect(() => {
    lngLatRef.current = { lng: longitude, lat: latitude };
    
    // 立即更新位置
    if (scene && elementRef.current) {
      const mapsService = (scene as any).mapService;
      if (mapsService) {
        updatePositionSync(mapsService);
      }
    }
  }, [longitude, latitude, scene]);

  return null;
}

export default Marker;