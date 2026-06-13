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
import React, { useCallback, useMemo, useState, useImperativeHandle, forwardRef } from 'react';
import { useMapControl, type ControlPosition } from '../../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from '../ControlContainer';
import { useDrawInteraction, type UseDrawInteractionResult } from './useDrawInteraction';
import type { DrawControlProps, DrawMode, DrawToolMode, DrawFeature, DrawStyleConfig } from './draw-types';

// ============================================================
// 工具栏按钮配置
// ============================================================

interface ToolButton {
  mode: DrawToolMode;
  icon: string;
  title: string;
  label: string;
}

const DRAW_TOOLS: ToolButton[] = [
  { mode: 'point', icon: 'location_on', title: '绘制点', label: '点' },
  { mode: 'polyline', icon: 'timeline', title: '绘制折线', label: '线' },
  { mode: 'polygon', icon: 'pentagon', title: '绘制多边形', label: '面' },
  { mode: 'circle', icon: 'radio_button_unchecked', title: '绘制圆形', label: '圆形' },
  { mode: 'rectangle', icon: 'crop_square', title: '绘制矩形', label: '矩形' },
  { mode: 'edit', icon: 'edit_square', title: '编辑要素', label: '编辑' },
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
  const availableModes = useMemo(() => {
    if (!modes) return DRAW_TOOLS;
    return DRAW_TOOLS.filter((tool) => modes!.includes(tool.mode));
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

  const controlContent = (
    <div
      className={`l7-control l7-control-draw l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
      role="toolbar"
      aria-label="绘制工具栏"
    >
      {availableModes.map((tool) => (
        <button
          key={tool.mode}
          className={`l7-button-control l7-draw-tool-btn${activeMode === tool.mode ? ' l7-button-control--active' : ''}`}
          onClick={() => handleModeClick(tool.mode)}
          title={tool.title}
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
export type { DrawControlProps, DrawMode, DrawToolMode, DrawFeature, DrawStyleConfig } from './draw-types';