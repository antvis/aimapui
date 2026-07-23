import React, { useState } from 'react';
import {
  LayerCompare,
  SatelliteLayer,
  BubbleLayer,
  type LayerCompareMode,
} from '@antv/aimapui';

/**
 * 北京热门地点数据（经纬度 + 分类 + 热度）
 */
const pois = [
  { lng: 116.404, lat: 39.915, name: '故宫', category: '景点', value: 95 },
  { lng: 116.397, lat: 39.917, name: '天安门', category: '景点', value: 90 },
  { lng: 116.39, lat: 39.905, name: '前门', category: '景点', value: 70 },
  { lng: 116.413, lat: 39.905, name: '王府井', category: '商圈', value: 88 },
  { lng: 116.353, lat: 39.907, name: '西单', category: '商圈', value: 80 },
  { lng: 116.437, lat: 39.903, name: '国贸', category: '商圈', value: 92 },
  { lng: 116.385, lat: 39.93, name: '鸟巢', category: '景点', value: 75 },
  { lng: 116.393, lat: 39.925, name: '钟鼓楼', category: '景点', value: 60 },
  { lng: 116.326, lat: 39.896, name: '北京西站', category: '交通', value: 65 },
  { lng: 116.432, lat: 39.896, name: '北京南站', category: '交通', value: 68 },
  { lng: 116.366, lat: 39.94, name: '中关村', category: '商圈', value: 85 },
  { lng: 116.332, lat: 39.908, name: '玉渊潭', category: '景点', value: 55 },
  { lng: 116.417, lat: 39.888, name: '天坛', category: '景点', value: 78 },
];

/**
 * LayerCompare Demo
 *
 * 演示图层对比组件的两种模式：
 * - 双屏（split）：左侧卫星影像 vs 右侧分类气泡图，拖动分隔条调整两侧比例
 * - 卷帘（swipe）：卫星影像与分类气泡图叠放，拖动卷帘条揭示/遮挡
 *
 * 两侧地图相机（平移/缩放/旋转）自动同步。
 */
export default function LayerCompareDemo() {
  const [mode, setMode] = useState<LayerCompareMode>('split');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <LayerCompare
        mode={mode}
        onModeChange={setMode}
        map={{
          basemap: 'gaode',
          center: [116.4, 39.91],
          zoom: 12,
          style: 'light',
          gestureConfig: { dragPan: true, pinchZoom: true, dragRotate: true },
        }}
        beforeLabel="卫星影像"
        afterLabel="分类气泡"
        defaultPosition={50}
        before={<SatelliteLayer provider="gaode" opacity={1} />}
        after={
          <BubbleLayer
            source={pois}
            sourceType="json"
            sourceConfig={{ x: 'lng', y: 'lat' }}
            colorField="category"
            colorValues={['#ef4444', '#f59e0b', '#3b82f6']}
            sizeField="value"
            sizeRange={[8, 26]}
            labelField="name"
            labelColor="#1f2937"
            labelSize={12}
            style={{ stroke: '#fff', strokeWidth: 2, opacity: 0.85 }}
          />
        }
      />
    </div>
  );
}
