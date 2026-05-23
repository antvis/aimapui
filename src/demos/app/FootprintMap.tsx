import React, { useState, useCallback } from 'react';
import { Aimap } from '../../components/Aimap';
import { ZoomControl } from '../../components/Control/ZoomControl';
import { GeoLocateControl } from '../../components/Control/GeoLocateControl';
import { Marker } from '../../components/Interaction/Marker';

/* ================================================================
   足迹地图 (Footprint Map) — 移动端应用 Demo
   设计参考 Luminous Explorer 设计稿：
   - 毛玻璃搜索栏 + 分类筛选标签
   - 照片堆叠标记（stacked photo markers）+ 漂浮动画
   - FAB 创建足迹按钮
   - 底部导航栏
   - 底部信息卡片
   ================================================================ */

/** 足迹点数据 */
interface FootprintSpot {
  id: string;
  name: string;
  category: string;
  lng: number;
  lat: number;
  photoCount: number;
  photo: string;
  color: string;
}

/** 分类筛选标签 */
const CATEGORIES = [
  { key: 'hot', label: 'Hot', icon: 'local_fire_department', filled: true },
  { key: 'nature', label: 'Nature', icon: 'forest', filled: false },
  { key: 'history', label: 'History', icon: 'account_balance', filled: false },
  { key: 'cafe', label: 'Cafe Hopping', icon: 'local_cafe', filled: false },
  { key: 'urban', label: 'Urban Art', icon: 'palette', filled: false },
] as const;

/** 足迹数据（东京新宿地区） */
const FOOTPRINTS: FootprintSpot[] = [
  {
    id: 'neon',
    name: 'Neon District',
    category: 'urban',
    lng: 139.7005,
    lat: 35.6938,
    photoCount: 12,
    photo: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=200&h=200&fit=crop',
    color: '#630ed4',
  },
  {
    id: 'zen',
    name: 'Zen Gardens',
    category: 'nature',
    lng: 139.7248,
    lat: 35.7101,
    photoCount: 8,
    photo: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200&h=200&fit=crop',
    color: '#b4136d',
  },
  {
    id: 'skyline',
    name: 'Skyline Peak',
    category: 'hot',
    lng: 139.6903,
    lat: 35.6856,
    photoCount: 5,
    photo: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=200&h=200&fit=crop',
    color: '#005479',
  },
  {
    id: 'temple',
    name: 'Ancient Temple',
    category: 'history',
    lng: 139.7147,
    lat: 35.6995,
    photoCount: 15,
    photo: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=200&h=200&fit=crop',
    color: '#7c3aed',
  },
  {
    id: 'coffee',
    name: 'Hidden Cafes',
    category: 'cafe',
    lng: 139.7034,
    lat: 35.6892,
    photoCount: 6,
    photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    color: '#006d9c',
  },
];

/** 底部导航项 */
const NAV_ITEMS = [
  { key: 'explore', label: 'Explore', icon: 'explore', active: true },
  { key: 'planner', label: 'Planner', icon: 'route', active: false },
  { key: 'footprints', label: 'Footprints', icon: 'photo_library', active: false },
  { key: 'profile', label: 'Profile', icon: 'person', active: false },
] as const;

export default function FootprintMap() {
  const [activeCategory, setActiveCategory] = useState<string>('hot');
  const [selectedSpot, setSelectedSpot] = useState<FootprintSpot | null>(null);
  const [activeNav, setActiveNav] = useState<string>('explore');

  const filteredFootprints = activeCategory === 'hot'
    ? FOOTPRINTS
    : FOOTPRINTS.filter((fp) => fp.category === activeCategory);

  const handleMarkerClick = useCallback((spot: FootprintSpot) => {
    setSelectedSpot((prev) => (prev?.id === spot.id ? null : spot));
  }, []);

  /** 底部导航栏高度（padding 10+34 + icon 22 + label 16 ≈ 82） */
  const NAV_HEIGHT = 82;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* ── 地图区域（底部留出导航栏空间） ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: NAV_HEIGHT }}>
        <Aimap
          map={{
            basemap: 'gaode',
            center: [139.7005, 35.6938],
            zoom: 13.5,
            style: 'light',
          }}
        >
        <ZoomControl position="rightcenter" />
        <GeoLocateControl position="rightcenter" />

        {/* 照片足迹标记 */}
        {filteredFootprints.map((spot) => (
          <Marker
            key={spot.id}
            longitude={spot.lng}
            latitude={spot.lat}
            onClick={() => handleMarkerClick(spot)}
          >
            <div
              className="marker-animate-float"
              style={{
                position: 'relative',
                cursor: 'pointer',
                animation: `float 3s ease-in-out infinite`,
                animationDelay: `${FOOTPRINTS.indexOf(spot) * 0.4}s`,
              }}
            >
              {/* 照片堆叠效果 */}
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                {/* 堆叠底层 - 旋转偏移 */}
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 12, background: '#fff',
                  border: '2px solid #fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'rotate(-5deg) translate(-2px, -2px)',
                }} />
                {/* 堆叠中层 */}
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 12, background: '#fff',
                  border: '2px solid #fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'rotate(5deg) translate(2px, 2px)',
                }} />
                {/* 照片主体 */}
                <img
                  src={spot.photo}
                  alt={spot.name}
                  style={{
                    position: 'relative',
                    width: 64, height: 64,
                    borderRadius: 12,
                    objectFit: 'cover',
                    border: '2px solid #fff',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                {/* 照片数量角标 */}
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 20, height: 20,
                  padding: '0 5px',
                  borderRadius: 999,
                  background: spot.color,
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                  boxShadow: `0 2px 6px ${spot.color}66`,
                }}>
                  {spot.photoCount}
                </div>
              </div>

              {/* 标签名 - 毛玻璃药丸 */}
              <div style={{
                marginTop: 10,
                padding: '4px 12px',
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 999,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#131b2e', fontFamily: 'Inter' }}>
                  {spot.name}
                </span>
              </div>
            </div>
          </Marker>
        ))}
      </Aimap>
      </div>

      {/* ═══════ 顶部搜索栏 ═══════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 1000, padding: '48px 16px 0',
      }}>
        {/* 搜索条 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px',
          background: 'rgba(250, 248, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#630ed4' }}>search</span>
          <span style={{ flex: 1, fontSize: 14, color: 'rgba(74, 68, 85, 0.7)', fontFamily: 'Inter' }}>
            Search destinations, footprints...
          </span>
          <button style={{
            width: 40, height: 40, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', cursor: 'pointer',
            color: '#630ed4',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>tune</span>
          </button>
        </div>

        {/* 分类筛选标签 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 10, overflowX: 'auto',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          paddingTop: 2, paddingBottom: 2,
        }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: isActive ? '2px solid #630ed4' : '2px solid transparent',
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(4px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 16,
                    color: isActive ? '#630ed4' : '#4a4455',
                    fontVariationSettings: cat.filled && isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {cat.icon}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
                  color: isActive ? '#630ed4' : '#4a4455',
                  fontFamily: 'Inter',
                }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ 选中足迹详情卡片 ═══════ */}
      {selectedSpot && (
        <div style={{
          position: 'absolute',
          bottom: 98, left: 16, right: 16,
          zIndex: 40,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{
            padding: 16,
            background: 'rgba(250, 248, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}>
            {/* 拖拽柄 */}
            <div style={{
              width: 36, height: 4,
              borderRadius: 2,
              background: 'rgba(123, 116, 135, 0.3)',
              margin: '0 auto 12px',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={selectedSpot.photo}
                  alt={selectedSpot.name}
                  style={{
                    width: 48, height: 48,
                    borderRadius: 12,
                    objectFit: 'cover',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#131b2e', fontFamily: "'Plus Jakarta Sans'" }}>
                    {selectedSpot.name}
                  </div>
                  <div style={{ fontSize: 14, color: '#4a4455', fontFamily: 'Inter', marginTop: 2 }}>
                    {selectedSpot.photoCount} footprints nearby
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSpot(null)}
                style={{
                  background: 'rgba(99, 14, 212, 0.1)',
                  border: 'none', borderRadius: '50%',
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#630ed4',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 默认底部信息卡（未选中时显示） ═══════ */}
      {!selectedSpot && (
        <div style={{
          position: 'absolute', bottom: 98, left: 16, right: 16, zIndex: 40,
        }}>
          <div style={{
            padding: 16,
            background: 'rgba(250, 248, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}>
            {/* 拖拽柄 */}
            <div style={{
              width: 36, height: 4,
              borderRadius: 2,
              background: 'rgba(123, 116, 135, 0.3)',
              margin: '0 auto 16px',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#131b2e', fontFamily: "'Plus Jakarta Sans'" }}>
                  Trending Around You
                </div>
                <div style={{ fontSize: 14, color: '#4a4455', fontFamily: 'Inter', marginTop: 2 }}>
                  Discover {FOOTPRINTS.length} new footprints in Shinjuku
                </div>
              </div>
              <button style={{
                background: 'rgba(99, 14, 212, 0.1)',
                border: 'none', borderRadius: '50%',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#630ed4',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ FAB 创建足迹按钮 ═══════ */}
      <button style={{
        position: 'absolute', bottom: 98, right: 16, zIndex: 1000,
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #630ed4, #b4136d)',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>
          add_a_photo
        </span>
      </button>

      {/* ═══════ 底部导航栏 ═══════ */}
      <nav style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(250, 248, 255, 0.8)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.05)',
        borderRadius: '24px 24px 0 0',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '10px 24px 34px',
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 2,
                  padding: '4px 16px',
                  borderRadius: 16,
                  border: 'none',
                  background: isActive ? 'rgba(253, 86, 167, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: isActive ? 'scale(0.9)' : 'scale(1)',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 22,
                    color: isActive ? '#fd56a7' : '#7b7487',
                    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {item.icon}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
                  color: isActive ? '#fd56a7' : '#7b7487',
                  fontFamily: 'Inter',
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ═══════ 漂浮动画关键帧（内联注入） ═══════ */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}