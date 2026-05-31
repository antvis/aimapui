import React, { useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useScene } from '../../context/SceneContext';
import type { MarkerSchema } from '../../schema/types';
import { MAKI_ICONS } from './maki-icons';

// ============================================================
// Marker 类型定义 — Cartographic Precision System v1.2.0
// ============================================================

/**
 * Marker 基础形态
 * - pin:   水滴型 (32x40px)，默认业务点，用于 POI、站点、静态设施
 * - circle: 圆型 (24x24px)，移动/轻量点，用于实时车辆、传感器
 * - icon:  图标型，在 Pin 内嵌入 Maki 图标
 * - dot:   简化点 (8px)，低缩放级降级形态
 */
export type MarkerVariant = 'pin' | 'circle' | 'icon' | 'dot';

/**
 * Marker 语义颜色
 * - primary:  信息/默认 (#2563EB)
 * - success:  完成/安全 (#00854D)
 * - warning:  预警/高负载 (#943700)
 * - error:    故障/危险 (#BA1A1A)
 */
export type MarkerColor = 'primary' | 'success' | 'warning' | 'error';

/**
 * Marker 语义颜色值映射
 */
const MARKER_COLOR_MAP: Record<MarkerColor, { fill: string; bg: string; ring: string }> = {
  primary: { fill: '#2563eb', bg: 'rgba(37, 99, 235, 0.2)', ring: 'rgba(37, 99, 235, 0.2)' },
  success: { fill: '#00854d', bg: 'rgba(0, 133, 77, 0.2)', ring: 'rgba(0, 133, 77, 0.2)' },
  warning: { fill: '#943700', bg: 'rgba(148, 55, 0, 0.2)', ring: 'rgba(148, 55, 0, 0.2)' },
  error:   { fill: '#ba1a1a', bg: 'rgba(186, 26, 26, 0.2)', ring: 'rgba(186, 26, 26, 0.2)' },
};

/**
 * 检测内容是否为 HTML 字符串
 */
function isHtmlString(content: unknown): content is string {
  return typeof content === 'string' && /<[a-zA-Z][^>]*>/.test(content);
}

// ============================================================
// 内置 Marker 内容组件
// ============================================================

/**
 * 水滴型 Pin SVG — 32x40px，使用 CSS 变量 --marker-color 控制颜色
 */
function PinSvg({ color = 'primary' }: { color?: MarkerColor }) {
  const { fill } = MARKER_COLOR_MAP[color];
  return (
    <svg
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="aimapui-marker-pin"
      style={{ width: 32, height: 40, display: 'block', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.07)) drop-shadow(0 2px 2px rgba(0,0,0,0.06))' }}
    >
      <path
        d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 40 16 40C16 40 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z"
        fill={fill}
        stroke="white"
        strokeWidth={1.5}
      />
      <circle cx="16" cy="16" r="4" fill="white" />
    </svg>
  );
}

/**
 * 带 Maki 图标的 Pin — 32x40px
 * icon 为 Maki 图标名（如 "cafe"、"bus"、"airport"），从内置注册表渲染 SVG path
 */
function IconPin({ icon, color = 'primary' }: { icon: string; color?: MarkerColor }) {
  const { fill } = MARKER_COLOR_MAP[color];
  const iconPath = MAKI_ICONS[icon] ?? MAKI_ICONS['marker'] ?? '';

  return (
    <div
      className="aimapui-marker-pin aimapui-marker-pin--icon"
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-start', justifyContent: 'center', width: 32, height: 40, filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.07)) drop-shadow(0 2px 2px rgba(0,0,0,0.06))' }}
    >
      <svg
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <path
          d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 40 16 40C16 40 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z"
          fill={fill}
          stroke="white"
          strokeWidth={1.5}
        />
      </svg>
      {/* Maki 图标 SVG：原始 viewBox 15x15，缩放居中在 Pin 上半部分 */}
      {iconPath && (
        <svg
          viewBox="0 0 15 15"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'relative',
            zIndex: 1,
            width: 16,
            height: 16,
            marginTop: 8,
            fill: 'white',
          }}
        >
          <path d={iconPath} style={{ fill: 'white' }} />
        </svg>
      )}
    </div>
  );
}

/**
 * 圆型 Marker — 24x24px
 */
function CircleMarker({ color = 'primary' }: { color?: MarkerColor }) {
  const { fill, bg } = MARKER_COLOR_MAP[color];
  return (
    <div
      className="aimapui-marker-circle"
      style={{
        position: 'relative', width: 24, height: 24, borderRadius: '50%',
        border: '1.5px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg, borderColor: fill,
      }}
    >
      <div
        className="aimapui-marker-circle__inner"
        style={{ width: 6, height: 6, borderRadius: '50%', background: fill }}
      />
    </div>
  );
}

/**
 * 简化圆点 — 8x8px，低缩放级降级形态
 */
function DotMarker({ color = 'primary' }: { color?: MarkerColor }) {
  const { fill } = MARKER_COLOR_MAP[color];
  return (
    <div
      className="aimapui-marker-dot"
      style={{
        width: 8, height: 8, borderRadius: '50%',
        border: '1.5px solid white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        background: fill,
      }}
    />
  );
}

/**
 * Marker 文本标注 — 置于 Marker 下方 4px，带白色光晕
 */
function MarkerLabel({ text }: { text: string }) {
  return (
    <div
      className="aimapui-marker-label"
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 450,
        color: '#1d1d1f',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 2px #fff, 0 0 4px rgba(255,255,255,0.5)',
      }}
    >
      {text}
    </div>
  );
}

// ============================================================
// MarkerProps
// ============================================================

export interface MarkerProps extends Omit<MarkerSchema, 'type' | 'content'> {
  /** Marker 形态，默认 pin */
  variant?: MarkerVariant;
  /** 语义颜色，默认 primary */
  color?: MarkerColor;
  /** Maki 图标名（如 "cafe"、"bus"、"airport"），仅 variant='icon' 时生效 */
  icon?: string;
  /** 文本标注，显示在 Marker 下方 4px */
  label?: string;
  /** 自定义内容，优先级高于 variant/color/icon/label */
  content?: React.ReactNode | string;
  /** 子元素，作为自定义内容渲染 */
  children?: React.ReactNode;
  className?: string;
  overlayContainer?: HTMLElement | null;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragEnd?: (lng: number, lat: number) => void;
  onDragging?: (lng: number, lat: number) => void;
  onDragStart?: (lng: number, lat: number) => void;
  /** 选中状态 */
  selected?: boolean;
  /** 禁用/离线状态 */
  inactive?: boolean;
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

/**
 * 根据 variant/colors/icon/label 自动生成 Marker 内容
 */
function renderMarkerContent(
  variant: MarkerVariant,
  color: MarkerColor,
  icon: string | undefined,
  label: string | undefined,
): React.ReactNode {
  let markerElement: React.ReactNode;

  switch (variant) {
    case 'pin':
      markerElement = <PinSvg color={color} />;
      break;
    case 'circle':
      markerElement = <CircleMarker color={color} />;
      break;
    case 'icon':
      markerElement = <IconPin icon={icon || 'marker'} color={color} />;
      break;
    case 'dot':
      markerElement = <DotMarker color={color} />;
      break;
    default:
      markerElement = <PinSvg color={color} />;
  }

  if (label) {
    return (
      <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        {markerElement}
        <MarkerLabel text={label} />
      </div>
    );
  }

  return markerElement;
}

export function Marker({
  longitude,
  latitude,
  variant = 'pin',
  color = 'primary',
  icon,
  label,
  content,
  children,
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
  selected = false,
  inactive = false,
  anchor = 'bottom',
  offsets = DEFAULT_OFFSETS,
  overflowHide = true,
}: MarkerProps) {
  const scene = useScene();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);
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

  // 用 ref 持有最新的事件回调，避免 DOM 监听器闭包过期
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const onMouseEnterRef = useRef(onMouseEnter);
  onMouseEnterRef.current = onMouseEnter;
  const onMouseLeaveRef = useRef(onMouseLeave);
  onMouseLeaveRef.current = onMouseLeave;
  const onDoubleClickRef = useRef(onDoubleClick);
  onDoubleClickRef.current = onDoubleClick;
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDraggingRef = useRef(onDragging);
  onDraggingRef.current = onDragging;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  // 计算 className：合并 variant、color、state 类名
  const computedClassName = React.useMemo(() => {
    const parts: string[] = ['aimapui-marker'];
    if (selected) parts.push('aimapui-marker--selected');
    if (inactive) parts.push('aimapui-marker--inactive');
    parts.push(`aimapui-marker--${color}`);
    if (className) parts.push(className);
    return parts.join(' ');
  }, [selected, inactive, color, className]);

  // 决定渲染内容：content > children > variant 渲染
  const markerContent = React.useMemo(() => {
    if (content) return content;
    if (children) return children;
    return renderMarkerContent(variant, color, icon, label);
  }, [content, children, variant, color, icon, label]);

  // 更新 Marker 位置（同步，使用 transform 替代 left/top 避免重排）
  const updatePositionSync = (mapsService: any) => {
    const element = elementRef.current;
    if (!element || !mapsService) return;

    const { lng, lat } = lngLatRef.current;
    if (isNaN(lng) || isNaN(lat)) return;

    let pos;
    try {
      pos = mapsService.lngLatToContainer([lng, lat]);
    } catch {
      return;
    }
    if (!pos || isNaN(pos.x) || isNaN(pos.y)) return;

    const x = pos.x + offsetX;
    const y = pos.y - offsetY;

    const anchorValue = anchorTranslate[anchor] || anchorTranslate.bottom;
    const rx = Math.round(x);
    const ry = Math.round(y);
    element.style.left = '0';
    element.style.top = '0';
    element.style.transform = `translate3d(${rx}px, ${ry}px, 0) ${anchorValue}`;

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

    registerEvent(mapsService, 'camerachange', handleUpdate);
    registerEvent(mapsService, 'viewchange', handleUpdate);
    registerEvent(scene, 'resize', refreshMapSize);

    const initMarker = async () => {
      if (!(scene as any).loaded) {
        await new Promise<void>((resolve) => {
          scene.once('loaded', () => resolve());
        });
      }
      if (isCancelled) return;

      // 创建 DOM 元素
      const element = document.createElement('div');
      element.className = computedClassName;
      element.style.position = 'absolute';
      element.style.left = '0';
      element.style.top = '0';
      element.style.whiteSpace = 'nowrap';
      element.style.pointerEvents = 'auto';
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
        mapsService.setMapStatus({ dragEnable: false, zoomEnable: false });

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

        if (onDragStartRef.current) {
          onDragStartRef.current(lngLatRef.current.lng, lngLatRef.current.lat);
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

        if (onDraggingRef.current) {
          onDraggingRef.current(newLngLat.lng, newLngLat.lat);
        }
      };

      const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        mapsService.setMapStatus({ dragEnable: true, zoomEnable: true });
        mapsService.off('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);

        if (onDragEndRef.current) {
          onDragEndRef.current(lngLatRef.current.lng, lngLatRef.current.lat);
        }
      };

      // 绑定 DOM 事件（通过 ref 调用最新回调，避免闭包过期）
      element.addEventListener('click', ((e: any) => onClickRef.current?.(e)) as EventListener);
      element.addEventListener('mouseenter', ((e: any) => onMouseEnterRef.current?.(e)) as EventListener);
      element.addEventListener('mouseleave', ((e: any) => onMouseLeaveRef.current?.(e)) as EventListener);
      element.addEventListener('dblclick', ((e: any) => onDoubleClickRef.current?.(e)) as EventListener);

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

    return () => {
      isCancelled = true;

      unregisterEvent(mapsService, 'camerachange', handleUpdate);
      unregisterEvent(mapsService, 'viewchange', handleUpdate);
      unregisterEvent(scene, 'resize', refreshMapSize);

      const handlers = handlersRef.current;
      if (handlers && draggable) {
        mapsService.setMapStatus({ dragEnable: true, zoomEnable: true });
      }

      if (elementRef.current) {
        const rootToUnmount = rootRef.current;
        const elementToRemove = elementRef.current;
        rootRef.current = null;
        elementRef.current = null;

        // 延迟到下一个微任务，避免在 React 渲染期间同步 unmount 导致竞态
        queueMicrotask(() => {
          if (rootToUnmount) {
            rootToUnmount.unmount();
          }
          if (elementToRemove.parentNode) {
            elementToRemove.parentNode.removeChild(elementToRemove);
          }
        });
      }

      handlersRef.current = null;
    };
  }, [scene, anchor, offsetX, offsetY, overflowHide, draggable, overlayContainer]);

  // 渲染内容
  useEffect(() => {
    if (!elementRef.current) return;
    const element = elementRef.current;

    if (isHtmlString(markerContent)) {
      element.innerHTML = markerContent as string;
    } else {
      if (!rootRef.current) {
        rootRef.current = createRoot(element);
      }
      rootRef.current.render(<>{markerContent}</>);
    }
  }, [markerContent]);

  // 更新 className（selected/inactive/color 变化时）
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.className = computedClassName;
    }
  }, [computedClassName]);

  // 更新经纬度
  useEffect(() => {
    lngLatRef.current = { lng: longitude, lat: latitude };

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