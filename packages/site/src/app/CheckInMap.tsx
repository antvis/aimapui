import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap } from '@antv/aimapui';
import { ZoomControl } from '@antv/aimapui';
import { GeoLocateControl } from '@antv/aimapui';
import { Marker } from '@antv/aimapui';
import { BottomSheet } from '@antv/aimapui';
import type { BottomSheetSnap } from '@antv/aimapui';
import { SearchBar } from '@antv/aimapui';

/* ================================================================
   打卡地图 — 移动端应用 Demo
   功能：点位展示 + 打卡状态 + 底部点位列表
   ================================================================ */

/** 打卡点数据类型 */
interface CheckInSpot {
  id: string;
  name: string;
  category: string;
  icon: string;
  lng: number;
  lat: number;
  address: string;
  checkedIn: boolean;
  checkedInTime?: string;
  distance?: string;
  rating?: number;
  color: string;
}

/** 分类筛选标签 */
const CATEGORIES = [
  { key: 'all', label: '全部', icon: 'grid_view' },
  { key: 'scenic', label: '景点', icon: 'landscape' },
  { key: 'food', label: '美食', icon: 'restaurant' },
  { key: 'culture', label: '文化', icon: 'museum' },
  { key: 'nature', label: '自然', icon: 'forest' },
  { key: 'shop', label: '商店', icon: 'shopping_bag' },
] as const;

/** 模拟打卡点数据（北京地区） */
const SPOTS: CheckInSpot[] = [
  { id: '1', name: '故宫博物院', category: 'culture', icon: 'museum', lng: 116.397, lat: 39.918, address: '东城区景山前街4号', checkedIn: true, checkedInTime: '09:32', distance: '1.2km', rating: 4.9, color: '#7c3aed' },
  { id: '2', name: '天安门广场', category: 'scenic', icon: 'flag', lng: 116.3975, lat: 39.9054, address: '东城区东长安街', checkedIn: true, checkedInTime: '10:15', distance: '0.8km', rating: 4.8, color: '#dc2626' },
  { id: '3', name: '南锣鼓巷', category: 'shop', icon: 'shopping_bag', lng: 116.403, lat: 39.937, address: '东城区南锣鼓巷', checkedIn: false, distance: '2.1km', rating: 4.5, color: '#f59e0b' },
  { id: '4', name: '景山公园', category: 'nature', icon: 'forest', lng: 116.396, lat: 39.925, address: '西城区景山西街44号', checkedIn: false, distance: '0.5km', rating: 4.6, color: '#10b981' },
  { id: '5', name: '王府井小吃街', category: 'food', icon: 'restaurant', lng: 116.418, lat: 39.914, address: '东城区王府井大街', checkedIn: false, distance: '1.8km', rating: 4.2, color: '#f97316' },
  { id: '6', name: '北海公园', category: 'nature', icon: 'forest', lng: 116.389, lat: 39.926, address: '西城区文津街1号', checkedIn: true, checkedInTime: '11:40', distance: '1.5km', rating: 4.7, color: '#06b6d4' },
  { id: '7', name: '什刹海', category: 'scenic', icon: 'sailing', lng: 116.384, lat: 39.94, address: '西城区什刹海', checkedIn: false, distance: '3.0km', rating: 4.6, color: '#2563eb' },
  { id: '8', name: '前门大街', category: 'shop', icon: 'store', lng: 116.398, lat: 39.899, address: '东城区前门大街', checkedIn: false, distance: '1.1km', rating: 4.3, color: '#8b5cf6' },
  { id: '9', name: '全聚德烤鸭', category: 'food', icon: 'restaurant', lng: 116.397, lat: 39.898, address: '前门大街30号', checkedIn: false, distance: '1.2km', rating: 4.4, color: '#ef4444' },
  { id: '10', name: '国家博物馆', category: 'culture', icon: 'account_balance', lng: 116.401, lat: 39.905, address: '东城区东长安街16号', checkedIn: false, distance: '0.6km', rating: 4.8, color: '#a855f7' },
  { id: '11', name: '天坛公园', category: 'scenic', icon: 'temple_buddhist', lng: 116.4107, lat: 39.8822, address: '东城区天坛内东里7号', checkedIn: false, distance: '4.2km', rating: 4.7, color: '#0891b2' },
  { id: '12', name: '雍和宫', category: 'culture', icon: 'temple_buddhist', lng: 116.417, lat: 39.947, address: '东城区雍和宫大街12号', checkedIn: false, distance: '5.0km', rating: 4.6, color: '#7c3aed' },
];

/**
 * 打卡地图 Demo（移动端）
 *
 * - 顶部：搜索栏 + 分类筛选
 * - 地图：打卡点 Marker（蓝色/绿色区分已打卡/未打卡）
 * - 选中：浮动卡片显示打卡点详情
 * - 底部：BottomSheet 展示点位列表 + 打卡进度
 */
export default function CheckInMap() {
  const [spots, setSpots] = useState<CheckInSpot[]>(SPOTS);
  const [selectedSpot, setSelectedSpot] = useState<CheckInSpot | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchValue, setSearchValue] = useState('');
  const [bottomSheetSnap, setBottomSheetSnap] = useState<BottomSheetSnap>('collapsed');
  const sceneRef = useRef<Scene | null>(null);

  const checkedInCount = spots.filter((s) => s.checkedIn).length;
  const totalCount = spots.length;

  /** 按分类和搜索过滤 */
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const categoryMatch = activeCategory === 'all' || spot.category === activeCategory;
      const searchMatch = !searchValue || spot.name.includes(searchValue) || spot.address.includes(searchValue);
      return categoryMatch && searchMatch;
    });
  }, [spots, activeCategory, searchValue]);

  /** 根据点位坐标计算包围盒并缩放到合适视图 */
  const fitSpotsBounds = useCallback((spotsToFocus: CheckInSpot[]) => {
    const scene = sceneRef.current;
    if (!scene || spotsToFocus.length === 0) return;

    const lngs = spotsToFocus.map((s) => s.lng);
    const lats = spotsToFocus.map((s) => s.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const avgLng = (minLng + maxLng) / 2;
    const avgLat = (minLat + maxLat) / 2;

    // 根据 Web Mercator 投影计算合适的 zoom 级别
    const lngSpan = maxLng - minLng || 0.001;
    const latSpan = maxLat - minLat || 0.001;
    const mapHeight = window.innerHeight || 667;
    const mapWidth = window.innerWidth || 375;
    const fractionH = 0.4;  // 点位占视口高度 40%（留出 BottomSheet 和顶部 UI 空间）
    const fractionW = 0.7;  // 点位占视口宽度 70%
    const latAtCenter = avgLat * Math.PI / 180;
    const zLat = Math.log2(fractionH * mapHeight * 360 * Math.cos(latAtCenter) / (256 * latSpan));
    const zLng = Math.log2(fractionW * mapWidth * 360 / (256 * lngSpan));
    const zoom = Math.max(3, Math.min(18, Math.floor(Math.min(zLat, zLng))));

    // 向上偏移中心点（为底部 BottomSheet 留空间）
    const metersPerPixel = 156543.03392 * Math.cos(latAtCenter) / Math.pow(2, zoom);
    const pixelOffsetY = -80;
    const latOffset = pixelOffsetY * metersPerPixel / 110540;

    try {
      scene.setZoomAndCenter(zoom, [avgLng, avgLat + latOffset]);
    } catch {
      try { scene.setCenter([avgLng, avgLat + latOffset]); scene.setZoom(zoom); } catch { /* ignore */ }
    }
  }, []);

  /** 场景就绪回调 */
  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    setTimeout(() => fitSpotsBounds(SPOTS), 300);
  }, [fitSpotsBounds]);

  /** 打卡 */
  const handleCheckIn = useCallback((spotId: string) => {
    setSpots((prev) =>
      prev.map((s) => {
        if (s.id !== spotId) return s;
        if (s.checkedIn) return s;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return { ...s, checkedIn: true, checkedInTime: timeStr };
      }),
    );
    setSelectedSpot((prev) => {
      if (!prev || prev.id !== spotId) return prev;
      if (prev.checkedIn) return prev;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      return { ...prev, checkedIn: true, checkedInTime: timeStr };
    });
  }, []);

  /** 点击地图上的 Marker */
  const handleMarkerClick = useCallback((spot: CheckInSpot) => {
    setSelectedSpot(spot);
  }, []);

  /** 点击列表中的打卡点 → 飞行到对应位置 + 选中 */
  const handleListItemClick = useCallback((spot: CheckInSpot) => {
    setSelectedSpot(spot);
  }, []);

  /** 搜索 */
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  /** 切换分类 → fitBounds 到对应景点范围 */
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setSelectedSpot(null);
    const spotsToFocus = category === 'all' ? SPOTS : SPOTS.filter((s) => s.category === category);
    if (spotsToFocus.length > 0) {
      fitSpotsBounds(spotsToFocus);
    }
  }, [fitSpotsBounds]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* ── 全屏地图 ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AiMap
          autoFit
          map={{
            basemap: 'gaode',
            center: [116.397, 39.918],
            zoom: 13.5,
            style: 'light',
          }}
          onSceneReady={handleSceneReady}
        >
          <ZoomControl position="rightcenter" />
          <GeoLocateControl position="rightcenter" />

          {/* 打卡点标记 */}
          {filteredSpots.map((spot) => (
            <Marker
              key={spot.id}
              longitude={spot.lng}
              latitude={spot.lat}
              variant="icon"
              icon={spot.checkedIn ? 'check_circle' : spot.icon}
              color={spot.checkedIn ? 'success' : 'primary'}
              label={spot.name}
              selected={selectedSpot?.id === spot.id}
              onClick={() => handleMarkerClick(spot)}
            />
          ))}
        </AiMap>
      </div>

      {/* ── UI 覆盖层 ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        {/* ── 顶部：搜索栏 + 进度 ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '48px 16px 0', pointerEvents: 'none', boxSizing: 'border-box' }}>
          {/* 搜索栏 */}
          <div style={{ pointerEvents: 'auto' }}>
            <SearchBar
              placeholder="搜索打卡地点..."
              onSearch={handleSearch}
            />
          </div>

          {/* 分类筛选标签 */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 10,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              pointerEvents: 'auto',
              paddingBottom: 2,
            }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              const count = cat.key === 'all' ? spots.length : spots.filter((s) => s.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: isActive ? '1.5px solid #004ac6' : '1px solid rgba(195, 198, 215, 0.4)',
                    background: isActive ? '#004ac6' : 'rgba(248, 249, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    color: isActive ? '#fff' : '#434655',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(0, 74, 198, 0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {cat.icon}
                  </span>
                  {cat.label}
                  <span
                    style={{
                      fontSize: 10,
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                      borderRadius: 8,
                      padding: '1px 5px',
                      fontWeight: 500,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 左下角打卡进度 ── */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            bottom: bottomSheetSnap === 'collapsed' ? 108 : 16,
            pointerEvents: 'auto',
            transition: 'bottom 0.3s ease',
          }}
        >
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 14,
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}
          >
            {/* 环形进度指示器 */}
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, transform: 'rotate(-90deg)' }}>
                <circle
                  cx="18" cy="18" r="15"
                  fill="none" stroke="rgba(195,198,215,0.3)" strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15"
                  fill="none" stroke="#10b981" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(checkedInCount / totalCount) * 94.2} 94.2`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <span style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#10b981',
              }}>
                {checkedInCount}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface)' }}>
                打卡进度
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>
                {checkedInCount}/{totalCount} 已完成
              </div>
            </div>
          </div>
        </div>

        {/* ── 选中打卡点浮动卡片 ── */}
        {selectedSpot && (
          <div
            style={{
              position: 'absolute',
              bottom: bottomSheetSnap === 'collapsed' ? 108 : 16,
              left: 16,
              right: 16,
              zIndex: 20,
              pointerEvents: 'auto',
              transition: 'bottom 0.3s ease',
            }}
          >
            <div
              className="glass-panel"
              style={{
                padding: 14,
                borderRadius: 18,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: `1px solid ${selectedSpot.checkedIn ? '#10b98140' : '#004ac620'}`,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* 图标 */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: selectedSpot.checkedIn ? '#10b98115' : `${selectedSpot.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 24,
                      color: selectedSpot.checkedIn ? '#10b981' : selectedSpot.color,
                      fontVariationSettings: selectedSpot.checkedIn ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                    }}
                  >
                    {selectedSpot.checkedIn ? 'check_circle' : selectedSpot.icon}
                  </span>
                </div>

                {/* 信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
                      {selectedSpot.name}
                    </h3>
                    {selectedSpot.checkedIn && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 6,
                          background: '#10b98115',
                          color: '#10b981',
                          fontWeight: 600,
                        }}
                      >
                        已打卡
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                      location_on
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                      {selectedSpot.address}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {selectedSpot.rating && (
                      <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span>
                        {selectedSpot.rating}
                      </span>
                    )}
                    {selectedSpot.distance && (
                      <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>straight</span>
                        {selectedSpot.distance}
                      </span>
                    )}
                    {selectedSpot.checkedInTime && (
                      <span style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                        {selectedSpot.checkedInTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* 关闭按钮 */}
                <button
                  onClick={() => setSelectedSpot(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 999,
                    color: 'var(--color-on-surface-variant)',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>

              {/* 打卡按钮 */}
              {!selectedSpot.checkedIn && (
                <button
                  onClick={() => handleCheckIn(selectedSpot.id)}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '10px 0',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #004ac6, #2563eb)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(0, 74, 198, 0.3)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseDown={(e) => { (e.currentTarget.style.transform = 'scale(0.97)'); }}
                  onMouseUp={(e) => { (e.currentTarget.style.transform = 'scale(1)'); }}
                  onMouseLeave={(e) => { (e.currentTarget.style.transform = 'scale(1)'); }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    location_on
                  </span>
                  立即打卡
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── 底部抽屉：点位列表 ── */}
        <BottomSheet
          defaultSnap="collapsed"
          collapsedHeight={96}
          halfRatio={0.5}
          expandedRatio={0.85}
          onSnapChange={setBottomSheetSnap}
        >
          {/* 抽屉标题 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
                打卡地图
              </h3>
              <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', margin: '2px 0 0' }}>
                {filteredSpots.length} 个点位 · 已打卡 {checkedInCount}
              </p>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#004ac612',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#004ac6', fontSize: 20 }}>
                location_on
              </span>
            </div>
          </div>

          {/* 打卡进度条 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 6 }}>
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: 'rgba(195, 198, 215, 0.2)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  width: `${(checkedInCount / totalCount) * 100}%`,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981', minWidth: 32, textAlign: 'right' }}>
              {Math.round((checkedInCount / totalCount) * 100)}%
            </span>
          </div>

          {/* 点位列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 32 }}>
            {filteredSpots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;

              return (
                <div
                  key={spot.id}
                  onClick={() => handleListItemClick(spot)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: isSelected
                      ? `1.5px solid ${spot.checkedIn ? '#10b981' : '#004ac6'}`
                      : '1px solid rgba(195, 198, 215, 0.2)',
                    background: isSelected
                      ? (spot.checkedIn ? '#10b98108' : '#004ac608')
                      : 'rgba(248, 249, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* 左侧图标 */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: spot.checkedIn ? '#10b98115' : `${spot.color}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 20,
                        color: spot.checkedIn ? '#10b981' : spot.color,
                        fontVariationSettings: spot.checkedIn ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                      }}
                    >
                      {spot.checkedIn ? 'check_circle' : spot.icon}
                    </span>
                    {/* 打卡角标 */}
                    {spot.checkedIn && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -3,
                          right: -3,
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #fff',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 8, color: '#fff' }}>
                          check
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 中间信息 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: spot.checkedIn ? '#10b981' : 'var(--color-on-surface)',
                          textDecoration: spot.checkedIn ? 'none' : 'none',
                        }}
                      >
                        {spot.name}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--color-on-surface-variant)',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {spot.address}
                    </div>
                  </div>

                  {/* 右侧：距离 + 打卡/按钮 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    {spot.distance && (
                      <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {spot.distance}
                      </span>
                    )}
                    {spot.checkedIn ? (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: '#10b98112',
                          color: '#10b981',
                          fontWeight: 600,
                        }}
                      >
                        {spot.checkedInTime}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckIn(spot.id);
                        }}
                        style={{
                          fontSize: 10,
                          padding: '4px 10px',
                          borderRadius: 8,
                          border: '1px solid #004ac6',
                          background: '#004ac6',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        打卡
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredSpots.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 8, opacity: 0.4 }}>
                  search_off
                </span>
                <div style={{ fontSize: 14, fontWeight: 500 }}>没有找到匹配的打卡点</div>
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>试试其他分类或关键词</div>
              </div>
            )}
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}