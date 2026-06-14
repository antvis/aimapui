/**
 * DrawControl — 地图绘制控件
 *
 * 支持点/线/面/矩形/圆形的交互式绘制与编辑，遵循项目控件规范：
 * - useMapControl 获取 scene 和 mapsService
 * - useControlContainer 判断是否在 ControlContainer 内
 * - ControlRegistry.mark 注册为控件
 * - Material Design 3 玻璃态风格
 *
 * 工具栏拆分为两个独立组件：
 * - DrawBasicToolbar: 基础绘制+编辑工具（点/线/面/圆/矩形/编辑 + 删除/清除）
 * - DrawAdvancedToolbar: 高级GIS操作（合并/切分）
 *
 * ```tsx
 * <AiMap map={{ basemap: 'gaode' }}>
 *   <DrawControl onDrawCreate={handleCreate} />
 * </AiMap>
 * ```
 */
import React, { useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { useMapControl, type ControlPosition } from '../../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from '../ControlContainer';
import { useDrawInteraction } from './useDrawInteraction';
import { DrawBasicToolbar, DrawAdvancedToolbar } from './DrawToolbar';
import type { DrawControlProps, DrawMode, DrawToolMode, DrawFeature } from './draw-types';

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
  const handleModeChange = useCallback(
    (mode: DrawMode) => {
      setActiveMode(mode);
      draw.setMode(mode);
    },
    [draw],
  );

  // 删除选中要素
  const handleDeleteSelected = useCallback(() => {
    draw.deleteSelectedFeature();
  }, [draw]);

  // 清除所有
  const handleClearAll = useCallback(() => {
    draw.clearAll();
  }, [draw]);

  const hasSelection = draw.selectedFeatureId !== null;
  const hasFeatures = draw.features.length > 0;

  const controlContent = (
    <>
      <DrawBasicToolbar
        activeMode={activeMode}
        onModeChange={handleModeChange}
        modes={modes}
        showDelete={showDelete}
        hasSelection={hasSelection}
        hasFeatures={hasFeatures}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={handleClearAll}
      />
      <DrawAdvancedToolbar
        activeMode={activeMode}
        onModeChange={handleModeChange}
        modes={modes}
      />
    </>
  );

  if (isInContainer) return <div className={className} style={style}>{controlContent}</div>;

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

// 重新导出
export { DrawBasicToolbar, DrawAdvancedToolbar } from './DrawToolbar';
export type { DrawControlProps, DrawMode, DrawToolMode, DrawBasicMode, DrawAdvancedMode, DrawFeature, DrawStyleConfig, DrawSnapConfig } from './draw-types';