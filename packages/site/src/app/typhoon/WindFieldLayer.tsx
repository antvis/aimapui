/* ================================================================
   WindFieldLayer — 风场图层适配器（台风 Demo）

   Thin wrapper: 将旧的 WindFieldRawData 格式适配为新的
   @antv/aimapui WindFieldLayer 组件。
   ================================================================ */

import React, { useMemo } from 'react';
import { WindFieldLayer as CoreWindFieldLayer } from '@antv/aimapui';
import type { WindFieldData } from '@antv/aimapui';
import type { WindFieldRawData } from './types';

export interface WindFieldLayerProps {
  /** 风场原始网格数据（旧格式，标记为 deprecated） */
  windData: WindFieldRawData | null;
  /** 是否可见 */
  visible?: boolean;
  /** 透明度 0-1 */
  opacity?: number;
  /** 粒子数量 */
  particleCount?: number;
  /** z-index */
  zIndex?: number;
}

/**
 * 将旧的 WindFieldRawData 转换为新的 WindFieldData
 */
function adaptData(raw: WindFieldRawData): WindFieldData {
  return {
    uData: raw.uData,
    vData: raw.vData,
    cols: raw.nx,
    rows: raw.ny,
    originLng: raw.lo1,
    originLat: raw.la1,
    deltaLng: raw.dx,
    deltaLat: raw.dy,
  };
}

export default function WindFieldLayer({
  windData,
  visible = true,
  opacity = 0.8,
  particleCount,
  zIndex = -2,
}: WindFieldLayerProps) {
  const source = useMemo(
    () => (windData ? adaptData(windData) : null),
    [windData],
  );

  if (!source) return null;

  return (
    <CoreWindFieldLayer
      source={source}
      visible={visible}
      opacity={opacity}
      particleCount={particleCount}
      zIndex={zIndex}
    />
  );
}