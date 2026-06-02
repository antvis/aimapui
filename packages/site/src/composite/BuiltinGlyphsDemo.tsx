import React, { useMemo, useState, useEffect, useRef } from 'react';

/**
 * 内置字体图标库展示 Demo
 *
 * 展示 GlyphLayer 内置的 Material Symbols Outlined 图标
 */

/** Material Symbols Outlined 图标列表（按分类） */
const MATERIAL_SYMBOLS_CATEGORIES: Record<string, { color: string; icons: string[] }> = {
  '天气': {
    color: '#0ea5e9',
    icons: ['sunny', 'cloud', 'cloudy', 'partly_cloudy_day', 'partly_cloudy_night', 'rainy', 'rainy_heavy', 'rainy_light', 'rainy_snow', 'thunderstorm', 'foggy', 'air', 'water_drop', 'ac_unit', 'filter_drama', 'cloudy_snowing', 'snowing', 'snowflake', 'severe_cold', 'umbrella', 'storm', 'tornado', 'thermostat', 'heat', 'hot'],
  },
  '交通出行': {
    color: '#2563eb',
    icons: ['flight', 'flight_takeoff', 'flight_land', 'train', 'directions_transit', 'directions_railway', 'directions_bus', 'directions_car', 'directions_boat', 'directions_bike', 'directions_walk', 'directions_run', 'taxi', 'local_taxi', 'local_airport', 'connecting_airports', 'two_wheeler', 'tram', 'subway', 'ferry', 'cable_car', 'ev_station', 'local_gas_station'],
  },
  '地点定位': {
    color: '#ef4444',
    icons: ['location_on', 'place', 'room', 'pin', 'pin_drop', 'near_me', 'my_location', 'gps_fixed', 'navigation', 'explore', 'map'],
  },
  '城市生活': {
    color: '#f59e0b',
    icons: ['restaurant', 'local_cafe', 'coffee', 'local_bar', 'hotel', 'local_hospital', 'local_pharmacy', 'local_atm', 'local_police', 'local_fire_department', 'local_post_office', 'local_library', 'local_mall', 'local_grocery_store', 'store', 'school', 'church', 'mosque', 'synagogue', 'temple_buddhist', 'temple_hindu', 'museum', 'castle', 'stadium', 'theater_comedy', 'pool', 'fitness_center', 'spa', 'park', 'forest'],
  },
  '活动运动': {
    color: '#10b981',
    icons: ['attractions', 'celebration', 'festival', 'nightlife', 'sports', 'sports_soccer', 'sports_basketball', 'sports_football', 'sports_tennis', 'sports_golf'],
  },
  '地图功能': {
    color: '#8b5cf6',
    icons: ['layers', 'layers_clear', 'terrain', 'landscape', 'share', 'favorite', 'star', 'home', 'work', 'person', 'people', 'trip', 'warning', 'emergency', 'photo_camera', 'shopping_bag'],
  },
  '通用': {
    color: '#64748b',
    icons: ['search', 'settings', 'info', 'help', 'close', 'check', 'add', 'remove', 'edit', 'delete', 'refresh', 'download', 'upload', 'visibility', 'visibility_off'],
  },
};

const MATERIAL_SYMBOLS_LINK = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0';

const MS_TAB_LIST = ['全部', ...Object.keys(MATERIAL_SYMBOLS_CATEGORIES)] as const;
type MsTabName = typeof MS_TAB_LIST[number];

export default function BuiltinGlyphsDemo() {
  const [msCategory, setMsCategory] = useState<MsTabName>('全部');
  const [filter, setFilter] = useState('');
  const [iconSize, setIconSize] = useState(24);
  const [fillColor, setFillColor] = useState('#2563eb');
  const fontLoadedRef = useRef(false);

  // 动态加载 Material Symbols 字体
  useEffect(() => {
    if (!fontLoadedRef.current && !document.querySelector(`link[href*="Material+Symbols"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MATERIAL_SYMBOLS_LINK;
      document.head.appendChild(link);
      fontLoadedRef.current = true;
    }
  }, []);

  // Material Symbols 可见图标列表
  const visibleMsIcons = useMemo(() => {
    let icons: string[];
    if (msCategory === '全部') {
      icons = Object.values(MATERIAL_SYMBOLS_CATEGORIES).flatMap(c => c.icons);
    } else {
      icons = MATERIAL_SYMBOLS_CATEGORIES[msCategory]?.icons ?? [];
    }
    if (filter) {
      return icons.filter(name => name.toLowerCase().includes(filter.toLowerCase()));
    }
    return icons;
  }, [msCategory, filter]);

  const getMsCategoryColor = (iconName: string): string => {
    for (const [, cat] of Object.entries(MATERIAL_SYMBOLS_CATEGORIES)) {
      if (cat.icons.includes(iconName)) return cat.color;
    }
    return '#64748b';
  };

  const totalMsCount = useMemo(
    () => Object.values(MATERIAL_SYMBOLS_CATEGORIES).reduce((sum, c) => sum + c.icons.length, 0),
    [],
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      {/* 顶部控制栏 */}
      <div style={{
        padding: '16px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>
          🔤 内置字体图标库
        </div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          {totalMsCount} 个 Material Symbols 图标
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

        {/* 尺寸控制 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }}>
          <span>尺寸:</span>
          <select
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
          >
            <option value={16}>16px</option>
            <option value={20}>20px</option>
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

      {/* Material Symbols 分类 Tab */}
      <div style={{
        padding: '8px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0,
      }}>
        {MS_TAB_LIST.map(tab => {
          const isActive = msCategory === tab;
          const count = tab === '全部'
            ? totalMsCount
            : MATERIAL_SYMBOLS_CATEGORIES[tab]?.icons.length ?? 0;
          const color = tab === '全部'
            ? '#6366f1'
            : MATERIAL_SYMBOLS_CATEGORIES[tab]?.color ?? '#6366f1';
          return (
            <button
              key={tab}
              onClick={() => setMsCategory(tab)}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
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

      {/* 图标网格 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {visibleMsIcons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 14 }}>
            没有找到匹配的图标
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 8,
          }}>
            {visibleMsIcons.map(name => {
              const categoryColor = getMsCategoryColor(name);
              return (
                <div
                  key={name}
                  title={`Material Symbols: ${name}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '12px 4px', borderRadius: 8, cursor: 'default',
                    background: '#fff', border: '1px solid #e5e7eb',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = categoryColor;
                    e.currentTarget.style.boxShadow = `0 2px 8px ${categoryColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontFamily: 'Material Symbols Outlined',
                      fontSize: iconSize,
                      color: fillColor,
                      lineHeight: 1,
                      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                    }}
                  >
                    {name}
                  </span>
                  <span style={{
                    fontSize: 10, color: '#6b7280', marginTop: 8,
                    maxWidth: 92, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textAlign: 'center', lineHeight: 1.2,
                  }}>
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
