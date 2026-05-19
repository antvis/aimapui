import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TooltipSchema } from '../../schema/types';

export interface TooltipProps extends Omit<TooltipSchema, 'type'> {
  targetElement?: HTMLElement | null;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Tooltip 组件（GeoLink Pro 风格）
 * - 支持 hover/click 触发
 * - 支持 top/right/bottom/left 四向箭头
 * - 使用玻璃态 + MD3 色板视觉
 */
export function Tooltip({
  content,
  trigger = 'hover',
  targetElement,
  placement = 'top',
  offset = 10,
  className,
  style,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ left: -9999, top: -9999 });

  const updatePosition = () => {
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

    // 轻量防溢出
    const padding = 8;
    left = Math.max(padding, Math.min(left, window.innerWidth - tipRect.width - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tipRect.height - padding));

    setPosition({ left, top });
  };

  useEffect(() => {
    if (!targetElement) return;

    const onEnter = () => {
      if (trigger === 'hover') {
        setVisible(true);
      }
    };
    const onLeave = () => {
      if (trigger === 'hover') {
        setVisible(false);
      }
    };
    const onClick = () => {
      if (trigger === 'click') {
        setVisible((v) => !v);
      }
    };

    targetElement.addEventListener('mouseenter', onEnter);
    targetElement.addEventListener('mouseleave', onLeave);
    targetElement.addEventListener('click', onClick);

    return () => {
      targetElement.removeEventListener('mouseenter', onEnter);
      targetElement.removeEventListener('mouseleave', onLeave);
      targetElement.removeEventListener('click', onClick);
    };
  }, [targetElement, trigger]);

  useEffect(() => {
    if (!visible) return;

    updatePosition();

    const onViewportChange = () => updatePosition();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [visible, targetElement, placement, offset]);

  const arrow = useMemo(() => {
    switch (placement) {
      case 'right':
        return <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '6px solid #27313f' }} />;
      case 'bottom':
        return <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #27313f' }} />;
      case 'left':
        return <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid #27313f' }} />;
      case 'top':
      default:
        return <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #27313f' }} />;
    }
  }, [placement]);

  if (!visible) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={className}
      style={{
        position: 'fixed',
        left: position.left,
        top: position.top,
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'rgba(39,49,63,0.95)',
        color: '#eaf1ff',
        border: '1px solid rgba(195,198,215,0.35)',
        borderRadius: 8,
        padding: '6px 10px',
        boxShadow: '0 8px 24px rgba(18,28,42,0.25)',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 450,
        fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {content}
      {arrow}
    </div>,
    document.body,
  );
}

export default Tooltip;
