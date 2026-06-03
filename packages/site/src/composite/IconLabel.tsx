import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AiMap, IconLayer, ZoomControl, Tooltip, createMakiPinMap, MAKI_ICONS } from '@antv/aimapui';
import type { LayerEventPayload, MakiIconName } from '@antv/aimapui';

/**
 * 图片标注图（IconLayer 设计规范 Demo）
 *
 * 展示特性：
 * - 图标 + 文字标签组合（图片在上，文字在下）
 * - 内置 Maki 图标（CC0），无需外部 URL
 * - 缩放适配：Zoom15+ 全显示 → 10-14 仅图标 → <10 降级圆点
 * - 碰撞检测：重叠时隐藏低优先级文本
 * - 2px 白色光晕确保深色底图可读性
 * - Tooltip 悬停展示详情
 * - 支持切换不同类型的图标
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

export default function Demo21IconLabel() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ lng: number; lat: number; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('全部');

  // 当前 tab 要展示的图标列表
  const visibleIcons = useMemo(() => {
    if (activeTab === '全部') {
      // 全部 tab：每个类别取前 4 个代表性图标
      const picks: MakiIconName[] = [];
      for (const [cat, { icons }] of Object.entries(ICON_CATEGORIES)) {
        const valid = icons.filter(i => MAKI_ICONS[i]);
        const sample = valid.slice(0, 4);
        picks.push(...sample);
      }
      return picks;
    }
    const catData = ICON_CATEGORIES[activeTab];
    if (!catData) return [];
    return catData.icons.filter(i => MAKI_ICONS[i]);
  }, [activeTab]);

  // 图标→颜色映射
  const iconColorMap = useMemo(() => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {};
    for (const { icons, color } of Object.values(ICON_CATEGORIES)) {
      for (const icon of icons) map[icon] = color;
    }
    return map;
  }, []);

  // 颜色映射
  const colorMap = useMemo(() => ({
    primary: '#2563eb',
    success: '#00854d',
    warning: '#943700',
    error: '#ba1a1a',
  }), []);

  // 使用内置 Maki 图标 Pin 样式，按数据中的 name 字段映射，不同类型使用不同背景颜色
  const makiPinMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const icon of visibleIcons) {
      const color = iconColorMap[icon] ?? 'primary';
      const fillColor = colorMap[color];
      map[icon] = createMakiPinMap([icon], { fill: fillColor })[icon];
    }
    return map;
  }, [visibleIcons, iconColorMap, colorMap]);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/893d1d5f-11d9-45f3-8322-ee9140d288ae.json')
      .then((res) => res.json())
      .then((json) => setData(Array.isArray(json) ? json : []))
      .catch(() => setData(null));
  }, []);

  const handleMouseEnter = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    const lng = feature?.longitude ?? feature?.lng ?? payload.lng;
    const lat = feature?.latitude ?? feature?.lat ?? payload.lat;
    const name = feature?.name ?? '';
    setTooltipInfo({ lng: Number(lng), lat: Number(lat), name: String(name) });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo(null);
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
        <AiMap map={{ basemap: 'gaode', center: [121.434765, 31.256735], zoom: 14.83, style: 'dark' }}>
          {data && (
            <IconLayer
              source={data}
              sourceType="json"
              sourceConfig={{ x: 'longitude', y: 'latitude' }}
              iconField="name"
              iconMap={makiPinMap}
              iconSize={16}
              iconAnchor="bottom"
              labelAnchor="top"
              labelOffset={[0, 0]}
              labelColor="#e6edf3"
              labelSize={12}
              labelHaloColor="#0d1117"
              labelHaloWidth={2}
              textAllowOverlap={false}
              iconAllowOverlap={true}
              zoomAdaption={true}
              zoomShowLabel={14}
              zoomDegradeToPoint={10}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          )}
          {tooltipInfo && (
            <Tooltip
              longitude={tooltipInfo.lng}
              latitude={tooltipInfo.lat}
              title={tooltipInfo.name}
              variant="light"
              visible
              placement="top"
              offset={12}
            />
          )}
          <ZoomControl />
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
                onClick={() => setActiveTab(tab)}
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