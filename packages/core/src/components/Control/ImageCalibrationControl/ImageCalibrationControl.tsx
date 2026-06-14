/**
 * ImageCalibrationControl — 地图图片配准控件
 *
 * 支持上传图片并通过拖拽4个角点进行地理配准，输出配准坐标和变换后的图片。
 * 遵循项目控件规范：useMapControl + useControlContainer + ControlRegistry.mark
 *
 * ```tsx
 * <AiMap map={{ basemap: 'gaode' }}>
 *   <ImageCalibrationControl
 *     onCalibrate={(result) => console.log('Corners:', result.corners)}
 *     onExport={(result) => console.log('Blob:', result.blob, 'Extent:', result.extent)}
 *   />
 * </AiMap>
 * ```
 */
import React, { useCallback, useImperativeHandle, useRef, forwardRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMapControl, type ControlPosition } from '../../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from '../ControlContainer';
import { useImageCalibration } from './useImageCalibration';
import { CornerHandles } from './CornerHandles';
import { cornersToExtent } from './image-calibration-utils';
import { ZipWriter } from './zip-writer';
import type {
  ImageCalibrationControlProps,
  ImageCalibrationHandle,
} from './image-calibration-types';

/** 带 tooltip 的工具条按钮 */
function TipButton({ icon, tip, onClick, disabled }: {
  icon: string;
  tip: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
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
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: 6,
            padding: '4px 8px',
            borderRadius: 4,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontSize: 11,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            lineHeight: 1.4,
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
      corners: controlledCorners,
      defaultCorners,
      imageSource,
      opacity = 0.7,
      accept = 'image/*',
      className,
      style,
      onCornersChange,
      onCalibrate,
      onExport,
      onImageLoad,
      onClear,
    },
    ref,
  ) {
    const { scene, mapsService, positionClassName, getMapContainer } = useMapControl(position);
    const isInContainer = useControlContainer();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const calibration = useImageCalibration({
      scene,
      mapsService,
      corners: controlledCorners,
      defaultCorners,
      imageSource,
      opacity,
      onCornersChange,
      onImageLoad,
    });

    const { state, screenPositions, setImage, setPhase, setOpacity, startDrag, clear, getCorners, setCorners, exportImage } = calibration;

    // 命令式 Handle
    useImperativeHandle(ref, () => ({
      getCorners,
      setCorners,
      setImage,
      exportImage,
      clear: handleClear,
    }));

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setImage(file);
        }
        // 重置 input 以允许重新选择同一文件
        e.target.value = '';
      },
      [setImage],
    );

    const handleConfirm = useCallback(() => {
      const corners = getCorners();
      if (corners) {
        setPhase('confirmed');
        onCalibrate?.({ corners, extent: cornersToExtent(corners) });
      }
    }, [getCorners, setPhase, onCalibrate]);

    // 导出弹框状态
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportConfig, setExportConfig] = useState({ outputWidth: 0, outputHeight: 0, cols: 1, rows: 1 });
    const [exportResult, setExportResult] = useState<import('./image-calibration-types').ExportResult | null>(null);
    const [exporting, setExporting] = useState(false);

    const handleExport = useCallback(() => {
      const dims = state.imageDimensions;
      setExportConfig({ outputWidth: dims?.width || 1024, outputHeight: dims?.height || 1024, cols: 1, rows: 1 });
      setExportResult(null);
      setShowExportDialog(true);
    }, [state.imageDimensions]);

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

      // 添加每个切片到 zip
      for (const tile of exportResult.tiles) {
        await zip.addBlob(`tile_${tile.row}_${tile.col}.png`, tile.blob);
      }

      // 生成坐标 JSON
      const tilesJson = exportResult.tiles.map((t) => ({
        file: `tile_${t.row}_${t.col}.png`,
        row: t.row,
        col: t.col,
        width: t.width,
        height: t.height,
        extent: t.extent,
        corners: t.corners,
      }));
      const jsonStr = JSON.stringify({
        extent: exportResult.extent,
        outputWidth: exportResult.outputWidth,
        outputHeight: exportResult.outputHeight,
        tiles: tilesJson,
      }, null, 2);
      zip.addFile('tiles.json', jsonStr);

      // 打包下载
      const zipBlob = zip.generate();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calibrated-tiles.zip';
      a.click();
      URL.revokeObjectURL(url);

      onExport?.(exportResult);
    }, [exportResult, onExport]);

    const handleExportCancel = useCallback(() => {
      if (exportResult) {
        URL.revokeObjectURL(exportResult.previewUrl);
        exportResult.tiles.forEach((t) => URL.revokeObjectURL(t.previewUrl));
      }
      setExportResult(null);
      setShowExportDialog(false);
    }, [exportResult]);

    const handleClear = useCallback(() => {
      clear();
      onClear?.();
    }, [clear, onClear]);

    const handleReEdit = useCallback(() => {
      setPhase('calibrating');
    }, [setPhase]);

    const handleOpacityChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setOpacity(Number(e.target.value));
      },
      [setOpacity],
    );

    // 放置到当前位置 — 将图片角点设为当前地图视口范围
    const handlePlaceToView = useCallback(() => {
      if (!mapsService || state.phase === 'idle') return;
      const bounds = mapsService.getBounds();
      if (!bounds) return;
      // bounds: [[minLng, minLat], [maxLng, maxLat]]
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      // 留一点边距（视口的 80%）
      const padLng = (maxLng - minLng) * 0.1;
      const padLat = (maxLat - minLat) * 0.1;
      const newCorners: import('./image-calibration-types').GeoCorners = [
        [minLng + padLng, maxLat - padLat], // TL
        [maxLng - padLng, maxLat - padLat], // TR
        [maxLng - padLng, minLat + padLat], // BR
        [minLng + padLng, minLat + padLat], // BL
      ];
      setCorners(newCorners);
    }, [mapsService, state.phase, setCorners]);

    // 透明度弹出面板
    const [showOpacitySlider, setShowOpacitySlider] = useState(false);

    // 渲染角点手柄覆盖层（图片由 L7 ImageLayer 渲染，手柄需在其上方）
    const mapContainer = getMapContainer();
    const overlayPortal =
      state.phase !== 'idle' && screenPositions && mapContainer
        ? createPortal(
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              <CornerHandles
                screenPositions={screenPositions}
                draggingCorner={state.draggingCorner}
                phase={state.phase}
                onStartDrag={startDrag}
              />
            </div>,
            mapContainer,
          )
        : null;

    // 竖排工具条 UI
    const controlContent = (
      <div
        className={`l7-control l7-control--glass l7-control-image-calibration ${className ?? ''}`}
        style={{ position: 'relative', ...style }}
      >
        <TipButton
          icon="upload"
          tip={state.phase === 'idle' ? '上传图片' : '更换图片'}
          onClick={() => fileInputRef.current?.click()}
        />
        <TipButton
          icon="fit_screen"
          tip="放置到当前位置"
          onClick={handlePlaceToView}
          disabled={state.phase === 'idle'}
        />
        <TipButton
          icon={state.phase === 'confirmed' ? 'edit' : 'check_circle'}
          tip={state.phase === 'confirmed' ? '重新校准' : '确认校准'}
          onClick={state.phase === 'confirmed' ? handleReEdit : handleConfirm}
          disabled={state.phase === 'idle'}
        />
        <TipButton
          icon="opacity"
          tip="透明度"
          onClick={() => setShowOpacitySlider(!showOpacitySlider)}
          disabled={state.phase === 'idle'}
        />
        <TipButton
          icon="download"
          tip="导出"
          onClick={handleExport}
          disabled={state.phase === 'idle'}
        />
        <TipButton
          icon="delete"
          tip="清除"
          onClick={handleClear}
          disabled={state.phase === 'idle'}
        />

        {/* 透明度滑块弹出面板 */}
        {showOpacitySlider && state.phase !== 'idle' && (
          <div
            className="l7-control--glass"
            style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              marginLeft: 6,
              padding: '8px 10px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              whiteSpace: 'nowrap',
              minWidth: 140,
            }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.opacity}
              onChange={handleOpacityChange}
              style={{ flex: 1, height: 4 }}
            />
            <span style={{ minWidth: 28, textAlign: 'right' }}>
              {Math.round(state.opacity * 100)}%
            </span>
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* 覆盖层 Portal */}
        {overlayPortal}

        {/* 导出设置弹框 */}
        {showExportDialog && createPortal(
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}
            onClick={handleExportCancel}
          >
            <div
              style={{ background: '#fff', borderRadius: 8, padding: 20, width: 520, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>导出配准图片</div>

              {/* 设置区域 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 12, fontSize: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  宽度(px)
                  <input type="number" value={exportConfig.outputWidth} min={64} max={8192}
                    onChange={(e) => setExportConfig((c) => ({ ...c, outputWidth: +e.target.value || 1024 }))}
                    style={{ width: 72, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  高度(px)
                  <input type="number" value={exportConfig.outputHeight} min={64} max={8192}
                    onChange={(e) => setExportConfig((c) => ({ ...c, outputHeight: +e.target.value || 1024 }))}
                    style={{ width: 72, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  切片列数
                  <input type="number" value={exportConfig.cols} min={1} max={20}
                    onChange={(e) => setExportConfig((c) => ({ ...c, cols: Math.max(1, +e.target.value || 1) }))}
                    style={{ width: 48, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  切片行数
                  <input type="number" value={exportConfig.rows} min={1} max={20}
                    onChange={(e) => setExportConfig((c) => ({ ...c, rows: Math.max(1, +e.target.value || 1) }))}
                    style={{ width: 48, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </label>
              </div>

              <button
                onClick={handleGeneratePreview}
                disabled={exporting}
                style={{ padding: '6px 16px', fontSize: 12, border: 'none', borderRadius: 4, background: '#2563eb', color: '#fff', cursor: 'pointer', marginBottom: 12 }}
              >
                {exporting ? '生成中...' : '生成预览'}
              </button>

              {/* 预览区域 */}
              {exportResult && (
                <>
                  <div style={{ position: 'relative', marginBottom: 12, border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <img src={exportResult.previewUrl} style={{ width: '100%', display: 'block' }} />
                    {/* 网格线 */}
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

                  {/* 切片信息 */}
                  <div style={{ fontSize: 11, color: '#666', fontFamily: 'monospace', marginBottom: 12, maxHeight: 160, overflow: 'auto' }}>
                    <div style={{ marginBottom: 4, fontWeight: 600, color: '#333' }}>
                      总计 {exportResult.tiles.length} 个切片 | {exportResult.outputWidth}×{exportResult.outputHeight}px
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      Extent: [{exportResult.extent.map((v) => v.toFixed(5)).join(', ')}]
                    </div>
                    {exportResult.tiles.map((tile) => (
                      <div key={`${tile.row}_${tile.col}`} style={{ padding: '2px 0', borderBottom: '1px solid #f3f4f6' }}>
                        tile_{tile.row}_{tile.col}.png ({tile.width}×{tile.height}) — [{tile.extent.map((v) => v.toFixed(5)).join(', ')}]
                      </div>
                    ))}
                  </div>

                  {/* 下载按钮 */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={handleExportCancel} style={{ padding: '6px 16px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
                      取消
                    </button>
                    <button onClick={handleDownloadAll} style={{ padding: '6px 16px', fontSize: 12, border: 'none', borderRadius: 4, background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
                      打包下载 ZIP（{exportResult.tiles.length} 张 + 坐标JSON）
                    </button>
                  </div>
                </>
              )}

              {!exportResult && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleExportCancel} style={{ padding: '6px 16px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
                    取消
                  </button>
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
