import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { AiMap, FillLayer } from '@antv/aimapui';
import { Marker } from '@antv/aimapui';

/* ================================================================
   旅行足迹统计地图 — 移动端应用 Demo
   设计参考：大众点评足迹地图
   - 顶部：渐变背景 + 用户头像 + 打卡统计
   - 地图：中国行政区划高亮 + 打卡标记
   - 底部：足迹地图搜索栏
   ================================================================ */

/** 打卡城市数据 */
interface CheckinCity {
  name: string;
  province: string;
  lng: number;
  lat: number;
  count: number;
}

/** 已打卡省份（用于行政区高亮） */
const VISITED_PROVINCES = ['北京市', '辽宁省', '吉林省', '山东省', '江苏省', '上海市', '浙江省', '安徽省'];

/** 打卡城市详情 */
const CHECKIN_CITIES: CheckinCity[] = [
  { name: '北京', province: '北京市', lng: 116.4, lat: 39.9, count: 12 },
  { name: '大连', province: '辽宁省', lng: 121.6, lat: 38.9, count: 1 },
  { name: '长春', province: '吉林省', lng: 125.3, lat: 43.8, count: 1 },
  { name: '上海', province: '上海市', lng: 121.4, lat: 31.2, count: 5 },
  { name: '杭州', province: '浙江省', lng: 120.1, lat: 30.3, count: 3 },
];

/** 统计数据 */
const STATS = {
  cities: 5,
  spots: 22,
  checkins: 22,
};

/** 省份 GeoJSON 数据 URL */
const PROVINCE_GEO_URL = 'https://geo.datav.alipay.com/areas_v3/bound/100000_full.json';

export default function TravelStatsMap() {
  const [geoData, setGeoData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(PROVINCE_GEO_URL)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch(() => {});
  }, []);

  /** 过滤出已访问省份的 GeoJSON */
  const visitedGeoJSON = useMemo(() => {
    if (!geoData) return null;
    return {
      type: 'FeatureCollection' as const,
      features: geoData.features.filter((f: any) =>
        VISITED_PROVINCES.includes(f.properties.name),
      ),
    };
  }, [geoData]);

  /** 导出图片分享 */
  const handleExport = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = container.querySelector('canvas');
    if (!canvas) {
      alert('地图尚未加载完成，请稍后重试');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `我的足迹地图_${new Date().toLocaleDateString()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* ========== 顶部渐变区域 ========== */}
      <div
        style={{
          flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #1d4ed8 100%)',
          padding: '24px 20px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装饰光效 */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', filter: 'blur(20px)' }} />
        <div style={{ position: 'absolute', top: 10, left: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(15px)' }} />

        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>我的足迹地图</h1>
        </div>

        {/* 用户信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', border: '2px solid rgba(255,255,255,0.6)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#9ca3af' }}>person</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>lzxue</span>
        </div>

        {/* 统计文字 */}
        <div style={{ color: '#fff', fontSize: 15, lineHeight: 1.8 }}>
          <div>
            你的打卡分布在<span style={{ fontSize: 20, fontWeight: 800, color: '#a5f3fc' }}>{STATS.cities}</span>个城市
          </div>
          <div>
            共在<span style={{ fontSize: 20, fontWeight: 800, color: '#a5f3fc' }}>{STATS.spots}</span>个地点打卡<span style={{ fontSize: 20, fontWeight: 800, color: '#a5f3fc' }}>{STATS.checkins}</span>次
          </div>
        </div>

        {/* 分享按钮 */}
        <button
          onClick={handleExport}
          style={{
            position: 'absolute',
            top: 20,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>share</span>
          分享
        </button>
      </div>

      {/* ========== 地图区域 ========== */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <AiMap
          map={{
            basemap: 'gaode',
            center: [108, 34],
            zoom: 3.8,
            style: 'dark',
          }}
        >
          {/* 已访问省份高亮填充 */}
          {visitedGeoJSON && (
            <FillLayer
              source={visitedGeoJSON}
              sourceType="geojson"
              color="#93c5fd"
              strokeColor="#3b82f6"
              strokeWidth={1.5}
              opacity={0.5}
            />
          )}

          {/* 打卡城市标记 */}
          {CHECKIN_CITIES.map((city) => (
            <Marker
              key={city.name}
              longitude={city.lng}
              latitude={city.lat}
              anchor="bottom"
              content={<CheckinMarker name={city.name} count={city.count} />}
            />
          ))}
        </AiMap>
      </div>
    </div>
  );
}

/* ================================================================
   子组件 — 打卡标记
   ================================================================ */

function CheckinMarker({ name, count }: { name: string; count: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 打卡卡片 */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(249,115,22,0.4)',
            border: '2px solid #fff',
            position: 'relative',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#fff', fontWeight: 700, background: '#dc2626', borderRadius: 2, padding: '0 3px', marginBottom: 2 }}>去过</div>
            <span style={{ fontSize: 16 }}>🎉</span>
          </div>
        </div>
        {/* 打卡次数角标 */}
        <div
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#22c55e',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
          }}
        >
          {count}
        </div>
      </div>
      {/* 省份名 */}
      <span style={{ fontSize: 11, color: '#374151', fontWeight: 500, marginTop: 4, textShadow: '0 0 4px #fff, 0 0 4px #fff' }}>{name}</span>
    </div>
  );
}
