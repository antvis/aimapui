/**
 * PlotControl — 态势标绘控件
 */
import React, { useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { useMapControl, useControlContainer, ControlRegistry } from '@antv/aimapui';
import { usePlotInteraction, getTooltipText, clientXFromEvent, clientYFromEvent } from './usePlotInteraction';
import { PlotToolbar } from './PlotToolbar';
import { PlotLayerManager } from './PlotLayerManager';
import type { PlotControlProps, PlotControlHandle, PlotMode } from './plot-types';

export const PlotControl = forwardRef<PlotControlHandle, PlotControlProps>(
  function PlotControl(
    {
      position = 'topright',
      defaultFeatures,
      features: controlledFeatures,
      tools,
      styles,
      className,
      style,
      onPlotCreate,
      onPlotUpdate,
      onPlotDelete,
      onPlotSelect,
      onModeChange,
      onChange,
    },
    ref,
  ) {
    const { scene, mapsService, positionClassName } = useMapControl(position as any);
    const isInContainer = useControlContainer();
    const layerManagerRef = useRef<PlotLayerManager | null>(null);

    const plot = usePlotInteraction({
      scene,
      mapsService,
      defaultFeatures,
      features: controlledFeatures,
      onPlotCreate,
      onPlotUpdate,
      onPlotDelete,
      onPlotSelect,
      onModeChange,
      onChange,
    });

    useImperativeHandle(ref, () => ({
      setMode: plot.setMode,
      addFeature: () => { /* TODO */ },
      deleteFeature: plot.deleteFeature,
      clearAll: plot.clearAll,
      getFeatures: plot.getFeatures,
      selectFeature: plot.selectFeature,
    }), [plot]);

    const handleModeChange = useCallback((mode: PlotMode) => { plot.setMode(mode); }, [plot]);
    const handleDeleteSelected = useCallback(() => {
      if (plot.selectedFeatureId) plot.deleteFeature(plot.selectedFeatureId);
    }, [plot]);
    const handleClearAll = useCallback(() => { plot.clearAll(); }, [plot]);

    // L7 层管理
    useEffect(() => {
      if (!scene) return;
      layerManagerRef.current = new PlotLayerManager(scene);
      return () => { layerManagerRef.current?.destroy(); layerManagerRef.current = null; };
    }, [scene]);

    // 同步已完成图形
    useEffect(() => {
      layerManagerRef.current?.updateFeatures(plot.features, plot.selectedFeatureId);
    }, [plot.features, plot.selectedFeatureId]);

    // 同步绘制预览（rubber-band）
    useEffect(() => {
      const mgr = layerManagerRef.current;
      if (!mgr) return;
      if (plot.mode !== 'select' && plot.mode !== 'edit' && plot.mode !== 'none') {
        mgr.updatePreview(plot.mode, plot.currentControlPoints, plot.mousePoint);
      } else {
        mgr.updatePreview('', [], null);
      }
    }, [plot.mode, plot.currentControlPoints, plot.mousePoint]);

    // tooltip — 跟随鼠标
    useEffect(() => {
      if (!scene) return;
      const mgr = layerManagerRef.current;
      if (!mgr) return;

      const handleMove = (e: Record<string, unknown>) => {
        const tip = getTooltipText(
          plot.mode,
          plot.currentControlPoints.length,
          plot.selectedFeatureId !== null,
        );
        if (tip) {
          mgr.showTooltip(tip.text, clientXFromEvent(e), clientYFromEvent(e), tip.shortcuts);
        } else {
          mgr.hideTooltip();
        }
      };

      scene.on('mousemove', handleMove);
      return () => {
        scene.off('mousemove', handleMove);
        mgr.hideTooltip();
      };
    }, [scene, plot.mode, plot.currentControlPoints.length, plot.selectedFeatureId]);

    // 光标
    useEffect(() => {
      if (!mapsService) return;
      const container = mapsService.getMapContainer?.();
      if (!container) return;
      if (plot.isDragging) {
        container.style.cursor = 'grabbing';
      } else if (plot.mode === 'edit') {
        container.style.cursor = plot.selectedFeatureId ? 'grab' : 'pointer';
      } else if (plot.mode !== 'select' && plot.mode !== 'none') {
        container.style.cursor = 'crosshair';
      } else {
        container.style.cursor = '';
      }
      return () => { container.style.cursor = ''; };
    }, [plot.mode, plot.isDragging, mapsService]);

    const controlContent = (
      <PlotToolbar
        activeMode={plot.mode}
        onModeChange={handleModeChange}
        tools={tools}
        hasSelection={plot.selectedFeatureId !== null}
        hasFeatures={plot.features.length > 0}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={handleClearAll}
      />
    );

    if (isInContainer) return <div className={className} style={style}>{controlContent}</div>;

    return (
      <div className={`l7-control-anchor ${positionClassName}`}>
        {controlContent}
      </div>
    );
  },
);

ControlRegistry.mark(PlotControl);

export default PlotControl;
