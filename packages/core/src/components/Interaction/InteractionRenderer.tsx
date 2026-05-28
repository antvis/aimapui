import React, { useRef, useState, useEffect } from 'react';
import type { InteractionSchema } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { Marker } from './Marker';
import { Popup } from './Popup';

export interface InteractionRendererProps {
  interactions: InteractionSchema[];
}

/**
 * 批量渲染交互元素（Marker / Popup）
 * Tooltip 由图层 hover/click 事件驱动，在此不做渲染
 *
 * 参考 L7 实现：使用 mapsService.getMarkerContainer() 作为 Marker/Popup 的 DOM 容器
 */
export function InteractionRenderer({ interactions }: InteractionRendererProps) {
  const scene = useScene();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!scene) return;

    const onLoaded = () => {
      try {
        // 参考 L7 Marker: mapsService.getMarkerContainer()
        const mapsService = (scene as any).mapService;
        if (mapsService && typeof mapsService.getMarkerContainer === 'function') {
          const markerContainer = mapsService.getMarkerContainer() as HTMLElement;
          if (markerContainer) {
            setContainer(markerContainer);
            return;
          }
        }
      } catch {
        // mapsService 不可用，降级
      }

      // 降级：延迟再试
      const timer = setTimeout(() => {
        try {
          const mapsService = (scene as any).mapService;
          if (mapsService && typeof mapsService.getMarkerContainer === 'function') {
            const markerContainer = mapsService.getMarkerContainer() as HTMLElement;
            if (markerContainer) {
              setContainer(markerContainer);
            }
          }
        } catch {
          // 仍然不可用
        }
      }, 100);

      return () => clearTimeout(timer);
    };

    // 如果已经 loaded
    if ((scene as any).loaded) {
      const cleanup = onLoaded();
      return cleanup;
    } else {
      scene.on('loaded', onLoaded);
      return () => {
        scene.off('loaded', onLoaded);
      };
    }
  }, [scene]);

  const markers = interactions.filter((i) => i.type === 'marker') as Extract<
    InteractionSchema,
    { type: 'marker' }
  >[];
  const popups = interactions.filter((i) => i.type === 'popup') as Extract<
    InteractionSchema,
    { type: 'popup' }
  >[];

  return (
    <>
      {container &&
        markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            {...marker}
            overlayContainer={container}
          />
        ))}
      {container &&
        popups.map((popup, index) => (
          <Popup
            key={`popup-${index}`}
            {...popup}
            overlayContainer={container}
          />
        ))}
    </>
  );
}

export default InteractionRenderer;