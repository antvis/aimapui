import { useCallback, useEffect, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, RouteLayer, Popup, Marker } from '@antv/aimapui';

/* ================================================================
   杭州三日游旅游地图 — Material Design 3 设计风格
   Design Tokens: Primary #005da7, Secondary #42691a
   ================================================================ */

// ── Material Design 3 Design Tokens ──────────────────────────────
const T = {
  primary: '#005da7',
  primaryContainer: '#2976c7',
  secondary: '#42691a',
  secondaryContainer: '#c2f191',
  onSecondaryContainer: '#486f20',
  background: '#f4fafd',
  surface: '#f4fafd',
  surfaceContainer: '#e8eff1',
  surfaceContainerLow: '#eef5f7',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHighest: '#dde4e6',
  surfaceDim: '#d4dbdd',
  surfaceVariant: '#dde4e6',
  surfaceBright: '#f4fafd',
  onBackground: '#161d1f',
  onSurface: '#161d1f',
  onSurfaceVariant: '#414751',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onPrimaryFixed: '#001c39',
  onPrimaryFixedVariant: '#004883',
  outline: '#717783',
  outlineVariant: '#c1c7d3',
  error: '#ba1a1a',
  inverseSurface: '#2b3234',
  inverseOnSurface: '#ebf2f4',
  tertiary: '#595c5f',
  radius: '0.25rem',
  radiusLg: '0.5rem',
  radiusXl: '0.75rem',
  radius2xl: '1rem',
  radius3xl: '1.5rem',
  radiusFull: '9999px',
};

// ── Data Model ───────────────────────────────────────────────────
interface Spot {
  id: string;
  name: string;
  lng: number;
  lat: number;
  icon: string;
  time: string;
  duration: string;
  rating: number;
  description: string;
  image: string;
  hasFood?: boolean;
  photoTip?: boolean;
}

interface DayRoute {
  day: number;
  title: string;
  theme: string;
  spots: Spot[];
}

const HANGZHOU_ROUTES: DayRoute[] = [
  {
    day: 1,
    title: '第一天',
    theme: '西湖经典环游',
    spots: [
      {
        id: 'd1-1',
        name: '断桥残雪',
        lng: 120.155,
        lat: 30.261,
        icon: 'landscape',
        time: '09:00',
        duration: '1.5h',
        rating: 4.8,
        description: '西湖十景之一，民间爱情传说发生地。',
        image: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=400&h=400&fit=crop',
      },
      {
        id: 'd1-2',
        name: '郭庄 (Gusu Garden)',
        lng: 120.143,
        lat: 30.249,
        icon: 'nature',
        time: '11:30',
        duration: '2h',
        rating: 4.6,
        description: '典型的江南私家园林，临湖凭眺。',
        image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop',
        hasFood: true,
      },
      {
        id: 'd1-3',
        name: '雷峰塔',
        lng: 120.149,
        lat: 30.232,
        icon: 'temple_buddhist',
        time: '15:00',
        duration: '1.5h',
        rating: 4.7,
        description: '俯瞰西湖全景的最佳地点，传说之地。',
        image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=400&fit=crop',
        photoTip: true,
      },
    ],
  },
  {
    day: 2,
    title: '第二天',
    theme: '灵隐禅意之旅',
    spots: [
      {
        id: 'd2-1',
        name: '灵隐寺',
        lng: 120.1,
        lat: 30.24,
        icon: 'temple_buddhist',
        time: '08:00',
        duration: '2h',
        rating: 4.9,
        description: '千年古刹，飞来峰石窟艺术精华。',
        image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=400&fit=crop',
      },
      {
        id: 'd2-2',
        name: '北高峰',
        lng: 120.095,
        lat: 30.248,
        icon: 'hiking',
        time: '10:30',
        duration: '1.5h',
        rating: 4.5,
        description: '登顶俯瞰灵隐全景，可选缆车上下。',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      },
      {
        id: 'd2-3',
        name: '龙井村',
        lng: 120.115,
        lat: 30.225,
        icon: 'local_cafe',
        time: '13:00',
        duration: '2h',
        rating: 4.7,
        description: '品正宗西湖龙井，春季可体验采茶。',
        image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=400&fit=crop',
        hasFood: true,
      },
    ],
  },
  {
    day: 3,
    title: '第三天',
    theme: '运河与现代杭州',
    spots: [
      {
        id: 'd3-1',
        name: '京杭大运河',
        lng: 120.13,
        lat: 30.32,
        icon: 'directions_boat',
        time: '09:00',
        duration: '1.5h',
        rating: 4.6,
        description: '水上巴士体验运河风光，从武林门出发。',
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=400&fit=crop',
      },
      {
        id: 'd3-2',
        name: '西溪湿地',
        lng: 120.06,
        lat: 30.27,
        icon: 'park',
        time: '11:30',
        duration: '3h',
        rating: 4.7,
        description: '电瓶船深入湿地，看白鹭翩飞。',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      },
      {
        id: 'd3-3',
        name: '武林夜市',
        lng: 120.165,
        lat: 30.275,
        icon: 'restaurant',
        time: '16:00',
        duration: '2h',
        rating: 4.5,
        description: '杭帮菜小吃一条街，片儿川必吃。',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
        hasFood: true,
      },
    ],
  },
];

type Category = '全部' | '西湖' | '寺庙' | '历史' | '美食';
const CATEGORIES: Category[] = ['全部', '西湖', '寺庙', '历史', '美食'];

function spotsToPath(spots: Spot[]): [number, number][] {
  return spots.map((s) => [s.lng, s.lat]);
}

function spotsToStops(spots: Spot[]) {
  return spots.map((s, i) => ({
    id: s.id,
    lng: s.lng,
    lat: s.lat,
    name: s.name,
    index: i,
    icon: s.icon,
  }));
}

const CARD_COLLAPSED_H = 130;
const CARD_EXPANDED_H = 450;

// ── TopAppBar: Search + Category Chips ───────────────────────────
function TopAppBar({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: Category;
  onCategoryChange: (c: Category) => void;
}) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 12px 0',
        gap: 12,
      }}
    >
      {/* Search Bar */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderRadius: 9999,
          background: 'rgba(244, 250, 253, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid rgba(22, 29, 31, 0.05)`,
          boxShadow: '0px 10px 30px rgba(74, 144, 226, 0.08)',
          transition: 'all 0.2s',
          ...(searchFocused
            ? {
                boxShadow: `0px 0px 0px 2px rgba(0, 93, 167, 0.2), 0px 10px 30px rgba(74, 144, 226, 0.08)`,
                borderColor: 'rgba(0, 93, 167, 0.3)',
              }
            : {}),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 22, color: T.primary }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="搜索景点、路线..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: 14,
              fontWeight: 400,
              color: T.onSurface,
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            }}
          />
        </div>
        <button
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(41, 118, 199, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: T.onSurfaceVariant }}
          >
            tune
          </span>
        </button>
      </div>

      {/* Category Chips */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          display: 'flex',
          gap: 8,
          padding: '0 4px 4px',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                flexShrink: 0,
                padding: '6px 20px',
                borderRadius: 9999,
                border: isActive
                  ? 'none'
                  : `1px solid rgba(22, 29, 31, 0.05)`,
                background: isActive
                  ? T.secondary
                  : 'rgba(244, 250, 253, 0.7)',
                color: isActive ? T.onSecondary : T.onSurfaceVariant,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                cursor: 'pointer',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: isActive
                  ? '0px 2px 8px rgba(66, 105, 26, 0.3)'
                  : '0px 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── FAB: Current Location ────────────────────────────────────────
function LocationFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        right: 16,
        bottom: CARD_COLLAPSED_H + 80,
        zIndex: 3000,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        background: T.surface,
        color: T.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 10px 30px rgba(74, 144, 226, 0.15)',
        transition: 'transform 0.2s',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.9)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
        my_location
      </span>
    </button>
  );
}

// ── BottomSheet: Trip Plan Panel ─────────────────────────────────
function TravelBottomSheet({
  routes,
  activeDay,
  selectedSpot,
  onDayChange,
  onSpotSelect,
}: {
  routes: DayRoute[];
  activeDay: number;
  selectedSpot: Spot | null;
  onDayChange: (d: number) => void;
  onSpotSelect: (s: Spot) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const route = routes[activeDay];
  const transform = expanded ? 'translateY(5%)' : 'translateY(62%)';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2500,
        height: CARD_EXPANDED_H,
        background: 'rgba(244, 250, 253, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '1.5rem 1.5rem 0 0',
        boxShadow: '0px -10px 40px rgba(0, 0, 0, 0.08)',
        transform,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '85vh',
      }}
    >
      {/* Drag Handle */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '10px 0 4px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 48,
            height: 4,
            background: 'rgba(65, 71, 81, 0.2)',
            borderRadius: 4,
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          padding: '0 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: T.onSurface,
                margin: 0,
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                lineHeight: '28px',
              }}
            >
              杭州三日游
            </h2>
            <p
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: T.onSurfaceVariant,
                margin: '2px 0 0',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
              }}
            >
              为您精选的深度文化路线
            </p>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              background: T.secondaryContainer,
              color: T.onSecondaryContainer,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
              transition: 'all 0.2s',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
            开始行程
          </button>
        </div>

        {/* Day Tabs */}
        <div
          style={{
            display: 'flex',
            padding: 3,
            background: T.surfaceContainerLow,
            borderRadius: 16,
          }}
        >
          {routes.map((r, i) => {
            const isActive = i === activeDay;
            return (
              <button
                key={r.day}
                onClick={() => onDayChange(i)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? T.surface : 'transparent',
                  color: isActive ? T.primary : T.onSurfaceVariant,
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                  boxShadow: isActive ? '0px 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {r.title}
              </button>
            );
          })}
        </div>

        {/* Timeline Route List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {route.spots.map((spot, i) => {
            const isLast = i === route.spots.length - 1;
            const isSel = selectedSpot?.id === spot.id;
            return (
              <div key={spot.id} style={{ position: 'relative', paddingLeft: 32 }}>
                {/* Vertical line */}
                {!isLast && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 13,
                      top: 28,
                      width: 0,
                      height: 'calc(100% - 16px)',
                      borderLeft: `2px dashed rgba(0, 93, 167, 0.3)`,
                    }}
                  />
                )}
                {/* Number circle */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 6,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: T.primary,
                    color: T.onPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: `0 0 0 4px ${T.surface}`,
                    zIndex: 1,
                  }}
                >
                  {i + 1}
                </div>
                {/* Card */}
                <div
                  onClick={() => onSpotSelect(spot)}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    borderRadius: 16,
                    cursor: 'pointer',
                    background: isSel
                      ? 'rgba(0, 93, 167, 0.04)'
                      : T.surfaceContainerLowest,
                    border: `1px solid ${
                      isSel ? 'rgba(0, 93, 167, 0.2)' : 'rgba(22, 29, 31, 0.05)'
                    }`,
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: T.surfaceVariant,
                      position: 'relative',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 28,
                        color: T.outline,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      image
                    </span>
                    <img
                      src={spot.image}
                      alt={spot.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'relative',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: T.onSurface,
                          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                        }}
                      >
                        {spot.name}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: T.primary,
                          background: 'rgba(0, 93, 167, 0.08)',
                          padding: '2px 8px',
                          borderRadius: 9999,
                        }}
                      >
                        {spot.time}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        color: T.onSurfaceVariant,
                        margin: '4px 0 0',
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {spot.description}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 6,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          color: T.onSurfaceVariant,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 14 }}
                        >
                          schedule
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>
                          {spot.duration}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 14,
                            color: T.secondary,
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          star
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: T.secondary,
                          }}
                        >
                          {spot.rating}
                        </span>
                      </div>
                      {spot.hasFood && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            color: T.primary,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 14 }}
                          >
                            restaurant
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>
                            推荐午餐
                          </span>
                        </div>
                      )}
                      {spot.photoTip && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            color: T.onSurfaceVariant,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 14 }}
                          >
                            photo_camera
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>
                            落日最佳
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── BottomNav: Navigation Bar ────────────────────────────────────
function BottomNav({ sheetExpanded }: { sheetExpanded: boolean }) {
  const bottomOffset = sheetExpanded ? 10 : CARD_COLLAPSED_H - 100;

  return (
    <nav
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3200,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 6,
        width: '90%',
        maxWidth: 360,
        background: 'rgba(244, 250, 253, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(22, 29, 31, 0.05)',
        borderRadius: 9999,
        boxShadow: '0px 10px 30px rgba(74, 144, 226, 0.08)',
        transition: 'bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Map Tab (Active) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: T.secondaryContainer,
          color: T.onSecondaryContainer,
          borderRadius: 9999,
          padding: '6px 20px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
        >
          map
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, marginTop: 1 }}>
          地图
        </span>
      </div>
      {/* Discover Tab */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.onSurfaceVariant,
          borderRadius: 9999,
          padding: '6px 20px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          explore
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, marginTop: 1 }}>
          发现
        </span>
      </div>
      {/* Trip Tab */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.onSurfaceVariant,
          borderRadius: 9999,
          padding: '6px 20px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          event_note
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, marginTop: 1 }}>
          行程
        </span>
      </div>
    </nav>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function HangzhouTravelMap() {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sceneRef = useRef<Scene | null>(null);
  const route = HANGZHOU_ROUTES[activeDay];
  const routeColor = '#005da7';

  // Filter spots by category
  const filteredSpots = route.spots.filter(
    (s) => activeCategory === '全部' || matchesCategory(s, activeCategory),
  );

  function matchesCategory(spot: Spot, cat: Category): boolean {
    switch (cat) {
      case '西湖':
        return spot.name.includes('西湖') || spot.name.includes('湖') || spot.name.includes('堤') || spot.name.includes('湿地');
      case '寺庙':
        return spot.name.includes('寺') || spot.name.includes('庙') || spot.name.includes('塔');
      case '历史':
        return spot.name.includes('古') || spot.name.includes('运河') || spot.name.includes('村');
      case '美食':
        return spot.name.includes('夜市') || spot.name.includes('村') || spot.hasFood === true;
      default:
        return true;
    }
  }

  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    const spots = HANGZHOU_ROUTES[0].spots;
    setTimeout(() => {
      const lngs = spots.map((s) => s.lng);
      const lats = spots.map((s) => s.lat);
      const pad = 0.06;
      scene.fitBounds(
        [
          [Math.min(...lngs) - pad, Math.min(...lats) - pad],
          [Math.max(...lngs) + pad, Math.max(...lats) + pad],
        ],
        { padding: [80, 40, CARD_COLLAPSED_H + 20, 40] },
      );
    }, 400);
  }, []);

  const handleDayChange = useCallback(
    (dayIndex: number) => {
      setActiveDay(dayIndex);
      setSelectedSpot(null);
      const spots = HANGZHOU_ROUTES[dayIndex].spots;
      const scene = sceneRef.current;
      if (!scene) return;
      const lngs = spots.map((s) => s.lng);
      const lats = spots.map((s) => s.lat);
      const pad = 0.06;
      scene.fitBounds(
        [
          [Math.min(...lngs) - pad, Math.min(...lats) - pad],
          [Math.max(...lngs) + pad, Math.max(...lats) + pad],
        ],
        { padding: [80, 40, CARD_COLLAPSED_H + 20, 40], animate: true },
      );
    },
    [],
  );

  const handleSpotClick = useCallback((spot: Spot) => {
    setSelectedSpot((prev) => (prev?.id === spot.id ? null : spot));
    const scene = sceneRef.current;
    if (!scene) return;
    scene.setZoomAndCenter(14, [spot.lng, spot.lat]);
  }, []);

  const handleLocate = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.setZoomAndCenter(14, [120.145, 30.26]);
  }, []);

  // Detect sheet expansion from DOM
  useEffect(() => {
    const sheet = document.getElementById('travel-bottom-sheet');
    if (!sheet) return;
    const observer = new MutationObserver(() => {
      const currentTransform = sheet.style.transform;
      setSheetExpanded(currentTransform.includes('translateY(5%)'));
    });
    observer.observe(sheet, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: T.background,
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Map ── */}
      <AiMap
        autoFit={false}
        map={{
          basemap: 'gaode',
          center: [120.145, 30.26],
          zoom: 12,
          style: 'light',
        }}
        onSceneReady={handleSceneReady}
      >
        {/* Route Layer */}
        <RouteLayer
          key={`${activeDay}-${activeCategory}`}
          path={spotsToPath(filteredSpots)}
          stops={spotsToStops(filteredSpots)}
          onStopClick={(p) => {
            const stopId = typeof p.feature?.id === 'string' ? p.feature.id : undefined;
            const spot = route.spots.find((s) => s.id === stopId);
            if (spot) handleSpotClick(spot);
          }}
          color={routeColor}
          lineWidth={3}
          stopSize={10}
          stopRenderer="icon"
          stopIconSize={24}
          stopColor={routeColor}
          showStopIndex={false}
        />

        {/* West Lake Pulse Marker */}
        <Marker longitude={120.147} latitude={30.243} anchor="center" offsets={[0, 0]}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(0, 93, 167, 0.15)',
                filter: 'blur(4px)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: T.primary,
                color: T.onPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${T.surface}`,
                boxShadow: '0px 2px 8px rgba(0, 93, 167, 0.4)',
                zIndex: 1,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 18,
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                water_lux
              </span>
            </div>
            <div
              style={{
                marginTop: 4,
                padding: '2px 10px',
                background: 'rgba(244, 250, 253, 0.9)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 9999,
                border: '1px solid rgba(22, 29, 31, 0.05)',
                boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.onSurface,
                  whiteSpace: 'nowrap',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                }}
              >
                西湖景区
              </span>
            </div>
          </div>
        </Marker>

        {/* Lingyin Temple Marker */}
        <Marker longitude={120.1} latitude={30.24} anchor="center" offsets={[0, 0]}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: T.secondary,
                color: T.onSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${T.surface}`,
                boxShadow: '0px 2px 8px rgba(66, 105, 26, 0.4)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
              >
                temple_buddhist
              </span>
            </div>
            <div
              style={{
                marginTop: 4,
                padding: '2px 10px',
                background: 'rgba(244, 250, 253, 0.9)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 9999,
                border: '1px solid rgba(22, 29, 31, 0.05)',
                boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.onSurface,
                  whiteSpace: 'nowrap',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                }}
              >
                灵隐寺
              </span>
            </div>
          </div>
        </Marker>

        {/* Xixi Wetland Marker */}
        <Marker longitude={120.06} latitude={30.27} anchor="center" offsets={[0, 0]}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: T.secondary,
                color: T.onSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${T.surface}`,
                boxShadow: '0px 2px 8px rgba(66, 105, 26, 0.4)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
              >
                park
              </span>
            </div>
            <div
              style={{
                marginTop: 4,
                padding: '2px 10px',
                background: 'rgba(244, 250, 253, 0.9)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 9999,
                border: '1px solid rgba(22, 29, 31, 0.05)',
                boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.onSurface,
                  whiteSpace: 'nowrap',
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                }}
              >
                西溪湿地
              </span>
            </div>
          </div>
        </Marker>
      </AiMap>

      {/* ── UI Overlays ── */}
      <TopAppBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <LocationFab onClick={handleLocate} />

      {/* ── Bottom Sheet (with id for observer) ── */}
      <div id="travel-bottom-sheet">
        <TravelBottomSheet
          routes={HANGZHOU_ROUTES}
          activeDay={activeDay}
          selectedSpot={selectedSpot}
          onDayChange={handleDayChange}
          onSpotSelect={handleSpotClick}
        />
      </div>

      {/* ── Bottom Nav ── */}
      <BottomNav sheetExpanded={sheetExpanded} />

      {/* ── Popup ── */}
      {selectedSpot && (
        <Popup
          longitude={selectedSpot.lng}
          latitude={selectedSpot.lat}
          size="standard"
          singleton
          closeButton
          visible
          onClose={() => setSelectedSpot(null)}
          header={{
            title: selectedSpot.name,
            statusLabel: selectedSpot.duration,
            statusColor: routeColor,
          }}
          attributes={[
            {
              label: '路线',
              value: `Day${route.day} · ${route.theme}`,
            },
            { label: '贴士', value: selectedSpot.description },
          ]}
          actions={[
            {
              variant: 'primary' as const,
              label: '导航到这里',
              onClick: () => {},
            },
            {
              variant: 'secondary' as const,
              label: '查看详情',
              onClick: () => {},
            },
          ]}
        />
      )}

      {/* ── CSS Keyframes for pulse animation ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}