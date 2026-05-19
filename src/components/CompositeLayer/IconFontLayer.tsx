import React from 'react';
import type { LayerSchema } from '../../schema/types';
import { PointLayer } from '../Layer/PointLayer';

export interface IconFontLayerProps extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];
  iconField: string;
}

/**
 * 字体标注图层（IconFontLayer）
 */
export function IconFontLayer({
  source,
  sourceType = 'json',
  sourceConfig,
  iconField,
  color = '#1677ff',
  size = 20,
  style,
  ...rest
}: IconFontLayerProps) {
  return (
    <PointLayer
      {...rest}
      source={source}
      sourceType={sourceType}
      sourceConfig={sourceConfig}
      shapeField={iconField}
      shapeValues="text"
      color={color}
      size={size}
      style={{ textAllowOverlap: true, ...(style ?? {}) }}
    />
  );
}

export default IconFontLayer;
