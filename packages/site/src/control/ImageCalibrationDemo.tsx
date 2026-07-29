import React, { useState, useCallback, useRef } from 'react';
import {
  AiMap,
  ImageCalibrationControl,
  ZoomControl,
  SatelliteLayer,
  type GeoCorners,
  type CalibrationResult,
  type ExportResult,
  type ImageCalibrationHandle,
} from '@antv/aimapui';

/**
 * 图片配准控件演示 — 水平布局，内置多图配准列表管理
 */
export default function ImageCalibrationDemo() {
  const [log, setLog] = useState<string[]>([]);
  const [satellite, setSatellite] = useState(false);
  const controlRef = useRef<ImageCalibrationHandle>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 12));
  }, []);

  /** 控件回调：角点变化 */
  const handleCornersChange = useCallback(
    () => {},
    [],
  );

  /** 控件回调：校准完成 */
  const handleCalibrate = useCallback(
    (imageId: string, result: CalibrationResult) => {
      addLog(`校准完成 [${imageId}] extent: [${result.extent.map((v) => v.toFixed(4)).join(', ')}]`);
    },
    [addLog],
  );

  /** 控件回调：导出 */
  const handleExport = useCallback(
    (imageId: string, result: ExportResult) => {
      const sizeMB = (result.blob.size / 1024 / 1024).toFixed(2);
      addLog(`导出 [${imageId}] ${result.tiles.length} 切片, ${result.outputWidth}×${result.outputHeight}px, ${sizeMB} MB`);
    },
    [addLog],
  );

  /** 控件回调：预处理 */
  const handlePreprocess = useCallback(
    (imageId: string, result: { croppedDimensions: { width: number; height: number }; initialCorners: GeoCorners | null }) => {
      const { croppedDimensions, initialCorners } = result;
      const cornersInfo = initialCorners ? '含初始坐标' : '自动计算坐标';
      addLog(`预处理 [${imageId}] ${croppedDimensions.width}×${croppedDimensions.height}px, ${cornersInfo}`);
    },
    [addLog],
  );

  /** 控件回调：清除 */
  const handleClear = useCallback((imageId: string) => {
    addLog(`已清除 [${imageId}]`);
  }, [addLog]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 卫星底图切换 */}
      <button
        onClick={() => setSatellite((v) => !v)}
        title={satellite ? '关闭卫星底图' : '开启卫星底图'}
        style={{
          position: 'absolute', top: 12, left: 12, zIndex: 100,
          padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)',
          cursor: 'pointer', fontSize: 12, fontWeight: 600,
          background: satellite ? '#2563eb' : 'rgba(255,255,255,0.92)',
          color: satellite ? '#fff' : '#475569',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'background 0.15s, color 0.15s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          satellite_alt
        </span>
        卫星
      </button>

      <AiMap
        map={{
          basemap: 'gaode',
          center: [116.4, 39.9],
          zoom: 12,
          style: satellite ? 'normal' : 'light',
        }}
      >
        {satellite && <SatelliteLayer provider="gaode" />}
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

      {/* 底部日志面板 */}
      {log.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            maxHeight: 120,
            overflowY: 'auto',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: 6,
            border: '1px solid #e0e0e0',
            fontSize: 11,
            fontFamily: 'monospace',
            zIndex: 50,
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
  );
}