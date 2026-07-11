import React from 'react';
import { AiMap, ZoomControl } from '@antv/aimapui';
import { RouteLayer } from '@antv/aimapui';
import { LegendCategories } from '@antv/aimapui';

/**
 * 杭州三日游路径地图
 *
 * Day 1: 西湖环线（文化经典）
 * Day 2: 灵隐-西溪（山水禅意）
 * Day 3: 钱塘江-滨江（都市活力）
 */

// Day 1 路径：西湖环线
const day1Path: [number, number][] = [
  [120.1488, 30.2590], // 断桥
  [120.1450, 30.2550], // 白堤
  [120.1410, 30.2510], // 平湖秋月
  [120.1380, 30.2460], // 曲院风荷
  [120.1400, 30.2400], // 苏堤
  [120.1450, 30.2350], // 花港观鱼
  [120.1510, 30.2330], // 雷峰塔
  [120.1560, 30.2380], // 柳浪闻莺
  [120.1550, 30.2440], // 湖滨
];

// Day 2 路径：灵隐-西溪
const day2Path: [number, number][] = [
  [120.0990, 30.2400], // 灵隐寺
  [120.1050, 30.2450], // 飞来峰
  [120.1000, 30.2550], // 北高峰
  [120.0850, 30.2650], // 西溪湿地东
  [120.0700, 30.2700], // 西溪湿地核心
  [120.0600, 30.2680], // 西溪湿地西
];

// Day 3 路径：钱塘江-滨江
const day3Path: [number, number][] = [
  [120.1600, 30.2300], // 钱塘江大桥
  [120.1700, 30.2250], // 六和塔
  [120.1850, 30.2200], // 钱江新城
  [120.2000, 30.2220], // 城市阳台
  [120.2100, 30.2180], // 滨江星光大道
  [120.2200, 30.2150], // 奥体中心
];

// 途经点
const day1Stops = [
  { lng: 120.1488, lat: 30.2590, name: '断桥残雪' },
  { lng: 120.1410, lat: 30.2510, name: '平湖秋月' },
  { lng: 120.1380, lat: 30.2460, name: '曲院风荷' },
  { lng: 120.1450, lat: 30.2350, name: '花港观鱼' },
  { lng: 120.1510, lat: 30.2330, name: '雷峰塔' },
  { lng: 120.1550, lat: 30.2440, name: '湖滨步行街' },
];

const day2Stops = [
  { lng: 120.0990, lat: 30.2400, name: '灵隐寺', markerVariant: 'pin' as const, markerColor: 'success' as const },
  { lng: 120.1050, lat: 30.2450, name: '飞来峰', markerVariant: 'circle' as const, markerColor: 'warning' as const },
  { lng: 120.1000, lat: 30.2550, name: '北高峰', markerVariant: 'dot' as const, markerColor: 'primary' as const },
  { lng: 120.0700, lat: 30.2700, name: '西溪湿地', markerVariant: 'pin' as const, markerColor: 'error' as const },
];

const day3Stops = [
  { lng: 120.1700, lat: 30.2250, name: '六和塔', icon: 'religious-buddhist' },
  { lng: 120.1850, lat: 30.2200, name: '钱江新城', icon: 'town-hall' },
  { lng: 120.2000, lat: 30.2220, name: '城市阳台', icon: 'viewpoint' },
  { lng: 120.2200, lat: 30.2150, name: '奥体中心', icon: 'stadium' },
];

const DAY_COLORS = {
  day1: '#2563eb',
  day2: '#10b981',
  day3: '#f59e0b',
};

export default function RouteLayerDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [120.13, 30.25],
          zoom: 12.5,
          pitch: 0,
          style: 'light',
        }}
      >
        {/* Day 1 — 西湖环线 */}
        <RouteLayer
          path={day1Path}
          stops={day1Stops}
          color={DAY_COLORS.day1}
          lineWidth={2}
          glow
          animate
          stopSize={8}
          stopRenderer="point"
        />

        {/* Day 2 — 灵隐-西溪 */}
        <RouteLayer
          path={day2Path}
          stops={day2Stops}
          color={DAY_COLORS.day2}
          lineWidth={2}
          glow
          stopSize={8}
          endColor={DAY_COLORS.day2}
          stopRenderer="marker"
          stopMarkerVariant="circle"
        />

        {/* Day 3 — 钱塘江-滨江 */}
        <RouteLayer
          path={day3Path}
          stops={day3Stops}
          color={DAY_COLORS.day3}
          lineWidth={2}
          glow
          stopSize={8}
          endColor={DAY_COLORS.day3}
          stopRenderer="icon"
          stopIconSize={14}
        />

        <ZoomControl position="bottomright" />

        <LegendCategories
          type="categories"
          title="杭州三日游"
          labels={['Day 1 · Point 编号站点', 'Day 2 · Marker 停留点', 'Day 3 · Icon 停留点']}
          colors={[DAY_COLORS.day1, DAY_COLORS.day2, DAY_COLORS.day3]}
        />
      </AiMap>
    </div>
  );
}
