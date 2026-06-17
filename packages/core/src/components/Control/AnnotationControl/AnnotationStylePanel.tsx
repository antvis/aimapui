/**
 * AnnotationStylePanel — 标注样式面板
 *
 * 左上角显示，根据当前模式/选中标注类型展示对应样式编辑器：
 * - 颜色色板
 * - 透明度滑块（highlighter）
 * - 线宽滑块（highlighter）
 * - 字号选择（text）
 */
import React, { useCallback } from 'react';
import type { AnnotationMode, AnnotationFeature, AnnotationProperties } from './annotation-types';
import { ANNOTATION_COLORS } from './annotation-styles';

// ============================================================
// Props
// ============================================================

interface AnnotationStylePanelProps {
  mode: AnnotationMode;
  selectedFeature: AnnotationFeature | null;
  /** 当前绘制使用的颜色 */
  activeColor: string;
  activeOpacity: number;
  activeStrokeWidth: number;
  activeFontSize: number;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onStrokeWidthChange: (width: number) => void;
  onFontSizeChange: (size: number) => void;
  /** 更新已选中标注的属性 */
  onUpdateFeature?: (id: string, props: Partial<AnnotationProperties>) => void;
}

// ============================================================
// 子组件
// ============================================================

const ColorSwatches: React.FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ value, onChange }) => (
  <div className="aimapui-style-panel-row">
    <span className="aimapui-style-panel-label">颜色</span>
    <div className="aimapui-style-panel-swatches">
      {ANNOTATION_COLORS.map((c) => (
        <button
          key={c}
          className={`aimapui-style-panel-swatch${value === c ? ' aimapui-style-panel-swatch--active' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={c}
        />
      ))}
    </div>
  </div>
);

const SliderRow: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, unit = '', onChange }) => (
  <div className="aimapui-style-panel-row">
    <span className="aimapui-style-panel-label">{label}</span>
    <input
      type="range"
      className="aimapui-style-panel-slider"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <span className="aimapui-style-panel-value">{value}{unit}</span>
  </div>
);

// ============================================================
// 面板内容选择
// ============================================================

function getRelevantType(mode: AnnotationMode, feature: AnnotationFeature | null): string | null {
  if (feature) return feature.properties.annotationType;
  if (mode === 'select' || mode === 'none') return null;
  return mode;
}

// ============================================================
// AnnotationStylePanel
// ============================================================

export const AnnotationStylePanel: React.FC<AnnotationStylePanelProps> = ({
  mode,
  selectedFeature,
  activeColor,
  activeOpacity,
  activeStrokeWidth,
  activeFontSize,
  onColorChange,
  onOpacityChange,
  onStrokeWidthChange,
  onFontSizeChange,
  onUpdateFeature,
}) => {
  const type = getRelevantType(mode, selectedFeature);

  // 如果选中了标注，修改颜色时同时更新该标注
  const handleColorChange = useCallback((color: string) => {
    onColorChange(color);
    if (selectedFeature && onUpdateFeature) {
      onUpdateFeature(selectedFeature.id, { color } as any);
    }
  }, [onColorChange, selectedFeature, onUpdateFeature]);

  const handleOpacityChange = useCallback((opacity: number) => {
    onOpacityChange(opacity);
    if (selectedFeature?.properties.annotationType === 'highlighter' && onUpdateFeature) {
      onUpdateFeature(selectedFeature.id, { strokeOpacity: opacity } as any);
    }
  }, [onOpacityChange, selectedFeature, onUpdateFeature]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    onStrokeWidthChange(width);
    if (selectedFeature?.properties.annotationType === 'highlighter' && onUpdateFeature) {
      onUpdateFeature(selectedFeature.id, { strokeWidth: width } as any);
    }
  }, [onStrokeWidthChange, selectedFeature, onUpdateFeature]);

  const handleFontSizeChange = useCallback((size: number) => {
    onFontSizeChange(size);
    if (selectedFeature?.properties.annotationType === 'text' && onUpdateFeature) {
      onUpdateFeature(selectedFeature.id, { fontSize: size } as any);
    }
  }, [onFontSizeChange, selectedFeature, onUpdateFeature]);

  if (!type) return null;

  const showColor = ['marker', 'highlighter', 'text', 'note', 'link'].includes(type);
  const showOpacity = type === 'highlighter';
  const showStrokeWidth = type === 'highlighter';
  const showFontSize = type === 'text';

  if (!showColor && !showOpacity && !showStrokeWidth && !showFontSize) return null;

  return (
    <div className="aimapui-style-panel l7-control--glass">
      {showColor && <ColorSwatches value={activeColor} onChange={handleColorChange} />}
      {showOpacity && (
        <SliderRow label="透明度" value={activeOpacity} min={0.1} max={1} step={0.1} onChange={handleOpacityChange} />
      )}
      {showStrokeWidth && (
        <SliderRow label="线宽" value={activeStrokeWidth} min={2} max={24} step={1} unit="px" onChange={handleStrokeWidthChange} />
      )}
      {showFontSize && (
        <SliderRow label="字号" value={activeFontSize} min={10} max={48} step={1} unit="px" onChange={handleFontSizeChange} />
      )}
    </div>
  );
};
