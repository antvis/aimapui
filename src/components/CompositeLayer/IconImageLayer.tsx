import React, { useEffect, useMemo, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { PointLayer } from '../Layer/PointLayer';

/** 标签锚点位置 */
export type LabelAnchor = 'right' | 'bottom' | 'top' | 'left';

export interface IconImageLayerProps extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  // ===== 图标配置 =====
  /** 图标映射字段 */
  iconField: string;
  /** 图标资源映射 { fieldValue: imageUrl } */
  iconMap: Record<string, string>;
  /** 图标尺寸，标准 24，紧凑 16 */
  iconSize?: number;

  // ===== 文字标签配置 =====
  /** 是否显示文字标签，默认 true */
  showLabel?: boolean;
  /** 文字标签字段，默认取 iconField */
  labelField?: string;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字号 (12-14px) */
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
  /** 文本是否允许重叠，默认 false（开启碰撞检测） */
  textAllowOverlap?: boolean;
  /** 图标是否允许重叠，默认 true */
  iconAllowOverlap?: boolean;

  // ===== 缩放适配 =====
  /** 是否开启缩放适配，默认 true */
  zoomAdaption?: boolean;
  /** 高缩放级阈值（显示图标+文字），默认 15 */
  zoomShowLabel?: number;
  /** 低缩放级阈值（降级为圆点），默认 10 */
  zoomDegradeToPoint?: number;

  // ===== 交互 =====
  onClick?: (payload: LayerEventPayload) => void;
  onMouseEnter?: (payload: LayerEventPayload) => void;
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

/** 根据锚点方向计算偏移量 */
function computeLabelOffset(anchor: LabelAnchor, iconSize: number): [number, number] {
  const gap = iconSize / 2 + 4;
  switch (anchor) {
    case 'right': return [gap, 0];
    case 'left': return [-gap, 0];
    case 'top': return [0, -gap];
    case 'bottom':
    default: return [0, gap];
  }
}

/**
 * 图片标注图层（IconImageLayer）
 *
 * 按照设计规范实现的图片图标+文字标签组合图层：
 * - 内置图标与文字两个 PointLayer，统一管理渲染时序
 * - 图标 1px 白色描边 (Halo) 增强复杂底图辨识度
 * - 文字 2px 光晕确保深色底图可读性
 * - 缩放适配：Zoom15+ 全显示 → 10-14 仅图标 → <10 降级圆点
 * - 碰撞检测：重叠时隐藏低优先级文本
 */
export function IconImageLayer({
  source,
  sourceType = 'json',
  sourceConfig,
  iconField,
  iconMap,
  iconSize = 24,
  size,
  showLabel = true,
  labelField,
  labelColor = '#333',
  labelSize = 12,
  labelAnchor = 'bottom',
  labelHaloColor = '#fff',
  labelHaloWidth = 2,
  labelStyle,
  textAllowOverlap = false,
  iconAllowOverlap = true,
  zoomAdaption = true,
  zoomShowLabel = 15,
  zoomDegradeToPoint = 10,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: IconImageLayerProps) {
  const scene = useScene();
  const [ready, setReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(15);

  const iconKeys = useMemo(() => Object.keys(iconMap), [iconMap]);
  const resolvedIconSize = size ?? iconSize;
  const resolvedLabelField = labelField ?? iconField;
  const labelOffset = useMemo(
    () => computeLabelOffset(labelAnchor, resolvedIconSize),
    [labelAnchor, resolvedIconSize],
  );

  // 注册图片资源
  useEffect(() => {
    if (!scene) return;
    iconKeys.forEach((key) => {
      scene.addImage(key, iconMap[key]);
    });
    setReady(true);
  }, [scene, iconKeys, iconMap]);

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

  // 所有 hooks 已在此之上调用完毕 —— 以下为条件渲染
  if (!ready) return null;

  const shouldShowLabel = !zoomAdaption || currentZoom >= zoomShowLabel;
  const shouldDegradeToPoint = zoomAdaption && currentZoom < zoomDegradeToPoint;

  // 降级为圆点模式
  if (shouldDegradeToPoint) {
    return (
      <PointLayer
        source={source}
        sourceType={sourceType}
        sourceConfig={sourceConfig}
        shape="circle"
        color={rest.color ?? '#3b82f6'}
        size={6}
        style={{ opacity: 0.8 }}
      />
    );
  }

  return (
    <>
      {/* 图标图层 — anchor: bottom，图标底部对齐地理坐标点 */}
      <PointLayer
        {...rest}
        source={source}
        sourceType={sourceType}
        sourceConfig={sourceConfig}
        shapeField={iconField}
        shapeValues={iconKeys}
        size={resolvedIconSize}
        style={{
          anchor: 'bottom',
          allowOverlap: iconAllowOverlap,
          ...(rest.style as Record<string, unknown> ?? {}),
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />

      {/* 文字标签图层 — anchor: top，文字顶部对齐地理坐标点 */}
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
            anchor: 'top',
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

export default IconImageLayer;
