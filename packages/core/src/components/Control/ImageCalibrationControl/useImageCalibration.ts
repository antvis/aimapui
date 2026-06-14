import { useCallback, useEffect, useRef, useState } from 'react';
import * as L7 from '@antv/l7';
import type {
  CalibrationPhase,
  CalibrationState,
  CornerIndex,
  GeoCorners,
  ExportConfig,
  ExportResult,
  ImageSource,
} from './image-calibration-types';
import { computeInitialCorners, cornersToExtent, loadImageSource, loadImage } from './image-calibration-utils';
import { exportCalibratedTiles } from './perspective-transform';
import type { Point2D } from './perspective-transform';

export interface UseImageCalibrationOptions {
  scene: any;
  mapsService: any;
  corners?: GeoCorners;
  defaultCorners?: GeoCorners;
  imageSource?: ImageSource;
  opacity?: number;
  onCornersChange?: (corners: GeoCorners) => void;
  onImageLoad?: (dimensions: { width: number; height: number }) => void;
}

export interface UseImageCalibrationResult {
  state: CalibrationState;
  screenPositions: [Point2D, Point2D, Point2D, Point2D] | null;
  setImage: (source: ImageSource) => void;
  setPhase: (phase: CalibrationPhase) => void;
  setOpacity: (opacity: number) => void;
  startDrag: (corner: CornerIndex) => void;
  clear: () => void;
  getCorners: () => GeoCorners | null;
  setCorners: (corners: GeoCorners) => void;
  exportImage: (config?: ExportConfig) => Promise<ExportResult>;
}

export function useImageCalibration({
  scene,
  mapsService,
  corners: controlledCorners,
  defaultCorners,
  imageSource,
  opacity = 0.7,
  onCornersChange,
  onImageLoad,
}: UseImageCalibrationOptions): UseImageCalibrationResult {
  const [state, setState] = useState<CalibrationState>({
    phase: 'idle',
    imageUrl: null,
    imageDimensions: null,
    corners: defaultCorners ?? null,
    draggingCorner: null,
    opacity,
  });

  const [screenPositions, setScreenPositions] = useState<[Point2D, Point2D, Point2D, Point2D] | null>(null);

  const cornersRef = useRef<GeoCorners | null>(state.corners);
  const draggingRef = useRef<CornerIndex | null>(null);
  const revokeUrlRef = useRef<(() => void) | null>(null);
  const onCornersChangeRef = useRef(onCornersChange);
  onCornersChangeRef.current = onCornersChange;

  // L7 ImageLayer ref
  const imageLayerRef = useRef<any>(null);

  const isControlled = controlledCorners !== undefined;
  const effectiveCorners = isControlled ? controlledCorners : state.corners;

  useEffect(() => {
    cornersRef.current = effectiveCorners ?? null;
  }, [effectiveCorners]);

  // 同步受控 corners
  useEffect(() => {
    if (isControlled && controlledCorners) {
      setState((s) => ({ ...s, corners: controlledCorners }));
    }
  }, [isControlled, controlledCorners]);

  // 初始图片源加载
  useEffect(() => {
    if (imageSource) {
      handleSetImage(imageSource);
    }
  }, [imageSource]);

  // 跟踪"已提交"的角点（拖拽结束后），避免拖拽中频繁重建图层
  const [committedCorners, setCommittedCorners] = useState<GeoCorners | null>(effectiveCorners ?? null);
  useEffect(() => {
    // 只在非拖拽时同步
    if (!state.draggingCorner) {
      setCommittedCorners(effectiveCorners ?? null);
    }
  }, [effectiveCorners, state.draggingCorner]);

  // 管理 L7 ImageLayer —— 当图片URL、已提交角点或透明度变化时更新图层
  useEffect(() => {
    if (!scene || !state.imageUrl || !committedCorners) {
      if (imageLayerRef.current) {
        try {
          scene?.removeLayer(imageLayerRef.current);
        } catch {}
        imageLayerRef.current = null;
      }
      return;
    }

    // 使用 coordinates（4角点）让图片按精确位置显示，顺序：左上、右上、右下、左下
    const coordinates = [
      committedCorners[0], // TL
      committedCorners[1], // TR
      committedCorners[2], // BR
      committedCorners[3], // BL
    ];

    if (imageLayerRef.current) {
      try {
        scene.removeLayer(imageLayerRef.current);
      } catch {}
      imageLayerRef.current = null;
    }

    const layer = new (L7 as any).ImageLayer({
      zIndex: 10,
      name: '__calibration_image__',
    });

    layer.source(state.imageUrl, {
      parser: {
        type: 'image',
        coordinates,
      },
    });

    layer.style({
      opacity: state.opacity,
    });

    scene.addLayer(layer);
    imageLayerRef.current = layer;

    return () => {
      if (imageLayerRef.current) {
        try {
          scene.removeLayer(imageLayerRef.current);
        } catch {}
        imageLayerRef.current = null;
      }
    };
  }, [scene, state.imageUrl, committedCorners, state.opacity]);

  // 角点 → 屏幕坐标映射
  const updateScreenPositions = useCallback(() => {
    if (!mapsService || !cornersRef.current) {
      setScreenPositions(null);
      return;
    }
    try {
      const positions = cornersRef.current.map((corner) => {
        const pixel = mapsService.lngLatToContainer([corner[0], corner[1]]);
        return [pixel.x, pixel.y] as Point2D;
      }) as [Point2D, Point2D, Point2D, Point2D];
      setScreenPositions(positions);
    } catch {
      // scene 未就绪时忽略
    }
  }, [mapsService]);

  // 监听相机变化
  useEffect(() => {
    if (!mapsService || !effectiveCorners) return;
    updateScreenPositions();

    const handler = () => updateScreenPositions();
    mapsService.on('camerachange', handler);
    mapsService.on('viewchange', handler);
    return () => {
      mapsService.off('camerachange', handler);
      mapsService.off('viewchange', handler);
    };
  }, [mapsService, effectiveCorners, updateScreenPositions]);

  // 拖拽逻辑 — 使用 document 级别事件，避免 DOM 覆盖层截断地图事件
  const startDrag = useCallback(
    (corner: CornerIndex) => {
      if (!mapsService) return;
      draggingRef.current = corner;
      setState((s) => ({ ...s, draggingCorner: corner }));
      mapsService.setMapStatus({ dragEnable: false, zoomEnable: false });

      const mapContainer = mapsService.getContainer?.() as HTMLElement | null;

      const handleMouseMove = (e: MouseEvent) => {
        if (draggingRef.current === null || !cornersRef.current || !mapContainer) return;

        // 将 document 鼠标坐标转为地图容器内坐标，再转为经纬度
        const rect = mapContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const lngLat = mapsService.containerToLngLat([x, y]);
        if (!lngLat) return;

        const newCorners = [...cornersRef.current] as unknown as GeoCorners;
        newCorners[draggingRef.current] = [lngLat.lng, lngLat.lat];
        cornersRef.current = newCorners;

        if (!isControlled) {
          setState((s) => ({ ...s, corners: newCorners }));
        }
        onCornersChangeRef.current?.(newCorners);
        updateScreenPositions();
      };

      const handleMouseUp = () => {
        draggingRef.current = null;
        setState((s) => ({ ...s, draggingCorner: null }));
        mapsService.setMapStatus({ dragEnable: true, zoomEnable: true });
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [mapsService, isControlled, updateScreenPositions],
  );

  // 设置图片
  const handleSetImage = useCallback(
    async (source: ImageSource) => {
      // 清理之前的 blob URL
      revokeUrlRef.current?.();
      revokeUrlRef.current = null;

      try {
        const info = await loadImageSource(source);
        revokeUrlRef.current = info.revokeUrl ?? null;

        // 如果没有初始角点，根据地图视口计算
        let initialCorners = cornersRef.current;
        if (!initialCorners && mapsService) {
          const center = mapsService.getCenter();
          const zoom = mapsService.getZoom();
          const aspect = info.width / info.height;
          initialCorners = computeInitialCorners(
            [center.lng, center.lat],
            zoom,
            aspect,
          );
        }

        setState((s) => ({
          ...s,
          phase: 'calibrating',
          imageUrl: info.url,
          imageDimensions: { width: info.width, height: info.height },
          corners: isControlled ? s.corners : initialCorners,
        }));

        if (!isControlled && initialCorners) {
          cornersRef.current = initialCorners;
          onCornersChangeRef.current?.(initialCorners);
        }

        onImageLoad?.({ width: info.width, height: info.height });
        // 延迟一帧更新屏幕位置
        requestAnimationFrame(updateScreenPositions);
      } catch (err) {
        console.error('Failed to load image:', err);
      }
    },
    [mapsService, isControlled, onImageLoad, updateScreenPositions],
  );

  const setPhase = useCallback((phase: CalibrationPhase) => {
    setState((s) => ({ ...s, phase }));
  }, []);

  const setOpacity = useCallback((newOpacity: number) => {
    setState((s) => ({ ...s, opacity: newOpacity }));
  }, []);

  const clear = useCallback(() => {
    revokeUrlRef.current?.();
    revokeUrlRef.current = null;
    cornersRef.current = null;

    // 移除 L7 图层
    if (imageLayerRef.current && scene) {
      try {
        scene.removeLayer(imageLayerRef.current);
      } catch {}
      imageLayerRef.current = null;
    }

    setState({
      phase: 'idle',
      imageUrl: null,
      imageDimensions: null,
      corners: null,
      draggingCorner: null,
      opacity,
    });
    setScreenPositions(null);
  }, [opacity, scene]);

  const getCorners = useCallback(() => cornersRef.current, []);

  const setCorners = useCallback(
    (newCorners: GeoCorners) => {
      cornersRef.current = newCorners;
      if (!isControlled) {
        setState((s) => ({ ...s, corners: newCorners }));
      }
      onCornersChangeRef.current?.(newCorners);
      updateScreenPositions();
    },
    [isControlled, updateScreenPositions],
  );

  const exportImage = useCallback(
    async (config?: ExportConfig): Promise<ExportResult> => {
      if (!state.imageUrl || !cornersRef.current || !state.imageDimensions) {
        throw new Error('No image or corners to export');
      }

      const img = await loadImage(state.imageUrl);
      const corners = cornersRef.current;

      const outputWidth = config?.outputWidth || state.imageDimensions.width;
      const outputHeight = config?.outputHeight || state.imageDimensions.height;
      const cols = config?.cols || 1;
      const rows = config?.rows || 1;

      const { fullBlob, tiles: rawTiles, extent } = await exportCalibratedTiles(img, corners, {
        outputWidth,
        outputHeight,
        cols,
        rows,
        format: config?.format,
        quality: config?.quality,
      });

      const previewUrl = URL.createObjectURL(fullBlob);
      const tiles = rawTiles.map((t) => ({
        blob: t.blob,
        previewUrl: URL.createObjectURL(t.blob),
        row: t.row,
        col: t.col,
        extent: t.extent,
        corners: t.corners as import('./image-calibration-types').GeoCorners,
        width: t.width,
        height: t.height,
      }));

      return { tiles, extent, previewUrl, blob: fullBlob, outputWidth, outputHeight };
    },
    [state.imageUrl, state.imageDimensions],
  );

  // 清理
  useEffect(() => {
    return () => {
      revokeUrlRef.current?.();
      if (imageLayerRef.current && scene) {
        try {
          scene.removeLayer(imageLayerRef.current);
        } catch {}
      }
    };
  }, [scene]);

  return {
    state,
    screenPositions,
    setImage: handleSetImage,
    setPhase,
    setOpacity,
    startDrag,
    clear,
    getCorners,
    setCorners,
    exportImage,
  };
}
