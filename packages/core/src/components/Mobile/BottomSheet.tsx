import React, { useCallback, useEffect, useRef, useState } from 'react';

export type BottomSheetSnap = 'collapsed' | 'half' | 'expanded';

export interface BottomSheetProps {
  /** 子内容 */
  children?: React.ReactNode;
  /** 初始吸附状态 */
  defaultSnap?: BottomSheetSnap;
  /** 收起时的高度（px） */
  collapsedHeight?: number;
  /** 半展开时的高度比例（0-1），相对于容器高度 */
  halfRatio?: number;
  /** 完全展开时的高度比例（0-1），相对于容器高度 */
  expandedRatio?: number;
  /** 吸附状态变化回调 */
  onSnapChange?: (snap: BottomSheetSnap) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示拖拽手柄 */
  showHandle?: boolean;
  /** 圆角大小 */
  borderRadius?: number;
}

/**
 * 移动端底部抽屉组件
 *
 * 支持三档吸附：收起（collapsed）、半展开（half）、完全展开（expanded）
 * 手势拖拽切换，Material Design 3 风格
 *
 * ```tsx
 * <BottomSheet defaultSnap="half">
 *   <div>抽屉内容</div>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  children,
  defaultSnap = 'collapsed',
  collapsedHeight = 80,
  halfRatio = 0.45,
  expandedRatio = 0.85,
  onSnapChange,
  className,
  showHandle = true,
  borderRadius = 32,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const isDragging = useRef(false);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [snap, setSnap] = useState<BottomSheetSnap>(defaultSnap);
  const [isAnimating, setIsAnimating] = useState(false);

  /** 获取容器高度（最近的 position:relative 祖先或视口） */
  const getContainerHeight = useCallback(() => {
    const parent = sheetRef.current?.offsetParent as HTMLElement | null;
    return parent ? parent.clientHeight : window.innerHeight;
  }, []);

  // 计算各档高度
  const getSnapHeight = useCallback(
    (snapValue: BottomSheetSnap) => {
      const containerHeight = getContainerHeight();
      switch (snapValue) {
        case 'collapsed':
          return collapsedHeight;
        case 'half':
          return containerHeight * halfRatio;
        case 'expanded':
          return containerHeight * expandedRatio;
      }
    },
    [collapsedHeight, halfRatio, expandedRatio, getContainerHeight],
  );

  // 初始化高度
  useEffect(() => {
    setCurrentHeight(getSnapHeight(defaultSnap));
  }, [defaultSnap, getSnapHeight]);

  // 吸附到最近的档位
  const snapToNearest = useCallback(
    (height: number, velocity: number) => {
      const collapsedH = getSnapHeight('collapsed');
      const halfH = getSnapHeight('half');
      const expandedH = getSnapHeight('expanded');

      let targetSnap: BottomSheetSnap;

      // 快速滑动判断
      if (Math.abs(velocity) > 0.5) {
        if (velocity > 0) {
          // 向上滑
          targetSnap = height > halfH ? 'expanded' : 'half';
        } else {
          // 向下滑
          targetSnap = height < halfH ? 'collapsed' : 'half';
        }
      } else {
        // 距离判断
        const distCollapsed = Math.abs(height - collapsedH);
        const distHalf = Math.abs(height - halfH);
        const distExpanded = Math.abs(height - expandedH);
        const minDist = Math.min(distCollapsed, distHalf, distExpanded);

        if (minDist === distCollapsed) targetSnap = 'collapsed';
        else if (minDist === distHalf) targetSnap = 'half';
        else targetSnap = 'expanded';
      }

      setIsAnimating(true);
      setSnap(targetSnap);
      setCurrentHeight(getSnapHeight(targetSnap));
      onSnapChange?.(targetSnap);

      setTimeout(() => setIsAnimating(false), 300);
    },
    [getSnapHeight, onSnapChange],
  );

  // Touch 事件处理
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      isDragging.current = true;
      dragStartY.current = event.touches[0].clientY;
      dragStartHeight.current = currentHeight;
      setIsAnimating(false);
    },
    [currentHeight],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isDragging.current) return;
      const deltaY = dragStartY.current - event.touches[0].clientY;
      const maxHeight = getContainerHeight() * expandedRatio;
      const newHeight = Math.max(
        collapsedHeight,
        Math.min(maxHeight, dragStartHeight.current + deltaY),
      );
      setCurrentHeight(newHeight);
    },
    [collapsedHeight, expandedRatio, getContainerHeight],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const deltaY = dragStartY.current - event.changedTouches[0].clientY;
      const velocity = deltaY / 100;
      snapToNearest(currentHeight, velocity);
    },
    [currentHeight, snapToNearest],
  );

  // Mouse 事件处理（桌面端调试）
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      isDragging.current = true;
      dragStartY.current = event.clientY;
      dragStartHeight.current = currentHeight;
      setIsAnimating(false);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const deltaY = dragStartY.current - moveEvent.clientY;
        const maxHeight = getContainerHeight() * expandedRatio;
        const newHeight = Math.max(
          collapsedHeight,
          Math.min(maxHeight, dragStartHeight.current + deltaY),
        );
        setCurrentHeight(newHeight);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        isDragging.current = false;
        const deltaY = dragStartY.current - upEvent.clientY;
        const velocity = deltaY / 100;
        const maxHeight = getContainerHeight() * expandedRatio;
        snapToNearest(
          Math.max(
            collapsedHeight,
            Math.min(maxHeight, dragStartHeight.current + (dragStartY.current - upEvent.clientY)),
          ),
          velocity,
        );
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [currentHeight, collapsedHeight, expandedRatio, snapToNearest, getContainerHeight],
  );

  // 编程式切换档位
  const snapTo = useCallback(
    (targetSnap: BottomSheetSnap) => {
      setIsAnimating(true);
      setSnap(targetSnap);
      setCurrentHeight(getSnapHeight(targetSnap));
      onSnapChange?.(targetSnap);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [getSnapHeight, onSnapChange],
  );

  return (
    <div
      ref={sheetRef}
      className={className}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: currentHeight,
        zIndex: 1000,
        pointerEvents: 'auto',
        transition: isAnimating ? 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        willChange: 'height',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--color-surface, #f8f9ff)',
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
          borderTop: '1px solid rgba(195, 198, 215, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 拖拽手柄区域 */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{
            padding: '12px 0 16px',
            cursor: 'grab',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          {showHandle && (
            <div
              style={{
                width: 48,
                height: 6,
                borderRadius: 3,
                background: 'rgba(195, 198, 215, 0.5)',
                margin: '0 auto',
              }}
            />
          )}
        </div>

        {/* 内容区域 */}
        <div
          style={{
            flex: 1,
            overflowY: snap === 'collapsed' ? 'hidden' : 'auto',
            overflowX: 'hidden',
            padding: '0 16px',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
