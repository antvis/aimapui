import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AiMap, Marker } from '@antv/aimapui';
import { MAKI_ICONS, type MakiIconName } from '@antv/aimapui';

/**
 * Marker 图标全览 — 按类别分 Tab 展示所有 Maki 图标的 Marker 效果
 *
 * 左侧地图：当前选中类别的 Marker 渲染在地图上
 * 右侧面板：分类搜索，点击图标可在地图上高亮定位
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
  const [filter, setFilter] = useState('');
  const mapRef = useRef<any>(null);

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
      // 加上 4 种 variant 演示
      return picks;
    }
    const catData = ICON_CATEGORIES[activeTab];
    if (!catData) return [];
    const valid = catData.icons.filter(i => MAKI_ICONS[i]);
    return buildGridLayout(valid, catData.color, activeTab);
  }, [activeTab]);

  // 图标→颜色映射
  const iconColorMap = useMemo(() => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {};
    for (const { icons, color } of Object.values(ICON_CATEGORIES)) {
      for (const icon of icons) map[icon] = color;
    }
    return map;
  }, []);

  // 面板分类（静态）
  const categories = useMemo(() => {
    const cats: Record<string, MakiIconName[]> = {};
    for (const [cat, { icons }] of Object.entries(ICON_CATEGORIES)) {
      const valid = icons.filter(i => MAKI_ICONS[i]);
      if (valid.length > 0) cats[cat] = valid;
    }
    return cats;
  }, []);

  const categorizedSet = useMemo(() => {
    const set = new Set<string>();
    Object.values(categories).forEach(icons => icons.forEach(i => set.add(i)));
    return set;
  }, [categories]);

  const uncategorized = useMemo(
    () => Object.keys(MAKI_ICONS).filter(i => !categorizedSet.has(i)).sort() as MakiIconName[],
    [categorizedSet],
  );

  const matchesFilter = (name: string) => !filter || name.toLowerCase().includes(filter.toLowerCase());

  // 点击面板图标 → 飞到对应 tab + 选中
  const handleSelectIcon = useCallback((name: string) => {
    setSelected(prev => {
      if (prev === name) return null;
      // 切到对应分类 tab
      for (const [cat, { icons }] of Object.entries(ICON_CATEGORIES)) {
        if (icons.includes(name as MakiIconName)) {
          setActiveTab(cat as TabName);
          break;
        }
      }
      // 飞到地图中心
      setTimeout(() => {
        const scene = mapRef.current;
        if (scene) {
          try { scene.setZoom(14, {}, 500); } catch { /* */ }
        }
      }, 100);
      return name;
    });
  }, []);

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
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex' }}>
      {/* 地图 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <AiMap
          map={{
            basemap: 'gaode',
            center: [CENTER_LNG, CENTER_LAT],
            zoom: activeTab === '全部' ? 13 : 12.5,
            style: 'light',
          }}
          onSceneReady={(scene: any) => { mapRef.current = scene; }}
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

      {/* 右侧图标面板 */}
      <div style={{
        width: 340, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        background: '#fff', borderLeft: '1px solid #e5e7eb',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
      }}>
        {/* 标题 + 搜索 */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4 }}>
            Maki Icons
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
            {Object.keys(MAKI_ICONS).length} 个地图图标 · 点击定位到地图
          </div>
          <input
            type="text"
            placeholder="搜索图标..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6,
              fontSize: 12, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 图标网格 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {Object.entries(categories).map(([cat, icons]) => {
            const filtered = icons.filter(matchesFilter);
            if (filtered.length === 0) return null;
            const color = ICON_CATEGORIES[cat]?.color ?? 'primary';
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase',
                  letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: color === 'primary' ? '#2563eb' : color === 'success' ? '#00854d' : color === 'warning' ? '#943700' : '#ba1a1a',
                    flexShrink: 0,
                  }} />
                  <span style={{ color: '#374151' }}>{cat}</span>
                  <span style={{ color: '#9ca3af', fontWeight: 400 }}>{filtered.length}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {filtered.map(name => (
                    <IconChip
                      key={name}
                      name={name}
                      color={color}
                      selected={selected === name}
                      onClick={() => handleSelectIcon(name)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {uncategorized.filter(matchesFilter).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                其他
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {uncategorized.filter(matchesFilter).map(name => (
                  <IconChip
                    key={name}
                    name={name}
                    color="primary"
                    selected={selected === name}
                    onClick={() => handleSelectIcon(name)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 单个图标芯片：SVG 预览 + 名称 */
function IconChip({ name, color, selected, onClick }: {
  name: string;
  color: 'primary' | 'success' | 'warning' | 'error';
  selected: boolean;
  onClick: () => void;
}) {
  const pathData = MAKI_ICONS[name];
  const accent = color === 'primary' ? '#2563eb' : color === 'success' ? '#00854d' : color === 'warning' ? '#943700' : '#ba1a1a';
  return (
    <div
      onClick={onClick}
      title={name}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: 52, padding: '4px 0', borderRadius: 6, cursor: 'pointer',
        background: selected ? accent + '12' : 'transparent',
        border: selected ? `1px solid ${accent}` : '1px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      <svg viewBox="0 0 15 15" width={18} height={18} fill={selected ? accent : '#374151'}>
        <path d={pathData} />
      </svg>
      <span style={{
        fontSize: 8, color: selected ? accent : '#6b7280', marginTop: 2,
        maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textAlign: 'center', lineHeight: 1.2,
      }}>
        {name}
      </span>
    </div>
  );
}
