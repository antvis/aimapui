import React, { useState, useCallback } from 'react';
import { Aimap, PointLayer, HeatmapLayer, ZoomControl, ScaleControl } from '../../index';
import type { MapEventPayload, LayerEventPayload } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
const cities = [
  { lng: 116.4, lat: 39.9, name: '北京', value: 100 },
  { lng: 121.5, lat: 31.2, name: '上海', value: 90 },
  { lng: 113.3, lat: 23.1, name: '广州', value: 80 },
  { lng: 114.1, lat: 22.5, name: '深圳', value: 85 },
  { lng: 104.1, lat: 30.6, name: '成都', value: 70 },
  { lng: 106.6, lat: 29.6, name: '重庆', value: 75 },
];

const heatData = Array.from({ length: 100 }, () => ({
  lng: 116.0 + Math.random() * 0.8,
  lat: 39.6 + Math.random() * 0.6,
  value: Math.random() * 100,
}));

/**
 * 地图事件 — onMapMove / onMapZoom + 数据驱动切换
 */
export default function Demo15MapEvents() {
  const [mapInfo, setMapInfo] = useState({ center: [108, 32] as [number, number], zoom: 4 });
  const [useHeatmap, setUseHeatmap] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleMapMove = useCallback((payload: MapEventPayload) => {
    setMapInfo({ center: payload.center, zoom: payload.zoom });
  }, []);

  const handleMapZoom = useCallback((payload: MapEventPayload) => {
    setMapInfo((prev) => ({ ...prev, zoom: payload.zoom }));
  }, []);

  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; items: Array<{ label: string; value: string | number }> }>({
    visible: false, lng: 0, lat: 0, items: [],
  });

  const handleLayerClick = useCallback((_: LayerEventPayload) => {
    setClickCount((c) => c + 1);
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setTooltipInfo({ visible: true, lng: payload.lng, lat: payload.lat, items: [
      { label: '城市', value: String(payload.feature.name ?? '') },
      { label: '数值', value: Number(payload.feature.value ?? 0) },
    ]});
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{ basemap: 'gaode', center: [108, 32], zoom: 4, style: useHeatmap ? 'dark' : 'light' }}
        onMapMove={handleMapMove}
        onMapZoom={handleMapZoom}
      >
        {useHeatmap ? (
          <HeatmapLayer source={heatData} sizeField="value" onClick={handleLayerClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
        ) : (
          <PointLayer
            source={cities}
            colorField="value"
            colorValues={['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A']}
            size={16}
            active={{ color: '#fff' }}
            onClick={handleLayerClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        )}
        {tooltipInfo.visible && (
          <Tooltip
            longitude={tooltipInfo.lng}
            latitude={tooltipInfo.lat}
            variant="dark"
            visible={true}
            items={tooltipInfo.items}
          />
        )}
        <ZoomControl />
        <ScaleControl />
      </Aimap>

      {/* 控制面板 + 地图状态 */}
      </div>
  );
}