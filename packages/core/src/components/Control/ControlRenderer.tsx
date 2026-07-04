import React from 'react';
import type { ControlSchema, ControlPosition, LayerSchema } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { ControlContainer } from './ControlContainer';
import { ZoomControl } from './ZoomControl';
import { ScaleControl } from './ScaleControl';
import { FullscreenControl } from './FullscreenControl';
import { GeoLocateControl } from './GeoLocateControl';
import { MapThemeControl } from './MapThemeControl';
import { MouseLocationControl } from './MouseLocationControl';
import { ExportImageControl } from './ExportImageControl';
import { LayerSwitchControl } from './LayerSwitchControl';
import { DrawControl } from './DrawControl';
import type { DrawToolMode } from './DrawControl';
import { ImageCalibrationControl } from './ImageCalibrationControl';

export interface ControlRendererProps {
  controls: ControlSchema[];
  layers: LayerSchema[];
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Schema 模式控件渲染器
 *
 * 使用 ControlContainer 包裹，按 position 自动分组排列，
 * 同一角度的多个控件自动堆叠而不会重叠
 */
export function ControlRenderer({ controls, layers, onLayerToggle, containerRef }: ControlRendererProps) {
  const scene = useScene();

  return (
    <ControlContainer>
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
    </ControlContainer>
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
    case 'draw':
      return (
        <DrawControl
          position={position ?? 'topright'}
          modes={control.options?.modes as DrawToolMode[] | undefined}
          showDelete={control.options?.showDelete as boolean | undefined}
        />
      );
    case 'imageCalibration': {
      const cb = control.callbacks ?? {};
      return (
        <ImageCalibrationControl
          position={position ?? 'topright'}
          opacity={control.options?.opacity as number | undefined}
          imageSource={control.options?.imageSource as string | undefined}
          onCornersChange={cb.onCornersChange as ((imageId: string, corners: unknown) => void) | undefined}
          onCalibrate={cb.onCalibrate as ((imageId: string, result: unknown) => void) | undefined}
          onExport={cb.onExport as ((imageId: string, result: unknown) => void) | undefined}
          onImageLoad={cb.onImageLoad as ((imageId: string, dimensions: unknown) => void) | undefined}
          onPreprocess={cb.onPreprocess as ((imageId: string, result: unknown) => void) | undefined}
          onClear={cb.onClear as ((imageId: string) => void) | undefined}
          onImagesChange={cb.onImagesChange as ((images: unknown) => void) | undefined}
          onImageSwitch={cb.onImageSwitch as ((imageId: string) => void) | undefined}
          onImageRename={cb.onImageRename as ((imageId: string, oldName: string, newName: string) => void) | undefined}
          onImagesReorder={cb.onImagesReorder as ((images: unknown) => void) | undefined}
          onImageAdd={cb.onImageAdd as ((image: unknown) => void) | undefined}
          onImageRemove={cb.onImageRemove as ((imageId: string) => void) | undefined}
          onImageUpload={cb.onImageUpload as any}
          onCropUpload={cb.onCropUpload as any}
          onExportUpload={cb.onExportUpload as any}
        />
      );
    }
    default:
      return null;
  }
}

export default ControlRenderer;