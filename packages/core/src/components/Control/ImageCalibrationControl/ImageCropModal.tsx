/**
 * ImageCropModal — 图片裁剪 + 初始坐标输入弹窗
 *
 * 上传图片后弹出此弹窗，用户可以：
 * 1. 拖拽裁剪框选择需要配准的图片区域
 * 2. 输入4个角点的初始地理坐标（或使用地图视口自动计算）
 * 3. 确认后进入配准阶段
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CropRegion, GeoCorners } from './image-calibration-types';
import { clampCropRegion } from './image-calibration-utils';

const CORNER_LABELS = ['左上 (TL)', '右上 (TR)', '右下 (BR)', '左下 (BL)'] as const;
const HANDLE_SIZE = 10;

interface CropHandleDragState {
  handle: 'tl' | 'tr' | 'br' | 'bl' | 'move';
  startMouseX: number;
  startMouseY: number;
  startCrop: CropRegion;
}

interface ImageCropModalProps {
  /** 原图 URL (ObjectURL 或远程 URL) */
  imageUrl: string;
  /** 原图尺寸 */
  imageDimensions: { width: number; height: number };
  /** 地图中心点 [lng, lat]，用于自动计算初始坐标 */
  mapCenter: [number, number] | null;
  /** 地图 zoom，用于自动计算初始坐标 */
  mapZoom: number | null;
  /** 是否显示初始坐标输入区域，默认 true */
  showInitialCoords?: boolean;
  /** 确认回调：传入裁剪区域和可选的初始坐标 */
  onConfirm: (cropRegion: CropRegion, initialCorners: GeoCorners | null) => void;
  /** 取消回调 */
  onCancel: () => void;
}

export function ImageCropModal({
  imageUrl,
  imageDimensions,
  mapCenter,
  mapZoom,
  showInitialCoords = true,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  // --- 裁剪区域状态 ---
  const [cropRegion, setCropRegion] = useState<CropRegion>({
    x: 0,
    y: 0,
    width: imageDimensions.width,
    height: imageDimensions.height,
  });
  const [dragState, setDragState] = useState<CropHandleDragState | null>(null);

  // --- 初始坐标状态 ---
  const [useAutoCoords, setUseAutoCoords] = useState(true);
  const [manualCorners, setManualCorners] = useState<GeoCorners>([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);

  // --- 图片显示缩放 ---
  const canvasRef = useRef<HTMLDivElement>(null);
  const [displayScale, setDisplayScale] = useState(1);

  // 根据容器尺寸计算缩放比例
  useEffect(() => {
    const updateScale = () => {
      if (!canvasRef.current) return;
      const containerWidth = canvasRef.current.clientWidth;
      const containerHeight = canvasRef.current.clientHeight;
      const scaleX = containerWidth / imageDimensions.width;
      const scaleY = containerHeight / imageDimensions.height;
      setDisplayScale(Math.min(scaleX, scaleY, 1));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageDimensions]);

  // --- 裁剪框拖拽逻辑 ---
  const imageElRef = useRef<HTMLImageElement | null>(null);

  const getCropFromMouse = useCallback(
    (clientX: number, clientY: number): { imgX: number; imgY: number } => {
      if (!imageElRef.current) return { imgX: 0, imgY: 0 };
      const rect = imageElRef.current.getBoundingClientRect();
      const imgX = (clientX - rect.left) / displayScale;
      const imgY = (clientY - rect.top) / displayScale;
      return { imgX, imgY };
    },
    [displayScale],
  );

  const handleCropMouseDown = useCallback(
    (e: React.MouseEvent, handle: CropHandleDragState['handle']) => {
      e.preventDefault();
      e.stopPropagation();
      setDragState({
        handle,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startCrop: { ...cropRegion },
      });
    },
    [cropRegion],
  );

  // document 级别 mousemove/mouseup
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - dragState.startMouseX) / displayScale;
      const deltaY = (e.clientY - dragState.startMouseY) / displayScale;
      const start = dragState.startCrop;

      let newRegion: CropRegion;
      switch (dragState.handle) {
        case 'move':
          newRegion = {
            ...start,
            x: start.x + deltaX,
            y: start.y + deltaY,
          };
          break;
        case 'tl':
          newRegion = {
            x: start.x + deltaX,
            y: start.y + deltaY,
            width: start.width - deltaX,
            height: start.height - deltaY,
          };
          break;
        case 'tr':
          newRegion = {
            x: start.x,
            y: start.y + deltaY,
            width: start.width + deltaX,
            height: start.height - deltaY,
          };
          break;
        case 'br':
          newRegion = {
            x: start.x,
            y: start.y,
            width: start.width + deltaX,
            height: start.height + deltaY,
          };
          break;
        case 'bl':
          newRegion = {
            x: start.x + deltaX,
            y: start.y,
            width: start.width - deltaX,
            height: start.height + deltaY,
          };
          break;
        default:
          newRegion = start;
      }

      // 确保 width/height 最小值
      if (newRegion.width < 20) {
        if (dragState.handle === 'tl' || dragState.handle === 'bl') {
          newRegion.x = start.x + start.width - 20;
        }
        newRegion.width = 20;
      }
      if (newRegion.height < 20) {
        if (dragState.handle === 'tl' || dragState.handle === 'tr') {
          newRegion.y = start.y + start.height - 20;
        }
        newRegion.height = 20;
      }

      setCropRegion(clampCropRegion(newRegion, imageDimensions.width, imageDimensions.height));
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, displayScale, imageDimensions]);

  // --- 坐标输入 ---
  const handleCornerInput = useCallback(
    (index: number, field: 'lng' | 'lat', value: string) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;
      const newCorners = [...manualCorners] as unknown as GeoCorners;
      newCorners[index] = [
        field === 'lng' ? numValue : newCorners[index][0],
        field === 'lat' ? numValue : newCorners[index][1],
      ];
      setManualCorners(newCorners);
    },
    [manualCorners],
  );

  // 当切换到自动模式时，用地图视口预填充坐标
  useEffect(() => {
    if (useAutoCoords && mapCenter && mapZoom !== null) {
      const aspect = cropRegion.width / cropRegion.height;
      const span = 360 / Math.pow(2, mapZoom) * 0.3;
      const halfW = (span * aspect) / 2;
      const halfH = span / 2;
      const [lng, lat] = mapCenter;
      setManualCorners([
        [lng - halfW, lat + halfH],
        [lng + halfW, lat + halfH],
        [lng + halfW, lat - halfH],
        [lng - halfW, lat - halfH],
      ]);
    }
  }, [useAutoCoords, mapCenter, mapZoom, cropRegion.width, cropRegion.height]);

  // --- 确认 ---
  const handleConfirmClick = useCallback(() => {
    const finalCorners = useAutoCoords ? null : manualCorners;
    onConfirm(cropRegion, finalCorners);
  }, [cropRegion, useAutoCoords, manualCorners, onConfirm]);

  // --- 渲染裁剪框叠加层 ---
  const cropDisplayX = cropRegion.x * displayScale;
  const cropDisplayY = cropRegion.y * displayScale;
  const cropDisplayW = cropRegion.width * displayScale;
  const cropDisplayH = cropRegion.height * displayScale;

  // 裁剪框外的遮罩区域（4块半透明遮罩）
  const maskStyle = (clipPath: string): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    top: 0,
    width: imageDimensions.width * displayScale,
    height: imageDimensions.height * displayScale,
    background: 'rgba(0, 0, 0, 0.45)',
    clipPath,
    pointerEvents: 'none',
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          padding: 0,
          width: 680,
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <span>图片裁剪 & 初始坐标</span>
          <button
            onClick={onCancel}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 20,
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 左侧：裁剪画布 */}
          <div
            ref={canvasRef}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              background: '#f9fafb',
              overflow: 'hidden',
              minHeight: 300,
            }}
          >
            <div style={{ position: 'relative', lineHeight: 0 }}>
              <img
                ref={imageElRef}
                src={imageUrl}
                style={{
                  width: imageDimensions.width * displayScale,
                  height: imageDimensions.height * displayScale,
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                draggable={false}
              />

              {/* 遮罩层 — 4块遮住裁剪框外区域 */}
              <div style={maskStyle(`polygon(0% 0%, 100% 0%, 100% ${cropDisplayY}px, ${cropDisplayX}px ${cropDisplayY}px, ${cropDisplayX}px ${cropDisplayY + cropDisplayH}px, 0% ${cropDisplayY + cropDisplayH}px)`)} />
              <div style={maskStyle(`polygon(100% 0%, 100% 100%, ${cropDisplayX + cropDisplayW}px 100%, ${cropDisplayX + cropDisplayW}px ${cropDisplayY}px, 100% ${cropDisplayY}px)`)} />
              <div style={maskStyle(`polygon(${cropDisplayX + cropDisplayW}px ${cropDisplayY}px, 100% ${cropDisplayY}px, 100% 100%, ${cropDisplayX + cropDisplayW}px 100%, ${cropDisplayX + cropDisplayW}px ${cropDisplayY + cropDisplayH}px)`)} />
              <div style={maskStyle(`polygon(0% ${cropDisplayY + cropDisplayH}px, ${cropDisplayX}px ${cropDisplayY + cropDisplayH}px, ${cropDisplayX + cropDisplayW}px ${cropDisplayY + cropDisplayH}px, ${cropDisplayX + cropDisplayW}px 100%, 0% 100%)`)} />

              {/* 裁剪框边框 */}
              <div
                onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                style={{
                  position: 'absolute',
                  left: cropDisplayX,
                  top: cropDisplayY,
                  width: cropDisplayW,
                  height: cropDisplayH,
                  border: '2px solid #f59e0b',
                  cursor: dragState?.handle === 'move' ? 'grabbing' : 'grab',
                  pointerEvents: 'auto',
                  boxSizing: 'border-box',
                }}
              >
                {/* 网格辅助线 (三等分) */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {/* 横线 */}
                  <div style={{ position: 'absolute', top: '33.3%', left: 0, right: 0, height: 1, background: 'rgba(245,158,7,0.3)' }} />
                  <div style={{ position: 'absolute', top: '66.6%', left: 0, right: 0, height: 1, background: 'rgba(245,158,7,0.3)' }} />
                  {/* 竖线 */}
                  <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: 1, background: 'rgba(245,158,7,0.3)' }} />
                  <div style={{ position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: 1, background: 'rgba(245,158,7,0.3)' }} />
                </div>

                {/* 四角拖拽手柄 */}
                {(['tl', 'tr', 'br', 'bl'] as const).map((handle) => {
                  const positions: Record<string, React.CSSProperties> = {
                    tl: { left: -HANDLE_SIZE / 2, top: -HANDLE_SIZE / 2, cursor: 'nwse-resize' },
                    tr: { right: -HANDLE_SIZE / 2, top: -HANDLE_SIZE / 2, cursor: 'nesw-resize' },
                    br: { right: -HANDLE_SIZE / 2, bottom: -HANDLE_SIZE / 2, cursor: 'nwse-resize' },
                    bl: { left: -HANDLE_SIZE / 2, bottom: -HANDLE_SIZE / 2, cursor: 'nesw-resize' },
                  };
                  return (
                    <div
                      key={handle}
                      onMouseDown={(e) => handleCropMouseDown(e, handle)}
                      style={{
                        position: 'absolute',
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                        background: '#fff',
                        border: '2px solid #f59e0b',
                        borderRadius: 2,
                        pointerEvents: 'auto',
                        ...positions[handle],
                      }}
                    />
                  );
                })}

                {/* 裁剪尺寸标注 */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -22,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 10,
                    color: '#f59e0b',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    fontFamily: 'monospace',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '1px 4px',
                    borderRadius: 2,
                  }}
                >
                  {Math.round(cropRegion.width)} × {Math.round(cropRegion.height)}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：坐标输入面板 */}
          {showInitialCoords && (
            <div
              style={{
                width: 260,
                padding: '16px 20px',
                borderLeft: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                overflowY: 'auto',
                fontSize: 12,
              }}
            >
              {/* 裁剪区域信息 */}
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#333' }}>裁剪区域</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', color: '#666', fontFamily: 'monospace', fontSize: 11 }}>
                <span>X: {Math.round(cropRegion.x)}px</span>
                <span>Y: {Math.round(cropRegion.y)}px</span>
                <span>W: {Math.round(cropRegion.width)}px</span>
                <span>H: {Math.round(cropRegion.height)}px</span>
              </div>

              {/* 重置裁剪区域按钮 */}
              <button
                onClick={() => setCropRegion({ x: 0, y: 0, width: imageDimensions.width, height: imageDimensions.height })}
                style={{
                  padding: '4px 12px',
                  fontSize: 11,
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  background: '#fff',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                重置裁剪区域
              </button>

              {/* 坐标输入模式 */}
              <div style={{ fontWeight: 600, color: '#333', marginTop: 8 }}>初始坐标</div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="coordMode"
                    checked={useAutoCoords}
                    onChange={() => setUseAutoCoords(true)}
                  />
                  <span>自动计算</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="coordMode"
                    checked={!useAutoCoords}
                    onChange={() => setUseAutoCoords(false)}
                  />
                  <span>手动输入</span>
                </label>
              </div>

              {useAutoCoords && (
                <div style={{ color: '#888', fontSize: 11, lineHeight: 1.5 }}>
                  基于当前地图视口中心自动计算4个角点坐标。确认后将图片放置到地图视口中。
                </div>
              )}

              {!useAutoCoords && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {manualCorners.map((corner, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 64, color: '#666', fontSize: 11 }}>{CORNER_LABELS[index]}</span>
                      <input
                        type="number"
                        step="any"
                        value={corner[0]}
                        onChange={(e) => handleCornerInput(index, 'lng', e.target.value)}
                        placeholder="经度"
                        style={{
                          width: 72,
                          padding: '3px 6px',
                          border: '1px solid #d1d5db',
                          borderRadius: 3,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        }}
                      />
                      <input
                        type="number"
                        step="any"
                        value={corner[1]}
                        onChange={(e) => handleCornerInput(index, 'lat', e.target.value)}
                        placeholder="纬度"
                        style={{
                          width: 72,
                          padding: '3px 6px',
                          border: '1px solid #d1d5db',
                          borderRadius: 3,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 坐标预览 */}
              <div style={{ fontSize: 10, color: '#999', fontFamily: 'monospace', lineHeight: 1.6, marginTop: 4 }}>
                {useAutoCoords ? '自动模式' : '手动模式'}:
                {manualCorners.map((c, i) => (
                  <div key={i}>{CORNER_LABELS[i]}: [{c[0].toFixed(4)}, {c[1].toFixed(4)}]</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '12px 20px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '6px 20px',
              fontSize: 13,
              border: '1px solid #d1d5db',
              borderRadius: 5,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirmClick}
            style={{
              padding: '6px 20px',
              fontSize: 13,
              border: 'none',
              borderRadius: 5,
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            确认裁剪 & 开始配准
          </button>
        </div>
      </div>
    </div>
  );
}
