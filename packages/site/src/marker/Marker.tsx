import React, { useCallback, useMemo, useState } from 'react';
import { AiMap, Marker } from '@antv/aimapui';
import { MAKI_ICONS, type MakiIconName } from '@antv/aimapui';

/**
 * Marker 图标全览 — 按类别分 Tab 展示所有 Maki 图标的 Marker 效果
 *
 * 地图：当前选中类别的 Marker 渲染在地图上
 */

// ─── 分类 & 颜色 ────────────────────────────────────────────
const ICON_CATEGORIES: Record<string, { icons: MakiIconName[]; color: 'primary' | 'success' | 'warning' | 'error' }> = {
  '交通': {
    color: 'primary',
    icons: ['airport', 'airfield', 'heliport', 'bus', 'rail', 'rail-light', 'rail-metro', 'ferry', 'ferry-jp', 'bicycle', 'bicycle-share', 'car', 'car-rental', 'car-repair', 'scooter', 'taxi', 'parking', 'parking-garage', 'parking-paid', 'fuel', 'charging-station', 'highway-rest-area', 'toll', 'bridge', 'tunnel', 'barrier', 'roadblock', 'road-accident', 'aerialway'],
  },
  '餐饮': {
    color: 'error',
    icons: ['cafe', 'restaurant', 'restaurant-bbq', 'restaurant-noodle', 'restaurant-pizza', 'restaurant-seafood', 'restaurant-sushi', 'bar', 'beer', 'alcohol-shop', 'ice-cream', 'bakery', 'confectionery', 'teahouse', 'bbq', 'fast-food', 'grocery'],
  },
  '住宿与购物': {
    color: 'warning',
    icons: ['lodging', 'campsite', 'shop', 'clothing-store', 'furniture', 'jewelry-store', 'shoe', 'gift', 'hardware', 'garden-centre', 'laundry', 'convenience', 'marketplace', 'warehouse'],
  },
  '医疗与应急': {
    color: 'error',
    icons: ['hospital', 'hospital-jp', 'pharmacy', 'doctor', 'dentist', 'veterinary', 'blood-bank', 'defibrillator', 'emergency-phone', 'fire-station', 'fire-station-jp', 'police', 'police-jp', 'prison', 'shelter'],
  },
  '景点与休闲': {
    color: 'success',
    icons: ['attraction', 'museum', 'art-gallery', 'cinema', 'theatre', 'music', 'karaoke', 'gaming', 'amusement-park', 'zoo', 'aquarium', 'stadium', 'observation-tower', 'golf', 'swimming', 'tennis', 'soccer', 'basketball', 'baseball', 'cricket', 'volleyball', 'skateboard', 'skiing', 'snowmobile', 'horse-riding', 'fitness-centre', 'playground', 'picnic-site', 'beach', 'hot-spring', 'mountain', 'volcano', 'waterfall', 'viewpoint', 'castle', 'castle-jp', 'monument', 'monument-jp', 'landmark', 'landmark-jp', 'lighthouse', 'lighthouse-jp', 'garden', 'park', 'park-alt1', 'farm', 'wetland', 'natural'],
  },
  '教育与文化': {
    color: 'primary',
    icons: ['school', 'school-jp', 'college', 'college-jp', 'library', 'place-of-worship', 'religious-christian', 'religious-muslim', 'religious-buddhist', 'religious-jewish', 'religious-shinto'],
  },
  '城镇与设施': {
    color: 'warning',
    icons: ['city', 'town', 'village', 'building', 'building-alt1', 'commercial', 'residential-community', 'town-hall', 'embassy', 'post', 'post-jp', 'bank', 'bank-jp', 'communications-tower', 'mobile-phone', 'telephone', 'toilet', 'elevator', 'wheelchair', 'recycling', 'waste-basket', 'drinking-water', 'slipway', 'information', 'cross', 'arrow', 'caution', 'danger', 'circle', 'circle-stroked', 'square', 'square-stroked', 'triangle', 'triangle-stroked', 'diamond', 'star', 'star-stroked', 'heart', 'marker', 'marker-stroked', 'globe', 'rocket', 'logging', 'windmill', 'watermill', 'dam', 'harbor', 'gate', 'lift-gate', 'fence', 'ranger-station', 'dog-park'],
  },
};

// Tab 列表
const TAB_LIST = ['全部', ...Object.keys(ICON_CATEGORIES)] as const;
type TabName = typeof TAB_LIST[number];

// ─── 网格布局 ────────────────────────────────────────────
const COLS = 8;
const LAT_STEP = 0.003;
const LNG_STEP = 0.004;
const CENTER_LNG = 116.397;
const CENTER_LAT = 39.909;

interface MarkerLayout {
  name: string;
  lng: number;
  lat: number;
  color: 'primary' | 'success' | 'warning' | 'error';
  category: string;
}

function buildGridLayout(icons: string[], color: 'primary' | 'success' | 'warning' | 'error', category: string): MarkerLayout[] {
  const rows = Math.ceil(icons.length / COLS);
  const startLng = CENTER_LNG - ((COLS - 1) * LNG_STEP) / 2;
  const startLat = CENTER_LAT + ((rows - 1) * LAT_STEP) / 2;
  return icons.map((name, i) => ({
    name,
    lng: startLng + (i % COLS) * LNG_STEP,
    lat: startLat - Math.floor(i / COLS) * LAT_STEP,
    color,
    category,
  }));
}

// ─── 主组件 ──────────────────────────────────────────────
export default function Demo05Marker() {
  const [activeTab, setActiveTab] = useState<TabName>('全部');
  const [selected, setSelected] = useState<string | null>(null);

  // 当前 tab 要展示的 Marker 列表
  const visibleLayouts = useMemo(() => {
    if (activeTab === '全部') {
      // 全部 tab：每个类别取前 4 个代表性图标
      const picks: MarkerLayout[] = [];
      for (const [cat, { icons, color }] of Object.entries(ICON_CATEGORIES)) {
        const valid = icons.filter(i => MAKI_ICONS[i]);
        const sample = valid.slice(0, 4);
        picks.push(...buildGridLayout(sample, color, cat));
      }
      return picks;
    }
    const catData = ICON_CATEGORIES[activeTab];
    if (!catData) return [];
    const valid = catData.icons.filter(i => MAKI_ICONS[i]);
    return buildGridLayout(valid, catData.color, activeTab);
  }, [activeTab]);

  const handleMarkerClick = useCallback((name: string) => {
    setSelected(prev => prev === name ? null : name);
  }, []);

  // tab 颜色指示器
  const tabColor: Record<string, string> = {
    '全部': '#6366f1',
    '交通': '#2563eb',
    '餐饮': '#ba1a1a',
    '住宿与购物': '#943700',
    '医疗与应急': '#ba1a1a',
    '景点与休闲': '#00854d',
    '教育与文化': '#2563eb',
    '城镇与设施': '#943700',
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 地图 */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <AiMap
          map={{
            basemap: 'gaode',
            center: [CENTER_LNG, CENTER_LAT],
            zoom: activeTab === '全部' ? 13 : 12.5,
            style: 'light',
          }}
        >
          {/* 当前 tab 的 Marker 列表 */}
          {visibleLayouts.map(m => (
            <Marker
              key={m.name}
              longitude={m.lng}
              latitude={m.lat}
              variant="icon"
              color={m.color}
              icon={m.name}
              label={m.name}
              selected={selected === m.name}
              onClick={() => handleMarkerClick(m.name)}
            />
          ))}

          {/* 4 种 variant 演示（仅全部 tab 显示） */}
          {activeTab === '全部' && (
            <>
              <Marker longitude={116.382} latitude={39.918} variant="pin" color="primary" label="Pin" />
              <Marker longitude={116.412} latitude={39.918} variant="circle" color="success" label="Circle" />
              <Marker longitude={116.382} latitude={39.895} variant="dot" color="error" />
              <Marker longitude={116.412} latitude={39.895} variant="icon" color="warning" icon="star" label="Icon" />
            </>
          )}
        </AiMap>

        {/* 左上角类别 Tab */}
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 10,
          background: 'rgba(255,255,255,0.95)', borderRadius: 8,
          padding: '6px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 420,
        }}>
          {TAB_LIST.map(tab => {
            const isActive = activeTab === tab;
            const color = tabColor[tab] ?? '#6366f1';
            const count = tab === '全部'
              ? Object.values(ICON_CATEGORIES).reduce((s, c) => s + c.icons.filter(i => MAKI_ICONS[i]).length, 0)
              : ICON_CATEGORIES[tab]?.icons.filter(i => MAKI_ICONS[i]).length ?? 0;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelected(null); }}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  background: isActive ? color + '18' : 'transparent',
                  color: isActive ? color : '#6b7280',
                  borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab}{' '}<span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
