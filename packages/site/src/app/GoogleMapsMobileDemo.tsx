import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, BottomSheet, LineLayer, Marker, Popup } from '@antv/aimapui';

/* ================================================================
   Google Maps Mobile — Explore 页面 Demo
   设计规范：.codefuse/google_page.md
   ================================================================ */

// ── Design Tokens per spec ──────────────────────────────────────
const G = {
  primary: '#1A73E8', secondary: '#0B57D0',
  highlightBg: '#E3EDFF', highlightBgAlt: '#E8F0FE',
  surface: '#FFFFFF',
  textPrimary: '#1C1B1F', textSecondary: '#5E5E5E',
  textTertiary: '#707070', textQuaternary: '#867F7F',
  borderLight: '#F3F2F2', borderMedium: '#D9D9D9',
  shadowLight: '0px 1px 2px rgba(0,0,0,0.25)',
  shadowMedium: '0px 4px 4px rgba(0,0,0,0.25)',
  shadowHeavy: '0px 4px 12px rgba(0,0,0,0.25)',
  bottomNavShadow: '0px -2px 4px rgba(0,0,0,0.25)',
  cardShadow: '-2px 0px 11px rgba(0,0,0,0.25)',
  tabInactive: '#5E5E5E',
  handleColor: '#C5C6CD',
};

// ── Data ────────────────────────────────────────────────────────
const PILL_FILTERS = [
  { key: 'all', label: '全部', icon: 'explore' },
  { key: 'restaurant', label: '餐厅', icon: 'restaurant' },
  { key: 'cafe', label: '咖啡', icon: 'local_cafe' },
  { key: 'hotel', label: '酒店', icon: 'hotel' },
  { key: 'shopping', label: '购物', icon: 'shopping_bag' },
  { key: 'gas', label: '加油站', icon: 'local_gas_station' },
  { key: 'park', label: '公园', icon: 'park' },
  { key: 'museum', label: '博物馆', icon: 'museum' },
];

interface PoiItem { id: string; name: string; category: string; lng: number; lat: number; rating: number; reviewCount: number; address: string; distance: string; openNow?: boolean; }

const POIS: PoiItem[] = [
  { id: '1', name: '外婆家(湖滨店)', category: 'restaurant', lng: 120.164, lat: 30.251, rating: 4.5, reviewCount: 2834, address: '杭州市上城区湖滨路 25 号', distance: '1.2 km', openNow: true },
  { id: '2', name: '星巴克(西湖天地店)', category: 'cafe', lng: 120.159, lat: 30.244, rating: 4.3, reviewCount: 1562, address: '杭州市上城区南山路 147 号', distance: '0.8 km', openNow: true },
  { id: '3', name: '杭州君悦酒店', category: 'hotel', lng: 120.163, lat: 30.248, rating: 4.7, reviewCount: 4218, address: '杭州市上城区湖滨路 28 号', distance: '1.5 km' },
  { id: '4', name: '杭州大厦购物城', category: 'shopping', lng: 120.161, lat: 30.276, rating: 4.4, reviewCount: 5630, address: '杭州市拱墅区环城北路 258 号', distance: '2.8 km', openNow: true },
  { id: '5', name: '中国石化(天目山路站)', category: 'gas', lng: 120.13, lat: 30.272, rating: 4.1, reviewCount: 892, address: '杭州市西湖区天目山路 398 号', distance: '3.2 km', openNow: true },
  { id: '6', name: '绿荼(龙井路店)', category: 'restaurant', lng: 120.118, lat: 30.228, rating: 4.6, reviewCount: 3401, address: '杭州市西湖区龙井路 72 号', distance: '4.1 km', openNow: true },
  { id: '7', name: '西湖风景区', category: 'park', lng: 120.141, lat: 30.241, rating: 4.8, reviewCount: 52100, address: '杭州市西湖区龙井路 1 号', distance: '0.5 km' },
  { id: '8', name: '浙江省博物馆', category: 'museum', lng: 120.152, lat: 30.255, rating: 4.5, reviewCount: 7820, address: '杭州市西湖区孤山路 25 号', distance: '1.7 km' },
  { id: '9', name: '中国丝绸博物馆', category: 'museum', lng: 120.159, lat: 30.228, rating: 4.4, reviewCount: 3201, address: '杭州市上城区玉皇山路 73-1 号', distance: '2.3 km' },
  { id: '10', name: 'M Stand(武林广场店)', category: 'cafe', lng: 120.167, lat: 30.273, rating: 4.2, reviewCount: 678, address: '杭州市拱墅区武林广场 21 号', distance: '2.6 km', openNow: true },
];

const CAT_ICON: Record<string, { icon: string; color: string }> = {
  restaurant: { icon: 'restaurant', color: '#EA4335' },
  cafe: { icon: 'local_cafe', color: '#8E6B4F' },
  hotel: { icon: 'hotel', color: '#1A73E8' },
  shopping: { icon: 'shopping_bag', color: '#F9AB00' },
  gas: { icon: 'local_gas_station', color: '#34A853' },
  park: { icon: 'park', color: '#34A853' },
  museum: { icon: 'museum', color: '#9C6BFF' },
};

const NAV_TABS = [
  { key: 'explore', label: '探索', icon: 'explore' },
  { key: 'commute', label: '通勤', icon: 'commute' },
  { key: 'saved', label: '收藏', icon: 'bookmark' },
  { key: 'contrib', label: '贡献', icon: 'add_location_alt' },
  { key: 'updates', label: '更新', icon: 'notifications' },
];

// Spec constants
const BOTTOM_NAV_H = 89;        // 53 + 36 safe area
const CARD_COLLAPSED_H = 96;
const CARD_EXPANDED_H = 520;

// ── Zoom Buttons ────────────────────────────────────────────────
function ZoomButtons({ scene }: { scene: Scene | null }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden',
      background: G.surface, boxShadow: G.shadowLight,
    }}>
      <button onClick={() => scene?.setZoom(Math.min(18, scene.getZoom() + 1))}
        style={zBtnS}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: G.textSecondary }}>add</span>
      </button>
      <div style={{ height: 1, background: G.borderLight }} />
      <button onClick={() => scene?.setZoom(Math.max(3, scene.getZoom() - 1))}
        style={zBtnS}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: G.textSecondary }}>remove</span>
      </button>
    </div>
  );
}
const zBtnS: React.CSSProperties = { width: 40, height: 40, border: 'none', cursor: 'pointer', background: G.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' };

// ── Bottom Nav (spec: 89px, 0px -2px 4px shadow, z-index base) ──
function BottomNav({ activeTab, onTab }: { activeTab: string; onTab: (k: string) => void }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2500,
      height: BOTTOM_NAV_H, background: G.surface,
      boxShadow: G.bottomNavShadow,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '4px 8px 36px', gap: 4,
    }}>
      {NAV_TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <div key={tab.key} onClick={() => onTab(tab.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, cursor: 'pointer', width: 64, height: 49,
              padding: 0,
            }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', padding: '4px 20px', gap: 4,
              width: 64, height: 32, borderRadius: 20,
              background: isActive ? G.highlightBg : 'transparent',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 24, color: isActive ? G.secondary : G.textSecondary,
              }}>{tab.icon}</span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 500, letterSpacing: '0.01em', lineHeight: '13px',
              color: isActive ? G.secondary : G.tabInactive,
            }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Business-style drawer per spec ─────────────────────────────
function BottomCard({ filteredPois, activeFilter, selectedPoi, onSelect, selectedPoiId, onPoiClick, visible = false, onStartNavigation }: {
  filteredPois: PoiItem[]; activeFilter: string; selectedPoi: PoiItem | null; selectedPoiId: string | null;
  onSelect: (p: PoiItem) => void; onPoiClick: (p: PoiItem) => void; visible?: boolean; onStartNavigation?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'list'>('overview');

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 3100, background: G.surface, display: 'flex', flexDirection: 'column', pointerEvents: 'auto',
    }}>
      {/* Close Button */}
      <div style={{ position: 'absolute', top: 52, right: 12, zIndex: 10 }}>
        <span className="material-symbols-outlined" onClick={() => onPoiClick(selectedPoi!)} style={{ fontSize: 24, color: '#4F4F4F', cursor: 'pointer', background: G.surface, borderRadius: '50%', padding: 4, boxShadow: G.shadowLight }}>close</span>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 52 }}>
          {/* Title — spec: 20px/400 */}
          <div style={{ padding: '16px 28px 0', fontSize: 20, fontWeight: 400, color: '#000', lineHeight: '23px', letterSpacing: '0.01em' }}>
            {selectedPoi ? selectedPoi.name : '西湖风景区'}
          </div>

          {/* Address — spec: 14px, #867F7F */}
          <div style={{ padding: '4px 28px 8px', fontSize: 14, color: '#867F7F', lineHeight: '16px' }}>
            {selectedPoi ? selectedPoi.address : '杭州市西湖区龙井路 1 号'}
          </div>

          {/* Action Buttons row — spec exact */}
          <div style={{ display: 'flex', gap: 4, padding: '12px 28px', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {/* Primary button — spec: 12px 18px 12px 16px, gap 6, #1A73E8, radius 44, icon 18px, label 16px/500 */}
            <button onClick={onStartNavigation} style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '12px 18px 12px 16px', borderRadius: 44, border: 'none', cursor: 'pointer',
              background: G.primary, fontFamily: 'Roboto, system-ui, sans-serif',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>directions</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: '19px' }}>导航</span>
            </button>
            {/* Secondary Call — spec: 12px 16px, gap 6, #ECF3FE, radius 44, icon 22px, label 16px/500 #0B57D0 */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '12px 16px', borderRadius: 44, border: 'none', cursor: 'pointer',
              background: '#ECF3FE', fontFamily: 'Roboto, system-ui, sans-serif',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: G.secondary }}>call</span>
            </button>
            {/* Secondary Save — spec: 12px 16px, gap 6, #ECF3FE, radius 44, icon 22px, label 16px/500 #0B57D0 */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '12px 16px', borderRadius: 44, border: 'none', cursor: 'pointer',
              background: '#ECF3FE', fontFamily: 'Roboto, system-ui, sans-serif',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: G.secondary }}>bookmark</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: G.secondary, lineHeight: '19px' }}>收藏</span>
            </button>
            {/* Secondary Share — spec: 12px 16px */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '12px 16px', borderRadius: 44, border: 'none', cursor: 'pointer',
              background: '#ECF3FE', fontFamily: 'Roboto, system-ui, sans-serif',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: G.secondary }}>share</span>
            </button>
          </div>

          {/* Tab Bar — spec: 36px, selected=15px/600 #1761D7 + 3px highlighter, inactive=15px/500 #7F7F7F */}
          <div style={{
            display: 'flex', height: 36, borderBottom: '1px solid #BBBBBB', flexShrink: 0,
            padding: '0 28px',
          }}>
            {(['overview', 'list'] as const).map(tab => {
              const isActive = activeTab === tab;
              return (
                <div key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    position: 'relative', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    padding: '4px 4px 0', gap: 4, width: 72, height: 36,
                  }}>
                  <span style={{
                    fontSize: 15, fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#1761D7' : '#7F7F7F',
                    lineHeight: '22px', letterSpacing: isActive ? '0.2px' : undefined,
                  }}>{tab === 'overview' ? '概览' : '列表'}</span>
                  {isActive && (
                    <div style={{
                      width: 64, height: 3, background: '#1761D7',
                      borderRadius: '4px 4px 0 0', alignSelf: 'stretch',
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'overview' ? (
              /* Overview — simple info rows per spec */
              <div style={{ padding: '12px 28px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {selectedPoi && (
                  <>
                    <InfoRow label="评分" value={`${selectedPoi.rating} (${selectedPoi.reviewCount.toLocaleString()} 条评价)`} />
                    <InfoRow label="地址" value={selectedPoi.address} />
                    <InfoRow label="距离" value={selectedPoi.distance} />
                    {selectedPoi.openNow && <InfoRow label="状态" value="营业中" valueColor="#34A853" />}
                  </>
                )}
                {!selectedPoi && (
                  <InfoRow label="评分" value="4.8 (52,100 条评价)" />
                )}
              </div>
            ) : (
              /* List tab — POI items per spec: 72px, 34px icon, divider #F3F2F2 */
              <div style={{ paddingBottom: 32 }}>
                <div style={{ padding: '8px 28px 4px', fontSize: 15, fontWeight: 500, color: '#000' }}>
                  {activeFilter === 'all' ? '附近地点' : PILL_FILTERS.find(f => f.key === activeFilter)?.label}
                  <span style={{ fontSize: 12, color: G.textSecondary, marginLeft: 6, fontWeight: 400 }}>{filteredPois.length} 个</span>
                </div>
                {filteredPois.map((poi, i) => {
                  const cat = CAT_ICON[poi.category] ?? CAT_ICON.restaurant;
                  return (
                    <div key={poi.id} onClick={() => onPoiClick(poi)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 20,
                        height: 72, padding: '0 0 0 12px', cursor: 'pointer',
                        borderBottom: i < filteredPois.length - 1 ? `1px solid ${G.borderLight}` : 'none',
                        background: selectedPoiId === poi.id ? G.highlightBgAlt : 'transparent',
                        transition: 'background 0.15s',
                      }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', background: G.highlightBgAlt,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: cat.color }}>{cat.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 400, color: G.textPrimary, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poi.name}</div>
                        <div style={{ fontSize: 12, color: G.textTertiary, display: 'flex', alignItems: 'center', gap: 4, lineHeight: '18px' }}>
                          <span style={{ color: '#F9AB00', fontWeight: 500 }}>★ {poi.rating}</span>
                          <span>({poi.reviewCount.toLocaleString()})</span><span>·</span><span>{poi.distance}</span>
                          {poi.openNow && <><span>·</span><span style={{ color: '#34A853' }}>营业中</span></>}
                        </div>
                        <div style={{ fontSize: 12, color: G.textQuaternary, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poi.address}</div>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: G.borderMedium, marginRight: 12 }}>chevron_right</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '12px 0',
      borderBottom: `1px solid ${G.borderLight}`,
    }}>
      <span style={{ fontSize: 14, color: G.textSecondary, width: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: valueColor ?? G.textPrimary, lineHeight: '20px' }}>{value}</span>
    </div>
  );
}

// 模拟定位
const SIM_USER_LOC = { lng: 120.155, lat: 30.255 };

export default function GoogleMapsMobileDemo() {
  const sceneRef = useRef<Scene | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoi, setSelectedPoi] = useState<PoiItem | null>(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [userLoc, setUserLoc] = useState<{ lng: number; lat: number } | null>(null);
  const [navigationMode, setNavigationMode] = useState(false);

  useEffect(() => {
    let resolved = false;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { resolved = true; setUserLoc({ lng: pos.coords.longitude, lat: pos.coords.latitude }); },
        () => { if (!resolved) setUserLoc(SIM_USER_LOC); },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
    const fallback = setTimeout(() => { if (!resolved) setUserLoc(SIM_USER_LOC); }, 6000);
    return () => clearTimeout(fallback);
  }, []);

  const filteredPois = useMemo(() => {
    if (activeFilter === 'all') return POIS;
    return POIS.filter(p => p.category === activeFilter);
  }, [activeFilter]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return POIS.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    setTimeout(() => {
      scene.fitBounds(
        [[120.095, 30.20], [120.18, 30.29]],
        { padding: [72, 20, BOTTOM_NAV_H + CARD_COLLAPSED_H + 10, 20] },
      );
    }, 400);
  }, []);

  const handlePoiClick = useCallback((poi: PoiItem) => {
    setSelectedPoi(prev => prev?.id === poi.id ? null : poi);
    sceneRef.current?.setZoomAndCenter(15, [poi.lng, poi.lat]);
  }, []);

  const handlePoiSelect = useCallback((poi: PoiItem) => {
    setSelectedPoi(poi);
    sceneRef.current?.setZoomAndCenter(15, [poi.lng, poi.lat]);
  }, []);

  const handleStartNavigation = useCallback(() => {
    if (!selectedPoi || !userLoc) return;
    setNavigationMode(true);
    // 调整视野以同时显示起点和终点
    const bounds: [[number, number], [number, number]] = [
      [Math.min(userLoc.lng, selectedPoi.lng) - 0.01, Math.min(userLoc.lat, selectedPoi.lat) - 0.01],
      [Math.max(userLoc.lng, selectedPoi.lng) + 0.01, Math.max(userLoc.lat, selectedPoi.lat) + 0.01],
    ];
    sceneRef.current?.fitBounds(bounds, { padding: [80, 40, BOTTOM_NAV_H + 200, 40] });
  }, [selectedPoi, userLoc]);

  const handleExitNavigation = useCallback(() => {
    setNavigationMode(false);
  }, []);

  // 生成模拟路线（直线 + 简单折线）
  const routeFeature = useMemo(() => {
    if (!navigationMode || !selectedPoi || !userLoc) return null;
    const start = [userLoc.lng, userLoc.lat];
    const end = [selectedPoi.lng, selectedPoi.lat];
    const midLng = (start[0] + end[0]) / 2;
    const midLat = (start[1] + end[1]) / 2 + 0.005;
    return {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [start, [midLng, midLat], end],
      },
      properties: {},
    };
  }, [navigationMode, selectedPoi, userLoc]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: 'Roboto, system-ui, sans-serif', background: '#E8EAED' }}>
      {/* Map */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AiMap autoFit={false} map={{ basemap: 'gaode', center: [120.15, 30.25], zoom: 13, style: 'normal', gestureConfig: { dragPan: true, pinchZoom: true, dragRotate: true } }} onSceneReady={handleSceneReady}>
          {filteredPois.map(poi => {
            const cat = CAT_ICON[poi.category] ?? CAT_ICON.restaurant;
            return (
              <Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="bottom" offsets={[0, 0]}>
                <div onClick={() => handlePoiClick(poi)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                  {selectedPoi?.id === poi.id && (
                    <div style={{ background: '#1C1B1F', color: '#fff', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', marginBottom: 4, boxShadow: G.shadowMedium }}>{poi.name}</div>
                  )}
                  <div style={{
                    width: selectedPoi?.id === poi.id ? 38 : 30, height: selectedPoi?.id === poi.id ? 38 : 30,
                    borderRadius: '50%', background: selectedPoi?.id === poi.id ? G.primary : G.surface,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', boxShadow: selectedPoi?.id === poi.id ? G.shadowMedium : G.shadowLight,
                    border: selectedPoi?.id === poi.id ? 'none' : `2px solid ${cat.color}`,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: selectedPoi?.id === poi.id ? 20 : 16, color: selectedPoi?.id === poi.id ? '#fff' : cat.color }}>{cat.icon}</span>
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: G.primary, marginTop: 2, boxShadow: `0 0 0 2px ${G.surface}` }} />
                </div>
              </Marker>
            );
          })}

          {/* User Location Marker — spec: 62×62 cone + blue dot */}
          {userLoc && (
            <Marker longitude={userLoc.lng} latitude={userLoc.lat} anchor="center" offsets={[0, 0]}>
              <div style={{ pointerEvents: 'none', position: 'relative', width: 62, height: 62 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(233deg, rgba(11,103,225,0) 42%, rgba(99,166,255,0.58) 99%)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: G.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: G.primary, border: '2px solid #fff' }} />
                  </div>
                </div>
              </div>
            </Marker>
          )}

          {/* Navigation Route Line */}
          {routeFeature && (
            <LineLayer
              source={{ type: 'FeatureCollection', features: [routeFeature] }}
              sourceType="geojson"
              shape="line"
              size={4}
              color={G.primary}
              style={{ opacity: 0.9, lineType: 'solid' } as Record<string, unknown>}
              zIndex={10}
            />
          )}
        </AiMap>
      </div>

      {/* ═══ Status Bar — spec: 48px, padding 18px 26px 14px 27px ═══ */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2000, height: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 26px 14px 27px', pointerEvents: 'none' }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: '#121212', letterSpacing: '-0.408px' }}>9:41</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#121212' }}>signal_cellular_alt</span>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#121212' }}>wifi</span>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#121212' }}>battery_full</span>
        </div>
      </div>

      {/* ═══ Search Bar — spec: top: 52px, container 56px, bar 48px, radius 40 ═══ */}
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, zIndex: 4000, height: 56, display: 'flex', flexDirection: 'column', padding: '4px 12px', pointerEvents: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '8px 12px', gap: 16, flex: 1,
          background: G.surface, boxShadow: '0px 4px 4px rgba(0,0,0,0.25)', borderRadius: 40,
          overflow: 'hidden', pointerEvents: 'auto',
        }}>
          {searchFocused ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#4F4F4F', cursor: 'pointer', flexShrink: 0 }} onClick={() => { setSearchFocused(false); setSearchQuery(''); }}>arrow_back</span>
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索地点" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 20, color: G.textPrimary, background: 'transparent', fontFamily: 'inherit' }} onBlur={() => { if (!searchQuery) setSearchFocused(false); }} />
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#4F4F4F', cursor: 'pointer', flexShrink: 0 }} onClick={() => { setSearchFocused(false); setSearchQuery(''); setSelectedPoi(null); }}>close</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: G.textTertiary, flexShrink: 0 }}>search</span>
              <span style={{ flex: 1, fontSize: 20, color: G.textTertiary, letterSpacing: '0.01em', cursor: 'text' }} onClick={() => setSearchFocused(true)}>搜索地点</span>
              <div style={{ width: 30, height: 30, borderRadius: 24, background: G.highlightBgAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: G.primary }}>person</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ Search Results List ═══ */}
      {searchFocused && searchQuery.trim() && (
        <div style={{
          position: 'absolute', top: 108, left: 12, right: 12, zIndex: 4001,
          background: G.surface, borderRadius: 16, boxShadow: G.shadowMedium,
          maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', pointerEvents: 'auto',
        }}>
          {searchResults.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: G.textTertiary, fontSize: 14 }}>
              未找到相关地点
            </div>
          ) : (
            searchResults.map(poi => {
              const cat = CAT_ICON[poi.category] ?? CAT_ICON.restaurant;
              const isSelected = selectedPoi?.id === poi.id;
              return (
                <div key={poi.id} onClick={() => { handlePoiClick(poi); setSearchFocused(false); setSearchQuery(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    cursor: 'pointer', borderBottom: `1px solid ${G.borderLight}`,
                    background: isSelected ? G.highlightBgAlt : 'transparent',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: isSelected ? G.primary : G.highlightBgAlt,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: isSelected ? '#fff' : cat.color }}>{cat.icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: G.textPrimary, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poi.name}</div>
                    <div style={{ fontSize: 12, color: G.textTertiary, lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poi.address}</div>
                  </div>
                  <span style={{ fontSize: 12, color: G.textQuaternary, flexShrink: 0 }}>{poi.distance}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ Pills — spec: top: 122px, height 40px ═══ */}
      <div style={{
        position: 'absolute', top: 122, left: 0, right: 0, zIndex: 2003,
        height: 40, display: 'flex', alignItems: 'flex-start',
        padding: '4px 0px 4px 12px', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', pointerEvents: 'none',
      }}>
        {PILL_FILTERS.map(f => {
          const isActive = activeFilter === f.key;
          return (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
              flexShrink: 0, height: 32, borderRadius: 24, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px 6px 8px',
              fontSize: 15, fontWeight: 500, fontFamily: 'inherit', letterSpacing: '0.02em',
              background: isActive ? '#1C1B1F' : G.surface,
              color: isActive ? '#fff' : 'rgba(0,0,0,0.9)',
              boxShadow: isActive ? undefined : '0px 1px 2px rgba(0,0,0,0.25)',
              transition: 'all 0.15s', pointerEvents: 'auto',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{f.icon}</span>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ═══ Left Column: Zoom + Locate + Directions ═══ */}
      <div style={{
        position: 'absolute', left: 10, bottom: BOTTOM_NAV_H + 2, zIndex: 3000,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}><ZoomButtons scene={sceneRef.current} /></div>
        <button onClick={() => { if (userLoc) sceneRef.current?.setZoomAndCenter(16, [userLoc.lng, userLoc.lat]); }}
          style={{ width: 40, height: 40, borderRadius: 44, border: 'none', cursor: 'pointer', background: G.surface, boxShadow: G.shadowLight, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: G.primary }}>my_location</span>
        </button>
        <button onClick={navigationMode ? handleExitNavigation : handleStartNavigation}
          style={{ width: 58, height: 58, borderRadius: 44, border: 'none', cursor: 'pointer', background: navigationMode ? G.red : G.primary, boxShadow: G.shadowHeavy, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#fff' }}>{navigationMode ? 'close' : 'directions'}</span>
        </button>
      </div>

      {/* ═══ Bottom Nav — spec: 89px, 0px -2px 4px shadow ═══ */}
      <BottomNav activeTab={activeTab} onTab={setActiveTab} />

      {/* ═══ Bottom Card — spec: -2px 0px 11px shadow ═══ */}
      <BottomCard filteredPois={filteredPois} activeFilter={activeFilter} selectedPoi={selectedPoi} selectedPoiId={selectedPoi?.id ?? null} onSelect={handlePoiSelect} onPoiClick={handlePoiClick} visible={!!selectedPoi} onStartNavigation={handleStartNavigation} />

      {/* ═══ Popup ═══ */}
      {selectedPoi && (
        <Popup longitude={selectedPoi.lng} latitude={selectedPoi.lat} size="standard" singleton closeButton visible onClose={() => setSelectedPoi(null)}
          header={{ title: selectedPoi.name, statusLabel: selectedPoi.openNow ? '营业中' : undefined, statusColor: '#34A853' }}
          attributes={[
            { label: '评分', value: `${selectedPoi.rating} (${selectedPoi.reviewCount.toLocaleString()} 条评价)` },
            { label: '地址', value: selectedPoi.address },
            { label: '距离', value: selectedPoi.distance },
          ]}
          actions={[
            { variant: 'primary' as const, label: '导航', onClick: () => {} },
            { variant: 'secondary' as const, label: '收藏', onClick: () => {} },
          ]}
        />
      )}
    </div>
  );
}