'use client'
import { useState } from 'react'
import {
  Aimap,
  PointLayer,
  ZoomControl,
  ScaleControl,
  Tooltip,
  LegendCategories,
  ThemeProvider,
} from '@antv/aimapkit'
import type { LayerEventPayload } from '@antv/aimapkit'


const DEMO_DATA = [
  { name: '北京', lng: 116.407, lat: 39.904, category: '一线', value: 2154 },
  { name: '上海', lng: 121.473, lat: 31.230, category: '一线', value: 2487 },
  { name: '广州', lng: 113.264, lat: 23.129, category: '一线', value: 1867 },
  { name: '深圳', lng: 114.057, lat: 22.543, category: '一线', value: 1756 },
  { name: '杭州', lng: 120.153, lat: 30.287, category: '新一线', value: 1203 },
  { name: '成都', lng: 104.065, lat: 30.659, category: '新一线', value: 1633 },
  { name: '武汉', lng: 114.298, lat: 30.584, category: '新一线', value: 1121 },
  { name: '南京', lng: 118.796, lat: 32.059, category: '新一线', value: 931 },
  { name: '重庆', lng: 106.551, lat: 29.563, category: '二线', value: 1581 },
  { name: '西安', lng: 108.939, lat: 34.341, category: '二线', value: 953 },
  { name: '长沙', lng: 112.938, lat: 28.228, category: '二线', value: 839 },
  { name: '郑州', lng: 113.625, lat: 34.746, category: '二线', value: 987 },
  { name: '昆明', lng: 102.832, lat: 24.880, category: '三线', value: 685 },
  { name: '厦门', lng: 118.089, lat: 24.479, category: '三线', value: 516 },
  { name: '哈尔滨', lng: 126.534, lat: 45.803, category: '三线', value: 955 },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
const CATEGORIES = ['一线', '新一线', '二线', '三线']

export default function MapDemo() {
  const [tooltipInfo, setTooltipInfo] = useState<{
    lng: number
    lat: number
    data: Record<string, any>
  } | null>(null)

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 380 }}>
      <ThemeProvider theme="dark">
        <Aimap
          map={{
            basemap: 'gaode',
            style: 'dark',
            center: [113.5, 34.5],
            zoom: 4,
            logoVisible: false,
          }}
          style={{ width: '100%', height: '100%', minHeight: 380 }}
          onLayerMouseMove={(payload: LayerEventPayload) => {
            if (payload.feature) {
              setTooltipInfo({
                lng: payload.lngLat.lng,
                lat: payload.lngLat.lat,
                data: payload.feature,
              })
            }
          }}
          onLayerMouseLeave={() => setTooltipInfo(null)}
        >
          <PointLayer
            source={DEMO_DATA}
            sourceType="json"
            longitudeField="lng"
            latitudeField="lat"
            colorField="category"
            colorValues={COLORS}
            sizeField="value"
            sizeValues={[6, 28]}
            style={{
              opacity: 0.85,
              strokeWidth: 1,
              stroke: '#fff',
              strokeOpacity: 0.3,
            }}
          />
          <ZoomControl position="topright" />
          <ScaleControl position="bottomright" />
          <LegendCategories
            title="城市级别"
            labels={CATEGORIES}
            colors={COLORS}
            position="bottom-left"
          />
          {tooltipInfo && (
            <Tooltip
              longitude={tooltipInfo.lng}
              latitude={tooltipInfo.lat}
              variant="dark"
              title={tooltipInfo.data.name}
              items={[
                { label: '级别', value: tooltipInfo.data.category },
                { label: '人口', value: `${tooltipInfo.data.value} 万` },
              ]}
            />
          )}
        </Aimap>
      </ThemeProvider>
    </div>
  )
}
