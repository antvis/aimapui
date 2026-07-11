import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useScene } from '../../context/SceneContext';
import { useMapPosition } from '../../hooks/useMapPosition';
import { cx } from '../../utils/style';
import type { PopupSchema } from '../../schema/types';

// ============================================================
// Popup 类型定义 — Cartographic Precision System v1.2.0
// ============================================================

/**
 * Popup 尺寸变体
 * - compact:   宽度 240px，适用于简单文字标注
 * - standard:  宽度 320px，适用于 POI 简介等通用场景
 * - detailed:  宽度 480px，适用于统计图表或详细参数对比
 */
export type PopupSize = 'compact' | 'standard' | 'detailed';

/**
 * 弹出框相对于锚点的位置
 * - auto: 根据视口边界自动选择（默认）
 * - top: 始终在锚点上方
 * - bottom: 始终在锚点下方
 * - left: 始终在锚点左侧
 * - right: 始终在锚点右侧
 */
export type PopupPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

/**
 * Popup 标题栏配置
 */
export interface PopupHeader {
  /** 标题文字 */
  title: string;
  /** 封面图 URL（可选，显示在顶部 aspect-video 比例） */
  coverUrl?: string;
  /** 状态标签（可选，显示在封面图左下角） */
  statusLabel?: string;
  /** 状态颜色（可选，默认 emerald-500） */
  statusColor?: string;
  /** 标题前的状态点颜色（可选，compact 模式标题前脉冲指示灯） */
  statusDot?: string;
}

/**
 * Popup 属性项
 */
export interface PopupAttribute {
  /** 属性标签 */
  label: string;
  /** 属性值 */
  value: string | number;
  /** 值颜色（可选，默认使用 on-surface） */
  valueColor?: string;
  /** Material Symbols 图标名（仅 detailed 模式渲染图标容器） */
  icon?: string;
}

/**
 * Popup 操作按钮
 */
export interface PopupAction {
  /** 按钮文字 */
  label: string;
  /** 按钮类型：primary 主按钮 / secondary 次要按钮 */
  variant?: 'primary' | 'secondary';
  /** 点击回调 */
  onClick?: () => void;
}

export interface PopupProps extends Omit<PopupSchema, 'type' | 'content'> {
  /** 弹窗内容，支持纯文本 / HTML 字符串 / ReactNode。当使用 header/attributes/actions 结构化模式时可省略 */
  content?: string | React.ReactNode;
  /** 尺寸变体，默认 standard */
  size?: PopupSize;
  /** 弹出位置，默认 auto（自动根据视口边界选择） */
  placement?: PopupPlacement;
  /** 弹出框偏移量（像素），默认 8px，正数远离锚点 */
  offset?: number;
  /**
   * 布局预设 — 快速选择信息排布方式，自动映射到 size + 内部样式
   * - simple:    纯文本/HTML，compact 尺寸
   * - card:      标题 + 属性列表，standard 尺寸
   * - rich:      封面图 + 标题 + 属性 + 操作按钮，detailed 尺寸
   * 传入后仍可被 size/header/attributes/actions 单独覆盖
   */
  layout?: 'simple' | 'card' | 'rich';
  /** 结构化标题栏（可选，传入后覆盖简单内容模式） */
  header?: PopupHeader;
  /** 属性列表（可选，"标签-值"对齐模式） */
  attributes?: PopupAttribute[];
  /** 底部操作按钮（可选） */
  actions?: PopupAction[];
  /** 受控可见性：传入时由外部控制显隐；不传或 undefined 时组件内部管理 */
  visible?: boolean;
  /** 是否启用互斥模式（默认 false）。启用后同一时间仅显示一个 Popup */
  singleton?: boolean;
  overlayContainer?: HTMLElement | null;
  onClose?: () => void;
  className?: string;
}

/**
 * 检测内容是否为 HTML 字符串
 */
function isHtmlString(content: unknown): content is string {
  return typeof content === 'string' && /<[a-zA-Z][^>]*>/.test(content);
}

// ============================================================
// 互斥管理 — 模块级单例跟踪
// ============================================================

type PopupId = symbol;
let activeSingletonPopup: PopupId | null = null;
const singletonListeners = new Set<(activeId: PopupId | null) => void>();

function registerSingleton(id: PopupId, onClose: () => void) {
  if (activeSingletonPopup && activeSingletonPopup !== id) {
    // 通知上一个 Popup 关闭
    singletonListeners.forEach((fn) => fn(id));
  }
  activeSingletonPopup = id;
}

function unregisterSingleton(id: PopupId) {
  if (activeSingletonPopup === id) {
    activeSingletonPopup = null;
  }
}

// ============================================================
// 箭头方向与定位计算
// ============================================================

/** 根据锚点和 Popup 尺寸判断最佳方向 */
function computePlacement(
  anchorX: number,
  anchorY: number,
  popupWidth: number,
  popupHeight: number,
  mapWidth: number,
  mapHeight: number,
  preferred: PopupPlacement,
  offset: number,
): { placement: 'top' | 'bottom' | 'left' | 'right'; transform: string } {
  if (preferred !== 'auto') {
    return buildTransform(preferred as 'top' | 'bottom' | 'left' | 'right', offset);
  }

  // 默认 top（锚点上方），检查是否溢出
  const spaceTop = anchorY;
  const spaceBottom = mapHeight - anchorY;
  const spaceLeft = anchorX;
  const spaceRight = mapWidth - anchorX;

  const tipHeight = 8; // 箭头高度

  // 尝试 top
  if (spaceTop >= popupHeight + offset + tipHeight) {
    return buildTransform('top', offset);
  }
  // 尝试 bottom
  if (spaceBottom >= popupHeight + offset + tipHeight) {
    return buildTransform('bottom', offset);
  }
  // 尝试 right
  if (spaceRight >= popupWidth + offset + tipHeight) {
    return buildTransform('right', offset);
  }
  // 尝试 left
  if (spaceLeft >= popupWidth + offset + tipHeight) {
    return buildTransform('left', offset);
  }

  // 所有方向都不够空间，选择最大空间方向
  const spaces = { top: spaceTop, bottom: spaceBottom, right: spaceRight, left: spaceLeft };
  const best = (Object.entries(spaces) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0] as 'top' | 'bottom' | 'left' | 'right';
  return buildTransform(best, offset);
}

function buildTransform(
  placement: 'top' | 'bottom' | 'left' | 'right',
  offset: number,
): { placement: 'top' | 'bottom' | 'left' | 'right'; transform: string } {
  switch (placement) {
    case 'top':
      return { placement: 'top', transform: `translate(-50%, -100%) translateY(-${offset}px)` };
    case 'bottom':
      return { placement: 'bottom', transform: `translate(-50%, 0) translateY(${offset}px)` };
    case 'left':
      return { placement: 'left', transform: `translate(-100%, -50%) translateX(-${offset}px)` };
    case 'right':
      return { placement: 'right', transform: `translate(0, -50%) translateX(${offset}px)` };
  }
}

// ============================================================
// Popup 子组件
// ============================================================

/** 关闭按钮 — 绝对定位在右上角 */
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="aimapui-popup-close-btn absolute top-2 right-2 size-8 flex items-center justify-center text-on-surface-variant rounded-lg transition-[color,background] duration-200 cursor-pointer bg-transparent border-none p-0 hover:text-on-surface hover:bg-surface-container-high [&_.material-symbols-outlined]:text-xl"
      aria-label="关闭"
    >
      <span className="material-symbols-outlined">close</span>
    </button>
  );
}

/** 箭头 SVG 路径 — 四方向 */
const ARROW_PATHS = {
  // 箭头朝下（Popup 在锚点上方）
  top: 'M0 0L8 8L16 0',
  // 箭头朝上（Popup 在锚点下方）
  bottom: 'M0 8L8 0L16 8',
  // 箭头朝右（Popup 在锚点左侧）
  left: 'M0 0L8 8L0 16',
  // 箭头朝左（Popup 在锚点右侧）
  right: 'M8 0L0 8L8 16',
} as const;

/** 指向箭头 — 放置在 .aimapui-popup-content 外部，不受 overflow:hidden 裁剪 */
function PopupTip({ placement }: { placement: 'top' | 'bottom' | 'left' | 'right' }) {
  const isVertical = placement === 'top' || placement === 'bottom';
  const svgWidth = isVertical ? 16 : 8;
  const svgHeight = isVertical ? 8 : 16;
  const viewBox = isVertical ? '0 0 16 8' : '0 0 8 16';
  const path = ARROW_PATHS[placement];

  // 颜色与容器保持一致（使用 CSS 变量支持主题切换）
  const fillColor = 'var(--color-surface)';
  const strokeColor = 'var(--color-outline-variant)';

  return (
    <div className={`aimapui-popup-tip-arrow aimapui-popup-tip-arrow--${placement === 'top' ? 'bottom' : placement === 'bottom' ? 'top' : placement}`}>
      <svg width={svgWidth} height={svgHeight} viewBox={viewBox} fill="none">
        <path d={path} fill={fillColor} />
        <path d={path} stroke={strokeColor} strokeWidth="0.5" fill="none" />
      </svg>
    </div>
  );
}

/** 封面图 + 状态标签 */
function CoverImage({ header, onClose }: { header: PopupHeader; onClose: () => void }) {
  if (!header.coverUrl) return null;
  return (
    <div className="aimapui-popup-cover relative aspect-video overflow-hidden">
      <img src={header.coverUrl} alt={header.title} className="aimapui-popup-cover-img w-full h-full object-cover" />
      <button
        className="aimapui-popup-close-btn aimapui-popup-close-btn--cover absolute top-2 right-2 size-8 bg-black/30 backdrop-blur-sm text-white flex items-center justify-center rounded-full border-none cursor-pointer transition-colors duration-200 z-10 hover:bg-black/50 [&_.material-symbols-outlined]:text-lg"
        aria-label="关闭"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
      {header.statusLabel && (
        <div className="aimapui-popup-status-badge absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-surface/90 backdrop-blur-sm rounded-md shadow-sm text-[10px] font-semibold uppercase tracking-wide text-on-surface">
          <div
            className="size-2 rounded-full"
            style={{ background: header.statusColor || '#10b981' }}
          />
          <span>{header.statusLabel}</span>
        </div>
      )}
    </div>
  );
}

/** 标题区 — 关闭按钮绝对定位在右上角 */
function HeaderSection({
  header,
  onClose,
  hasCover,
  showStatusDot,
}: {
  header: PopupHeader;
  onClose: () => void;
  hasCover: boolean;
  showStatusDot?: boolean;
}) {
  return (
    <div className={cx('aimapui-popup-header relative flex items-center p-4', !hasCover && 'pr-10')}>
      {showStatusDot && header.statusDot && (
        <div
          className="size-2 rounded-full shrink-0 mr-2 animate-pulse"
          style={{ background: header.statusDot }}
        />
      )}
      <h3 className="aimapui-popup-title text-xl leading-7 font-semibold text-on-surface m-0 flex-1 min-w-0 truncate">{header.title}</h3>
      {!hasCover && <CloseButton onClick={onClose} />}
    </div>
  );
}

/** 属性列表 — 根据 size 变体切换布局 */
function AttributeList({
  attributes,
  size,
}: {
  attributes: PopupAttribute[];
  size: PopupSize;
}) {
  const isCompact = size === 'compact';
  const isDetailed = size === 'detailed';
  const cols = isCompact ? 1 : 2;

  return (
    <div
      className={cx(
        'aimapui-popup-attrs',
        isCompact ? 'flex flex-col' : 'grid gap-2',
      )}
      style={!isCompact ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}
    >
      {attributes.map((attr, i) => {
        // Detailed 模式且属性有 icon：渲染图标容器 + 大号值
        if (isDetailed && attr.icon) {
          return (
            <div key={i} className="aimapui-popup-attr flex items-center gap-2">
              <div className="aimapui-popup-attr-icon size-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0 [&_.material-symbols-outlined]:text-[28px]">
                <span className="material-symbols-outlined">{attr.icon}</span>
              </div>
              <div>
                <p className="aimapui-popup-attr-label text-sm leading-5 text-on-surface-variant m-0">{attr.label}</p>
                <p className="aimapui-popup-attr-value text-sm leading-5 font-medium text-on-surface m-0" style={attr.valueColor ? { color: attr.valueColor } : undefined}>
                  {attr.value}
                </p>
              </div>
            </div>
          );
        }

        // Compact/Standard 模式 — 标签-值左右对齐
        return (
          <div key={i} className={cx(
            'aimapui-popup-attr',
            'flex justify-between items-baseline gap-2',
            isCompact && 'py-2 border-b border-outline-variant/30 last:border-b-0 last:pb-0 first:pt-0',
          )}>
            <p className="aimapui-popup-attr-label text-sm leading-5 text-on-surface-variant m-0">{attr.label}</p>
            <p className="aimapui-popup-attr-value text-sm leading-5 font-medium text-on-surface m-0 text-right" style={attr.valueColor ? { color: attr.valueColor } : undefined}>
              {attr.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** 底部操作栏 */
function ActionBar({ actions }: { actions: PopupAction[] }) {
  return (
    <div className="aimapui-popup-actions flex gap-3 px-4 pb-4">
      {actions.map((action, i) => (
        <button
          key={i}
          className={cx(
            'aimapui-popup-action-btn',
            'flex-1 py-2.5 text-sm leading-5 font-semibold rounded-lg border-none cursor-pointer transition-all duration-150 active:scale-[0.98]',
            action.variant === 'secondary'
              ? 'aimapui-popup-action-btn--secondary bg-transparent text-on-surface border-2 border-solid border-outline-variant hover:bg-surface-container-low'
              : 'aimapui-popup-action-btn--primary bg-primary text-on-primary shadow-sm hover:shadow-[0_4px_12px_rgba(0,74,198,0.3)]',
          )}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Popup 主组件
// ============================================================

export function Popup({
  longitude,
  latitude,
  content,
  closeButton = true,
  size: sizeProp,
  placement: placementProp = 'auto',
  offset = 8,
  layout,
  header,
  attributes,
  actions,
  visible: visibleProp,
  singleton = false,
  overlayContainer,
  onClose,
  className,
}: PopupProps) {
  // layout 预设自动映射 size
  const resolvedSize = sizeProp ?? (layout === 'simple' ? 'compact' : layout === 'rich' ? 'detailed' : 'standard');
  const size = resolvedSize;
  const scene = useScene();
  // 如果传入了 visibleProp，则为受控模式；否则内部管理
  const isControlled = visibleProp !== undefined;
  const [internalVisible, setInternalVisible] = useState(true);
  const visible = isControlled ? visibleProp! : internalVisible;

  // 退场动效状态
  const [exiting, setExiting] = useState(false);

  // 当前生效的箭头方向
  const [currentPlacement, setCurrentPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  const popupRef = useRef<HTMLDivElement>(null);
  const isInViewRef = useRef(true);
  const mountedRef = useRef(false);

  // 互斥 ID
  const popupIdRef = useRef<PopupId>(Symbol('popup'));

  // 自动获取 overlay 容器
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

    if (tryGetContainer()) return;

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

  // ── 关闭处理（含退场动效） ──
  const handleClose = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    // 等待退场动画完成后再真正关闭
    setTimeout(() => {
      if (!isControlled) setInternalVisible(false);
      onClose?.();
      setExiting(false);
    }, 150); // 与 CSS aimapui-popup-exit 动画时长一致
  }, [isControlled, onClose, exiting]);

  // ── 互斥管理 ──
  useEffect(() => {
    if (!singleton || !visible) return;
    const id = popupIdRef.current;
    registerSingleton(id, handleClose);
    return () => unregisterSingleton(id);
  }, [singleton, visible, handleClose]);

  useEffect(() => {
    if (!singleton) return;
    const id = popupIdRef.current;
    const handler = (newActiveId: PopupId | null) => {
      // 如果有其他 Popup 成为了 active，关闭自己
      if (newActiveId !== id && visible) {
        handleClose();
      }
    };
    singletonListeners.add(handler);
    return () => {
      singletonListeners.delete(handler);
    };
  }, [singleton, visible, handleClose]);

  // ── 统一定位 + 视口裁剪逻辑（供初次定位与地图交互回调共用） ──
  // 将共享逻辑放入 ref，避免重复实现导致行为不一致
  const applyPositionRef = useRef<(x: number, y: number) => void>(() => {});
  applyPositionRef.current = (x: number, y: number) => {
    const el = popupRef.current;
    if (!el) return;

    const rx = Math.round(x);
    const ry = Math.round(y);

    // 获取地图容器实际显示尺寸（注意：popup 渲染在 markerContainer 内，不会被地图自动裁剪，
    // 需要在这里手动判定锚点是否落在地图可视区域内）
    let mapW = 0;
    let mapH = 0;
    try {
      const mapsService = (scene as any)?.mapService;
      const mapContainer = mapsService?.getContainer?.() as HTMLElement | undefined;
      if (mapContainer) {
        const rect = mapContainer.getBoundingClientRect();
        mapW = rect.width || mapContainer.clientWidth || mapContainer.scrollWidth;
        mapH = rect.height || mapContainer.clientHeight || mapContainer.scrollHeight;
      }
    } catch { /* 降级 */ }

    // 计算 popup 自身尺寸（用于 placement 翻转决策）
    const contentEl = el.querySelector('.aimapui-popup-content') as HTMLElement | null;
    const pw = contentEl?.offsetWidth || 320;
    const ph = contentEl?.offsetHeight || 200;

    const { placement, transform: subTransform } = computePlacement(
      rx, ry, pw, ph, mapW, mapH, placementProp, offset,
    );

    setCurrentPlacement(placement);

    el.style.left = '0';
    el.style.top = '0';
    el.style.transform = `translate3d(${rx}px, ${ry}px, 0) ${subTransform}`;

    // ── 视口内判断 ──
    // 修复点：拿不到地图尺寸时不能默认 inView=true，否则被拖出地图后仍会显示。
    // 此时退化为"尝试用 marker 容器尺寸"做兜底，再不济也保持当前可见性不变。
    let inView: boolean;
    if (mapW > 0 && mapH > 0) {
      // 允许一点点 buffer，避免锚点恰好压在边缘时抖动
      const buffer = 2;
      inView = rx >= -buffer && rx <= mapW + buffer && ry >= -buffer && ry <= mapH + buffer;
    } else {
      // 尝试用父容器尺寸兜底
      const parent = el.parentElement;
      if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
        inView = rx >= 0 && rx <= parent.clientWidth && ry >= 0 && ry <= parent.clientHeight;
      } else {
        // 完全拿不到尺寸：保持先前状态，避免一上来就闪烁
        inView = isInViewRef.current;
      }
    }
    isInViewRef.current = inView;
    // 使用 display:none 彻底从布局移除，避免 visibility:hidden 仍残留 GPU 合成层
    el.style.display = inView ? '' : 'none';
  };

  // ── 计算并设置 Popup 位置（初次定位入口） ──
  const updatePopupPosition = useCallback(() => {
    if (!scene) return;
    try {
      const mapsService = (scene as any).mapService;
      const pos = mapsService
        ? mapsService.lngLatToContainer([longitude, latitude])
        : scene.lngLatToContainer([longitude, latitude]);
      if (pos) applyPositionRef.current(pos.x, pos.y);
    } catch {
      // 场景可能未初始化
    }
  }, [scene, longitude, latitude]);

  // 容器或 visible 变化后，Portal DOM 准备就绪，重新定位
  useEffect(() => {
    if (!container || !visible) return;
    // 等待 Portal DOM 挂载完成
    const rafId = requestAnimationFrame(() => {
      updatePopupPosition();
    });
    return () => cancelAnimationFrame(rafId);
  }, [container, visible, updatePopupPosition]);

  // ESC 键关闭
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleClose]);

  // ── 点击地图空白处关闭（L7 unclick） ──
  useEffect(() => {
    if (!visible || !scene) return;
    const handleUnclick = () => {
      handleClose();
    };
    scene.on('unclick', handleUnclick);
    return () => {
      scene.off('unclick', handleUnclick);
    };
  }, [visible, scene, handleClose]);

  // 高性能位置更新 — 地图交互时持续同步（复用 applyPositionRef，避免逻辑漂移）
  useMapPosition(scene, longitude, latitude, (x, y) => {
    applyPositionRef.current(x, y);
  });

  // ── 渲染 ──

  // 不可见时不渲染
  if (!visible || !container) return null;

  // 是否有结构化内容
  const hasStructuredContent = header || attributes || actions;
  const hasCover = !!(header as PopupHeader)?.coverUrl;

  // 根据 placement 决定 Popup wrapper 的 flex 方向
  const isHorizontal = currentPlacement === 'left' || currentPlacement === 'right';

  // 渲染内容
  const renderContent = () => {
    // 简单内容模式（纯文本/HTML/ReactNode）
    if (!hasStructuredContent) {
      if (isHtmlString(content)) {
        return (
          <div className="aimapui-popup-body relative p-4 pt-2 pr-10 text-sm leading-5 text-on-surface break-words whitespace-normal">
            {closeButton && <CloseButton onClick={handleClose} />}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      }
      return (
        <div className="aimapui-popup-body relative p-4 pt-2 pr-10 text-sm leading-5 text-on-surface break-words whitespace-normal">
          {closeButton && <CloseButton onClick={handleClose} />}
          <div>{content ?? ''}</div>
        </div>
      );
    }

    // 结构化内容模式
    return (
      <>
        {/* 封面图 + 封面上的关闭按钮 */}
        {header && hasCover && <CoverImage header={header} onClose={handleClose} />}

        {/* 标题区 */}
        {header && (
          <HeaderSection
            header={header}
            onClose={handleClose}
            hasCover={hasCover}
            showStatusDot={size === 'compact'}
          />
        )}

        {/* 内容区 */}
        <div className={cx('aimapui-popup-body relative p-4 text-sm leading-5 text-on-surface break-words whitespace-normal', !header && closeButton && 'pr-10')}>
          {/* 结构化模式下无 header 时的关闭按钮（绝对定位在内容区右上角） */}
          {!header && closeButton && <CloseButton onClick={handleClose} />}
          {/* 非结构化内容传入时作为 body 补充 */}
          {content && !isHtmlString(content) && typeof content !== 'string' && <div>{content}</div>}
          {content && isHtmlString(content) && (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
          {content && !isHtmlString(content) && typeof content === 'string' && <div>{content}</div>}
          {!content && !attributes?.length && !actions?.length && !header && (
            <div style={{ color: 'var(--color-on-surface-variant)' }}>无内容</div>
          )}

          {/* 属性列表 */}
          {attributes && attributes.length > 0 && (
            <AttributeList
              attributes={attributes}
              size={size}
            />
          )}
        </div>

        {/* 底部操作栏 */}
        {actions && actions.length > 0 && <ActionBar actions={actions} />}
      </>
    );
  };

  // 水平模式下的 wrapper 样式
  const wrapperStyle: React.CSSProperties = isHorizontal
    ? { display: 'flex', alignItems: 'center' }
    : { display: 'flex', flexDirection: 'column', alignItems: 'center' };

  return createPortal(
    <div
      ref={popupRef}
      className={cx('aimapui-popup', `aimapui-popup--${size}`)}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: 'translate(-9999px, -9999px)',
        // 初始隐藏，等待 applyPosition 计算后再显示，避免 (-9999,-9999) 闪烁
        display: 'none',
        zIndex: 30,
        pointerEvents: 'auto',
        ...wrapperStyle,
      }}
    >
      {/* 箭头在上方（Popup 在锚点下方时，箭头在上） */}
      {currentPlacement === 'bottom' && <PopupTip placement={currentPlacement} />}

      {/* 箭头在左侧（Popup 在锚点右侧时，箭头在左） */}
      {currentPlacement === 'right' && <PopupTip placement={currentPlacement} />}

      {/* Popup 内容容器 - MD3 玻璃拟态 */}
      <div className={cx('aimapui-popup-content overflow-hidden rounded-xl', exiting && 'aimapui-popup-content--exit', className)}>
        {renderContent()}
      </div>

      {/* 箭头在下方（Popup 在锚点上方时，箭头在下） */}
      {currentPlacement === 'top' && <PopupTip placement={currentPlacement} />}

      {/* 箭头在右侧（Popup 在锚点左侧时，箭头在右） */}
      {currentPlacement === 'left' && <PopupTip placement={currentPlacement} />}
    </div>,
    container,
  );
}

export default Popup;