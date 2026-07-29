import React, { useEffect, useState } from 'react';
import { AiMap, WindFieldLayer, ZoomControl } from '@antv/aimapui';
import type { WindFieldData } from '@antv/aimapui';
import { Legend } from '../components/Legend';

const API_LASTWIND = 'https://typhoon.slt.zj.gov.cn/Api/LastWind';

/** 将台风 API 返回的原始数据转换为 WindFieldData */
function adaptWindData(raw: Record<string, unknown>): WindFieldData | null {
  const rawWindData = raw.windData;
  // windData 可能是 JSON 字符串或已解析的数组
  const windArray: any[] = typeof rawWindData === 'string'
    ? JSON.parse(rawWindData)
    : (rawWindData as any[]);
  if (!Array.isArray(windArray) || windArray.length < 2) return null;

  const uItem = windArray.find((g: any) =>
    g.header?.parameterNumberName?.includes('U-component'));
  const vItem = windArray.find((g: any) =>
    g.header?.parameterNumberName?.includes('V-component'));

  if (!uItem || !vItem) return null;

  const h = uItem.header;
  return {
    uData: uItem.data,
    vData: vItem.data,
    cols: h.nx,
    rows: h.ny,
    originLng: h.lo1,
    originLat: h.la1,
    deltaLng: h.dx,
    deltaLat: h.dy,
  };
}

const WIND_RAMP_COLORS = ['#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#ef4444'];

/**
 * 风场图层 Demo
 *
 * 使用 Canvas 粒子动画渲染全球风场：
 * - 数据来源：台风网 LastWind API（GRIB2 U/V 分量，360×181 网格，1° 分辨率）
 * - 粒子沿 U/V 分量方向移动
 * - 风速→HSL 颜色映射（蓝→青→绿→黄→红）
 * - 拖尾淡出效果
 */
export default function WindFieldLayerDemo() {
  const [data, setData] = useState<WindFieldData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_LASTWIND, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Record<string, unknown> = await res.json();
        if (cancelled) return;

        const adapted = adaptWindData(json);
        if (!adapted) throw new Error('解析风场数据失败');
        setData(adapted);
        setTime(String(json.synTime ?? ''));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [120, 30],
          zoom: 2,
          style: 'dark',
        }}
      >
        {data && (
          <WindFieldLayer
            source={data}
            particleCount={12000}
            speedScale={0.35}
            opacity={0.85}
          />
        )}
        <ZoomControl position="bottomright" />
      </AiMap>

      {/* 风速色带图例 */}
      <div style={{ position: 'absolute', bottom: 32, left: 16, zIndex: 10 }}>
        <Legend
          type="ramp"
          title="风速 (m/s)"
          colors={WIND_RAMP_COLORS}
          labels={['0', '30+']}
        />
      </div>

      {/* 状态提示 */}
      {loading && !error && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 20,
          padding: '6px 12px', borderRadius: 8,
          background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
          color: '#94a3b8', fontSize: 12,
        }}>
          正在加载风场数据…
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 20,
          padding: '6px 12px', borderRadius: 8,
          background: 'rgba(127,29,29,0.9)',
          color: '#fca5a5', fontSize: 12,
        }}>
          ❌ {error}
        </div>
      )}
      {data && time && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10,
          padding: '6px 12px', borderRadius: 8,
          background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
          color: '#94a3b8', fontSize: 11,
        }}>
          {time}
        </div>
      )}
    </div>
  );
}