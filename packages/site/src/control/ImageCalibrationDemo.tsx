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

/**
 * 图片配准控件演示 — 左侧工具条形式，支持上传图片、缩放定位、校准、导出
 */
export default function ImageCalibrationDemo() {
  const [corners, setCorners] = useState<GeoCorners | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const controlRef = useRef<ImageCalibrationHandle>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 6));
  }, []);

  const handleCornersChange = useCallback((newCorners: GeoCorners) => {
    setCorners(newCorners);
  }, []);

  const handleCalibrate = useCallback((result: CalibrationResult) => {
    addLog(`校准完成 extent: [${result.extent.map((v: number) => v.toFixed(4)).join(', ')}]`);
  }, [addLog]);

  const handleExport = useCallback((result: ExportResult) => {
    const sizeMB = (result.blob.size / 1024 / 1024).toFixed(2);
    addLog(`导出 ${result.tiles.length} 切片, ${result.outputWidth}×${result.outputHeight}px, ${sizeMB} MB`);
  }, [addLog]);

  const handleClear = useCallback(() => {
    setCorners(null);
    addLog('已清除');
  }, [addLog]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
          position="topleft"
          opacity={0.7}
          onCornersChange={handleCornersChange}
          onCalibrate={handleCalibrate}
          onExport={handleExport}
          onClear={handleClear}
        />
        <ZoomControl position="bottomright" />
      </AiMap>

      {/* 简洁日志面板 */}
      {log.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            maxWidth: 340,
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 11,
            fontFamily: 'monospace',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          {log.map((msg, i) => (
            <div key={i} style={{ color: i === 0 ? '#333' : '#999', marginBottom: 2 }}>{msg}</div>
          ))}
        </div>
      )}
    </div>
  );
}
