import { useCallback, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, Marker } from '@antv/aimapui';

/* ================================================================
   Apple Maps 风格地图 Demo
   设计参考 Apple Maps iOS 原生应用设计规范 (.codefuse/apple.md)
   - 地图浏览模式：Liquid Glass 浮层控件 + 蓝点 Pin 标记
   - POI 详情面板：Bottom Sheet 半屏卡片
   ================================================================ */

// ─── Apple Maps Design Tokens ───────────────────────────────────
const A = {
  primary: '#0088FF',
  primaryDark: '#0C79FE',
  primaryAlpha: 'rgba(0, 136, 255, 0.08)',
  primaryTinted: 'rgba(0, 136, 255, 0.12)',
  red: '#FF383C',
  locStart: '#FFA62B',
  locEnd: '#FF5D00',
  locPin: '#F19B3F',
  locDot: '#FF5C00',
  labelText: '#AC480C',
  surface: '#FFFFFF',
  surfaceLight: '#F5F6F3',
  surfaceGray: '#E6E5E5',
  separator: '#BDBDBD',
  textPrimary: '#000000',
  textSecondary: '#868782',
  textTertiary: '#7A7B78',
  textLink: '#0088FF',
  textLinkEdit: '#008BFF',
  textOnDark: '#FFFFFF',
  glassIcon: '#211906',
  searchIcon: '#6C6C6C',
  searchPlaceholder: '#88898B',
  avatarStart: '#A0C2E4',
  avatarEnd: '#717FBE',
  weatherIcon: '#D1D1D5',
  glassLight: 'linear-gradient(0deg, rgba(245,245,245,0.4), rgba(245,245,245,0.4)), #0F0F0F',
  glassPanel: 'linear-gradient(0deg, rgba(245,245,245,0.2), rgba(245,245,245,0.2)), rgba(15,15,15,0.2)',
  glassBlend: 'normal, color-dodge' as const,
  glassFill: 'rgba(245, 245, 245, 0.1)',
  glassButtonBg: 'rgba(255, 255, 255, 0.85)',
  // Tools-style light translucent glass (toolbar, temperature, search bar)
  // No dark base, no color-dodge — just white translucent
  toolsBg: 'rgba(245, 245, 245, 0.4)',
  toolsFill: 'rgba(245, 245, 245, 0.1)',
  pinGlow: 'radial-gradient(50% 50% at 50% 50%, #579DFF 0%, rgba(87, 196, 255, 0) 100%)',
  glassShadow: '0px 4px 32px rgba(0, 0, 0, 0.16)',
  glassShadowLight: '0px 4px 32px rgba(0, 0, 0, 0.08)',
  pinShadow: 'drop-shadow(0px 4px 16px rgba(0, 0, 0, 0.24))',
  guideGray: 'linear-gradient(180deg, #E9E9E9 0%, #FDFDFC 100%)',
  guideYellow: 'linear-gradient(180deg, #FFF6C8 0%, #FDFDFC 100%)',
};

// ─── 类型定义 ───────────────────────────────────────────────────
interface POI {
  id: string;
  name: string;
  category: string;
  lng: number;
  lat: number;
  address: string;
  phone: string;
  status: 'Open' | 'Closed';
  statusLabel: string;
  walkPercent: number;
  priceLevel: number; // 1-4 for $-$$$$
  driveDist: string;
  driveTime: string;
  photos: string[];
  ratings: { category: string; score: number; count: number }[];
  goodToKnow: string[];
  hours: { day: string; time: string }[];
  todayLabel: string;
}

// ─── POI 数据（杭州地区） ────────────────────────────────────────
const POIS: POI[] = [
  {
    id: 'westlake',
    name: 'West Lake',
    category: 'Scenic Spot · Park',
    lng: 120.147,
    lat: 30.243,
    address: '1 Longjing Rd, Xihu District\nHangzhou, Zhejiang 310013',
    phone: '+86 (571) 8717-9600',
    status: 'Open',
    statusLabel: 'Open 24 hours',
    walkPercent: 92,
    priceLevel: 1,
    driveDist: '3.2 km',
    driveTime: '12 min',
    photos: [
      'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1580587771525-78b9f2858a22?w=400&h=400&fit=crop',
    ],
    ratings: [
      { category: 'Overall', score: 98, count: 8456 },
      { category: 'Scenery', score: 99, count: 7234 },
      { category: 'Cleanliness', score: 95, count: 6102 },
      { category: 'Accessibility', score: 91, count: 4890 },
    ],
    goodToKnow: ['Good for Kids', 'Wheelchair Accessible'],
    hours: [
      { day: 'Mon - Sun', time: 'Open 24 hours' },
    ],
    todayLabel: 'Open Now',
  },
  {
    id: 'lingyin',
    name: 'Lingyin Temple',
    category: 'Buddhist Temple · Historic Site',
    lng: 120.101,
    lat: 30.242,
    address: '1 Fayun Lane, Xihu District\nHangzhou, Zhejiang 310013',
    phone: '+86 (571) 8796-8665',
    status: 'Open',
    statusLabel: 'Until 17:15',
    walkPercent: 85,
    priceLevel: 2,
    driveDist: '7.8 km',
    driveTime: '25 min',
    photos: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=400&fit=crop',
    ],
    ratings: [
      { category: 'Overall', score: 96, count: 5230 },
      { category: 'History', score: 97, count: 4102 },
      { category: 'Atmosphere', score: 98, count: 3890 },
      { category: 'Facilities', score: 88, count: 3100 },
    ],
    goodToKnow: ['Cash Only', 'No Photos Inside Halls'],
    hours: [
      { day: 'Mon - Sun', time: '07:00 - 17:15' },
    ],
    todayLabel: 'Open Until 17:15',
  },
  {
    id: 'longjing',
    name: 'Longjing Tea Village',
    category: 'Tea House · Cafe',
    lng: 120.124,
    lat: 30.221,
    address: 'Longjing Rd, Xihu District\nHangzhou, Zhejiang 310008',
    phone: '+86 (571) 8799-4002',
    status: 'Open',
    statusLabel: 'Until 18:00',
    walkPercent: 78,
    priceLevel: 3,
    driveDist: '5.5 km',
    driveTime: '18 min',
    photos: [
      'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
    ],
    ratings: [
      { category: 'Overall', score: 94, count: 3210 },
      { category: 'Food & Drink', score: 95, count: 2800 },
      { category: 'Service', score: 92, count: 2450 },
      { category: 'Atmosphere', score: 97, count: 2600 },
    ],
    goodToKnow: ['Accepts WeChat Pay', 'Outdoor Seating'],
    hours: [
      { day: 'Mon - Sat', time: '09:00 - 18:00' },
      { day: 'Sunday', time: '10:00 - 17:00' },
    ],
    todayLabel: 'Open Until 18:00',
  },
  {
    id: 'hefang',
    name: 'Hefang Street',
    category: 'Shopping · Historic Street',
    lng: 120.168,
    lat: 30.242,
    address: 'Hefang St, Shangcheng District\nHangzhou, Zhejiang 310002',
    phone: '+86 (571) 8780-8851',
    status: 'Open',
    statusLabel: 'Until 22:00',
    walkPercent: 88,
    priceLevel: 2,
    driveDist: '2.1 km',
    driveTime: '8 min',
    photos: [
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=400&fit=crop',
    ],
    ratings: [
      { category: 'Overall', score: 91, count: 6780 },
      { category: 'Shopping', score: 89, count: 5100 },
      { category: 'Food & Drink', score: 93, count: 4600 },
      { category: 'Atmosphere', score: 92, count: 4100 },
    ],
    goodToKnow: ['Accepts Credit Cards', 'Busy on Weekends'],
    hours: [
      { day: 'Mon - Thu', time: '10:00 - 21:00' },
      { day: 'Fri - Sat', time: '10:00 - 22:00' },
      { day: 'Sunday', time: '10:00 - 20:00' },
    ],
    todayLabel: 'Open Until 22:00',
  },
  {
    id: 'xixi',
    name: 'Xixi Wetland Park',
    category: 'National Park · Wetland',
    lng: 120.067,
    lat: 30.27,
    address: '518 Tianmushan Rd, Xihu District\nHangzhou, Zhejiang 310023',
    phone: '+86 (571) 8810-6688',
    status: 'Open',
    statusLabel: 'Until 17:30',
    walkPercent: 72,
    priceLevel: 2,
    driveDist: '12.4 km',
    driveTime: '35 min',
    photos: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
    ],
    ratings: [
      { category: 'Overall', score: 93, count: 4560 },
      { category: 'Scenery', score: 94, count: 3900 },
      { category: 'Facilities', score: 87, count: 3200 },
      { category: 'Accessibility', score: 85, count: 2800 },
    ],
    goodToKnow: ['Good for Kids', 'Boat Tours Available'],
    hours: [
      { day: 'Mon - Sun', time: '08:00 - 17:30' },
    ],
    todayLabel: 'Open Until 17:30',
  },
];

// ─── 子组件：Liquid Glass 按钮 ──────────────────────────────────
function GlassButton({
  size,
  style,
  children,
  onClick,
}: {
  size: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        isolation: 'isolate',
        width: size,
        height: size,
        background: A.glassButtonBg,
        boxShadow: A.glassShadow,
        borderRadius: size / 2,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: A.glassLight,
          backgroundBlendMode: A.glassBlend,
          borderRadius: size / 2,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── 子组件：Glass 面板 ────────────────────────────────────────
function GlassPanel({
  width,
  height,
  borderRadius,
  style,
  children,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: width ?? 'auto',
        height: height ?? 'auto',
        background: A.glassButtonBg,
        boxShadow: A.glassShadow,
        borderRadius: borderRadius ?? 24,
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: A.glassPanel,
          backgroundBlendMode: A.glassBlend,
          backdropFilter: 'blur(16px)',
          borderRadius: borderRadius ?? 24,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── 子组件：温度小组件 ──────────────────────────────────────────
function TemperatureWidget() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        top: 50,
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '14px 0',
        gap: 2,
        isolation: 'isolate',
        width: 60,
        height: 32,
        background: A.toolsBg,
        boxShadow: A.glassShadow,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, top: '-0.09px', bottom: '0.09px',
          background: A.toolsFill,
          borderRadius: 12,
        }}
      />
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 16,
          fontWeight: 400,
          color: A.weatherIcon,
          lineHeight: '19px',
        }}
      >
        ☀️
      </span>
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          color: A.textPrimary,
          lineHeight: '21px',
        }}
      >
        28°
      </span>
    </div>
  );
}

// ─── 子组件：垂直工具栏 ──────────────────────────────────────────
function VerticalToolbar({ onLocate }: { onLocate: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        gap: 16,
        isolation: 'isolate',
        width: 48,
        height: 95,
        background: A.toolsBg,
        boxShadow: A.glassShadow,
        borderRadius: 24,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: A.toolsFill,
          borderRadius: 24,
        }}
      />
      {/* Explore / Look Around */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 18,
          fontWeight: 590,
          color: A.glassIcon,
          lineHeight: '20px',
          letterSpacing: '-0.5px',
        }}
      >
        🔭
      </span>
      {/* Locate me */}
      <span
        onClick={onLocate}
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 18,
          fontWeight: 590,
          color: A.primary,
          lineHeight: '20px',
          letterSpacing: '-0.5px',
          cursor: 'pointer',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: A.primary }}>location_on</span>
      </span>
    </div>
  );
}

// ─── 子组件：底部搜索栏 ──────────────────────────────────────────
function BottomSearchBar() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 18,
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0 14px',
        gap: 8,
        width: 332,
        height: 66,
        background: A.toolsBg,
        boxShadow: A.glassShadow,
        borderRadius: 20,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: A.toolsFill,
          borderRadius: 20,
        }}
      />
      {/* Search Input */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px',
          gap: 4,
          flex: 1,
          height: 38,
          background: 'rgba(120, 120, 128, 0.08)',
          backdropFilter: 'blur(11px)',
          borderRadius: 22,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {/* Search Icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7.5" cy="7.5" r="6" stroke={A.searchIcon} strokeWidth="1.6" />
            <line x1="12" y1="12" x2="16" y2="16" stroke={A.searchIcon} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontFamily: "'SF Pro', -apple-system, sans-serif",
              fontSize: 15,
              fontWeight: 510,
              color: A.searchIcon,
              letterSpacing: '-0.5px',
            }}
          >
            Search Places
          </span>
        </div>
        {/* Mic Icon */}
        <span
          style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 15,
            fontWeight: 590,
            color: A.searchIcon,
            letterSpacing: '-0.5px',
          }}
        >
          🎤
        </span>
      </div>
      {/* Avatar */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 38,
          height: 38,
          background: `linear-gradient(180deg, ${A.avatarStart} 0%, ${A.avatarEnd} 100%)`,
          borderRadius: 18,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: A.textOnDark,
            letterSpacing: '-0.5px',
          }}
        >
          L
        </span>
      </div>
    </div>
  );
}

// ─── 子组件：POI 详情面板 ────────────────────────────────────────
function PlaceCard({ poi, onClose }: { poi: POI; onClose: () => void }) {
  return (
    <>
      {/* 半透明遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.16)',
          zIndex: 2000,
        }}
      />
      {/* 详情面板 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '85%',
          background: A.surfaceLight,
          boxShadow: A.glassShadow,
          backdropFilter: 'blur(16px)',
          borderRadius: '36px 36px 0 0',
          zIndex: 2001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Fill layer */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: A.glassPanel,
            backgroundBlendMode: A.glassBlend,
            backdropFilter: 'blur(21px)',
            borderRadius: '36px 36px 0 0',
          }}
        />
        {/* Grabber */}
        <div
          style={{
            width: 48,
            height: 4,
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 4,
            margin: '6px auto 0',
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
          }}
        />
        {/* 头部信息 */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            padding: '12px 16px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'SF Pro', -apple-system, sans-serif",
              fontSize: 19,
              fontWeight: 700,
              color: A.textPrimary,
              letterSpacing: '-0.4px',
              lineHeight: '23px',
            }}
          >
            {poi.name}
          </div>
          <div
            style={{
              fontFamily: "'SF Pro', -apple-system, sans-serif",
              fontSize: 13,
              fontWeight: 590,
              color: A.textSecondary,
              letterSpacing: '-0.4px',
              lineHeight: '16px',
              marginTop: 2,
            }}
          >
            {poi.category}
          </div>
        </div>

        {/* 可滚动内容 */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', padding: '0 16px 80px' }}>
          {/* Actions Row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 8,
              marginTop: 16,
              marginBottom: 24,
            }}
          >
            <ActionButton label="Directions" icon="directions_car" primary />
            <ActionButton label="Call" icon="call" />
            <ActionButton label="Website" icon="language" />
          </div>

          {/* Info Stats */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 28,
              marginBottom: 24,
            }}
          >
            <InfoStat label="Status" value={poi.statusLabel} color={poi.status === 'Closed' ? A.red : '#34C759'} />
            <InfoStat label="Walk" value={`${poi.walkPercent}%`} icon="directions_walk" />
            <InfoStat label="Price" value={'$'.repeat(poi.priceLevel)} />
            <InfoStat label="Drive" value={poi.driveDist} icon="directions_car" sub={poi.driveTime} />
          </div>

          {/* Photo Gallery */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {poi.photos.map((url, i) => (
              <div
                key={i}
                style={{
                  width: 176,
                  height: 176,
                  borderRadius: 26,
                  background: `linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Pro', -apple-system, sans-serif",
                    fontSize: 17,
                    fontWeight: 590,
                    color: A.textOnDark,
                    letterSpacing: '-0.8px',
                  }}
                >
                  {i === 0 ? 'Atmosphere' : 'All Photos'}
                </span>
              </div>
            ))}
            {/* Add / More buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 104,
                  height: 82,
                  background: A.surfaceLight,
                  borderRadius: 22,
                  padding: 8,
                  gap: 2,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: A.primary }}>add_a_photo</span>
                <span
                  style={{
                    fontFamily: "'SF Pro', -apple-system, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: A.primary,
                    textAlign: 'center',
                  }}
                >
                  Add Photo
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 104,
                  height: 82,
                  background: A.surfaceLight,
                  borderRadius: 22,
                  padding: 8,
                  gap: 2,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: A.primary }}>photo_library</span>
                <span
                  style={{
                    fontFamily: "'SF Pro', -apple-system, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: A.primary,
                    textAlign: 'center',
                  }}
                >
                  More Photos
                </span>
              </div>
            </div>
          </div>

          {/* Ratings Section */}
          <div style={{ marginBottom: 24 }}>
            <SectionTitle title="Ratings" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {poi.ratings.map((r, i) => (
                <RatingRow key={i} category={r.category} score={r.score} count={r.count} />
              ))}
            </div>
            {/* Rate Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px 10px',
                marginTop: 12,
                background: A.primaryTinted,
                borderRadius: 26,
                gap: 10,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: A.primary }}>star</span>
              <span
                style={{
                  fontFamily: "'SF Pro', -apple-system, sans-serif",
                  fontSize: 17,
                  fontWeight: 590,
                  color: A.primary,
                  letterSpacing: '-0.5px',
                }}
              >
                Rate This Place
              </span>
            </div>
          </div>

          {/* Good to Know */}
          <div style={{ marginBottom: 24 }}>
            <SectionTitle title="Good to Know" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {poi.goodToKnow.map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: A.textPrimary }}>✓</span>
                  <span
                    style={{
                      fontFamily: "'SF Pro', -apple-system, sans-serif",
                      fontSize: 17,
                      fontWeight: 400,
                      color: A.textPrimary,
                      letterSpacing: '-0.8px',
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingBottom: 8,
                borderBottom: `1px solid ${A.separator}`,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Pro', -apple-system, sans-serif",
                  fontSize: 20,
                  fontWeight: 590,
                  color: A.textPrimary,
                  letterSpacing: '-0.8px',
                }}
              >
                Hours
              </span>
              <span
                style={{
                  fontFamily: "'SF Pro', -apple-system, sans-serif",
                  fontSize: 15,
                  fontWeight: 510,
                  color: A.textLinkEdit,
                  letterSpacing: '-0.4px',
                }}
              >
                Edit
              </span>
            </div>
            <div
              style={{
                fontFamily: "'SF Pro', -apple-system, sans-serif",
                fontSize: 17,
                fontWeight: 400,
                color: A.red,
                letterSpacing: '-0.4px',
                marginBottom: 8,
              }}
            >
              {poi.todayLabel}
            </div>
            {poi.hours.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Pro', -apple-system, sans-serif",
                    fontSize: 17,
                    fontWeight: 400,
                    color: A.textPrimary,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {h.day}
                </span>
                <span
                  style={{
                    fontFamily: "'SF Pro', -apple-system, sans-serif",
                    fontSize: 17,
                    fontWeight: 400,
                    color: A.textPrimary,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {h.time}
                </span>
              </div>
            ))}
          </div>

          {/* Details */}
          <div style={{ marginBottom: 24 }}>
            <SectionTitle title="Details" />
            <div style={{ marginTop: 8 }}>
              {/* Phone */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 8,
                  borderBottom: `0.5px solid ${A.separator}`,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Pro', -apple-system, sans-serif",
                    fontSize: 15,
                    fontWeight: 400,
                    color: A.textSecondary,
                    letterSpacing: '-0.4px',
                  }}
                >
                  Phone
                </span>
                <span
                  style={{
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: 17,
                    fontWeight: 500,
                    color: A.textLink,
                  }}
                >
                  {poi.phone}
                </span>
              </div>
              {/* Address */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Pro', -apple-system, sans-serif",
                    fontSize: 15,
                    fontWeight: 400,
                    color: A.textSecondary,
                    letterSpacing: '-0.4px',
                  }}
                >
                  Address
                </span>
                <span
                  style={{
                    fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                    fontSize: 17,
                    fontWeight: 400,
                    color: A.textPrimary,
                    lineHeight: '22px',
                    textAlign: 'right' as const,
                    maxWidth: 192,
                  }}
                >
                  {poi.address}
                </span>
              </div>
            </div>
          </div>

          {/* System Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <SystemActionButton label="Report an Issue" icon="report_problem" />
            <SystemActionButton label="Add to Favorites" icon="location_on" />
            <SystemActionButton label="Claim This Place" icon="apartment" />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── 详情面板子组件 ─────────────────────────────────────────────
function ActionButton({ label, icon, primary }: { label: string; icon: string; primary?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 8,
        gap: 2,
        flex: 1,
        height: 53,
        background: primary ? A.primary : A.primaryAlpha,
        borderRadius: 14,
      }}
    >
      <span style={{ fontSize: 16, color: primary ? A.textOnDark : A.primary }}>{icon}</span>
      <span
        style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: primary ? A.textOnDark : A.primary,
          textAlign: 'center' as const,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function InfoStat({ label, value, color, icon, sub }: { label: string; value: string; color?: string; icon?: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span
        style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 13,
          fontWeight: 590,
          color: A.textSecondary,
          letterSpacing: '-0.4px',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
        <span
          style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 16,
            fontWeight: sub ? 700 : 590,
            color: color ?? A.textPrimary,
          }}
        >
          {value}
        </span>
      </div>
      {sub && (
        <span
          style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 11,
            fontWeight: 400,
            color: A.textSecondary,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <span
      style={{
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        fontSize: 20,
        fontWeight: 590,
        color: A.textPrimary,
        letterSpacing: '-0.8px',
        lineHeight: '24px',
      }}
    >
      {title}
    </span>
  );
}

function RatingRow({ category, score, count }: { category: string; score: number; count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        height: 41,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        <span
          style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 17,
            fontWeight: 510,
            color: A.textPrimary,
            letterSpacing: '-0.8px',
          }}
        >
          {category}
        </span>
        <span
          style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 15,
            fontWeight: 400,
            color: A.textSecondary,
            letterSpacing: '-0.8px',
          }}
        >
          {count} ratings
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 27, color: A.textPrimary }}>star</span>
        <span
          style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 27,
            fontWeight: 700,
            color: A.textPrimary,
          }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

function SystemActionButton({ label, icon }: { label: string; icon: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px 10px',
        gap: 10,
        background: A.primaryTinted,
        borderRadius: 26,
      }}
    >
      <span style={{ fontSize: 18, color: A.primary, position: 'absolute', left: 24 }}>{icon}</span>
      <span
        style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 17,
          fontWeight: 590,
          color: A.primary,
          letterSpacing: '-0.5px',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── 主组件 ─────────────────────────────────────────────────────
export default function AppleMapsDemo() {
  const sceneRef = useRef<Scene | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    setTimeout(() => {
      scene.fitBounds(
        [
          [120.05, 30.2],
          [120.18, 30.28],
        ],
        { padding: { top: 80, bottom: 120, left: 60, right: 60 } },
      );
    }, 400);
  }, []);

  const handleLocate = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.setZoomAndCenter(14, [120.15, 30.25]);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: A.surface, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif" }}>
      {/* ── AiMap 地图画布 ── */}
      <AiMap
        autoFit={false}
        map={{
          basemap: 'gaode',
          center: [120.15, 30.25],
          zoom: 13,
          style: 'light',
        }}
        onSceneReady={handleSceneReady}
      >
        {/* POI Markers — 橙色地点标记 */}
        {POIS.map((poi) => (
          <Marker
            key={poi.id}
            longitude={poi.lng}
            latitude={poi.lat}
            anchor="bottom"
            offsets={[0, 0]}
          >
            <div
              onClick={() => setSelectedPoi(poi)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              {/* Pin Icon */}
              <div
                style={{
                  width: 44,
                  height: 55,
                  position: 'relative',
                  filter: A.pinShadow,
                }}
              >
                {/* Pin body */}
                <div
                  style={{
                    position: 'absolute',
                    width: 42,
                    height: 42,
                    left: 1,
                    top: 0,
                    background: `linear-gradient(180deg, ${A.locStart} 0%, ${A.locEnd} 100%)`,
                    borderRadius: '50%',
                    border: '2px solid #FFFFFF',
                  }}
                >
                  {/* Inner icon area */}
                  <div
                    style={{
                      position: 'absolute',
                      width: 20,
                      height: 20,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                  </div>
                </div>
                {/* Pin bottom tip */}
                <div
                  style={{
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: 2,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `8px solid ${A.locEnd}`,
                  }}
                />
                {/* Small dot at tip */}
                <div
                  style={{
                    position: 'absolute',
                    width: 6,
                    height: 6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: -2,
                    background: A.locDot,
                    borderRadius: '50%',
                    border: '1.5px solid #FFFFFF',
                  }}
                />
              </div>
              {/* Name Label */}
              <span
                style={{
                  fontFamily: "'SF Pro', -apple-system, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: A.labelText,
                  textAlign: 'center' as const,
                  background: 'rgba(255,255,255,0.85)',
                  padding: '1px 4px',
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.9)',
                  marginTop: 2,
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {poi.name}
              </span>
            </div>
          </Marker>
        ))}

        {/* Center Pin — 搜索蓝点 + 光晕 */}
        <Marker longitude={120.155} latitude={30.25} anchor="center" offsets={[0, 0]}>
          <div style={{ width: 86, height: 88, position: 'relative' }}>
            {/* Radial Glow */}
            <div
              style={{
                position: 'absolute',
                width: 86,
                height: 86,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: A.pinGlow,
                borderRadius: '50%',
              }}
            />
            {/* Blue Dot Core */}
            <div
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: A.primaryDark,
                border: '4px solid #FFFFFF',
                borderRadius: '50%',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </Marker>
      </AiMap>

      {/* ── 模式 A：地图浏览覆盖层 ── */}
      {!selectedPoi && (
        <>
          {/* 关闭按钮（左上角）*/}
          <GlassButton size={44} style={{ position: 'absolute', left: 16, top: 16, zIndex: 1100 }}>
            <span
              style={{
                fontFamily: "'SF Pro', -apple-system, sans-serif",
                fontSize: 19,
                fontWeight: 590,
                color: A.glassIcon,
                letterSpacing: '-0.5px',
              }}
            >
              ✕
            </span>
          </GlassButton>

          {/* 信息按钮（右上角） */}
          <GlassButton size={44} style={{ position: 'absolute', right: 16, top: 16, zIndex: 1100 }}>
            <span
              style={{
                fontFamily: "'SF Pro', -apple-system, sans-serif",
                fontSize: 19,
                fontWeight: 590,
                color: A.glassIcon,
                letterSpacing: '-0.5px',
              }}
            >
              ℹ️
            </span>
          </GlassButton>

          <TemperatureWidget />
          <VerticalToolbar onLocate={handleLocate} />
          <BottomSearchBar />
        </>
      )}

      {/* ── 模式 B：POI 详情面板 ── */}
      {selectedPoi && (
        <PlaceCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
      )}
    </div>
  );
}