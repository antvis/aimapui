import React, { useState, useMemo } from 'react';
import { Aimap, LineLayer, PointLayer, ZoomControl, MapThemeControl } from '../../index';
import { Legend } from '../components/Legend';

/* ================================================================
   最炫航线图 — 应用模板 Demo
   设计参考：航旅纵横「最炫航线图」
   - 弧线展示飞行/火车航路
   - 出发/到达城市标记点
   - 底部统计卡片：出行分类 + 总里程
   - 渐变弧线 + 动画效果
   ================================================================ */

/** 航线数据 */
interface Route {
  from: string;
  fromLng: number;
  fromLat: number;
  to: string;
  toLng: number;
  toLat: number;
  type: 'flight' | 'train';
  count: number;
}

const ROUTES: Route[] = [
  // 国际航线
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '东京', toLng: 139.69, toLat: 35.69, type: 'flight', count: 12 },
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '首尔', toLng: 126.98, toLat: 37.57, type: 'flight', count: 8 },
  { from: '上海', fromLng: 121.47, fromLat: 31.23, to: '东京', toLng: 139.69, toLat: 35.69, type: 'flight', count: 15 },
  { from: '上海', fromLng: 121.47, fromLat: 31.23, to: '新加坡', toLng: 103.85, toLat: 1.29, type: 'flight', count: 6 },
  { from: '上海', fromLng: 121.47, fromLat: 31.23, to: '曼谷', toLng: 100.50, toLat: 13.76, type: 'flight', count: 4 },
  { from: '广州', fromLng: 113.26, fromLat: 23.13, to: '吉隆坡', toLng: 101.69, toLat: 3.14, type: 'flight', count: 7 },
  { from: '广州', fromLng: 113.26, fromLat: 23.13, to: '悉尼', toLng: 151.21, toLat: -33.87, type: 'flight', count: 3 },
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '伦敦', toLng: -0.12, toLat: 51.51, type: 'flight', count: 5 },
  { from: '上海', fromLng: 121.47, fromLat: 31.23, to: '巴黎', toLng: 2.35, toLat: 48.86, type: 'flight', count: 4 },
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '纽约', toLng: -74.0, toLat: 40.71, type: 'flight', count: 2 },
  { from: '成都', fromLng: 104.07, fromLat: 30.67, to: '加德满都', toLng: 85.32, toLat: 27.72, type: 'flight', count: 3 },
  { from: '昆明', fromLng: 102.83, fromLat: 25.04, to: '曼谷', toLng: 100.50, toLat: 13.76, type: 'flight', count: 5 },
  // 国内航线
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '上海', toLng: 121.47, toLat: 31.23, type: 'flight', count: 28 },
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '广州', toLng: 113.26, toLat: 23.13, type: 'flight', count: 18 },
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '成都', toLng: 104.07, toLat: 30.67, type: 'flight', count: 14 },
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '深圳', toLng: 114.06, toLat: 22.54, type: 'flight', count: 11 },
  { from: '上海', fromLng: 121.47, fromLat: 31.23, to: '深圳', toLng: 114.06, toLat: 22.54, type: 'flight', count: 16 },
  { from: '上海', fromLng: 121.47, fromLat: 31.23, to: '厦门', toLng: 118.09, toLat: 24.48, type: 'flight', count: 9 },
  { from: '广州', fromLng: 113.26, fromLat: 23.13, to: '成都', toLng: 104.07, toLat: 30.67, type: 'flight', count: 8 },
  { from: '成都', fromLng: 104.07, fromLat: 30.67, to: '拉萨', toLng: 91.11, toLat: 29.65, type: 'flight', count: 6 },
  { from: '成都', fromLng: 104.07, fromLat: 30.67, to: '昆明', toLng: 102.83, toLat: 25.04, type: 'flight', count: 7 },
  // 高铁
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '上海', toLng: 121.47, toLat: 31.23, type: 'train', count: 42 },
  { from: '上海', fromLng: 121.47, fromLat: 31.23, to: '杭州', toLng: 120.15, toLat: 30.29, type: 'train', count: 35 },
  { from: '广州', fromLng: 113.26, fromLat: 23.13, to: '深圳', toLng: 114.06, toLat: 22.54, type: 'train', count: 30 },
  { from: '北京', fromLng: 116.41, fromLat: 39.90, to: '天津', toLng: 117.20, toLat: 39.13, type: 'train', count: 50 },
  { from: '成都', fromLng: 104.07, fromLat: 30.67, to: '重庆', toLng: 106.55, toLat: 29.56, type: 'train', count: 22 },
  { from: '上海', fromLng: 121.47, fromLat: 31.23, to: '南京', toLng: 118.80, toLat: 32.06, type: 'train', count: 28 },
];

/** 出行分类统计 */
const TRIP_CATEGORIES = [
  { label: '旅游', count: 28, color: '#06B6D4', icon: 'flight_takeoff' },
  { label: '出差', count: 42, color: '#8B5CF6', icon: 'work' },
  { label: '回家', count: 18, color: '#F59E0B', icon: 'home' },
  { label: '学习', count: 5, color: '#10B981', icon: 'school' },
  { label: '为爱', count: 3, color: '#EF4444', icon: 'favorite' },
  { label: '追星', count: 2, color: '#EC4899', icon: 'star' },
];

const NAV_HEIGHT = 72;

export default function FlightRouteMap() {
  const [activeTab, setActiveTab] = useState<'all' | 'flight' | 'train'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalFlights = useMemo(() =>
    ROUTES.filter(r => r.type === 'flight').reduce((s, r) => s + r.count, 0), []);
  const totalTrains = useMemo(() =>
    ROUTES.filter(r => r.type === 'train').reduce((s, r) => s + r.count, 0), []);

  const filteredRoutes = useMemo(() => {
    if (activeTab === 'flight') return ROUTES.filter(r => r.type === 'flight');
    if (activeTab === 'train') return ROUTES.filter(r => r.type === 'train');
    return ROUTES;
  }, [activeTab]);

  // 生成弧线 CSV 数据
  const arcCSV = useMemo(() => {
    const header = 'from_lng,from_lat,to_lng,to_lat,count,type';
    const rows = filteredRoutes.map(r =>
      `${r.fromLng},${r.fromLat},${r.toLng},${r.toLat},${r.count},${r.type}`
    );
    return [header, ...rows].join('\n');
  }, [filteredRoutes]);

  // 城市节点数据
  const cityPoints = useMemo(() => {
    const cityMap = new Map<string, { lng: number; lat: number; total: number }>();
    filteredRoutes.forEach(r => {
      const fromKey = r.from;
      const toKey = r.to;
      if (!cityMap.has(fromKey)) cityMap.set(fromKey, { lng: r.fromLng, lat: r.fromLat, total: 0 });
      if (!cityMap.has(toKey)) cityMap.set(toKey, { lng: r.toLng, lat: r.toLat, total: 0 });
      cityMap.get(fromKey)!.total += r.count;
      cityMap.get(toKey)!.total += r.count;
    });
    const header = 'lng,lat,name,total';
    const rows = Array.from(cityMap.entries()).map(
      ([name, d]) => `${d.lng},${d.lat},${name},${d.total}`
    );
    return [header, ...rows].join('\n');
  }, [filteredRoutes]);

  const maxCount = Math.max(...filteredRoutes.map(r => r.count));

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: '#0f172a' }}>
      {/* 地图区域 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: NAV_HEIGHT }}>
        <Aimap
          map={{
            basemap: 'gaode',
            center: [105, 30],
            zoom: 4,
            style: 'dark',
            pitch: 20,
          }}
        >
          {/* 弧线图层 */}
          <LineLayer
            source={arcCSV}
            sourceType="csv"
            sourceConfig={{
              x: 'from_lng',
              y: 'from_lat',
              x1: 'to_lng',
              y1: 'to_lat',
            }}
            shape="arc"
            size={1.5}
            sizeField="count"
            sizeValues={[0.5, 3]}
            color="#06B6D4"
            colorField="type"
            colorValues={['#06B6D4', '#8B5CF6']}
            style={{
              opacity: 0.7,
            }}
            
          />

          {/* 城市节点 */}
          <PointLayer
            source={cityPoints}
            sourceType="csv"
            sourceConfig={{
              x: 'lng',
              y: 'lat',
            }}
            size={3}
            sizeField="total"
            sizeValues={[2, 5]}
            color="#06B6D4"
            shape="circle"
            style={{
              opacity: 1,
              stroke: '#fff',
              strokeWidth: 1,
            }}
          />

          <ZoomControl position="bottomright" showZoom />
          <MapThemeControl position="topright" />
        </Aimap>
      </div>

      {/* ═══════ 顶部标题栏 ═══════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '12px 16px',
        background: 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#06B6D4', pointerEvents: 'auto' }}>flight</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>我的航线图</span>
          <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)', marginLeft: 4 }}>2025</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)', marginTop: 2 }}>
          基于真实行程生成
        </div>
      </div>

      {/* ═══════ 左上角统计卡片 ═══════ */}
      <div style={{
        position: 'absolute', top: 60, left: 12, zIndex: 1000,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* 总览卡片 */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(6,182,212,0.15)',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          minWidth: 140,
        }}>
          <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            出行总览
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#06B6D4', lineHeight: 1.2 }}>{totalFlights}</div>
              <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.6)', marginTop: 1 }}>✈ 航班</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#8B5CF6', lineHeight: 1.2 }}>{totalTrains}</div>
              <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.6)', marginTop: 1 }}>🚄 高铁</div>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: 'rgba(148,163,184,0.5)' }}>
            共 {ROUTES.length} 条航线 · 覆盖 {new Set(ROUTES.flatMap(r => [r.from, r.to])).size} 城市
          </div>
        </div>

        {/* 类型切换 */}
        <div style={{
          display: 'flex', gap: 4, padding: 3,
          background: 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(6,182,212,0.1)',
          borderRadius: 10,
        }}>
          {([
            { key: 'all' as const, label: '全部', icon: 'route' },
            { key: 'flight' as const, label: '航班', icon: 'flight' },
            { key: 'train' as const, label: '高铁', icon: 'train' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 10px', borderRadius: 8, border: 'none',
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))'
                  : 'transparent',
                color: activeTab === tab.key ? '#e0f2fe' : 'rgba(148,163,184,0.6)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ 右侧出行分类面板 ═══════ */}
      <div style={{
        position: 'absolute', top: 60, right: 12, zIndex: 1000,
        padding: '12px 14px',
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(6,182,212,0.1)',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        width: 120,
      }}>
        <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          出行分类
        </div>
        {TRIP_CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setSelectedCategory(selectedCategory === cat.label ? null : cat.label)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 0', border: 'none', background: 'none',
              width: '100%', cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: cat.color }}>
              {cat.icon}
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 11, color: selectedCategory === cat.label ? '#f1f5f9' : 'rgba(203,213,225,0.7)', fontWeight: selectedCategory === cat.label ? 600 : 400 }}>
              {cat.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.count}</span>
          </button>
        ))}
      </div>

      {/* ═══════ 左下图例 ═══════ */}
      <div style={{ position: 'absolute', bottom: NAV_HEIGHT + 12, left: 12, zIndex: 1000 }}>
        <Legend
          type="categories"
          title="航线类型"
          items={[
            { label: '航班', color: '#06B6D4' },
            { label: '高铁', color: '#8B5CF6' },
          ]}
        />
      </div>

      {/* ═══════ 底部导航栏 ═══════ */}
      <nav style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
        height: NAV_HEIGHT,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'rgba(15,23,42,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(6,182,212,0.08)',
        padding: '0 8px',
      }}>
        {[
          { icon: 'explore', label: '发现', active: false },
          { icon: 'map', label: '航线', active: true },
          { icon: 'person', label: '我的', active: false },
        ].map(item => (
          <button key={item.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: 22,
              color: item.active ? '#06B6D4' : 'rgba(148,163,184,0.5)',
              fontVariationSettings: item.active ? "'FILL' 1" : undefined,
            }}>
              {item.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: item.active ? 600 : 400, color: item.active ? '#06B6D4' : 'rgba(148,163,184,0.5)' }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}