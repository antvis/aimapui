import React, { useState, useCallback } from 'react';
import { AiMap } from '@antv/aimapui';
import { ZoomControl } from '@antv/aimapui';
import { MapThemeControl } from '@antv/aimapui';
import { Marker } from '@antv/aimapui';
import { SatelliteLayer } from '@antv/aimapui';
import type { SatelliteProvider } from '@antv/aimapui';

/* ================================================================
   沉浸式旅游足迹地图 (Immersive Travel Map)
   遵循 immersive-travel-map.md 设计规范：
   - 沉浸感：UI 浮动在地图之上，毛玻璃 + 透明度
   - 层级感：地图层 → 标记层 → 交互层
   - 情感连接：照片作为足迹核心载体
   - 悬浮状态栏 (Floating Status Bar)
   - 照片足迹标记 (Photo Pin Stack)
   - 多功能操作底栏 (Floating Bottom Bar)
   ================================================================ */

interface TravelPin {
  id: string;
  city: string;
  cityEn: string;
  lng: number;
  lat: number;
  photoCount: number;
  photo: string;
  featured?: boolean;
}

const TRAVEL_PINS: TravelPin[] = [
  { id: 'paris', city: '巴黎', cityEn: 'Paris', lng: 2.35, lat: 48.86, photoCount: 12, photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=150&h=150&fit=crop' },
  { id: 'tokyo', city: '东京', cityEn: 'Tokyo', lng: 139.69, lat: 35.69, photoCount: 23, photo: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=150&h=150&fit=crop' },
  { id: 'nyc', city: '纽约', cityEn: 'New York', lng: -74.0, lat: 40.71, photoCount: 31, photo: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=150&h=150&fit=crop' },
  { id: 'venice', city: '威尼斯', cityEn: 'Venice', lng: 12.34, lat: 45.44, photoCount: 8, photo: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=150&h=150&fit=crop' },
  { id: 'sydney', city: '悉尼', cityEn: 'Sydney', lng: 151.21, lat: -33.87, photoCount: 17, photo: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=150&h=150&fit=crop' },
  { id: 'cairo', city: '开罗', cityEn: 'Cairo', lng: 31.24, lat: 30.04, photoCount: 5, photo: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=150&h=150&fit=crop' },
  { id: 'london', city: '伦敦', cityEn: 'London', lng: -0.12, lat: 51.51, photoCount: 19, photo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=150&h=150&fit=crop', featured: true },
  { id: 'bangkok', city: '曼谷', cityEn: 'Bangkok', lng: 100.50, lat: 13.76, photoCount: 14, photo: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=150&h=150&fit=crop' },
];

/** 地图显示模式 */
type MapMode = 'light' | 'dark' | 'satellite';

export default function ImmersiveTravelMap() {
  const [mapMode, setMapMode] = useState<MapMode>('light');
  const [satelliteProvider, setSatelliteProvider] = useState<SatelliteProvider>('gaode');
  const [showProviderPicker, setShowProviderPicker] = useState(false);
  const [selectedPin, setSelectedPin] = useState<TravelPin | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const handlePinClick = useCallback((pin: TravelPin) => {
    setSelectedPin((prev) => (prev?.id === pin.id ? null : pin));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* 地图主体 — 全屏沉浸 */}
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [20, 30],
          zoom: 2,
          style: mapMode === 'satellite' ? 'light' : mapMode,
        }}
      >
        {/* 卫星影像图层 — 仅卫星模式下显示 */}
        <SatelliteLayer provider={satelliteProvider} visible={mapMode === 'satellite'} />

        <ZoomControl position="rightcenter" showZoom />
        <MapThemeControl position="topright" defaultValue={mapMode === 'satellite' ? 'light' : mapMode} onThemeChange={(style) => setMapMode(style as MapMode)} />

        {/* 照片足迹标记 */}
        {TRAVEL_PINS.map((pin) => (
          <Marker
            key={pin.id}
            longitude={pin.lng}
            latitude={pin.lat}
            onClick={() => handlePinClick(pin)}
          >
            <div
              onMouseEnter={() => setHoveredPin(pin.id)}
              onMouseLeave={() => setHoveredPin(null)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: hoveredPin === pin.id ? 'translateY(-6px) scale(1.08)' : 'translateY(0) scale(1)',
              }}
            >
              {/* 照片堆叠效果 */}
              <div style={{ position: 'relative', width: 56, height: 56 }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.3)',
                  transform: 'rotate(-5deg) translate(2px, 3px)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.3)',
                  transform: 'rotate(3deg) translate(-1px, 2px)',
                }} />
                <img
                  src={pin.photo}
                  alt={pin.city}
                  style={{
                    position: 'relative', width: 56, height: 56,
                    borderRadius: 10, objectFit: 'cover',
                    border: '2px solid #fff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                />
                {/* 角标 */}
                <div style={{
                  position: 'absolute', top: -6, right: -6,
                  minWidth: 20, height: 20, padding: '0 5px',
                  borderRadius: 999,
                  background: pin.featured ? '#F59E0B' : '#7C3AED',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 6px rgba(124,58,237,0.4)',
                }}>
                  {pin.featured ? '★' : pin.photoCount}
                </div>
              </div>
              {/* Hover 城市名 */}
              {hoveredPin === pin.id && (
                <div style={{
                  position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  padding: '3px 8px', borderRadius: 4,
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(8px)',
                  fontSize: 10, fontWeight: 600, color: '#1e293b',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  {pin.city} {pin.cityEn}
                </div>
              )}
            </div>
          </Marker>
        ))}
      </AiMap>

      {/* ═══════ 悬浮状态栏 (Floating Status Bar) ═══════ */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 18px',
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'linear-gradient(135deg, #7C3AED, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(124,58,237,0.3)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>explore</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Wanderlust</span>
        </div>
        <div style={{ width: 1, height: 14, background: 'rgba(0,0,0,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>2,847 在线</span>
        </div>
        <div style={{ width: 1, height: 14, background: 'rgba(0,0,0,0.1)' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 999,
          background: 'rgba(124,58,237,0.1)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#7C3AED' }}>notifications</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED' }}>5 新动态</span>
        </div>
      </div>

      {/* ═══════ 左上角搜索 + 统计面板 ═══════ */}
      <div style={{
        position: 'absolute', top: 64, left: 16, zIndex: 1000,
        width: 260, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* 搜索框 */}
        <div style={{
          padding: 14,
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'rgba(124,58,237,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#7C3AED' }}>search</span>
            </div>
            <input
              type="text"
              placeholder="搜索城市或地点..."
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 12, fontWeight: 500, color: '#1e293b',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['已去过', '想去', '热门'].map((tag, i) => (
              <button key={tag} style={{
                padding: '4px 10px', borderRadius: 999, border: 'none',
                background: i === 0 ? '#7C3AED' : 'rgba(255,255,255,0.3)',
                color: i === 0 ? '#fff' : '#1e293b',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 统计面板 */}
        <div style={{
          padding: 14,
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>旅行统计</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED' }}>Level 8</span>
          </div>
          <div style={{ width: '100%', height: 5, borderRadius: 999, background: 'rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ width: '72%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #7C3AED, #a78bfa)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: '国家', value: '18' },
              { label: '城市', value: '47' },
              { label: '照片', value: '1.2k' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ 右上角操作按钮 ═══════ */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#475569',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
        </button>
        <button style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #7C3AED, #9333ea)',
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
          boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_a_photo</span>
        </button>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(124,58,237,0.5)',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop"
            alt="avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* ═══════ 多功能操作底栏 (Floating Bottom Bar) ═══════ */}
      <nav style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '8px 14px',
        background: 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 20,
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
      }}>
        {/* 日/夜/卫星模式 */}
        {[
          { icon: 'light_mode', active: mapMode === 'light', mode: 'light' as MapMode },
          { icon: 'dark_mode', active: mapMode === 'dark', mode: 'dark' as MapMode },
          { icon: 'satellite_alt', active: mapMode === 'satellite', mode: 'satellite' as MapMode },
        ].map((item) => (
          <button
            key={item.icon}
            onClick={() => {
              setMapMode(item.mode);
              if (item.mode === 'satellite') setShowProviderPicker(true);
              else setShowProviderPicker(false);
            }}
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              background: item.active ? 'rgba(124,58,237,0.12)' : 'transparent',
              color: item.active ? '#7C3AED' : '#475569',
              transition: 'all 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
          </button>
        ))}

        <div style={{ width: 1, height: 22, background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

        {/* 个人头像 */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7C3AED, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(124,58,237,0.3)',
        }}>
          L
        </div>

        <div style={{ width: 1, height: 22, background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

        {/* 区域快捷切换 */}
        {['🇬🇧 UK', '🇯🇵 JP', '🇫🇷 FR'].map((region) => (
          <button key={region} style={{
            padding: '5px 9px', borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,0.35)',
            fontSize: 11, fontWeight: 600, color: '#1e293b',
            cursor: 'pointer', transition: 'background 0.2s',
          }}>
            {region}
          </button>
        ))}

        <div style={{ width: 1, height: 22, background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

        {/* 图层/定位 */}
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: 'transparent', color: '#475569',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>layers</span>
        </button>
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: 'transparent', color: '#475569',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>near_me</span>
        </button>
      </nav>

      {/* ═══════ 卫星影像源选择器 ═══════ */}
      {showProviderPicker && mapMode === 'satellite' && (
        <div style={{
          position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1001,
          display: 'flex', gap: 6,
          padding: '8px 10px',
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 14,
          boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
        }}>
          {([
            { key: 'gaode' as SatelliteProvider, label: '高德卫星', icon: '🇨🇳' },
            { key: 'tianditu' as SatelliteProvider, label: '天地图', icon: '🌏' },
            { key: 'google' as SatelliteProvider, label: '谷歌卫星', icon: '🌐' },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setSatelliteProvider(item.key)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                background: satelliteProvider === item.key ? '#7C3AED' : 'rgba(255,255,255,0.4)',
                color: satelliteProvider === item.key ? '#fff' : '#1e293b',
                boxShadow: satelliteProvider === item.key ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <button
            onClick={() => setShowProviderPicker(false)}
            style={{
              width: 24, height: 24, borderRadius: 6, border: 'none',
              background: 'rgba(0,0,0,0.05)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', marginLeft: 2,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
          </button>
        </div>
      )}

      {/* ═══════ 选中详情弹窗 ═══════ */}
      {selectedPin && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1001,
          width: 320, padding: 16,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 18,
          boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <img
              src={selectedPin.photo}
              alt={selectedPin.city}
              style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '2px solid #fff' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{selectedPin.city}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{selectedPin.cityEn}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: 'middle', marginRight: 2 }}>photo_library</span>
                  {selectedPin.photoCount} 张照片
                </span>
                {selectedPin.featured && (
                  <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>★ 热门</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: 'none',
                background: 'rgba(0,0,0,0.05)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
