/**
 * ImageCalibrationControl — 地图图片配准控件
 *
 * 支持上传图片并通过拖拽4个角点进行地理配准，输出配准坐标和变换后的图片。
 * 遵循项目控件规范：useMapControl + useControlContainer + ControlRegistry.mark
 *
 * ```tsx
 * <AiMap map={{ basemap: 'gaode' }}>
 *   <ImageCalibrationControl
 *     onCalibrate={(imageId, result) => console.log('Corners:', result.corners)}
 *     onExport={(imageId, result) => console.log('Blob:', result.blob, 'Extent:', result.extent)}
 *   />
 * </AiMap>
 * ```
 */
import React, { useCallback, useImperativeHandle, useRef, forwardRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as L7 from '@antv/l7';
import { useMapControl, type ControlPosition } from '../../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from '../ControlContainer';
import { useImageCalibration } from './useImageCalibration';
import { CornerHandles } from './CornerHandles';
import { ImageCropModal } from './ImageCropModal';
import { cornersToExtent, cropImage, loadImageSource } from './image-calibration-utils';
import { ZipWriter } from './zip-writer';
import type {
  ImageCalibrationControlProps,
  ImageCalibrationHandle,
  ImageListAction,
  ImageSource,
  CropRegion,
  GeoCorners,
  RegisteredImage,
} from './image-calibration-types';

/** 带 tooltip 的工具条按钮 */
function TipButton({ icon, tip, onClick, disabled, direction }: {
  icon: string;
  tip: string;
  onClick: () => void;
  disabled?: boolean;
  direction?: 'horizontal' | 'vertical';
}) {
  const [hover, setHover] = useState(false);
  const isHorizontal = direction === 'horizontal';

  const tooltipStyle: React.CSSProperties = isHorizontal
    ? {
        left: '50%',
        top: '100%',
        transform: 'translateX(-50%)',
        marginTop: 6,
      }
    : {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: 6,
      };

  return (
    <div
      style={{ position: 'relative', display: 'flex' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        className="l7-button-control"
        onClick={onClick}
        disabled={disabled}
        aria-label={tip}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </button>
      {hover && (
        <div
          style={{
            position: 'absolute',
            ...tooltipStyle,
            padding: '4px 8px',
            borderRadius: 4,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontSize: 11,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            lineHeight: 1.4,
            zIndex: 300,
          }}
        >
          {tip}
        </div>
      )}
    </div>
  );
}

export const ImageCalibrationControl = forwardRef<ImageCalibrationHandle, ImageCalibrationControlProps>(
  function ImageCalibrationControl(
    {
      position = 'topright',
      layout = 'vertical',
      corners: controlledCorners,
      defaultCorners,
      imageSource,
      opacity = 1,
      accept = 'image/*',
      enableCrop = true,
      enableInitialCoords = true,
      className,
      style,
      onCornersChange,
      onCalibrate,
      onExport,
      onImageLoad,
      onPreprocess,
      onClear,
      onImagesChange,
      onImageSwitch,
      onImageRename,
      onImagesReorder,
      onImageAdd,
      onImageRemove,
    },
    ref,
  ) {
    const { scene, mapsService, positionClassName, getMapContainer } = useMapControl(position);
    const isInContainer = useControlContainer();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceFileInputRef = useRef<HTMLInputElement>(null);
    const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

    // ---- 多图状态管理 ----
    const [images, setImages] = useState<RegisteredImage[]>([]);
    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const [showImageList, setShowImageList] = useState(false);
    const [expandedOpacityId, setExpandedOpacityId] = useState<string | null>(null);
    const [editingNameId, setEditingNameId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [editNameValue, setEditNameValue] = useState('');

    // Refs for use in callbacks to avoid stale closures
    const imagesRef = useRef(images);
    imagesRef.current = images;
    const activeImageIdRef = useRef(activeImageId);
    activeImageIdRef.current = activeImageId;

    // ---- 管理所有非活跃图片的静态图层（确保所有已配准图片都显示在地图上） ----
    const staticLayersRef = useRef<Map<string, any>>(new Map());

    useEffect(() => {
      if (!scene) return;

      const activeId = activeImageIdRef.current;
      const currentLayerIds = new Set<string>();

      images.forEach((img) => {
        if (img.id === activeId) return;
        if (!img.corners || img.phase === 'idle') return;

        currentLayerIds.add(img.id);

        const existingLayer = staticLayersRef.current.get(img.id);
        if (existingLayer) {
          existingLayer.style({ opacity: img.opacity });
          return;
        }

        try {
          const coordinates = [
            img.corners[0], img.corners[1], img.corners[2], img.corners[3],
          ];
          const layer = new (L7 as any).ImageLayer({
            zIndex: 9,
            name: `__calibration_static_${img.id}__`,
          });
          layer.source(img.thumbnailUrl, {
            parser: { type: 'image', coordinates },
          });
          layer.style({ opacity: img.opacity });
          scene.addLayer(layer);
          staticLayersRef.current.set(img.id, layer);
        } catch (err) {
          console.error('Failed to create static layer:', err);
        }
      });

      staticLayersRef.current.forEach((layer, id) => {
        if (!currentLayerIds.has(id)) {
          try { scene.removeLayer(layer); } catch {}
          staticLayersRef.current.delete(id);
        }
      });
    }, [scene, images, activeImageId]);

    useEffect(() => {
      return () => {
        staticLayersRef.current.forEach((layer) => {
          try { scene?.removeLayer(layer); } catch {}
        });
        staticLayersRef.current.clear();
      };
    }, [scene]);

    // ---- 单图校准 Hook（focus 当前激活图片） ----
    const calibration = useImageCalibration({
      scene,
      mapsService,
      corners: controlledCorners,
      defaultCorners,
      imageSource,
      opacity,
      onCornersChange: (corners) => {
        const id = activeImageIdRef.current;
        if (id) onCornersChange?.(id, corners);
      },
      onImageLoad: (dimensions) => {
        const id = activeImageIdRef.current;
        if (id) onImageLoad?.(id, dimensions);
      },
    });

    const { state, screenPositions, setImage, setPhase, setOpacity, startDrag, clear, getCorners, setCorners, exportImage } = calibration;

    const getCornersRef = useRef(getCorners);
    getCornersRef.current = getCorners;
    const phaseRef = useRef(state.phase);
    phaseRef.current = state.phase;
    const opacityRef = useRef(state.opacity);
    opacityRef.current = state.opacity;
    const stateRef = useRef(state);
    stateRef.current = state;

    const syncImageState = useCallback(
      (id: string, patch: Partial<RegisteredImage>) => {
        setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));
      },
      [],
    );

    const prevPhaseRef = useRef(state.phase);
    const prevOpacityRef = useRef(state.opacity);
    const prevCornersRef = useRef(state.corners);
    if (activeImageId) {
      if (prevPhaseRef.current !== state.phase ||
          prevOpacityRef.current !== state.opacity ||
          prevCornersRef.current !== state.corners) {
        prevPhaseRef.current = state.phase;
        prevOpacityRef.current = state.opacity;
        prevCornersRef.current = state.corners;
        setTimeout(() => {
          syncImageState(activeImageId, {
            phase: state.phase,
            opacity: state.opacity,
            corners: state.corners,
          });
        }, 0);
      }
    }

    const saveActiveImageState = useCallback(() => {
      const id = activeImageIdRef.current;
      if (!id) return;
      setImages((prev) =>
        prev.map((img) => {
          if (img.id !== id) return img;
          return {
            ...img,
            corners: getCornersRef.current(),
            phase: phaseRef.current,
            opacity: opacityRef.current,
          };
        }),
      );
    }, []);

    const handleConfirm = useCallback(() => {
      const corners = getCorners();
      if (corners) {
        setPhase('confirmed');
        const id = activeImageIdRef.current;
        onCalibrate?.(id ?? '', { corners, extent: cornersToExtent(corners) });
      }
    }, [getCorners, setPhase, onCalibrate]);

    const handleReEdit = useCallback(() => {
      setPhase('calibrating');
    }, [setPhase]);

    const handleOpacityChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setOpacity(val);
        const id = activeImageIdRef.current;
        if (id) syncImageState(id, { opacity: val });
      },
      [setOpacity, syncImageState],
    );

    const handlePlaceToView = useCallback(() => {
      if (!mapsService || stateRef.current.phase === 'idle') return;
      const bounds = mapsService.getBounds();
      if (!bounds) return;
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      const padLng = (maxLng - minLng) * 0.1;
      const padLat = (maxLat - minLat) * 0.1;
      const newCorners: GeoCorners = [
        [minLng + padLng, maxLat - padLat],
        [maxLng - padLng, maxLat - padLat],
        [maxLng - padLng, minLat + padLat],
        [minLng + padLng, minLat + padLat],
      ];
      setCorners(newCorners);
    }, [mapsService, setCorners]);

    const handleScaleToImage = useCallback(
      (imageId: string) => {
        const img = imagesRef.current.find((i) => i.id === imageId);
        if (!img?.corners || !mapsService) return;
        const extent = cornersToExtent(img.corners);
        mapsService.fitBounds([
          [extent[0], extent[1]],
          [extent[2], extent[3]],
        ]);
      },
      [mapsService],
    );

    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportConfig, setExportConfig] = useState({ outputWidth: 0, outputHeight: 0, cols: 1, rows: 1 });
    const [exportResult, setExportResult] = useState<import('./image-calibration-types').ExportResult | null>(null);
    const [exporting, setExporting] = useState(false);

    const handleExport = useCallback(() => {
      const dims = stateRef.current.imageDimensions;
      setExportConfig({ outputWidth: dims?.width || 1024, outputHeight: dims?.height || 1024, cols: 1, rows: 1 });
      setExportResult(null);
      setShowExportDialog(true);
    }, []);

    const handleGeneratePreview = useCallback(async () => {
      setExporting(true);
      try {
        const result = await exportImage(exportConfig);
        setExportResult(result);
      } catch (err) {
        console.error('Export failed:', err);
      }
      setExporting(false);
    }, [exportImage, exportConfig]);

    const handleDownloadAll = useCallback(async () => {
      if (!exportResult) return;
      const zip = new ZipWriter();
      for (const tile of exportResult.tiles) {
        await zip.addBlob(`tile_${tile.row}_${tile.col}.png`, tile.blob);
      }
      zip.addFile('tiles.json', JSON.stringify({
        extent: exportResult.extent,
        outputWidth: exportResult.outputWidth,
        outputHeight: exportResult.outputHeight,
        tiles: exportResult.tiles.map((t) => ({
          file: `tile_${t.row}_${t.col}.png`,
          row: t.row, col: t.col,
          width: t.width, height: t.height,
          extent: t.extent, corners: t.corners,
        })),
      }, null, 2));
      const zipBlob = zip.generate();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url; a.download = 'calibrated-tiles.zip'; a.click();
      URL.revokeObjectURL(url);
      const id = activeImageIdRef.current;
      onExport?.(id ?? '', exportResult);
    }, [exportResult, onExport]);

    const handleExportCancel = useCallback(() => {
      if (exportResult) {
        URL.revokeObjectURL(exportResult.previewUrl);
        exportResult.tiles.forEach((t) => URL.revokeObjectURL(t.previewUrl));
      }
      setExportResult(null);
      setShowExportDialog(false);
    }, [exportResult]);

    const handleClearCurrent = useCallback(() => {
      saveActiveImageState();
      const id = activeImageIdRef.current;
      clear();
      if (id) {
        syncImageState(id, { phase: 'idle' as const, corners: null });
        onClear?.(id);
      }
    }, [saveActiveImageState, clear, syncImageState, onClear]);

    const handleActivateImage = useCallback(
      (img: RegisteredImage, isNew = false) => {
        saveActiveImageState();
        const staticLayer = staticLayersRef.current.get(img.id);
        if (staticLayer && scene) {
          try { scene.removeLayer(staticLayer); } catch {}
          staticLayersRef.current.delete(img.id);
        }
        setImages((prev) => {
          const exists = prev.find((i) => i.id === img.id);
          if (exists) return prev;
          if (isNew) onImageAdd?.(img);
          return [...prev, img];
        });
        setActiveImageId(img.id);
        onImageSwitch?.(img.id);
        setTimeout(() => { onImagesChange?.(imagesRef.current); }, 0);
        clear();
        setTimeout(() => {
          if (img.corners) setImage(img.source, img.corners);
          else setImage(img.source);
        }, 50);
      },
      [saveActiveImageState, clear, setImage, onImageSwitch, onImagesChange, onImageAdd, scene],
    );

    const handleSwitchImage = useCallback(
      (id: string) => {
        if (id === activeImageIdRef.current) return;
        const img = imagesRef.current.find((i) => i.id === id);
        if (!img) return;
        handleActivateImage(img);
      },
      [handleActivateImage],
    );

    const handleDeleteImage = useCallback(
      (id: string) => {
        const img = imagesRef.current.find((i) => i.id === id);
        if (img) {
          img.revokeUrl?.();
          img.croppedRevokeUrl?.();
        }
        const staticLayer = staticLayersRef.current.get(id);
        if (staticLayer && scene) {
          try { scene.removeLayer(staticLayer); } catch {}
          staticLayersRef.current.delete(id);
        }
        const remaining = imagesRef.current.filter((i) => i.id !== id);
        setImages(remaining);
        onImagesChange?.(remaining);
        onImageRemove?.(id);
        if (id === activeImageIdRef.current) {
          if (remaining.length > 0) {
            handleActivateImage(remaining[0]);
          } else {
            setActiveImageId(null);
            clear();
            onClear?.(id);
          }
        }
      },
      [clear, handleActivateImage, onClear, onImagesChange, onImageRemove, scene],
    );

    const actionHandlersRef = useRef<Record<ImageListAction, (imageId: string) => void>>({
      'opacity': (id) => { setExpandedOpacityId((prev) => (prev === id ? null : id)); },
      'place-to-view': () => { handlePlaceToView(); },
      'scale-to': (id) => { handleScaleToImage(id); },
      'calibrate': () => { handleConfirm(); },
      're-edit': () => { handleReEdit(); },
      'export': () => { handleExport(); },
      'delete': (id) => { handleDeleteImage(id); },
    });
    actionHandlersRef.current = {
      'opacity': (id) => { setExpandedOpacityId((prev) => (prev === id ? null : id)); },
      'place-to-view': () => { handlePlaceToView(); },
      'scale-to': (id) => { handleScaleToImage(id); },
      'calibrate': () => { handleConfirm(); },
      're-edit': () => { handleReEdit(); },
      'export': () => { handleExport(); },
      'delete': (id) => { handleDeleteImage(id); },
    };

    const handleImageAction = useCallback(
      (imageId: string, action: ImageListAction) => {
        if (imageId !== activeImageIdRef.current) {
          handleSwitchImage(imageId);
          setTimeout(() => { actionHandlersRef.current[action](imageId); }, 150);
          return;
        }
        actionHandlersRef.current[action](imageId);
      },
      [handleSwitchImage],
    );

    const handleRenameStart = useCallback((id: string, name: string) => {
      setEditingNameId(id);
      setEditNameValue(name);
    }, []);

    const handleRenameConfirm = useCallback((id: string) => {
      const img = imagesRef.current.find((i) => i.id === id);
      const newName = editNameValue.trim();
      if (!newName || !img || newName === img.name) {
        setEditingNameId(null);
        return;
      }
      const oldName = img.name;
      setImages((prev) => prev.map((i) => (i.id === id ? { ...i, name: newName } : i)));
      onImageRename?.(id, oldName, newName);
      setEditingNameId(null);
    }, [editNameValue, onImageRename]);

    const handleRenameCancel = useCallback(() => {
      setEditingNameId(null);
    }, []);

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      (e.currentTarget as HTMLElement).style.opacity = '0.4';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverId(id);
    }, []);

    const handleDragLeave = useCallback(() => { setDragOverId(null); }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const dragId = e.dataTransfer.getData('text/plain');
      if (!dragId || dragId === targetId) { setDragOverId(null); return; }
      setImages((prev) => {
        const fromIdx = prev.findIndex((i) => i.id === dragId);
        const toIdx = prev.findIndex((i) => i.id === targetId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });
      setDragOverId(null);
      setTimeout(() => { onImagesReorder?.(imagesRef.current); }, 0);
    }, [onImagesReorder]);

    const handleDragEnd = useCallback((e: React.DragEvent) => {
      (e.currentTarget as HTMLElement).style.opacity = '1';
      setDragOverId(null);
    }, []);

    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        if (enableCrop || enableInitialCoords) {
          try {
            const info = await loadImageSource(file);
            setPendingImageInfo({ url: info.url, dimensions: { width: info.width, height: info.height }, revokeUrl: info.revokeUrl ?? null, file });
          } catch (err) { console.error('Failed to load image for crop:', err); }
        } else {
          const thumbnailUrl = URL.createObjectURL(file);
          const newImage: RegisteredImage = {
            id: `calib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name, source: file, thumbnailUrl, dimensions: null,
            phase: 'idle', corners: null, opacity, revokeUrl: null, croppedRevokeUrl: null,
          };
          handleActivateImage(newImage, true);
        }
      },
      [enableCrop, enableInitialCoords, opacity, handleActivateImage],
    );

    // 替换图片
    const handleReplaceFile = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !replacingImageId) return;
        e.target.value = '';
        const oldImg = imagesRef.current.find((i) => i.id === replacingImageId);
        if (oldImg) {
          oldImg.revokeUrl?.();
          oldImg.croppedRevokeUrl?.();
        }
        if (enableCrop || enableInitialCoords) {
          try {
            const info = await loadImageSource(file);
            setPendingImageInfo({ url: info.url, dimensions: { width: info.width, height: info.height }, revokeUrl: info.revokeUrl ?? null, file });
            setPendingIsReplace(true);
          } catch (err) { console.error('Failed to load image for crop:', err); }
        } else {
          const thumbnailUrl = URL.createObjectURL(file);
          const newImage: RegisteredImage = {
            id: replacingImageId,
            name: file.name, source: file, thumbnailUrl, dimensions: null,
            phase: 'idle', corners: null, opacity, revokeUrl: null, croppedRevokeUrl: null,
          };
          setImages((prev) => prev.map((i) => (i.id === replacingImageId ? newImage : i)));
          handleActivateImage(newImage);
          setReplacingImageId(null);
        }
      },
      [replacingImageId, enableCrop, enableInitialCoords, opacity, handleActivateImage],
    );

    const handleReplaceClick = useCallback((id: string) => {
      setReplacingImageId(id);
      replaceFileInputRef.current?.click();
    }, []);

    const [pendingImageInfo, setPendingImageInfo] = useState<{
      url: string; dimensions: { width: number; height: number }; revokeUrl: (() => void) | null; file: File;
    } | null>(null);
    const [pendingIsReplace, setPendingIsReplace] = useState(false);

    const handleCropConfirm = useCallback(
      async (cropRegion: CropRegion, initialCorners: GeoCorners | null) => {
        if (!pendingImageInfo) return;
        const file = pendingImageInfo.file;
        const thumbnailUrl = URL.createObjectURL(file);
        try {
          const needsCrop = cropRegion.x !== 0 || cropRegion.y !== 0 ||
            cropRegion.width !== pendingImageInfo.dimensions.width ||
            cropRegion.height !== pendingImageInfo.dimensions.height;
          let croppedRevokeUrl: (() => void) | null = null;
          let imageSourceForCalibration: ImageSource = file;
          let finalDimensions = pendingImageInfo.dimensions;
          if (needsCrop) {
            const cropped = await cropImage(pendingImageInfo.url, cropRegion);
            pendingImageInfo.revokeUrl?.();
            croppedRevokeUrl = cropped.revokeUrl;
            imageSourceForCalibration = cropped.url;
            finalDimensions = { width: cropped.width, height: cropped.height };
            onPreprocess?.(activeImageIdRef.current ?? '', { croppedDimensions: finalDimensions, initialCorners });
          }
          const newImage: RegisteredImage = {
            id: pendingIsReplace && replacingImageId ? replacingImageId : `calib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name, source: imageSourceForCalibration, thumbnailUrl,
            dimensions: finalDimensions, phase: 'calibrating',
            corners: initialCorners ?? null, opacity, revokeUrl: null, croppedRevokeUrl,
          };
          if (pendingIsReplace && replacingImageId) {
            setImages((prev) => prev.map((i) => (i.id === replacingImageId ? newImage : i)));
            setReplacingImageId(null);
          }
          handleActivateImage(newImage, !pendingIsReplace);
        } catch (err) { console.error('Crop/setImage failed:', err); }
        setPendingImageInfo(null);
        setPendingIsReplace(false);
      },
      [pendingImageInfo, pendingIsReplace, replacingImageId, opacity, handleActivateImage, onPreprocess],
    );

    const handleCropCancel = useCallback(() => {
      if (pendingImageInfo) { pendingImageInfo.revokeUrl?.(); setPendingImageInfo(null); }
      setPendingIsReplace(false);
      setReplacingImageId(null);
    }, [pendingImageInfo]);

    const mapContainer = getMapContainer();
    const overlayPortal =
      state.phase !== 'idle' && screenPositions && mapContainer
        ? createPortal(
            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
              <CornerHandles screenPositions={screenPositions} draggingCorner={state.draggingCorner} phase={state.phase} onStartDrag={startDrag} />
            </div>,
            mapContainer,
          )
        : null;

    const phaseLabel = (phase: string) => {
      if (phase === 'idle') return '未配准';
      if (phase === 'calibrating') return '配准中';
      if (phase === 'confirmed') return '已配准';
      return phase;
    };

    useImperativeHandle(ref, () => ({
      getCorners, setCorners, setImage, exportImage,
      clear: handleClearCurrent,
      getImages: () => imagesRef.current,
      switchImage: (id: string) => handleSwitchImage(id),
      deleteImage: (id: string) => handleDeleteImage(id),
      getActiveImageId: () => activeImageIdRef.current,
    }));

    const isHorizontal = layout === 'horizontal';
    const isRightSide = position === 'topright' || position === 'bottomright';

    const panelStyle: React.CSSProperties = (() => {
      if (isHorizontal) {
        return {
          left: isRightSide ? 'auto' : 0, right: isRightSide ? 0 : 'auto',
          top: '100%', marginTop: 6,
        };
      }
      if (isRightSide) {
        return { right: '100%', top: 0, marginRight: 6 };
      }
      return { left: '100%', top: 0, marginLeft: 6 };
    })();

    const controlContent = (
      <div
        className={`l7-control l7-control--glass l7-control-image-calibration ${isHorizontal ? 'l7-control-image-calibration--horizontal' : ''} ${className ?? ''}`}
        style={{ position: 'relative', ...style }}
      >
        <TipButton icon="upload" tip="上传图片" onClick={() => fileInputRef.current?.click()} direction={layout} />
        <TipButton icon="list" tip="校准列表" onClick={() => setShowImageList(!showImageList)} direction={layout} />

        {showImageList && (
          <div
            className="l7-control l7-control--glass"
            style={{
              position: 'absolute', ...panelStyle,
              padding: 0, borderRadius: 8, width: 400, maxHeight: 360,
              display: 'flex', flexDirection: 'column', zIndex: 200, overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #c2c6d8', flexShrink: 0,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#191c1e' }}>校准列表</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button title="上传图片" onClick={() => fileInputRef.current?.click()}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 4, background: 'transparent', cursor: 'pointer', color: '#0050cb', fontSize: 16 }}>
                  <span className="material-symbols-outlined">upload</span>
                </button>
                <button title="导出全部" disabled={images.length === 0}
                  onClick={() => { if (activeImageId) handleExport(); }}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 4, background: 'transparent', cursor: 'pointer', color: '#0050cb', fontSize: 16, opacity: images.length === 0 ? 0.35 : 1 }}>
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {images.length === 0 && (
                <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '20px 0' }}>
                  暂无校准图片，请先上传
                </div>
              )}
              {images.map((img) => {
                const isActive = img.id === activeImageId;
                const isPhaseIdle = img.phase === 'idle';
                const isPhaseConfirmed = img.phase === 'confirmed';
                return (
                  <div
                    key={img.id} draggable
                    className={`l7-calibration-list-item ${isActive ? 'l7-calibration-list-item--active' : ''} ${dragOverId === img.id ? 'l7-calibration-list-item--drag-over' : ''}`}
                    onClick={() => handleSwitchImage(img.id)}
                    onDragStart={(e) => handleDragStart(e, img.id)}
                    onDragOver={(e) => handleDragOver(e, img.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, img.id)}
                    onDragEnd={handleDragEnd}
                    style={{ cursor: 'ns-resize' }}
                  >
                    <div className="l7-calibration-list-item__thumbnail">
                      <img src={img.thumbnailUrl} alt={img.name} />
                      <div className="l7-calibration-list-item__thumbnail-overlay"
                        onClick={(e) => { e.stopPropagation(); handleReplaceClick(img.id); }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>swap_horiz</span>
                      </div>
                    </div>
                    <div className="l7-calibration-list-item__info">
                      {editingNameId === img.id ? (
                        <input
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onBlur={() => handleRenameConfirm(img.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameConfirm(img.id);
                            if (e.key === 'Escape') handleRenameCancel();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          style={{ width: '100%', fontSize: 13, fontWeight: 600, padding: '2px 4px', border: '1px solid #0066ff', borderRadius: 3, outline: 'none' }}
                        />
                      ) : (
                        <div className="l7-calibration-list-item__name-row">
                          <span className="l7-calibration-list-item__name" title={img.name}>{img.name}</span>
                          <button className="l7-calibration-list-item__rename-btn" title="编辑名称"
                            onClick={(e) => { e.stopPropagation(); handleRenameStart(img.id, img.name); }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>edit</span>
                          </button>
                        </div>
                      )}
                      <div className="l7-calibration-list-item__phase">{phaseLabel(img.phase)}</div>
                      {expandedOpacityId === img.id && isActive && !isPhaseIdle && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 10 }}
                          onClick={(e) => e.stopPropagation()}>
                          <input type="range" min="0" max="1" step="0.05" value={img.opacity}
                            onChange={handleOpacityChange}
                            style={{ flex: 1, height: 3, maxWidth: 80 }} />
                          <span style={{ minWidth: 24, textAlign: 'right', color: '#666' }}>{Math.round(img.opacity * 100)}%</span>
                        </div>
                      )}
                    </div>
                    <div className="l7-calibration-list-item__actions" onClick={(e) => e.stopPropagation()}>
                      <button className="l7-calibration-list-item__action-btn" title="透明度" disabled={isPhaseIdle}
                        onClick={() => handleImageAction(img.id, 'opacity')}>
                        <span className="material-symbols-outlined">opacity</span>
                      </button>
                      <button className="l7-calibration-list-item__action-btn" title="放置到当前位置" disabled={isPhaseIdle}
                        onClick={() => handleImageAction(img.id, 'place-to-view')}>
                        <span className="material-symbols-outlined">filter_center_focus</span>
                      </button>
                      <button className="l7-calibration-list-item__action-btn" title="缩放到图片范围" disabled={isPhaseIdle || !img.corners}
                        onClick={() => handleImageAction(img.id, 'scale-to')}>
                        <span className="material-symbols-outlined">zoom_in</span>
                      </button>
                      <button className="l7-calibration-list-item__action-btn" title={isPhaseConfirmed ? '重新校准' : '确认配准'} disabled={isPhaseIdle}
                        onClick={() => handleImageAction(img.id, isPhaseConfirmed ? 're-edit' : 'calibrate')}>
                        <span className="material-symbols-outlined">{isPhaseConfirmed ? 'edit' : 'my_location'}</span>
                      </button>
                      <button className="l7-calibration-list-item__action-btn" title="导出" disabled={isPhaseIdle}
                        onClick={() => handleImageAction(img.id, 'export')}>
                        <span className="material-symbols-outlined">download</span>
                      </button>
                      <button className="l7-calibration-list-item__action-btn l7-calibration-list-item__action-btn--danger" title="删除"
                        onClick={() => handleImageAction(img.id, 'delete')}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} style={{ display: 'none' }} />
        <input ref={replaceFileInputRef} type="file" accept={accept} onChange={handleReplaceFile} style={{ display: 'none' }} />
        {overlayPortal}

        {pendingImageInfo && (enableCrop || enableInitialCoords) && createPortal(
          <ImageCropModal
            imageUrl={pendingImageInfo.url} imageDimensions={pendingImageInfo.dimensions}
            mapCenter={mapsService ? [mapsService.getCenter().lng, mapsService.getCenter().lat] : null}
            mapZoom={mapsService ? mapsService.getZoom() : null}
            showInitialCoords={enableInitialCoords}
            onConfirm={handleCropConfirm} onCancel={handleCropCancel}
          />,
          document.body,
        )}

        {showExportDialog && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}
            onClick={handleExportCancel}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 520, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>导出配准图片</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 12, fontSize: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>宽度(px)
                  <input type="number" value={exportConfig.outputWidth} min={64} max={8192}
                    onChange={(e) => setExportConfig((c) => ({ ...c, outputWidth: +e.target.value || 1024 }))}
                    style={{ width: 72, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>高度(px)
                  <input type="number" value={exportConfig.outputHeight} min={64} max={8192}
                    onChange={(e) => setExportConfig((c) => ({ ...c, outputHeight: +e.target.value || 1024 }))}
                    style={{ width: 72, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>切片列数
                  <input type="number" value={exportConfig.cols} min={1} max={20}
                    onChange={(e) => setExportConfig((c) => ({ ...c, cols: Math.max(1, +e.target.value || 1) }))}
                    style={{ width: 48, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>切片行数
                  <input type="number" value={exportConfig.rows} min={1} max={20}
                    onChange={(e) => setExportConfig((c) => ({ ...c, rows: Math.max(1, +e.target.value || 1) }))}
                    style={{ width: 48, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }} />
                </label>
              </div>
              <button onClick={handleGeneratePreview} disabled={exporting}
                style={{ padding: '6px 16px', fontSize: 12, border: 'none', borderRadius: 4, background: '#2563eb', color: '#fff', cursor: 'pointer', marginBottom: 12 }}>
                {exporting ? '生成中...' : '生成预览'}
              </button>
              {exportResult && (
                <>
                  <div style={{ position: 'relative', marginBottom: 12, border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <img src={exportResult.previewUrl} style={{ width: '100%', display: 'block' }} />
                    {(exportConfig.cols > 1 || exportConfig.rows > 1) && (
                      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                        {Array.from({ length: exportConfig.cols - 1 }, (_, i) => (
                          <line key={`c${i}`} x1={`${((i + 1) / exportConfig.cols) * 100}%`} y1="0" x2={`${((i + 1) / exportConfig.cols) * 100}%`} y2="100%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
                        ))}
                        {Array.from({ length: exportConfig.rows - 1 }, (_, i) => (
                          <line key={`r${i}`} x1="0" y1={`${((i + 1) / exportConfig.rows) * 100}%`} x2="100%" y2={`${((i + 1) / exportConfig.rows) * 100}%`} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
                        ))}
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#666', fontFamily: 'monospace', marginBottom: 12, maxHeight: 160, overflow: 'auto' }}>
                    <div style={{ marginBottom: 4, fontWeight: 600, color: '#333' }}>总计 {exportResult.tiles.length} 个切片 | {exportResult.outputWidth}×{exportResult.outputHeight}px</div>
                    <div style={{ marginBottom: 4 }}>Extent: [{exportResult.extent.map((v) => v.toFixed(5)).join(', ')}]</div>
                    {exportResult.tiles.map((tile) => (
                      <div key={`${tile.row}_${tile.col}`} style={{ padding: '2px 0', borderBottom: '1px solid #f3f4f6' }}>
                        tile_{tile.row}_{tile.col}.png ({tile.width}×{tile.height}) — [{tile.extent.map((v) => v.toFixed(5)).join(', ')}]
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={handleExportCancel} style={{ padding: '6px 16px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>取消</button>
                    <button onClick={handleDownloadAll} style={{ padding: '6px 16px', fontSize: 12, border: 'none', borderRadius: 4, background: '#2563eb', color: '#fff', cursor: 'pointer' }}>打包下载 ZIP（{exportResult.tiles.length} 张 + 坐标JSON）</button>
                  </div>
                </>
              )}
              {!exportResult && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleExportCancel} style={{ padding: '6px 16px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>取消</button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
      </div>
    );

    if (!scene || !mapsService) return null;
    if (isInContainer) return controlContent;
    return (
      <div className={`l7-control-anchor ${positionClassName}`}>
        {controlContent}
      </div>
    );
  },
);

ControlRegistry.mark(ImageCalibrationControl);
export type { ImageCalibrationHandle };