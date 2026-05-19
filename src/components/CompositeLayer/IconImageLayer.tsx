import React, { useEffect, useMemo, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import type { LayerSchema } from '../../schema/types';
import { PointLayer } from '../Layer/PointLayer';

export interface IconImageLayerProps extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];
  iconField: string;
  iconMap: Record<string, string>;
}

/**
 * 图片标注图层（IconImageLayer）
 */
export function IconImageLayer({
  source,
  sourceType = 'json',
  sourceConfig,
  iconField,
  iconMap,
  size = 10,
  ...rest
}: IconImageLayerProps) {
  const scene = useScene();
  const [ready, setReady] = useState(false);

  const iconKeys = useMemo(() => Object.keys(iconMap), [iconMap]);

  useEffect(() => {
    if (!scene) return;
    iconKeys.forEach((key) => {
      scene.addImage(key, iconMap[key]);
    });
    setReady(true);
  }, [scene, iconKeys, iconMap]);

  if (!ready) return null;

  return (
    <PointLayer
      {...rest}
      source={source}
      sourceType={sourceType}
      sourceConfig={sourceConfig}
      shapeField={iconField}
      shapeValues={iconKeys}
      size={size}
    />
  );
}

export default IconImageLayer;
