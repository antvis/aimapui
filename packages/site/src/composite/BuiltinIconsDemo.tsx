import React, { useMemo, useState } from 'react';
import { MAKI_ICONS } from '@antv/aimapui';
import type { MakiIconName } from '@antv/aimapui';

/** Pin 形状 SVG 路径（32×40 viewBox） */
const PIN_PATH = 'M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 40 16 40C16 40 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z';

/**
 * 内置图标卡片展示 Demo
 * 纯图标浏览，无地图依赖
 */

const CATEGORIES: Record<string, { icons: string[]; color: string }> = {
  '交通出行': {
    color: '#2563eb',
    icons: ['airport', 'airfield', 'heliport', 'bus', 'rail', 'rail-light', 'rail-metro', 'ferry', 'bicycle', 'bicycle-share', 'car', 'car-rental', 'car-repair', 'scooter', 'parking', 'parking-garage', 'parking-paid', 'fuel', 'charging-station', 'highway-rest-area', 'toll', 'bridge', 'tunnel', 'barrier', 'roadblock', 'road-accident', 'aerialway'],
  },
  '餐饮服务': {
    color: '#ef4444',
    icons: ['cafe', 'restaurant', 'restaurant-bbq', 'restaurant-noodle', 'restaurant-pizza', 'restaurant-seafood', 'restaurant-sushi', 'bar', 'beer', 'alcohol-shop', 'ice-cream', 'bakery', 'confectionery', 'teahouse', 'bbq', 'fast-food', 'grocery'],
  },
  '住宿购物': {
    color: '#f59e0b',
    icons: ['lodging', 'campsite', 'shop', 'clothing-store', 'furniture', 'jewelry-store', 'shoe', 'gift', 'hardware', 'garden-centre', 'laundry', 'convenience', 'warehouse'],
  },
  '医疗健康': {
    color: '#ec4899',
    icons: ['hospital', 'pharmacy', 'doctor', 'dentist', 'veterinary', 'blood-bank', 'defibrillator', 'emergency-phone', 'fire-station', 'police', 'prison', 'shelter'],
  },
  '景点休闲': {
    color: '#10b981',
    icons: ['attraction', 'museum', 'art-gallery', 'cinema', 'theatre', 'music', 'karaoke', 'gaming', 'amusement-park', 'zoo', 'aquarium', 'stadium', 'observation-tower', 'golf', 'swimming', 'tennis', 'soccer', 'basketball', 'baseball', 'cricket', 'volleyball', 'skateboard', 'skiing', 'snowmobile', 'horse-riding', 'fitness-centre', 'playground', 'picnic-site', 'beach', 'hot-spring', 'mountain', 'volcano', 'waterfall', 'viewpoint', 'castle', 'monument', 'landmark', 'lighthouse', 'garden', 'park', 'farm', 'wetland', 'natural'],
  },
  '教育文化': {
    color: '#6366f1',
    icons: ['school', 'college', 'library', 'place-of-worship', 'religious-christian', 'religious-muslim', 'religious-buddhist', 'religious-jewish', 'religious-shinto'],
  },
  '城镇设施': {
    color: '#8b5cf6',
    icons: ['city', 'town', 'village', 'building', 'commercial', 'residential-community', 'town-hall', 'embassy', 'post', 'bank', 'communications-tower', 'mobile-phone', 'telephone', 'toilet', 'elevator', 'wheelchair', 'recycling', 'waste-basket', 'drinking-water', 'slipway', 'information', 'harbor', 'gate', 'lift-gate', 'fence', 'ranger-station', 'dog-park'],
  },
  '标记符号': {
    color: '#64748b',
    icons: ['marker', 'arrow', 'cross', 'circle', 'square', 'triangle', 'diamond', 'star', 'heart', 'caution', 'danger', 'globe', 'rocket', 'watch', 'suitcase'],
  },
};

const TAB_LIST = ['全部', ...Object.keys(CATEGORIES)] as const;
type TabName = typeof TAB_LIST[number];

export default function BuiltinIconsDemo() {
  const [activeTab, setActiveTab] = useState<TabName>('全部');
  const [filter, setFilter] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [iconSize, setIconSize] = useState(24);
  const [fillColor, setFillColor] = useState('#2563eb');

  const visibleIcons = useMemo(() => {
    let icons: string[];
    if (activeTab === '全部') {
      // 全部 tab：展示 MAKI_ICONS 中所有图标
      icons = Object.keys(MAKI_ICONS);
    } else {
      icons = CATEGORIES[activeTab]?.icons ?? [];
    }
    // 过滤掉不存在的图标
    const valid = icons.filter(name => MAKI_ICONS[name as MakiIconName]);
    // 搜索过滤
    if (filter) {
      return valid.filter(name => name.toLowerCase().includes(filter.toLowerCase()));
    }
    return valid;
  }, [activeTab, filter]);

  const getCategoryColor = (iconName: string): string => {
    for (const [, cat] of Object.entries(CATEGORIES)) {
      if (cat.icons.includes(iconName)) return cat.color;
    }
    return '#64748b';
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      {/* 顶部控制栏 */}
      <div style={{
        padding: '16px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>
          🎨 内置图标库
        </div>

        <div style={{ flex: 1 }} />

        {/* 搜索框 */}
        <input
          type="text"
          placeholder="搜索图标名称..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6,
            fontSize: 13, outline: 'none', width: 180, boxSizing: 'border-box',
          }}
        />

        {/* Pin 模式切换 */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={showPin} onChange={(e) => setShowPin(e.target.checked)} />
          Pin 背景
        </label>

        {/* 尺寸控制 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }}>
          <span>尺寸:</span>
          <select
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
          >
            <option value={16}>16px</option>
            <option value={24}>24px</option>
            <option value={32}>32px</option>
            <option value={48}>48px</option>
          </select>
        </div>

        {/* 颜色选择 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }}>
          <span>颜色:</span>
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            style={{ width: 28, height: 24, border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', padding: 0 }}
          />
        </div>
      </div>

      {/* Tab 栏 */}
      <div style={{
        padding: '8px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0,
      }}>
        {TAB_LIST.map(tab => {
          const isActive = activeTab === tab;
          const count = tab === '全部'
            ? Object.keys(MAKI_ICONS).length
            : CATEGORIES[tab]?.icons.filter(i => MAKI_ICONS[i as MakiIconName]).length ?? 0;
          const color = tab === '全部' ? '#6366f1' : CATEGORIES[tab]?.color ?? '#6366f1';
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                background: isActive ? color + '15' : 'transparent',
                color: isActive ? color : '#6b7280',
                borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {tab} <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* 图标网格 — 紧凑无边框，hover 浅蓝高亮 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {visibleIcons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 14 }}>
            没有找到匹配的图标
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: 4,
          }}>
            {visibleIcons.map(name => {
              const pathData = MAKI_ICONS[name as MakiIconName];

              return (
                <div
                  key={name}
                  title={`${name} · ${showPin ? 'Pin' : '纯色'} · ${iconSize}px`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '10px 4px', borderRadius: 8, cursor: 'default',
                    background: 'transparent', border: '1px solid transparent',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eff3ff';
                    e.currentTarget.style.borderColor = '#c7d2fe';
                    const label = e.currentTarget.querySelector<HTMLSpanElement>('[data-icon-label]');
                    if (label) label.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    const label = e.currentTarget.querySelector<HTMLSpanElement>('[data-icon-label]');
                    if (label) label.style.color = '#6b7280';
                  }}
                >
                  {showPin ? (
                    <svg viewBox="0 0 32 40" width={Math.round(iconSize * 1.25)} height={Math.round(iconSize * 1.25 * 1.25)}>
                      <path d={PIN_PATH} fill={fillColor} stroke="white" strokeWidth="1.5" />
                      {pathData && (
                        <svg x="8" y="8" viewBox="0 0 15 15" width="16" height="16">
                          <path fill="white" d={pathData} />
                        </svg>
                      )}
                    </svg>
                  ) : (
                    <svg viewBox="0 0 15 15" width={iconSize} height={iconSize}>
                      <path fill={fillColor} d={pathData} />
                    </svg>
                  )}
                  <span
                    data-icon-label
                    style={{
                      fontSize: 11, color: '#6b7280',
                      maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      textAlign: 'center', lineHeight: 1.2,
                      transition: 'color 0.15s',
                    }}
                  >
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
