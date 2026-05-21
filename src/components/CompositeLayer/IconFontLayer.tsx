import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { PointLayer } from '../Layer/PointLayer';

/** 标签锚点位置 */
export type LabelAnchor = 'right' | 'bottom' | 'top' | 'left' | 'center';

/**
 * 内置天气 iconfont 图标映射（默认内置）
 * key 为语义化名称，value 为 iconfont unicode 字符
 */
export const BUILTIN_ICON_FONTS: Array<[string, string]> = [
  ['smallRain', '&#xe6f7;'],
  ['middleRain', '&#xe61c;'],
  ['hugeRain', '&#xe6a6;'],
  ['sun', '&#xe6da;'],
  ['cloud', '&#xe8da;'],
];

/** 默认内置 iconfont 字体路径 */
const DEFAULT_FONT_FAMILY = 'iconfont';
const DEFAULT_FONT_PATH = '//at.alicdn.com/t/font_2534097_ao9soua2obv.woff2?t=1622021146076';

export interface IconFontLayerProps extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  // ===== 字体图标配置 =====
  /** 图标内容字段（数据中每个要素的该字段值将作为图标文本渲染） */
  iconField: string;
  /**
   * 字体族名称
   * - 'material-symbols' 或 undefined: 使用内置 iconfont 字体（默认）
   * - 其他值：自定义 iconfont 字体族（需自行通过 scene.addFontFace 注册）
   */
  iconFontFamily?: string;
  /** 图标颜色，支持单色或数据驱动映射 */
  iconColor?: LayerSchema['color'];
  /** 图标尺寸 (16-24px)，默认 20 */
  iconSize?: number;
  /** 图标光晕颜色，默认白色 */
  iconHaloColor?: string;
  /** 图标光晕宽度 (1-2px)，默认 1 */
  iconHaloWidth?: number;
  /** 图标样式扩展 */
  iconStyle?: Record<string, unknown>;

  // ===== 文字标签配置 =====
  /** 是否显示文字标签，默认 true */
  showLabel?: boolean;
  /** 文字标签字段，默认取 iconField */
  labelField?: string;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字号 (10-14px)，默认 11 */
  labelSize?: number;
  /** 标签相对图标的锚点位置，默认 'bottom' */
  labelAnchor?: LabelAnchor;
  /** 标签光晕颜色，默认白色 */
  labelHaloColor?: string;
  /** 标签光晕宽度，默认 2px */
  labelHaloWidth?: number;
  /** 标签样式扩展 */
  labelStyle?: Record<string, unknown>;

  // ===== 碰撞检测 =====
  /** 文本标签是否允许重叠，默认 false（开启碰撞检测，仅隐藏文本） */
  textAllowOverlap?: boolean;
  /** 图标是否允许重叠，默认 true（图标始终保持可见） */
  iconAllowOverlap?: boolean;

  // ===== 缩放适配 =====
  /** 是否开启缩放适配，默认 true */
  zoomAdaption?: boolean;
  /** 高缩放级阈值（显示图标+文字），默认 14 */
  zoomShowLabel?: number;
  /** 低缩放级阈值（降级为圆点），默认 10 */
  zoomDegradeToPoint?: number;

  // ===== 交互 =====
  onClick?: (payload: LayerEventPayload) => void;
  onMouseEnter?: (payload: LayerEventPayload) => void;
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

/**
 * 字体图标标注图层（IconFontLayer）
 *
 * 按照 WebGL 设计规范实现的字体图标+文字标签组合图层：
 * - 内置 Google Material Symbols 字体，开箱即用
 * - SDF 渲染确保任意缩放下边缘锐利
 * - 图标 1-2px 光晕增强复杂底图辨识度
 * - 文字 2px 光晕确保可读性
 * - 碰撞检测：图标始终可见，仅文本被避让
 * - 缩放适配：L1(14+) 全显示 → L2(10-13) 仅图标 → L3(<10) 降级圆点
 */
export function IconFontLayer({
  source,
  sourceType = 'json',
  sourceConfig,
  iconField,
  iconFontFamily = 'material-symbols',
  iconColor = '#3b82f6',
  iconSize = 20,
  iconHaloColor = '#fff',
  iconHaloWidth = 1,
  iconStyle,
  showLabel = true,
  labelField,
  labelColor = '#333',
  labelSize = 11,
  labelAnchor = 'bottom',
  labelHaloColor = '#fff',
  labelHaloWidth = 2,
  labelStyle,
  textAllowOverlap = false,
  iconAllowOverlap = true,
  zoomAdaption = true,
  zoomShowLabel = 14,
  zoomDegradeToPoint = 10,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: IconFontLayerProps) {
  const scene = useScene();
  const [ready, setReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const fontLoadedRef = useRef(false);

  // 通过 L7 Scene 注册字体和图标
  useEffect(() => {
    if (!scene) return;
    if (fontLoadedRef.current) return;

    const fontFamily = iconFontFamily === 'material-symbols' ? DEFAULT_FONT_FAMILY : (iconFontFamily ?? DEFAULT_FONT_FAMILY);
    const fontPath = DEFAULT_FONT_PATH;

    // 注册字体
    scene.addFontFace(fontFamily, fontPath);
    // 注册内置图标映射
    scene.addIconFonts(BUILTIN_ICON_FONTS);

    fontLoadedRef.current = true;
  }, [scene, iconFontFamily]);

  // Scene 就绪检测
  useEffect(() => {
    if (!scene) return;
    const timer = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(timer);
  }, [scene]);

  // 计算标签偏移（必须在条件返回之前）
  const labelOffset: [number, number] = useMemo(() => {
    const gap = iconSize / 2 + 4;
    switch (labelAnchor) {
      case 'right': return [gap, 0];
      case 'left': return [-gap, 0];
      case 'top': return [0, -gap];
      case 'center': return [0, 0];
      case 'bottom':
      default: return [0, gap];
    }
  }, [labelAnchor, iconSize]);

  // 缩放适配监听
  useEffect(() => {
    if (!scene || !zoomAdaption) return;
    const handleZoomChange = () => {
      setCurrentZoom(scene.getZoom());
    };
    handleZoomChange();
    scene.on('zoomchange', handleZoomChange);
    return () => {
      scene.off('zoomchange', handleZoomChange);
    };
  }, [scene, zoomAdaption]);

  // 所有 hooks 已在此之上调用完毕
  if (!ready) return null;

  const resolvedLabelField = labelField ?? iconField;
  const resolvedFontFamily = iconFontFamily === 'material-symbols'
    ? DEFAULT_FONT_FAMILY
    : (iconFontFamily ?? DEFAULT_FONT_FAMILY);

  // 缩放适配：判断当前显示级别
  const shouldShowLabel = !zoomAdaption || currentZoom >= zoomShowLabel;
  const shouldDegradeToPoint = zoomAdaption && currentZoom < zoomDegradeToPoint;

  // L3: 降级为圆点模式
  if (shouldDegradeToPoint) {
    return (
      <PointLayer
        source={source}
        sourceType={sourceType}
        sourceConfig={sourceConfig}
        shape="circle"
        color={typeof iconColor === 'string' ? iconColor : '#3b82f6'}
        size={4}
        style={{ opacity: 0.7 }}
      />
    );
  }

  return (
    <>
      {/* 字体图标图层 — 始终可见 */}
      <PointLayer
        {...rest}
        source={source}
        sourceType={sourceType}
        sourceConfig={sourceConfig}
        shapeField={iconField}
        shapeValues="text"
        color={iconColor}
        size={iconSize}
        style={{
          fontFamily: resolvedFontFamily,
          textAllowOverlap: iconAllowOverlap,
          stroke: iconHaloColor,
          strokeWidth: iconHaloWidth,
          ...(iconStyle ?? {}),
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />

      {/* 文字标签图层 — 碰撞检测控制 */}
      {showLabel && shouldShowLabel && (
        <PointLayer
          source={source}
          sourceType={sourceType}
          sourceConfig={sourceConfig}
          shapeField={resolvedLabelField}
          shapeValues="text"
          color={labelColor}
          size={labelSize}
          style={{
            textAnchor: labelAnchor === 'right' ? 'left' : labelAnchor === 'left' ? 'right' : 'center',
            textOffset: labelOffset,
            stroke: labelHaloColor,
            strokeWidth: labelHaloWidth,
            fontWeight: '500',
            textAllowOverlap,
            ...(labelStyle ?? {}),
          }}
        />
      )}
    </>
  );
}

export default IconFontLayer;
