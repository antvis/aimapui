/**
 * DrawToolbar — 绘制工具栏独立组件
 *
 * 提供基础绘制工具（点/线/面/圆/矩形）和高级GIS操作工具（编辑/合并/切分）
 * 的可组合工具栏按钮组。可按需使用 DrawBasicToolbar 或 DrawAdvancedToolbar。
 *
 * ```tsx
 * <DrawBasicToolbar activeMode={mode} onModeChange={setMode} />
 * <DrawAdvancedToolbar activeMode={mode} onModeChange={setMode} />
 * ```
 */
import React, { useCallback, useRef, useEffect } from 'react';
import type { DrawMode, DrawToolMode, DrawBasicMode, DrawAdvancedMode } from './draw-types';

// ============================================================
// 工具按钮配置
// ============================================================

interface ToolButton {
  mode: DrawToolMode;
  icon: string;
  title: string;
  label: string;
}

/** 基础绘制工具 — 产生几何要素 */
const BASIC_TOOLS: ToolButton[] = [
  { mode: 'point', icon: 'location_on', title: '点 — 单击放置', label: '点' },
  { mode: 'polyline', icon: 'timeline', title: '线 — 单击添加顶点，双击结束', label: '线' },
  { mode: 'polygon', icon: 'pentagon', title: '面 — 单击添加顶点，双击闭合', label: '面' },
  { mode: 'circle', icon: 'radio_button_unchecked', title: '圆 — 单击圆心，再单击确定半径', label: '圆形' },
  { mode: 'rectangle', icon: 'crop_square', title: '矩形 — 按住拖拽绘制', label: '矩形' },
];

/** 高级 GIS 操作工具 — 对已有要素进行操作 */
const ADVANCED_TOOLS: ToolButton[] = [
  { mode: 'edit', icon: 'edit_square', title: '编辑 — 选中要素后拖拽移动或编辑顶点', label: '编辑' },
  { mode: 'merge', icon: 'call_merge', title: '合并 — 选中2+要素合并为一个', label: '合并' },
  { mode: 'split', icon: 'content_cut', title: '切分 — 绘制切线将要素分割', label: '切分' },
];

// ============================================================
// 公共 Props & Hook
// ============================================================

/** 工具栏通用 Props */
interface ToolbarProps {
  /** 当前活跃模式 */
  activeMode: DrawMode;
  /** 模式切换回调 */
  onModeChange: (mode: DrawMode) => void;
  /** 显示的模式子集（可选，默认全部显示） */
  modes?: DrawToolMode[];
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** tooltip 边界检测 + 定位 Hook */
function useToolbarTooltip() {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const showTooltip = useCallback((e: React.MouseEvent, title: string) => {
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
    el.textContent = title;
    el.style.display = 'block';

    // 先让浏览器计算 tooltip 尺寸
    const tooltipRect = el.getBoundingClientRect();
    const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // 默认放在按钮右侧
    let left = btnRect.right + 8;
    let top = btnRect.top + btnRect.height / 2 - tooltipRect.height / 2;

    // 边界碰撞检测
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 右侧超出 → 放到左侧
    if (left + tooltipRect.width > vw - 4) {
      left = btnRect.left - tooltipRect.width - 8;
    }
    // 左侧也超出 → 放到上方居中
    if (left < 4) {
      left = btnRect.left + btnRect.width / 2 - tooltipRect.width / 2;
      top = btnRect.top - tooltipRect.height - 8;
    }
    // 顶部超出 → 放到下方
    if (top < 4) {
      top = btnRect.bottom + 8;
    }
    // 底部超出 → 放到上方
    if (top + tooltipRect.height > vh - 4) {
      top = btnRect.top - tooltipRect.height - 8;
    }

    el.style.left = `${Math.max(4, left)}px`;
    el.style.top = `${Math.max(4, top)}px`;
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  }, []);

  // 卸载清理
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
// 工具按钮渲染
// ============================================================

function renderToolButtons(
  tools: ToolButton[],
  activeMode: DrawMode,
  onModeClick: (mode: DrawToolMode) => void,
  showTooltip: (e: React.MouseEvent, title: string) => void,
  hideTooltip: () => void,
  btnClassName: string,
) {
  return tools.map((tool) => (
    <button
      key={tool.mode}
      className={`l7-button-control ${btnClassName}${activeMode === tool.mode ? ' l7-button-control--active' : ''}`}
      onClick={() => onModeClick(tool.mode)}
      onMouseEnter={(e) => showTooltip(e, tool.title)}
      onMouseLeave={hideTooltip}
      aria-label={tool.title}
      aria-pressed={activeMode === tool.mode}
    >
      <span className="material-symbols-outlined">{tool.icon}</span>
    </button>
  ));
}

// ============================================================
// DrawBasicToolbar — 基础绘制工具栏
// ============================================================

/** 基础绘制工具栏 — 点/线/面/圆/矩形 */
export const DrawBasicToolbar: React.FC<ToolbarProps> = ({
  activeMode,
  onModeChange,
  modes,
  className,
  style,
}) => {
  const { showTooltip, hideTooltip } = useToolbarTooltip();

  const availableModes = React.useMemo(() => {
    if (!modes) return BASIC_TOOLS;
    return BASIC_TOOLS.filter((tool) => modes!.includes(tool.mode));
  }, [modes]);

  const handleModeClick = useCallback((mode: DrawToolMode) => {
    onModeChange(activeMode === mode ? 'none' : mode);
  }, [activeMode, onModeChange]);

  return (
    <div
      className={`l7-control l7-control-draw l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
      role="toolbar"
      aria-label="基础绘制工具"
    >
      {renderToolButtons(availableModes, activeMode, handleModeClick, showTooltip, hideTooltip, 'l7-draw-tool-btn')}
    </div>
  );
};

// ============================================================
// DrawAdvancedToolbar — 高级GIS操作工具栏
// ============================================================

/** 高级GIS操作工具栏 Props */
interface AdvancedToolbarProps extends ToolbarProps {
  /** 是否有选中要素（控制删除按钮显示） */
  hasSelection?: boolean;
  /** 是否有要素（控制清除按钮显示） */
  hasFeatures?: boolean;
  /** 是否显示删除/清除按钮，默认 true */
  showDelete?: boolean;
  /** 删除选中要素回调 */
  onDeleteSelected?: () => void;
  /** 清除所有要素回调 */
  onClearAll?: () => void;
}

/** 高级GIS操作工具栏 — 编辑/合并/切分 + 删除/清除 */
export const DrawAdvancedToolbar: React.FC<AdvancedToolbarProps> = ({
  activeMode,
  onModeChange,
  modes,
  showDelete = true,
  hasSelection = false,
  hasFeatures = false,
  onDeleteSelected,
  onClearAll,
  className,
  style,
}) => {
  const { showTooltip, hideTooltip } = useToolbarTooltip();

  const availableModes = React.useMemo(() => {
    if (!modes) return ADVANCED_TOOLS;
    return ADVANCED_TOOLS.filter((tool) => modes!.includes(tool.mode));
  }, [modes]);

  const handleModeClick = useCallback((mode: DrawToolMode) => {
    onModeChange(activeMode === mode ? 'none' : mode);
  }, [activeMode, onModeChange]);

  return (
    <div
      className={`l7-control l7-control-draw l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
      role="toolbar"
      aria-label="高级操作工具"
    >
      {renderToolButtons(availableModes, activeMode, handleModeClick, showTooltip, hideTooltip, 'l7-draw-advanced-btn')}

      {showDelete && activeMode === 'edit' && hasSelection && onDeleteSelected && (
        <>
          <div className="l7-draw-separator" />
          <button
            className="l7-button-control l7-draw-action-btn"
            onClick={onDeleteSelected}
            onMouseEnter={(e) => showTooltip(e, '删除选中要素')}
            onMouseLeave={hideTooltip}
            aria-label="删除选中要素"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </>
      )}

      {showDelete && hasFeatures && onClearAll && (
        <button
          className="l7-button-control l7-draw-action-btn"
          onClick={onClearAll}
          onMouseEnter={(e) => showTooltip(e, '清除所有要素')}
          onMouseLeave={hideTooltip}
          aria-label="清除所有要素"
        >
          <span className="material-symbols-outlined">delete_sweep</span>
        </button>
      )}
    </div>
  );
};
