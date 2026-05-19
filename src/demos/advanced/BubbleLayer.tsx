import React, { useEffect, useMemo, useState } from 'react';
import { Aimap, BubbleLayer, ZoomControl, Popup } from '../../index';
import type { LayerEventPayload } from '../../index';

type LabelPosition =
  | 'center'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

/**
 * 气泡图（气泡 + 文字）
 */
export default function Demo20BubbleText() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [labelPosition, setLabelPosition] = useState<LabelPosition>('top');
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

        // 构造演示用 value 字段，展示气泡大小映射
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

  const anchorConfig = useMemo(() => {
    const configs: Record<LabelPosition, { bubbleAnchor: any; labelAnchor: any; labelOffset?: [number, number] }> = {
      center: { bubbleAnchor: 'center', labelAnchor: 'center', labelOffset: [0, 0] },
      top: { bubbleAnchor: 'top', labelAnchor: 'bottom' },
      right: { bubbleAnchor: 'right', labelAnchor: 'left' },
      bottom: { bubbleAnchor: 'bottom', labelAnchor: 'top' },
      left: { bubbleAnchor: 'left', labelAnchor: 'right' },
      'top-right': { bubbleAnchor: 'top-right', labelAnchor: 'bottom-left' },
      'top-left': { bubbleAnchor: 'top-left', labelAnchor: 'bottom-right' },
      'bottom-right': { bubbleAnchor: 'bottom-right', labelAnchor: 'top-left' },
      'bottom-left': { bubbleAnchor: 'bottom-left', labelAnchor: 'top-right' },
    };
    return configs[labelPosition];
  }, [labelPosition]);

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

  const options: Array<{ label: string; value: LabelPosition }> = [
    { label: '中间', value: 'center' },
    { label: '上方', value: 'top' },
    { label: '右侧', value: 'right' },
    { label: '下方', value: 'bottom' },
    { label: '左侧', value: 'left' },
    { label: '右上', value: 'top-right' },
    { label: '左上', value: 'top-left' },
    { label: '右下', value: 'bottom-right' },
    { label: '左下', value: 'bottom-left' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [60.268, 30.3628], zoom: 1.8, style: 'light' }}>
        {data && (
          <BubbleLayer
            source={data}
            sourceType="geojson"
            labelField="name"
            color="#2f7cf6"
            sizeField="value"
            sizeValues={[8, 16, 32, 48, 64]}
            bubbleAnchor={anchorConfig.bubbleAnchor}
            labelAnchor={anchorConfig.labelAnchor}
            labelOffset={anchorConfig.labelOffset}
            onClick={handleBubbleClick}
          />
        )}
        <ZoomControl />
        
        {/* Popup 展示气泡数据 */}
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
      </Aimap>

      </div>
  );
}