import { useRef, useState, useEffect, useCallback } from 'react';
import type { ControlPosition } from './useMapControl';

const DIR_CLASSES = ['l7-popper-left', 'l7-popper-right', 'l7-popper-top', 'l7-popper-bottom'] as const;
const ALIGN_CLASSES = ['l7-popper-start', 'l7-popper-end'] as const;

/**
 * 根据控件 position 计算弹出面板的初始方向
 * - top* → 向下弹出, bottom* → 向上弹出
 * - left* → 向右弹出, right* → 向左弹出
 */
export function getPopperDirection(pos: ControlPosition): string {
  switch (pos) {
    case 'topleft': return 'l7-popper-bottom l7-popper-start';
    case 'topright': return 'l7-popper-bottom l7-popper-end';
    case 'bottomleft': return 'l7-popper-top l7-popper-start';
    case 'bottomright': return 'l7-popper-top l7-popper-end';
    case 'lefttop': return 'l7-popper-right l7-popper-start';
    case 'leftbottom': return 'l7-popper-right l7-popper-end';
    case 'righttop': return 'l7-popper-left l7-popper-start';
    case 'rightbottom': return 'l7-popper-left l7-popper-end';
    default: return 'l7-popper-bottom';
  }
}

/**
 * Popper 弹出方向 Hook —— 根据控件 position 给出初始方向，
 * 弹出后检测视口溢出并自动翻转。
 *
 * 返回 { popperRef, popperClass }
 * - popperRef：挂到弹出容器 div 上
 * - popperClass：当前计算出的 CSS class 字符串
 */
export function usePopperPosition(position: ControlPosition, open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const popperRef = useRef<HTMLDivElement>(null);
  const [popperClass, setPopperClass] = useState(() => getPopperDirection(position));

  useEffect(() => {
    if (!open) return;
    const initialClass = getPopperDirection(position);
    setPopperClass(initialClass);

    requestAnimationFrame(() => {
      const popperEl = popperRef.current;
      if (!popperEl) return;

      const rect = popperEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let flipV = '';
      let flipH = '';

      if (rect.bottom > vh - 8) {
        flipV = 'l7-popper-top';
      } else if (rect.top < 8) {
        flipV = 'l7-popper-bottom';
      }

      if (rect.right > vw - 8) {
        flipH = 'l7-popper-end';
      } else if (rect.left < 8) {
        flipH = 'l7-popper-start';
      }

      if (!flipV && !flipH) return;

      const parts = initialClass.split(' ');
      const dirPart = parts.find(p => (DIR_CLASSES as readonly string[]).includes(p)) ?? '';
      const alignPart = parts.find(p => (ALIGN_CLASSES as readonly string[]).includes(p)) ?? '';

      setPopperClass(`${flipV || dirPart} ${flipH || alignPart}`.trim());
    });
  }, [open, position]);

  return { popperRef, popperClass };
}
