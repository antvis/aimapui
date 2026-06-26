import React, { useState, useCallback, useRef } from 'react';
import {
  AiMap,
  ImageCalibrationControl,
  ZoomControl,
  type GeoCorners,
  type CalibrationResult,
  type ExportResult,
  type ImageCalibrationHandle,
} from '@antv/aimapui';

/** 单张校准图片的数据结构 */
interface CalibImage {
  id: string;
  name: string;
  file: File;
  previewUrl: string;
  corners: GeoCorners | null;
  phase: 'idle' | 'calibrating' | 'confirmed';
}

let nextId = 1;

/**
 * 图片配准控件演示 — 水平布局，支持多张图片管理
 */
export default function ImageCalibrationDemo() {
  const [images, setImages] = useState<CalibImage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const controlRef = useRef<ImageCalibrationHandle>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 12));
  }, []);

  /** 添加多张图片 */
  const handleAddFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      e.target.value = '';

      const newImages: CalibImage[] = Array.from(files).map((f: File) => ({
        id: `img-${nextId++}`,
        name: f.name,
        file: f,
        previewUrl: URL.createObjectURL(f),
        corners: null,
        phase: 'idle' as CalibImage['phase'],
      }));

      setImages((prev) => [...prev, ...newImages]);

      // 如果没有激活图片，激活第一张新增图片并加载到控件
      if (!activeId) {
        const firstNew = newImages[0];
        setActiveId(firstNew.id);
        setTimeout(() => {
          controlRef.current?.setImage(firstNew.file);
        }, 100);
      }

      addLog(`添加了 ${newImages.length} 张图片`);
    },
    [activeId, addLog],
  );

  /** 选中某张图片，激活校准 */
  const handleSelectImage = useCallback(
    (id: string) => {
      if (id === activeId) return;
      const img = images.find((i) => i.id === id);
      if (!img) return;

      setActiveId(id);

      controlRef.current?.clear();
      setTimeout(() => {
        if (img.corners) {
          controlRef.current?.setImage(img.file, img.corners);
        } else {
          controlRef.current?.setImage(img.file);
        }
      }, 100);

      addLog(`选中图片: ${img.name}`);
    },
    [images, activeId, addLog],
  );

  /** 替换当前激活图片 */
  const handleReplaceFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeId) return;
      e.target.value = '';

      const oldImage = images.find((i) => i.id === activeId);
      if (oldImage) {
        URL.revokeObjectURL(oldImage.previewUrl);
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === activeId
            ? {
                ...img,
                name: file.name,
                file,
                previewUrl: URL.createObjectURL(file),
                corners: null,
                phase: 'idle',
              }
            : img,
        ),
      );

      controlRef.current?.clear();
      setTimeout(() => {
        controlRef.current?.setImage(file);
      }, 100);

      addLog(`替换图片: ${file.name}`);
    },
    [activeId, images, addLog],
  );

  /** 删除图片 */
  const handleDeleteImage = useCallback(
    (id: string) => {
      const img = images.find((i) => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.previewUrl);
      }

      setImages((prev) => prev.filter((i) => i.id !== id));

      if (id === activeId) {
        const remaining = images.filter((i) => i.id !== id);
        if (remaining.length > 0) {
          const nextActive = remaining[0];
          setActiveId(nextActive.id);
          controlRef.current?.clear();
          setTimeout(() => {
            if (nextActive.corners) {
              controlRef.current?.setImage(nextActive.file, nextActive.corners);
            } else {
              controlRef.current?.setImage(nextActive.file);
            }
          }, 100);
        } else {
          setActiveId(null);
          controlRef.current?.clear();
        }
      }

      addLog('删除图片');
    },
    [images, activeId, addLog],
  );

  /** 控件回调：角点变化时保存到对应图片 */
  const handleCornersChange = useCallback(
    (newCorners: GeoCorners) => {
      if (!activeId) return;
      setImages((prev) =>
        prev.map((img) =>
          img.id === activeId ? { ...img, corners: newCorners } : img,
        ),
      );
    },
    [activeId],
  );

  /** 控件回调：校准完成 */
  const handleCalibrate = useCallback(
    (result: CalibrationResult) => {
      if (!activeId) return;
      setImages((prev) =>
        prev.map((img) =>
          img.id === activeId ? { ...img, phase: 'confirmed' as CalibImage['phase'] } : img,
        ),
      );
      addLog(`校准完成 extent: [${result.extent.map((v) => v.toFixed(4)).join(', ')}]`);
    },
    [activeId, addLog],
  );

  /** 控件回调：导出 */
  const handleExport = useCallback(
    (result: ExportResult) => {
      const sizeMB = (result.blob.size / 1024 / 1024).toFixed(2);
      addLog(`导出 ${result.tiles.length} 切片, ${result.outputWidth}×${result.outputHeight}px, ${sizeMB} MB`);
    },
    [addLog],
  );

  /** 控件回调：预处理 */
  const handlePreprocess = useCallback(
    (result: { croppedDimensions: { width: number; height: number }; initialCorners: GeoCorners | null }) => {
      const { croppedDimensions, initialCorners } = result;
      const cornersInfo = initialCorners ? '含初始坐标' : '自动计算坐标';
      addLog(`预处理完成 ${croppedDimensions.width}×${croppedDimensions.height}px, ${cornersInfo}`);
    },
    [addLog],
  );

  /** 控件回调：清除 */
  const handleClear = useCallback(() => {
    if (!activeId) return;
    setImages((prev) =>
      prev.map((img) =>
        img.id === activeId ? { ...img, corners: null, phase: 'idle' } : img,
      ),
    );
    addLog('已清除');
  }, [activeId, addLog]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      {/* 左侧：图片管理面板 */}
      <div
        style={{
          width: 280,
          height: '100%',
          background: '#f8f9fa',
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 面板标题 + 添加按钮 */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e0e0e0',
            background: '#fff',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>
            校准图片
          </span>
          <button
            onClick={() => addFileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              fontSize: 12,
              border: 'none',
              borderRadius: 4,
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
            添加
          </button>
          <input
            ref={addFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddFiles}
            style={{ display: 'none' }}
          />
        </div>

        {/* 图片列表 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {images.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#999',
                fontSize: 12,
                padding: '40px 0',
              }}
            >
              点击"添加"上传校准图片
            </div>
          )}

          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => handleSelectImage(img.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px',
                marginBottom: 6,
                borderRadius: 6,
                background: img.id === activeId ? '#e8f0fe' : '#fff',
                border: img.id === activeId
                  ? '2px solid #2563eb'
                  : '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {/* 缩略图 */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#eee',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* 图片信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {img.name}
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                  {img.phase === 'idle' && '未校准'}
                  {img.phase === 'calibrating' && '校准中'}
                  {img.phase === 'confirmed' && '已校准 ✓'}
                </div>
              </div>

              {/* 操作按钮（仅激活图片显示） */}
              {img.id === activeId && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      replaceFileInputRef.current?.click();
                    }}
                    title="替换图片"
                    style={{
                      padding: '4px',
                      border: 'none',
                      borderRadius: 4,
                      background: '#f0f0f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#666' }}>swap_horiz</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(img.id);
                    }}
                    title="删除"
                    style={{
                      padding: '4px',
                      border: 'none',
                      borderRadius: 4,
                      background: '#f0f0f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#e53935' }}>close</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 底部日志面板 */}
        {log.length > 0 && (
          <div
            style={{
              maxHeight: 120,
              overflowY: 'auto',
              padding: '8px 12px',
              background: '#fff',
              borderTop: '1px solid #e0e0e0',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            {log.map((msg, i) => (
              <div key={i} style={{ color: i === 0 ? '#333' : '#999', marginBottom: 2 }}>
                {msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右侧：地图 + 校准控件 */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <AiMap
          map={{
            basemap: 'gaode',
            center: [116.4, 39.9],
            zoom: 12,
            style: 'light',
          }}
        >
          <ImageCalibrationControl
            ref={controlRef}
            position="topright"
            layout="horizontal"
            opacity={0.7}
            enableCrop={true}
            enableInitialCoords={true}
            onCornersChange={handleCornersChange}
            onCalibrate={handleCalibrate}
            onExport={handleExport}
            onPreprocess={handlePreprocess}
            onClear={handleClear}
          />
          <ZoomControl position="bottomright" />
        </AiMap>
      </div>

      {/* 隐藏的替换文件 input */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}
