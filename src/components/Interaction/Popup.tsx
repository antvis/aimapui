import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useScene } from '../../context/SceneContext';
import { useMapPosition } from '../../hooks/useMapPosition';
import { cx } from '../../utils/style';
import type { PopupSchema } from '../../schema/types';

export type PopupSize = 'compact' | 'standard' | 'detailed';

export interface PopupProps extends Omit<PopupSchema, 'type' | 'content'> {
  /** 弹窗内容，支持纯文本 / HTML 字符串 / ReactNode */
  content: string | React.ReactNode;
  /** 尺寸变体 */
  size?: PopupSize;
  overlayContainer?: HTMLElement | null;
  onClose?: () => void;
  className?: string;
}

/**
 * Popup 组件 — 参考 L7 Popup 实现
 *
 * 核心机制：
 * - 挂载到 mapsService.getMarkerContainer()
 * - 使用 useMapPosition 回调模式直接操作 DOM style，避免 setState 延迟
 * - RAF 节流避免高频更新卡顿
 * - 超出可视区域自动隐藏
 */
const sizeClassMap: Record<PopupSize, string> = {
  compact: 'w-[240px]',
  standard: 'w-[320px]',
  detailed: 'w-[480px]',
};

/**
 * 检测内容是否为 HTML 字符串
 */
function isHtmlString(content: unknown): content is string {
  return typeof content === 'string' && /<[a-zA-Z][^>]*>/.test(content);
}

export function Popup({
  longitude,
  latitude,
  content,
  closeButton = true,
  size = 'standard',
  overlayContainer,
  onClose,
  className,
}: PopupProps) {
  const scene = useScene();
  const [visible, setVisible] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);
  const isInViewRef = useRef(true);

  // 自动获取 overlay 容器（组件化模式下）
  const [autoContainer, setAutoContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (overlayContainer || !scene) return;

    const tryGetContainer = () => {
      try {
        const mapsService = (scene as any).mapService;
        if (mapsService && typeof mapsService.getMarkerContainer === 'function') {
          const markerContainer = mapsService.getMarkerContainer() as HTMLElement;
          if (markerContainer) {
            setAutoContainer(markerContainer);
            return true;
          }
        }
      } catch {
        // 不可用
      }
      return false;
    };

    // 立即尝试获取容器
    if (tryGetContainer()) return;

    // 如果失败，等待 loaded 事件
    const onLoaded = () => {
      tryGetContainer();
    };

    if ((scene as any).loaded) {
      onLoaded();
    } else {
      scene.on('loaded', onLoaded);
    }

    return () => {
      scene.off('loaded', onLoaded);
    };
  }, [scene, overlayContainer]);

  const container = overlayContainer ?? autoContainer;

  // 强制重新渲染计数器，用于容器变化时触发重渲染
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (container) {
      // 容器准备好后强制重新渲染
      forceUpdate((v) => v + 1);
    }
  }, [container]);

  // 高性能位置更新：直接操作 DOM，避免 setState 导致的渲染延迟
  useMapPosition(scene, longitude, latitude, (x, y) => {
    // 检查是否在可视区域内
    let inView = true;
    try {
      const mapsService = (scene as any)?.mapService;
      if (mapsService) {
        const mapContainer = mapsService.getContainer?.() as HTMLElement;
        if (mapContainer) {
          const w = mapContainer.scrollWidth || mapContainer.clientWidth;
          const h = mapContainer.scrollHeight || mapContainer.clientHeight;
          inView = x >= 0 && x <= w && y >= 0 && y <= h;
        }
      }
    } catch {
      // 降级
    }
    isInViewRef.current = inView;

    // 直接操作 DOM — 使用 transform 替代 left/top 避免 Layout 重排
    // translate3d 强制 GPU 合成层，与地图 WebGL 同帧渲染
    const el = popupRef.current;
    if (el) {
      el.style.left = '0';
      el.style.top = '0';
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
      el.style.visibility = inView ? 'visible' : 'hidden';
      // 确保初始 display 不为 none
      if (el.style.display === 'none') {
        el.style.display = 'block';
      }
    }
  });

  if (!visible || !container) return null;

  // 渲染内容
  const renderContent = () => {
    if (isHtmlString(content)) {
      return (
        <div
          className="text-sm text-on-surface font-body-md leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return (
      <div className="text-sm text-on-surface font-body-md leading-relaxed">
        {content}
      </div>
    );
  };

  return createPortal(
    <div
      ref={popupRef}
      className={cx('aimapkit-popup')}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: 'translate3d(-9999px, -9999px, 0) translate(-50%, -100%)',
        willChange: 'transform',
        zIndex: 30,
        whiteSpace: 'nowrap',
        pointerEvents: 'auto',
      }}
    >
      {/* Popup 内容容器 - MD3 玻璃拟态设计 */}
      <div
        className={cx(
          'aimapkit-popup-content',
          sizeClassMap[size],
          className,
        )}
        style={{
          background: 'rgba(248, 249, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* 关闭按钮 - icon-button 样式 */}
        {closeButton && (
          <button
            onClick={() => {
              setVisible(false);
              onClose?.();
            }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#434655',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dee9fc';
              e.currentTarget.style.color = '#121c2a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#434655';
            }}
            aria-label="关闭"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        )}

        {/* 内容区 */}
        <div style={{ padding: '16px' }}>
          {renderContent()}
        </div>
      </div>

      {/* 指向箭头 - 等腰三角形 */}
      <div 
        className="aimapkit-popup-tip"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '-10px',
          width: '0',
          height: '0',
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '10px solid rgba(248, 249, 255, 0.95)',
        }}
      />
    </div>,
    container,
  );
}

export default Popup;