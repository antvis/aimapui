import React, { useState, useCallback } from 'react';
import { AiMap, ZoomControl } from '@antv/aimapui';
import { PlotControl, type PlotFeature, type PlotMode } from '@antv/aimapui-plot';

export default function PlotControlDemo() {
  const [currentMode, setCurrentMode] = useState<PlotMode>('select');
  const [log, setLog] = useState<string[]>([]);
  const [featureCount, setFeatureCount] = useState(0);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 6));
  }, []);

  const modeLabel: Record<string, string> = {
    select: '选择', edit: '编辑', rectangle: '矩形', circle: '圆形',
    sector: '扇形', 'straight-arrow': '直线箭头', 'curve-arrow': '曲线箭头', none: '无',
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [116.4, 39.9],
          zoom: 10,
          style: 'dark',
        }}
      >
        <PlotControl
          position="topright"
          onPlotCreate={(f) => {
            setFeatureCount((n) => n + 1);
            addLog(`+ 创建 ${f.properties.plotType}`);
          }}
          onPlotDelete={(f) => {
            setFeatureCount((n) => n - 1);
            addLog(`- 删除 ${f.properties.plotType}`);
          }}
          onPlotSelect={(f) => {
            if (f) addLog(`> 选中 ${f.properties.plotType}`);
          }}
          onModeChange={setCurrentMode}
        />
        <ZoomControl position="bottomright" />
      </AiMap>

      <div
        style={{
          position: 'absolute', bottom: 16, left: 16,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '10px 14px', fontSize: 12,
          color: '#333', lineHeight: 1.6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: 280, pointerEvents: 'none',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>态势标绘</div>
        <div>模式: <b>{modeLabel[currentMode] || currentMode}</b></div>
        <div>图形: <b>{featureCount}</b> 个</div>
        <div style={{ marginTop: 4, opacity: 0.6, fontSize: 11 }}>
          矩形/圆: 2 点 | 扇形: 3 点 | 直线箭头: 2 点 | 曲线箭头: 3+ 点(双击完成)
        </div>
        {log.length > 0 && (
          <div style={{ marginTop: 6, borderTop: '1px solid #e5e5e5', paddingTop: 6, opacity: 0.8 }}>
            {log.map((msg, i) => <div key={i}>{msg}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
