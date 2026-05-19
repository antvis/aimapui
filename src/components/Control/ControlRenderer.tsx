import React from 'react';
import type { ControlSchema, ControlPosition, LayerSchema } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { ZoomControl } from './ZoomControl';
import { ScaleControl } from './ScaleControl';
import { FullscreenControl } from './FullscreenControl';
import { GeoLocateControl } from './GeoLocateControl';
import { MapThemeControl } from './MapThemeControl';
import { MouseLocationControl } from './MouseLocationControl';
import { ExportImageControl } from './ExportImageControl';
import { LayerSwitchControl } from './LayerSwitchControl';

export interface ControlRendererProps {
  controls: ControlSchema[];
  layers: LayerSchema[];
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Schema 模式控件渲染器
 *
 * 每个控件自带 .l7-control-anchor 绝对定位，
 * 这里只需用一个 .l7-control-container 覆盖层包裹即可
 */
export function ControlRenderer({ controls, layers, onLayerToggle, containerRef }: ControlRendererProps) {
  const scene = useScene();

  return (
    <div className="l7-control-container">
      {controls.map((control, index) => (
        <ControlItem
          key={`${control.type}-${index}`}
          control={control}
          layers={layers}
          onLayerToggle={onLayerToggle}
          scene={scene}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}

function ControlItem({
  control,
  layers,
  onLayerToggle,
  scene: _scene,
  containerRef,
}: {
  control: ControlSchema;
  layers: LayerSchema[];
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  scene: ReturnType<typeof useScene>;
  containerRef?: React.RefObject<HTMLElement | null>;
}) {
  const position = (control.position as ControlPosition) ?? undefined;

  switch (control.type) {
    case 'zoom':
      return <ZoomControl position={position ?? 'bottomright'} />;
    case 'scale':
      return (
        <ScaleControl
          position={position ?? 'bottomleft'}
          maxWidth={control.options?.maxWidth as number}
          metric={control.options?.unit !== 'imperial'}
          imperial={control.options?.unit === 'imperial'}
        />
      );
    case 'fullscreen':
      return <FullscreenControl position={position ?? 'topright'} container={containerRef?.current} />;
    case 'geoLocate':
      return <GeoLocateControl position={position ?? 'topright'} />;
    case 'mapTheme':
      return <MapThemeControl position={position ?? 'topright'} />;
    case 'mouseLocation':
      return (
        <MouseLocationControl
          position={position ?? 'bottomleft'}
          precision={control.options?.precision as number | undefined}
        />
      );
    case 'exportImage':
      return <ExportImageControl position={position ?? 'topright'} format={control.options?.format as 'png' | 'jpg' | undefined} />;
    case 'layerSwitch':
      return (
        <LayerSwitchControl
          position={position ?? 'topright'}
          layers={layers.map((l, i) => ({
            id: l.id ?? `layer-${i}`,
            name: l.name,
            visible: l.visible,
          }))}
          onToggle={onLayerToggle ?? (() => {})}
        />
      );
    default:
      return null;
  }
}

export default ControlRenderer;