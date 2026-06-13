import React, { useState, useCallback } from 'react';
import {
  AiMap,
  DrawControl,
  ZoomControl,
  type DrawFeature,
  type DrawMode,
} from '@antv/aimapui';

/**
 * 绘制控件演示 — 展示点/线/面/矩形/圆形绘制与编辑功能
 */
export default function DrawControlDemo() {
  const [features, setFeatures] = useState<DrawFeature[]>([]);
  const [currentMode, setCurrentMode] = useState<DrawMode>('none');
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 5));
  }, []);

  const handleDrawCreate = useCallback((newFeatures: DrawFeature[]) => {
    setFeatures((prev) => [...prev, ...newFeatures]);
    newFeatures.forEach((f) => {
      addLog(`✅ 创建 ${f.properties.drawType}: ${f.id}`);
    });
  }, [addLog]);

  const handleDrawUpdate = useCallback((feature: DrawFeature) => {
    setFeatures((prev) => prev.map((f) => (f.id === feature.id ? feature : f)));
    addLog(`✏️ 更新: ${feature.id}`);
  }, [addLog]);

  const handleDrawDelete = useCallback((feature: DrawFeature) => {
    setFeatures((prev) => prev.filter((f) => f.id !== feature.id));
    addLog(`🗑️ 删除: ${feature.id}`);
  }, [addLog]);

  const handleDrawSelect = useCallback((feature: DrawFeature | null) => {
    if (feature) {
      addLog(`👆 选中: ${feature.id}`);
    }
  }, [addLog]);

  const handleModeChange = useCallback((mode: DrawMode) => {
    setCurrentMode(mode);
  }, []);

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
        <DrawControl
          position="topright"
          onDrawCreate={handleDrawCreate}
          onDrawUpdate={handleDrawUpdate}
          onDrawDelete={handleDrawDelete}
          onDrawSelect={handleDrawSelect}
          onModeChange={handleModeChange}
        />
        <ZoomControl />
      </AiMap>

      {/* 状态面板 */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          color: '#333',
          lineHeight: 1.6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: 260,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          绘制控件
        </div>
        <div>模式: <b>{currentMode === 'none' ? '未激活' : currentMode}</b></div>
        <div>要素: <b>{features.length}</b> 个</div>
        {log.length > 0 && (
          <div style={{ marginTop: 6, borderTop: '1px solid #e5e5e5', paddingTop: 6, opacity: 0.8 }}>
            {log.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}