/**
 * AnnotationToolbar — 标注工具栏
 *
 * 提供标注工具按钮组：选择/标记/高亮/文字/笔记/链接/图片/视频
 */
import React, { useCallback, useRef, useEffect } from 'react';
import type { AnnotationMode, AnnotationToolMode } from './annotation-types';

// ============================================================
// 工具按钮配置
// ============================================================

interface ToolButton {
  mode: AnnotationToolMode;
  icon: string;
  title: string;
  shortcut: string;
}

const ANNOTATION_TOOLS: ToolButton[] = [
  { mode: 'select', icon: 'pan_tool', title: '选择 — 点击标注选中/拖拽移动', shortcut: 'Esc' },
  { mode: 'marker', icon: 'location_on', title: '标记 — 单击放置地图钉', shortcut: 'M' },
  { mode: 'highlighter', icon: 'ink_highlighter', title: '高亮 — 按住拖拽手绘', shortcut: 'H' },
  { mode: 'text', icon: 'title', title: '文字 — 单击放置文字标签', shortcut: 'T' },
  { mode: 'note', icon: 'sticky_note_2', title: '笔记 — 单击放置富文本笔记', shortcut: 'N' },
  { mode: 'link', icon: 'link', title: '链接 — 单击放置链接', shortcut: 'K' },
  { mode: 'image', icon: 'image', title: '图片 — 单击放置图片', shortcut: 'I' },
  { mode: 'video', icon: 'videocam', title: '视频 — 单击放置视频', shortcut: 'V' },
];

// ============================================================
// Tooltip Hook
// ============================================================

function useToolbarTooltip() {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const showTooltip = useCallback((e: React.MouseEvent, title: string, shortcut: string) => {
    if (!tooltipRef.current) {
      const el = document.createElement('div');
      el.style.cssText = [
        'position:fixed', 'pointer-events:none', 'z-index:9999',
        'padding:5px 10px', 'border-radius:4px',
        'background:rgba(26,27,34,0.92)', 'color:#f2eff9',
        'font:500 11px/16px "JetBrains Mono",monospace',
        'white-space:nowrap', 'box-shadow:0 2px 8px rgba(0,0,0,0.3)',
      ].join(';');
      document.body.appendChild(el);
      tooltipRef.current = el;
    }

    const el = tooltipRef.current;
    el.textContent = `${title}  ${shortcut}`;
    el.style.display = 'block';

    const tooltipRect = el.getBoundingClientRect();
    const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // 以地图容器为边界，而非 viewport
    const mapContainer = (e.currentTarget as HTMLElement).closest('.l7-map-container, [id*="map"]')?.getBoundingClientRect();
    const bounds = mapContainer ?? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    const boundsRight = 'right' in bounds ? bounds.right : window.innerWidth;
    const boundsBottom = 'bottom' in bounds ? bounds.bottom : window.innerHeight;
    const boundsLeft = bounds.left;
    const boundsTop = bounds.top;

    // 默认放在按钮左侧（工具栏在右侧时更合理）
    let left = btnRect.left - tooltipRect.width - 8;
    let top = btnRect.top + btnRect.height / 2 - tooltipRect.height / 2;

    // 左侧放不下 → 放到右侧
    if (left < boundsLeft + 4) {
      left = btnRect.right + 8;
    }
    // 右侧也超出 → 上方居中
    if (left + tooltipRect.width > boundsRight - 4) {
      left = btnRect.left + btnRect.width / 2 - tooltipRect.width / 2;
      top = btnRect.top - tooltipRect.height - 8;
    }
    if (top < boundsTop + 4) {
      top = btnRect.bottom + 8;
    }
    if (top + tooltipRect.height > boundsBottom - 4) {
      top = btnRect.top - tooltipRect.height - 8;
    }

    el.style.left = `${Math.max(boundsLeft + 4, Math.min(left, boundsRight - tooltipRect.width - 4))}px`;
    el.style.top = `${Math.max(boundsTop + 4, Math.min(top, boundsBottom - tooltipRect.height - 4))}px`;
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  }, []);

  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.parentElement?.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  return { showTooltip, hideTooltip };
}

// ============================================================
// Props
// ============================================================

interface AnnotationToolbarProps {
  activeMode: AnnotationMode;
  onModeChange: (mode: AnnotationMode) => void;
  tools?: AnnotationToolMode[];
  hasSelection?: boolean;
  hasFeatures?: boolean;
  onDeleteSelected?: () => void;
  onClearAll?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================
// AnnotationToolbar
// ============================================================

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeMode,
  onModeChange,
  tools,
  hasSelection = false,
  hasFeatures = false,
  onDeleteSelected,
  onClearAll,
  className,
  style,
}) => {
  const { showTooltip, hideTooltip } = useToolbarTooltip();

  const availableTools = React.useMemo(() => {
    if (!tools) return ANNOTATION_TOOLS;
    return ANNOTATION_TOOLS.filter((tool) => tools.includes(tool.mode));
  }, [tools]);

  const handleModeClick = useCallback((mode: AnnotationToolMode) => {
    if (mode === 'select') {
      onModeChange('select');
    } else {
      onModeChange(activeMode === mode ? 'select' : mode);
    }
  }, [activeMode, onModeChange]);

  return (
    <div
      className={`l7-control l7-control-annotation l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
      role="toolbar"
      aria-label="标注工具"
    >
      {availableTools.map((tool) => (
        <button
          key={tool.mode}
          className={`l7-button-control l7-annotation-tool-btn${activeMode === tool.mode ? ' l7-button-control--active' : ''}`}
          onClick={() => handleModeClick(tool.mode)}
          onMouseEnter={(e) => showTooltip(e, tool.title, tool.shortcut)}
          onMouseLeave={hideTooltip}
          aria-label={tool.title}
          aria-pressed={activeMode === tool.mode}
        >
          <span className="material-symbols-outlined">{tool.icon}</span>
        </button>
      ))}

      {hasSelection && onDeleteSelected && (
        <>
          <div className="l7-draw-separator" />
          <button
            className="l7-button-control l7-annotation-action-btn"
            onClick={onDeleteSelected}
            onMouseEnter={(e) => showTooltip(e, '删除选中标注', 'Del')}
            onMouseLeave={hideTooltip}
            aria-label="删除选中标注"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </>
      )}

      {hasFeatures && onClearAll && (
        <button
          className="l7-button-control l7-annotation-action-btn"
          onClick={onClearAll}
          onMouseEnter={(e) => showTooltip(e, '清除所有标注', '')}
          onMouseLeave={hideTooltip}
          aria-label="清除所有标注"
        >
          <span className="material-symbols-outlined">delete_sweep</span>
        </button>
      )}
    </div>
  );
};

// 快捷键映射
export const ANNOTATION_SHORTCUT_MAP: Record<string, AnnotationToolMode> = {
  m: 'marker',
  h: 'highlighter',
  t: 'text',
  n: 'note',
  k: 'link',
  i: 'image',
  v: 'video',
  Escape: 'select',
};
