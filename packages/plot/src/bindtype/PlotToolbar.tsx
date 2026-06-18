/**
 * PlotToolbar — 标绘工具栏
 */
import React, { useCallback, useRef, useEffect } from 'react';
import type { PlotMode, PlotToolMode } from './plot-types';

interface ToolButton {
  mode: PlotToolMode;
  icon: string;
  title: string;
}

const PLOT_TOOLS: ToolButton[] = [
  { mode: 'select', icon: 'pan_tool', title: '选择 — 点击选中' },
  { mode: 'rectangle', icon: 'crop_square', title: '矩形区域 — 对角点绘制' },
  { mode: 'circle', icon: 'radio_button_unchecked', title: '圆形区域 — 圆心+边界' },
  { mode: 'sector', icon: 'pie_chart', title: '扇形区域 — 圆心+两条边' },
  { mode: 'straight-arrow', icon: 'arrow_right_alt', title: '直线箭头 — 起点→终点' },
  { mode: 'curve-arrow', icon: 'turn_right', title: '曲线箭头 — 多点控制曲线' },
  { mode: 'edit', icon: 'edit', title: '编辑 — 拖拽控制点修改形状' },
];

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

    const tooltipRect = el.getBoundingClientRect();
    const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let left = btnRect.left - tooltipRect.width - 8;
    let top = btnRect.top + btnRect.height / 2 - tooltipRect.height / 2;
    if (left < 4) left = btnRect.right + 8;
    if (top < 4) top = btnRect.bottom + 8;
    el.style.left = `${Math.max(4, left)}px`;
    el.style.top = `${Math.max(4, top)}px`;
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.display = 'none';
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

interface PlotToolbarProps {
  activeMode: PlotMode;
  onModeChange: (mode: PlotMode) => void;
  tools?: PlotToolMode[];
  hasSelection?: boolean;
  hasFeatures?: boolean;
  onDeleteSelected?: () => void;
  onClearAll?: () => void;
}

export const PlotToolbar: React.FC<PlotToolbarProps> = ({
  activeMode,
  onModeChange,
  tools,
  hasSelection = false,
  hasFeatures = false,
  onDeleteSelected,
  onClearAll,
}) => {
  const { showTooltip, hideTooltip } = useToolbarTooltip();

  const availableTools = React.useMemo(() => {
    if (!tools) return PLOT_TOOLS;
    return PLOT_TOOLS.filter((t) => tools.includes(t.mode));
  }, [tools]);

  const handleClick = useCallback((mode: PlotToolMode) => {
    onModeChange(mode === 'select' ? 'select' : (activeMode === mode ? 'select' : mode));
  }, [activeMode, onModeChange]);

  return (
    <div className="l7-control l7-control-plot l7-control--glass" role="toolbar" aria-label="标绘工具">
      {availableTools.map((tool) => (
        <button
          key={tool.mode}
          className={`l7-button-control l7-plot-tool-btn${activeMode === tool.mode ? ' l7-button-control--active' : ''}`}
          onClick={() => handleClick(tool.mode)}
          onMouseEnter={(e) => showTooltip(e, tool.title)}
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
            className="l7-button-control"
            onClick={onDeleteSelected}
            onMouseEnter={(e) => showTooltip(e, '删除选中')}
            onMouseLeave={hideTooltip}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </>
      )}
      {hasFeatures && onClearAll && (
        <button
          className="l7-button-control"
          onClick={onClearAll}
          onMouseEnter={(e) => showTooltip(e, '清除全部')}
          onMouseLeave={hideTooltip}
        >
          <span className="material-symbols-outlined">delete_sweep</span>
        </button>
      )}
    </div>
  );
};
