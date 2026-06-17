/**
 * AnnotationControl — 地图标注控件
 *
 * 支持 Marker/Highlighter/Text/Note/Link/Image/Video 七种标注工具，
 * 遵循项目控件规范：useMapControl + ControlRegistry + Material Design 3 风格。
 *
 * - 工具栏（topright）：模式切换
 * - 样式面板（topleft）：颜色/透明度/线宽/字号
 * - Text/Link：直接在地图上 inline 输入
 */
import React, { useCallback, useImperativeHandle, forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMapControl } from '../../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from '../ControlContainer';
import { useAnnotationInteraction } from './useAnnotationInteraction';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AnnotationRenderer } from './AnnotationRenderer';
import { AnnotationEditor } from './AnnotationEditor';
import { AnnotationStylePanel } from './AnnotationStylePanel';
import { HighlighterLayer } from './HighlighterLayer';
import type {
  AnnotationControlProps,
  AnnotationControlHandle,
  AnnotationMode,
  AnnotationProperties,
} from './annotation-types';

// ============================================================
// AnnotationControl 组件
// ============================================================

export const AnnotationControl = forwardRef<AnnotationControlHandle, AnnotationControlProps>(
  function AnnotationControl(
    {
      position = 'topright',
      defaultFeatures,
      features: controlledFeatures,
      tools,
      styles,
      onUpload,
      className,
      style,
      onAnnotationCreate,
      onAnnotationUpdate,
      onAnnotationDelete,
      onAnnotationSelect,
      onModeChange,
      onChange,
    },
    ref,
  ) {
    const { scene, mapsService, positionClassName } = useMapControl(position);
    const isInContainer = useControlContainer();
    const highlighterLayerRef = useRef<HighlighterLayer | null>(null);
    const stylePanelContainerRef = useRef<HTMLDivElement | null>(null);

    // 样式面板状态
    const [activeColor, setActiveColor] = useState('#3f51b5');
    const [activeOpacity, setActiveOpacity] = useState(0.5);
    const [activeStrokeWidth, setActiveStrokeWidth] = useState(8);
    const [activeFontSize, setActiveFontSize] = useState(14);

    const annotation = useAnnotationInteraction({
      scene,
      mapsService,
      defaultFeatures,
      features: controlledFeatures,
      styles,
      onUpload,
      onAnnotationCreate,
      onAnnotationUpdate,
      onAnnotationDelete,
      onAnnotationSelect,
      onModeChange,
      onChange,
      // 传入活跃样式，让新创建的标注继承面板设置
      activeColor,
      activeOpacity,
      activeStrokeWidth,
      activeFontSize,
    });

    useImperativeHandle(ref, () => ({
      setMode: annotation.setMode,
      addAnnotation: annotation.addFeature,
      updateAnnotation: annotation.updateFeature,
      deleteAnnotation: annotation.deleteFeature,
      clearAll: annotation.clearAll,
      getAnnotations: annotation.getFeatures,
      selectAnnotation: annotation.selectFeature,
    }), [annotation]);

    const handleModeChange = useCallback((mode: AnnotationMode) => {
      annotation.setMode(mode);
    }, [annotation]);

    const handleDeleteSelected = useCallback(() => {
      if (annotation.selectedFeatureId) {
        annotation.deleteFeature(annotation.selectedFeatureId);
      }
    }, [annotation]);

    const handleClearAll = useCallback(() => {
      annotation.clearAll();
    }, [annotation]);

    // Inline 编辑完成回调（text/link）
    const handleInlineCommit = useCallback((id: string, properties: Partial<AnnotationProperties>) => {
      annotation.updateFeature(id, properties);
      annotation.closeEditor();
    }, [annotation]);

    const handleInlineCancel = useCallback((id: string) => {
      // 如果标注内容为空则删除
      const feature = annotation.getFeatures().find((f) => f.id === id);
      if (feature) {
        const aType = feature.properties.annotationType;
        const isEmpty = aType === 'text'
          ? !(feature.properties as any).text
          : !(feature.properties as any).url;
        if (isEmpty) {
          annotation.deleteFeature(id);
        }
      }
      annotation.closeEditor();
    }, [annotation]);

    // 图片缩放
    const handleResize = useCallback((id: string, width: number, height: number) => {
      annotation.updateFeature(id, { width, height } as any);
    }, [annotation]);

    // 管理 HighlighterLayer
    useEffect(() => {
      if (!scene) return;
      highlighterLayerRef.current = new HighlighterLayer(scene);
      return () => {
        highlighterLayerRef.current?.destroy();
        highlighterLayerRef.current = null;
      };
    }, [scene]);

    useEffect(() => {
      if (!highlighterLayerRef.current) return;
      highlighterLayerRef.current.updateCompleted(annotation.features);
    }, [annotation.features]);

    useEffect(() => {
      if (!highlighterLayerRef.current) return;
      highlighterLayerRef.current.updateDrawing(annotation.currentStrokeVertices);
    }, [annotation.currentStrokeVertices]);

    // 光标样式
    useEffect(() => {
      if (!mapsService) return;
      const container = mapsService.getMapContainer?.();
      if (!container) return;

      const mode = annotation.mode;
      if (mode !== 'select' && mode !== 'none') {
        container.style.cursor = 'crosshair';
      } else {
        container.style.cursor = '';
      }
      return () => { container.style.cursor = ''; };
    }, [annotation.mode, mapsService]);

    // 创建样式面板的 DOM 容器（挂到地图 topleft 控件区域）
    useEffect(() => {
      if (!mapsService) return;
      const mapContainer = mapsService.getMapContainer?.() as HTMLElement | null;
      if (!mapContainer) return;

      const panel = document.createElement('div');
      panel.className = 'aimapui-style-panel-anchor';
      panel.style.cssText = 'position:absolute;top:10px;left:10px;z-index:10;pointer-events:auto;';
      mapContainer.appendChild(panel);
      stylePanelContainerRef.current = panel;

      return () => {
        panel.parentElement?.removeChild(panel);
        stylePanelContainerRef.current = null;
      };
    }, [mapsService]);

    const hasSelection = annotation.selectedFeatureId !== null;
    const hasFeatures = annotation.features.length > 0;

    const selectedFeature = annotation.selectedFeatureId
      ? annotation.features.find((f) => f.id === annotation.selectedFeatureId) ?? null
      : null;

    const editingFeature = annotation.editingFeatureId
      ? annotation.features.find((f) => f.id === annotation.editingFeatureId)
      : undefined;

    // text/link 用 inline 编辑，其他类型用 AnnotationEditor 弹层
    const useInlineEditor = editingFeature &&
      (editingFeature.properties.annotationType === 'text' || editingFeature.properties.annotationType === 'link');
    const usePopupEditor = editingFeature && !useInlineEditor;

    const controlContent = (
      <>
        <AnnotationToolbar
          activeMode={annotation.mode}
          onModeChange={handleModeChange}
          tools={tools}
          hasSelection={hasSelection}
          hasFeatures={hasFeatures}
          onDeleteSelected={handleDeleteSelected}
          onClearAll={handleClearAll}
        />
        <AnnotationRenderer
          features={annotation.features}
          selectedId={annotation.selectedFeatureId}
          editingId={annotation.editingFeatureId}
          scene={scene}
          mapsService={mapsService}
          styles={styles}
          onSelect={annotation.selectFeature}
          onDoubleClick={annotation.openEditor}
          onMove={annotation.moveFeature}
          onInlineCommit={handleInlineCommit}
          onInlineCancel={handleInlineCancel}
          onResize={handleResize}
        />
        {usePopupEditor && (
          <AnnotationEditor
            feature={editingFeature}
            scene={scene}
            mapsService={mapsService}
            onSave={annotation.updateFeature}
            onCancel={annotation.closeEditor}
            onDelete={annotation.deleteFeature}
            onUpload={onUpload}
          />
        )}
      </>
    );

    // 样式面板通过 portal 渲染到地图 topleft
    const stylePanel = stylePanelContainerRef.current ? createPortal(
      <AnnotationStylePanel
        mode={annotation.mode}
        selectedFeature={selectedFeature}
        activeColor={activeColor}
        activeOpacity={activeOpacity}
        activeStrokeWidth={activeStrokeWidth}
        activeFontSize={activeFontSize}
        onColorChange={setActiveColor}
        onOpacityChange={setActiveOpacity}
        onStrokeWidthChange={setActiveStrokeWidth}
        onFontSizeChange={setActiveFontSize}
        onUpdateFeature={annotation.updateFeature}
      />,
      stylePanelContainerRef.current,
    ) : null;

    if (isInContainer) {
      return (
        <>
          <div className={className} style={style}>{controlContent}</div>
          {stylePanel}
        </>
      );
    }

    return (
      <>
        <div className={`l7-control-anchor ${positionClassName}`}>
          {controlContent}
        </div>
        {stylePanel}
      </>
    );
  },
);

ControlRegistry.mark(AnnotationControl);

export default AnnotationControl;

export { AnnotationToolbar } from './AnnotationToolbar';
export { useAnnotationInteraction } from './useAnnotationInteraction';
export type {
  AnnotationControlProps,
  AnnotationControlHandle,
  AnnotationMode,
  AnnotationToolMode,
  AnnotationType,
  AnnotationFeature,
  AnnotationProperties,
  AnnotationStyleConfig,
  MarkerAnnotationProperties,
  HighlighterAnnotationProperties,
  TextAnnotationProperties,
  NoteAnnotationProperties,
  LinkAnnotationProperties,
  ImageAnnotationProperties,
  VideoAnnotationProperties,
} from './annotation-types';
