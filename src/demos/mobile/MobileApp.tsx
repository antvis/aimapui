import React, { useState, useCallback, useMemo } from 'react';
import { Aimap } from '../../components/Aimap';
import { ZoomControl } from '../../components/Control/ZoomControl';
import { Marker } from '../../components/Interaction/Marker';
import { LineLayer } from '../../components/Layer/LineLayer';
import { BottomSheet } from '../../components/Mobile/BottomSheet';
import type { BottomSheetSnap } from '../../components/Mobile/BottomSheet';

/* ================================================================
   杭州 3 日游旅游攻略 — 多日路线数据
   ================================================================ */

interface Spot {
  id: string;
  name: string;
  lng: number;
  lat: number;
  icon: string;
  duration: string;
  tips: string;
  image: string;
}

interface DayRoute {
  day: number;
  title: string;
  theme: string;
  color: string;
  spots: Spot[];
}

const TRAVEL_ROUTES: DayRoute[] = [
  {
    day: 1,
    title: '西湖经典环游',
    theme: '湖光山色 · 文化之旅',
    color: '#2563eb',
    spots: [
      { id: 'd1-1', name: '断桥残雪', lng: 120.155, lat: 30.261, icon: 'landscape', duration: '40min', tips: '清晨人少，推荐日出前到达', image: 'https://gw.alipayobjects.com/zos/rmsportal/NeUTMwKtPcPxIFNTWZOZ.png' },
      { id: 'd1-2', name: '白堤', lng: 120.152, lat: 30.257, icon: 'directions_walk', duration: '30min', tips: '沿白堤漫步至孤山，两侧桃柳交替', image: 'https://gw.alipayobjects.com/zos/rmsportal/cjHbStmRxBSLsOiZWJql.png' },
      { id: 'd1-3', name: '苏堤春晓', lng: 120.14, lat: 30.245, icon: 'nature', duration: '1h', tips: '骑行通过六桥，感受西湖全景', image: 'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png' },
      { id: 'd1-4', name: '雷峰塔', lng: 120.149, lat: 30.232, icon: 'temple_buddhist', duration: '1.5h', tips: '登塔俯瞰西湖，黄昏时分最佳', image: 'https://gw.alipayobjects.com/zos/rmsportal/IhosLpSUSQEHbuMxCbvr.png' },
      { id: 'd1-5', name: '河坊街', lng: 120.17, lat: 30.245, icon: 'restaurant', duration: '2h', tips: '晚餐推荐知味观，叫化鸡必点', image: 'https://gw.alipayobjects.com/zos/rmsportal/mqaQJPlMSJALyixnfogy.png' },
    ],
  },
  {
    day: 2,
    title: '灵隐禅意之旅',
    theme: '山林古刹 · 茶韵悠然',
    color: '#10b981',
    spots: [
      { id: 'd2-1', name: '灵隐寺', lng: 120.1, lat: 30.24, icon: 'temple_buddhist', duration: '2h', tips: '上午去人少，飞来峰石窟值得细看', image: 'https://gw.alipayobjects.com/zos/rmsportal/psUFoAMjkCcjqtUCNPSB.png' },
      { id: 'd2-2', name: '北高峰', lng: 120.095, lat: 30.248, icon: 'hiking', duration: '1.5h', tips: '灵隐后山登顶，可选缆车', image: 'https://gw.alipayobjects.com/zos/rmsportal/RmczdrAcbEOqLmHinhKB.png' },
      { id: 'd2-3', name: '龙井村', lng: 120.115, lat: 30.225, icon: 'local_cafe', duration: '2h', tips: '品正宗西湖龙井，春季可体验采茶', image: 'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.png' },
      { id: 'd2-4', name: '九溪烟树', lng: 120.115, lat: 30.205, icon: 'forest', duration: '1.5h', tips: '溪水潺潺，适合徒步纳凉', image: 'https://gw.alipayobjects.com/zos/rmsportal/ZBfODzMWLaEHkFEfJQmp.png' },
      { id: 'd2-5', name: '宋城', lng: 120.115, lat: 30.18, icon: 'theater_comedy', duration: '3h', tips: '《宋城千古情》演出 17:30 场最佳', image: 'https://gw.alipayobjects.com/zos/rmsportal/bFJWCjZnNxMdcDCvAtmC.png' },
    ],
  },
  {
    day: 3,
    title: '运河与现代杭州',
    theme: '古运河 · 科技城 · 美食',
    color: '#f59e0b',
    spots: [
      { id: 'd3-1', name: '京杭大运河', lng: 120.13, lat: 30.32, icon: 'directions_boat', duration: '1.5h', tips: '水上巴士体验运河风光，从武林门出发', image: 'https://gw.alipayobjects.com/zos/rmsportal/komGVRUxIAMorSZflTvl.png' },
      { id: 'd3-2', name: '拱宸桥', lng: 120.12, lat: 30.325, icon: 'museum', duration: '1h', tips: '参观运河博物馆，了解漕运历史', image: 'https://gw.alipayobjects.com/zos/rmsportal/zlYzVCeQrTXRqpHXSfUr.png' },
      { id: 'd3-3', name: '西溪湿地', lng: 120.06, lat: 30.27, icon: 'park', duration: '3h', tips: '电瓶船深入湿地，看白鹭翩飞', image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png' },
      { id: 'd3-4', name: '天目里', lng: 120.08, lat: 30.285, icon: 'shopping_bag', duration: '2h', tips: '隈研吾设计的文艺综合体，茑屋书店打卡', image: 'https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlhEQIn.png' },
      { id: 'd3-5', name: '武林夜市', lng: 120.165, lat: 30.275, icon: 'nightlife', duration: '2h', tips: '杭帮菜小吃一条街，片儿川必吃', image: 'https://gw.alipayobjects.com/zos/rmsportal/PvjLTFaqIVHCOacTfknB.png' },
    ],
  },
];

/** 将景点数组转换为路线 GeoJSON */
function spotsToLineGeoJSON(spots: Spot[]) {
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: spots.map((spot) => [spot.lng, spot.lat]),
        },
      },
    ],
  };
}

/**
 * 旅游攻略地图 Demo（移动端）
 *
 * - 顶部：行程标题 + 多日标签切换
 * - 地图：展示当日路线（LineLayer）+ 景点标注（Marker）
 * - 底部：BottomSheet 抽屉展示景点卡片列表
 */
export default function MobileApp() {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [bottomSheetSnap, setBottomSheetSnap] = useState<BottomSheetSnap>('collapsed');

  const currentRoute = TRAVEL_ROUTES[activeDay];

  /** 当日路线的 GeoJSON */
  const lineGeoJSON = useMemo(() => spotsToLineGeoJSON(currentRoute.spots), [currentRoute]);

  /** 地图中心自适应当日路线 */
  const mapCenter = useMemo(() => {
    const spots = currentRoute.spots;
    const avgLng = spots.reduce((sum, spot) => sum + spot.lng, 0) / spots.length;
    const avgLat = spots.reduce((sum, spot) => sum + spot.lat, 0) / spots.length;
    return [avgLng, avgLat] as [number, number];
  }, [currentRoute]);

  const handleSpotClick = useCallback((spot: Spot) => {
    setSelectedSpot(spot);
  }, []);

  const handleDayChange = useCallback((dayIndex: number) => {
    setActiveDay(dayIndex);
    setSelectedSpot(null);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* 全屏地图 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Aimap
          map={{
            basemap: 'gaode',
            center: [120.13, 30.25],
            zoom: 12,
            style: 'light',
          }}
        >
          <ZoomControl position="bottomright" />

          {/* 当日路线 */}
          <LineLayer
            source={lineGeoJSON}
            sourceType="geojson"
            color={currentRoute.color}
            size={4}
            style={{ lineType: 'dash', dashArray: [6, 4], opacity: 0.85 }}
          />

          {/* 景点标记 */}
          {currentRoute.spots.map((spot) => (
            <Marker
              key={spot.id}
              longitude={spot.lng}
              latitude={spot.lat}
              variant="icon"
              icon={spot.icon}
              color={selectedSpot?.id === spot.id ? 'warning' : 'primary'}
              label={spot.name}
              onClick={() => handleSpotClick(spot)}
            />
          ))}
        </Aimap>
      </div>

      {/* UI 覆盖层 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        {/* 顶部：行程标题 + 日期切换 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 10,
            padding: '12px 16px',
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        >
          {/* 标题栏 */}
          <div
            className="glass-panel"
            style={{
              padding: '12px 16px',
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              pointerEvents: 'auto',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 22 }}>
                travel_explore
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-on-surface)' }}>
                杭州 3 日游攻略
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginLeft: 'auto' }}>
                {TRAVEL_ROUTES.reduce((sum, route) => sum + route.spots.length, 0)} 个景点
              </span>
            </div>
          </div>

          {/* 日期切换标签 */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              pointerEvents: 'auto',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {TRAVEL_ROUTES.map((route, index) => {
              const isActive = index === activeDay;
              return (
                <button
                  key={route.day}
                  onClick={() => handleDayChange(index)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: isActive ? `2px solid ${route.color}` : '1px solid rgba(195, 198, 215, 0.4)',
                    background: isActive ? route.color : 'rgba(248, 249, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: isActive ? '#fff' : 'var(--color-on-surface)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `0 2px 12px ${route.color}40` : '0 1px 4px rgba(0,0,0,0.06)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 11, opacity: 0.9 }}>Day{route.day}</span>
                  {route.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* 选中景点的浮动卡片 */}
        {selectedSpot && (
          <div
            style={{
              position: 'absolute',
              bottom: 100,
              left: 16,
              right: 16,
              zIndex: 20,
              pointerEvents: 'auto',
            }}
          >
            <div
              className="glass-panel"
              style={{
                padding: 16,
                borderRadius: 20,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: `1px solid ${currentRoute.color}30`,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* 景点图片 */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: `2px solid ${currentRoute.color}30`,
                  }}
                >
                  <img
                    src={selectedSpot.image}
                    alt={selectedSpot.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
                      {selectedSpot.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: `${currentRoute.color}20`,
                        color: currentRoute.color,
                        fontWeight: 600,
                      }}
                    >
                      {selectedSpot.duration}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    💡 {selectedSpot.tips}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSpot(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 999,
                    color: 'var(--color-on-surface-variant)',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 底部抽屉：路线详情 */}
        <BottomSheet
          defaultSnap="collapsed"
          collapsedHeight={96}
          halfRatio={0.5}
          expandedRatio={0.85}
          onSnapChange={setBottomSheetSnap}
        >
          {/* 抽屉标题 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
                Day{currentRoute.day} · {currentRoute.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', margin: '4px 0 0' }}>
                {currentRoute.theme} · {currentRoute.spots.length} 个景点
              </p>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: `${currentRoute.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: currentRoute.color, fontSize: 20 }}>
                route
              </span>
            </div>
          </div>

          {/* 景点时间轴列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingBottom: 32, marginTop: 12 }}>
            {currentRoute.spots.map((spot, index) => {
              const isSelected = selectedSpot?.id === spot.id;
              const isLast = index === currentRoute.spots.length - 1;

              return (
                <div key={spot.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  {/* 时间轴线 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                    {/* 序号圆点 */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isSelected ? currentRoute.color : `${currentRoute.color}20`,
                        color: isSelected ? '#fff' : currentRoute.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                        transition: 'all 0.2s',
                      }}
                    >
                      {index + 1}
                    </div>
                    {/* 连接线 */}
                    {!isLast && (
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 16,
                          background: `${currentRoute.color}30`,
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </div>

                  {/* 景点卡片 */}
                  <div
                    onClick={() => handleSpotClick(spot)}
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 16,
                      border: isSelected ? `2px solid ${currentRoute.color}` : '1px solid rgba(195, 198, 215, 0.25)',
                      background: isSelected ? `${currentRoute.color}08` : 'rgba(248, 249, 255, 0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: `2px solid ${isSelected ? currentRoute.color : 'rgba(195, 198, 215, 0.3)'}`,
                        }}
                      >
                        <img
                          src={spot.image}
                          alt={spot.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-on-surface)', margin: 0 }}>
                            {spot.name}
                          </h4>
                          <span
                            style={{
                              fontSize: 11,
                              color: currentRoute.color,
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                            {spot.duration}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: 'var(--color-on-surface-variant)',
                            margin: '4px 0 0',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {spot.tips}
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined"
                        style={{ color: 'var(--color-on-surface-variant)', fontSize: 18, flexShrink: 0 }}
                      >
                        chevron_right
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </BottomSheet>
      </div>
    </div>
  );
}
