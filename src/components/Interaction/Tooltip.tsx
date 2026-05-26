import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useScene } from '../../context/SceneContext';
import { useMapPosition } from '../../hooks/useMapPosition';
import { cx } from '../../utils/style';
import { useTheme } from '../../context/ThemeContext';
import type { TooltipSchema } from '../../schema/types';

// ============================================================
// Tooltip 类型定义 — Cartographic Precision System v1.2.0
// ============================================================

/**
 * Tooltip 视觉变体
 * - dark:  深色高对比度（默认），适用于卫星图/亮色底图
 * - glass: 玻璃拟态毛玻璃，适用于简洁数据地图
 * - light: 浅色背景，适用于深色底图
 */
export type TooltipVariant = 'dark' | 'glass' | 'light';

/** Tooltip 方向 */
export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

/**
 * Tooltip 键值对数据项
 */
export interface TooltipItem {
  /** 标签 */
  label: string;
  /** 值 */
  value: string | number;
}

export interface TooltipProps {
  /** 内容：纯文本 / ReactNode。优先级高于 title/items */
  content?: string | React.ReactNode;
  /** 视觉变体，默认 dark */
  variant?: TooltipVariant;

  // ── 地图模式 ──
  /** 经度（地图定位模式） */
  longitude?: number;
  /** 纬度（地图定位模式） */
  latitude?: number;

  // ── DOM 模式 ──
  /** 目标 DOM 元素 */
  targetElement?: HTMLElement | null;

  /** 方向，默认 top */
  placement?: TooltipPlacement;
  /** 偏移距离，默认 8px */
  offset?: number;
  /** 触发方式，默认 hover */
  trigger?: 'hover' | 'click';
  /** 受控可见性 */
  visible?: boolean;
  /** 结构化标题 */
  title?: string;
  /** 结构化键值对列表 */
  items?: TooltipItem[];
  /** Overlay 容器 */
  overlayContainer?: HTMLElement | null;
  /** 自定义类名 */
  className?: string;
}

/** 箭头方向映射：placement -> 箭头所在位置 */
const ARROW_POSITION_MAP: Record<TooltipPlacement, string> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** placement 对应的 anchor translate */
const PLACEMENT_TRANSLATE: Record<TooltipPlacement, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0, -50%)',
};

// ============================================================
// Tooltip 主组件
// ============================================================

export function Tooltip({
  content,
  variant = 'dark',
  longitude,
  latitude,
  targetElement,
  placement = 'top',
  offset = 8,
  trigger = 'hover',
  visible: visibleProp,
  title,
  items,
  overlayContainer,
  className,
}: TooltipProps) {
  const { resolvedTheme } = useTheme();
  const scene = useScene();
  const isControlled = visibleProp !== undefined;
  const [internalVisible, setInternalVisible] = useState(false);
  const visible = isControlled ? visibleProp! : internalVisible;

  const tooltipRef = useRef<HTMLDivElement>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMapMode = longitude !== undefined && latitude !== undefined;

  // ── DOM 模式：监听目标元素事件 ──
  useEffect(() => {
    if (isMapMode || !targetElement || isControlled) return;

    const showWithDelay = () => {
      delayTimerRef.current = setTimeout(() => setInternalVisible(true), 100);
    };
    const hideImmediately = () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      setInternalVisible(false);
    };
    const toggleOnClick = () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      setInternalVisible((v) => !v);
    };

    if (trigger === 'hover') {
      targetElement.addEventListener('mouseenter', showWithDelay);
      targetElement.addEventListener('mouseleave', hideImmediately);
    } else {
      targetElement.addEventListener('click', toggleOnClick);
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      targetElement.removeEventListener('mouseenter', showWithDelay);
      targetElement.removeEventListener('mouseleave', hideImmediately);
      targetElement.removeEventListener('click', toggleOnClick);
    };
  }, [targetElement, trigger, isMapMode, isControlled]);

  // ── DOM 模式：定位到目标元素 ──
  const updateDomPosition = useCallback(() => {
    if (!targetElement || !tooltipRef.current) return;

    const rect = targetElement.getBoundingClientRect();
    const tipRect = tooltipRef.current.getBoundingClientRect();

    let left = 0;
    let top = 0;

    switch (placement) {
      case 'right':
        left = rect.right + offset;
        top = rect.top + rect.height / 2 - tipRect.height / 2;
        break;
      case 'bottom':
        left = rect.left + rect.width / 2 - tipRect.width / 2;
        top = rect.bottom + offset;
        break;
      case 'left':
        left = rect.left - tipRect.width - offset;
        top = rect.top + rect.height / 2 - tipRect.height / 2;
        break;
      case 'top':
      default:
        left = rect.left + rect.width / 2 - tipRect.width / 2;
        top = rect.top - tipRect.height - offset;
        break;
    }

    const padding = 8;
    left = Math.max(padding, Math.min(left, window.innerWidth - tipRect.width - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tipRect.height - padding));

    tooltipRef.current.style.left = `${left}px`;
    tooltipRef.current.style.top = `${top}px`;
  }, [targetElement, placement, offset]);

  useEffect(() => {
    if (isMapMode || !visible || !targetElement) return;
    updateDomPosition();
    const onResize = () => updateDomPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [visible, targetElement, isMapMode, updateDomPosition]);

  // ── 地图模式：获取地图容器的 viewport 偏移 ──
  const getMapContainerOffset = useCallback(() => {
    if (!scene) return { left: 0, top: 0 };
    try {
      const mapsService = (scene as any).mapService;
      const mapContainer = mapsService?.getMarkerContainer?.()
        ?? (scene as any).getMapContainer?.()
        ?? (scene as any).container
        ?? (scene as any).getContainer?.();
      if (mapContainer instanceof HTMLElement) {
        const rect = mapContainer.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
      }
    } catch {
      // ignore
    }
    return { left: 0, top: 0 };
  }, [scene]);

  // ── 地图模式：定位到经纬度（使用 fixed 定位，计算 viewport 绝对坐标）──
  const updateMapPosition = useCallback(() => {
    const el = tooltipRef.current;
    if (!el || !scene || !isMapMode) {
      return;
    }

    try {
      const mapsService = (scene as any).mapService;
      const pos = mapsService
        ? mapsService.lngLatToContainer([longitude, latitude])
        : (scene as any).lngLatToContainer([longitude, latitude]);

      if (!pos || isNaN(pos.x) || isNaN(pos.y)) return;

      let offsetX = 0;
      let offsetY = 0;
      switch (placement) {
        case 'top': offsetY = -offset; break;
        case 'bottom': offsetY = offset; break;
        case 'left': offsetX = -offset; break;
        case 'right': offsetX = offset; break;
      }

      // lngLatToContainer 返回相对于地图容器的坐标，需加上容器在 viewport 中的偏移
      const containerOffset = getMapContainerOffset();
      const rx = Math.round(pos.x + offsetX + containerOffset.left);
      const ry = Math.round(pos.y + offsetY + containerOffset.top);
      const anchorTranslate = PLACEMENT_TRANSLATE[placement];

      el.style.transform = `translate3d(${rx}px, ${ry}px, 0) ${anchorTranslate}`;
      el.style.visibility = 'visible';
    } catch {
      // ignore
    }
  }, [scene, longitude, latitude, placement, offset, isMapMode, getMapContainerOffset]);

  useEffect(() => {
    if (!isMapMode || !visible) return;
    const rafId = requestAnimationFrame(() => updateMapPosition());
    return () => cancelAnimationFrame(rafId);
  }, [visible, isMapMode, updateMapPosition]);

  // 地图交互时持续同步位置（拖拽/缩放时更新）
  useMapPosition(
    isMapMode ? scene : null,
    longitude ?? 0,
    latitude ?? 0,
    (x, y) => {
      const el = tooltipRef.current;
      if (!el || !isMapMode) return;

      let offsetX = 0;
      let offsetY = 0;
      switch (placement) {
        case 'top': offsetY = -offset; break;
        case 'bottom': offsetY = offset; break;
        case 'left': offsetX = -offset; break;
        case 'right': offsetX = offset; break;
      }

      const containerOffset = getMapContainerOffset();
      const rx = Math.round(x + offsetX + containerOffset.left);
      const ry = Math.round(y + offsetY + containerOffset.top);
      const anchorTranslate = PLACEMENT_TRANSLATE[placement];

      el.style.transform = `translate3d(${rx}px, ${ry}px, 0) ${anchorTranslate}`;
      el.style.visibility = 'visible';
    },
  );

  if (!visible) return null;

  const arrowDirection = ARROW_POSITION_MAP[placement];
  const hasStructuredContent = title || (items && items.length > 0);

  const renderContent = () => {
    if (content) {
      return typeof content === 'string' ? (
        <span dangerouslySetInnerHTML={{ __html: content }} />
      ) : content;
    }
    if (hasStructuredContent) {
      return (
        <>
          {title && <p className="aimapui-tooltip-title">{title}</p>}
          {items && items.length > 0 && (
            <div className="aimapui-tooltip-items">
              {items.map((item, i) => (
                <div key={i} className="aimapui-tooltip-item">
                  <span className="aimapui-tooltip-item-label">{item.label}</span>
                  <span className="aimapui-tooltip-item-value">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }
    return null;
  };

  const tooltipElement = (
    <div
      ref={tooltipRef}
      data-theme={resolvedTheme}
      className={cx('aimapui-tooltip', variant !== 'dark' && `aimapui-tooltip--${variant}`)}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: 'translate(-9999px, -9999px)',
        visibility: 'hidden',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div className={cx('aimapui-tooltip-content', className)}>
        {renderContent()}
      </div>
      <div className={`aimapui-tooltip-arrow aimapui-tooltip-arrow--${arrowDirection}`} />
    </div>
  );

  // 统一 portal 到 document.body，使用 fixed 定位 + viewport 坐标
  return createPortal(tooltipElement, document.body);
}

export default Tooltip;
