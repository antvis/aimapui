import React, { useEffect, useState } from 'react';
import { AiMap, BubbleLayer, ZoomControl, Popup } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';
import { Legend } from '../components/Legend';

/**
 * 气泡图 — 气泡 + 文字标签同时展示
 */
export default function Demo20BubbleText() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [selectedBubble, setSelectedBubble] = useState<{
    lng: number;
    lat: number;
    name: string;
    value: number;
  } | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/rmsportal/opYqFyDGyGUAUXkLUhBV.json')
      .then((res) => res.json())
      .then((json) => {
        if (!json || !Array.isArray(json.features)) {
          setData(json);
          return;
        }

        const enriched = {
          ...json,
          features: json.features.map((feature: Record<string, unknown>, idx: number) => {
            const props = (feature.properties as Record<string, unknown> | undefined) ?? {};
            const base = typeof props.Id === 'number' ? props.Id : idx;
            return {
              ...feature,
              properties: {
                ...props,
                value: (base % 5) + 1,
              },
            };
          }),
        };

        setData(enriched);
      })
      .catch(() => setData(null));
  }, []);

  const handleBubbleClick = (payload: LayerEventPayload) => {
    const { feature, lng, lat } = payload;
    if (!feature) return;

    const props = feature.properties as Record<string, unknown>;
    setSelectedBubble({
      lng,
      lat,
      name: (props?.name as string) ?? '未知',
      value: (props?.value as number) ?? 0,
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap map={{ basemap: 'gaode', center: [60.268, 30.3628], zoom: 1.8, style: 'light' }}>
        {data && (
          <BubbleLayer
            source={data}
            sourceType="geojson"
            labelField="name"
            color="#2f7cf6"
            sizeField="value"
            sizeValues={[10, 18, 28, 40, 54]}
            bubbleAnchor="center"
            labelAnchor="center"
            labelTrigger="always"
            labelOffset={[0, -8]}
            tooltipEffect={false}
            onClick={handleBubbleClick}
          />
        )}
        <ZoomControl />
        
        {selectedBubble && (
          <Popup
            longitude={selectedBubble.lng}
            latitude={selectedBubble.lat}
            content={`
              <div style="min-width: 200px;">
                <div style="font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">
                  ${selectedBubble.name}
                </div>
                <div style="padding-top: 8px; border-top: 1px solid rgba(195,198,215,0.3);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="color: #666; font-size: 12px;">数值</span>
                    <span style="font-weight: 600; color: #2f7cf6;">${selectedBubble.value}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #666; font-size: 12px;">坐标</span>
                    <span style="font-size: 11px; color: #999;">
                      ${selectedBubble.lng.toFixed(2)}, ${selectedBubble.lat.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            `}
            size="compact"
            closeButton
            onClose={() => setSelectedBubble(null)}
          />
        )}
      </AiMap>

      {/* 图例 — 气泡大小映射 */}
      <div style={{ position: 'absolute', bottom: 32, left: 16, zIndex: 10 }}>
        <Legend
          type="size"
          title="人口规模"
          color="#2f7cf6"
          items={[
            { size: 6, label: '1' },
            { size: 12, label: '2' },
            { size: 18, label: '3' },
            { size: 24, label: '4' },
            { size: 30, label: '5' },
          ]}
        />
      </div>
    </div>
  );
}