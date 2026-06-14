/**
 * DrawControl — 地图绘制控件
 *
 * 支持点/线/面/矩形/圆形的交互式绘制与编辑，遵循项目控件规范：
 * - useMapControl 获取 scene 和 mapsService
 * - useControlContainer 判断是否在 ControlContainer 内
 * - ControlRegistry.mark 注册为控件
 * - Material Design 3 玻璃态风格
 *
 * ```tsx
 * <AiMap map={{ basemap: 'gaode' }}>
 *   <DrawControl
 *     onDrawCreate={(features) => console.log('Created:', features)}
 *     onDrawUpdate={(feature) => console.log('Updated:', feature)}
 *   />
 * </AiMap>
 * ```
 */
import React, { useCallback, useMemo, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useMapControl, type ControlPosition } from '../../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from '../ControlContainer';
import { useDrawInteraction, type UseDrawInteractionResult } from './useDrawInteraction';
import type { DrawControlProps, DrawMode, DrawToolMode, DrawBasicMode, DrawAdvancedMode, DrawFeature, DrawStyleConfig } from './draw-types';

// ============================================================
// 工具栏按钮配置
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
// DrawControl 组件
// ============================================================

export const DrawControl = forwardRef<DrawControlHandle, DrawControlProps>(function DrawControl(
  {
    position = 'topright',
    defaultFeatures,
    features: controlledFeatures,
    modes,
    showDelete = true,
    styles,
    snap,
    className,
    style,
    onDrawCreate,
    onDrawUpdate,
    onDrawDelete,
    onDrawSelect,
    onModeChange,
    onChange,
  },
  ref,
) {
  const { scene, mapsService, positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();

  // 绘制交互 Hook
  const draw = useDrawInteraction({
    scene,
    mapsService,
    styles,
    snap,
    defaultFeatures,
    features: controlledFeatures,
    onDrawCreate,
    onDrawUpdate,
    onDrawDelete,
    onDrawSelect,
    onModeChange,
    onChange,
  });

  // 活跃模式状态（用于 UI 高亮）
  const [activeMode, setActiveMode] = useState<DrawMode>('none');

  // 可用的工具模式
  const availableBasicModes = useMemo(() => {
    if (!modes) return BASIC_TOOLS;
    return BASIC_TOOLS.filter((tool) => modes!.includes(tool.mode));
  }, [modes]);

  const availableAdvancedModes = useMemo(() => {
    if (!modes) return ADVANCED_TOOLS;
    return ADVANCED_TOOLS.filter((tool) => modes!.includes(tool.mode));
  }, [modes]);

  // 暴露命令式 API
  useImperativeHandle(ref, () => ({
    setMode: draw.setMode,
    addFeatures: draw.addFeatures,
    deleteFeature: draw.deleteFeature,
    clearAll: draw.clearAll,
    getFeatures: draw.getFeatures,
    selectFeature: draw.selectFeature,
  }), [draw]);

  // 模式切换处理
  const handleModeClick = useCallback(
    (mode: DrawToolMode) => {
      const newMode: DrawMode = activeMode === mode ? 'none' : mode;
      setActiveMode(newMode);
      draw.setMode(newMode);
    },
    [activeMode, draw],
  );

  // 删除选中要素
  const handleDeleteSelected = useCallback(() => {
    draw.deleteSelectedFeature();
  }, [draw]);

  // 清除所有
  const handleClearAll = useCallback(() => {
    draw.clearAll();
  }, [draw]);

  // 是否有选中要素（编辑模式下）
  const hasSelection = draw.selectedFeatureId !== null;
  // 是否有要素
  const hasFeatures = draw.features.length > 0;

  // 工具栏按钮 hover tooltip（原生 title 太慢且不统一，使用自定义实现）
  const toolbarTooltipRef = useRef<HTMLDivElement | null>(null);

  const handleToolMouseEnter = useCallback((e: React.MouseEvent, tool: ToolButton) => {
    if (!toolbarTooltipRef.current) {
      const el = document.createElement('div');
      el.style.cssText = [
        'position:fixed', 'pointer-events:none', 'z-index:9999',
        'padding:5px 10px', 'border-radius:4px',
        'background:rgba(26,27,34,0.92)', 'color:#f2eff9',
        'font:500 11px/16px "JetBrains Mono",monospace',
        'white-space:nowrap', 'box-shadow:0 2px 8px rgba(0,0,0,0.3)',
      ].join(';');
      document.body.appendChild(el);
      toolbarTooltipRef.current = el;
    }
    const el = toolbarTooltipRef.current;
    el.textContent = tool.title;
    el.style.display = 'block';
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    el.style.left = `${rect.right + 8}px`;
    el.style.top = `${rect.top + rect.height / 2 - 12}px`;
  }, []);

  const handleToolMouseLeave = useCallback(() => {
    if (toolbarTooltipRef.current) {
      toolbarTooltipRef.current.style.display = 'none';
    }
  }, []);

  // 组件卸载时清理
  React.useEffect(() => {
    return () => {
      if (toolbarTooltipRef.current) {
        toolbarTooltipRef.current.parentElement?.removeChild(toolbarTooltipRef.current);
        toolbarTooltipRef.current = null;
      }
    };
  }, []);

  const controlContent = (
    <div
      className={`l7-control l7-control-draw l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
      role="toolbar"
      aria-label="绘制工具栏"
    >
      {/* 基础绘制工具 */}
      {availableBasicModes.map((tool) => (
        <button
          key={tool.mode}
          className={`l7-button-control l7-draw-tool-btn${activeMode === tool.mode ? ' l7-button-control--active' : ''}`}
          onClick={() => handleModeClick(tool.mode)}
          onMouseEnter={(e) => handleToolMouseEnter(e, tool)}
          onMouseLeave={handleToolMouseLeave}
          aria-label={tool.title}
          aria-pressed={activeMode === tool.mode}
        >
          <span className="material-symbols-outlined">{tool.icon}</span>
        </button>
      ))}

      {/* 分隔线：基础 ↔ 高级 */}
      {availableAdvancedModes.length > 0 && (
        <div className="l7-draw-separator" />
      )}

      {/* 高级 GIS 操作工具 */}
      {availableAdvancedModes.map((tool) => (
        <button
          key={tool.mode}
          className={`l7-button-control l7-draw-advanced-btn${activeMode === tool.mode ? ' l7-button-control--active' : ''}`}
          onClick={() => handleModeClick(tool.mode)}
          onMouseEnter={(e) => handleToolMouseEnter(e, tool)}
          onMouseLeave={handleToolMouseLeave}
          aria-label={tool.title}
          aria-pressed={activeMode === tool.mode}
        >
          <span className="material-symbols-outlined">{tool.icon}</span>
        </button>
      ))}

      {showDelete && activeMode === 'edit' && hasSelection && (
        <>
          <div className="l7-draw-separator" />
          <button
            className="l7-button-control l7-draw-action-btn"
            onClick={handleDeleteSelected}
            title="删除选中要素"
            aria-label="删除选中要素"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </>
      )}

      {showDelete && hasFeatures && (
        <button
          className="l7-button-control l7-draw-action-btn"
            onClick={handleClearAll}
            title="清除所有要素"
            aria-label="清除所有要素"
          >
            <span className="material-symbols-outlined">delete_sweep</span>
          </button>
      )}
    </div>
  );

  if (isInContainer) return controlContent;

  return (
    <div className={`l7-control-anchor ${positionClassName}`}>
      {controlContent}
    </div>
  );
});

// 注册为控件类型，供 ControlContainer 识别
ControlRegistry.mark(DrawControl);

export default DrawControl;

// ============================================================
// 命令式 API Handle
// ============================================================

export interface DrawControlHandle {
  setMode: (mode: DrawMode) => void;
  addFeatures: (features: DrawFeature[]) => void;
  deleteFeature: (id: string) => void;
  clearAll: () => void;
  getFeatures: () => DrawFeature[];
  selectFeature: (id: string | null) => void;
}

// 重新导出类型
export type { DrawControlProps, DrawMode, DrawToolMode, DrawFeature, DrawStyleConfig, DrawSnapConfig } from './draw-types';