import React, { useState, useCallback } from 'react';
import {
  AiMap,
  AnnotationControl,
  ZoomControl,
  type AnnotationFeature,
  type AnnotationMode,
} from '@antv/aimapui';

/**
 * 标注控件演示 — Marker / Highlighter / Text / Note / Link / Image / Video
 */
export default function AnnotationControlDemo() {
  const [features, setFeatures] = useState<AnnotationFeature[]>([]);
  const [currentMode, setCurrentMode] = useState<AnnotationMode>('select');
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 6));
  }, []);

  const modeLabel: Record<string, string> = {
    select: '选择', marker: '标记', highlighter: '高亮',
    text: '文字', note: '笔记', link: '链接',
    image: '图片', video: '视频', none: '无',
  };

  const handleCreate = useCallback((feature: AnnotationFeature) => {
    setFeatures((prev) => [...prev, feature]);
    addLog(`+ 创建 ${feature.properties.annotationType}: ${feature.id.slice(-8)}`);
  }, [addLog]);

  const handleUpdate = useCallback((feature: AnnotationFeature) => {
    setFeatures((prev) => prev.map((f) => (f.id === feature.id ? feature : f)));
    addLog(`~ 更新: ${feature.id.slice(-8)}`);
  }, [addLog]);

  const handleDelete = useCallback((feature: AnnotationFeature) => {
    setFeatures((prev) => prev.filter((f) => f.id !== feature.id));
    addLog(`- 删除: ${feature.id.slice(-8)}`);
  }, [addLog]);

  const handleSelect = useCallback((feature: AnnotationFeature | null) => {
    if (feature) {
      addLog(`> 选中 ${feature.properties.annotationType}: ${feature.id.slice(-8)}`);
    }
  }, [addLog]);

  const handleModeChange = useCallback((mode: AnnotationMode) => {
    setCurrentMode(mode);
  }, []);

  // 模拟图片上传 — 实际使用时替换为真实上传逻辑
  const handleUpload = useCallback(async (file: File, type: 'image' | 'video'): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
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
        <AnnotationControl
          position="topright"
          onAnnotationCreate={handleCreate}
          onAnnotationUpdate={handleUpdate}
          onAnnotationDelete={handleDelete}
          onAnnotationSelect={handleSelect}
          onModeChange={handleModeChange}
          onUpload={handleUpload}
        />
        <ZoomControl position="bottomright" />
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
          maxWidth: 280,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          标注控件
        </div>
        <div>模式: <b>{modeLabel[currentMode] || currentMode}</b></div>
        <div>标注: <b>{features.length}</b> 个</div>
        <div style={{ marginTop: 4, opacity: 0.6, fontSize: 11 }}>
          快捷键: M 标记 / H 高亮 / T 文字 / N 笔记 / K 链接 / I 图片 / V 视频 / Esc 选择
        </div>
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
