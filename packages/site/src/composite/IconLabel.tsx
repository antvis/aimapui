import React, { useCallback, useEffect, useState } from 'react';
import { AiMap, IconLayer, ZoomControl, Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

/**
 * 图片标注图（IconLayer 设计规范 Demo）
 *
 * 展示特性：
 * - 图标 + 文字标签组合（图片在上，文字在下）
 * - 缩放适配：Zoom15+ 全显示 → 10-14 仅图标 → <10 降级圆点
 * - 碰撞检测：重叠时隐藏低优先级文本
 * - 2px 白色光晕确保深色底图可读性
 * - Tooltip 悬停展示详情
 */
export default function Demo21IconLabel() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ lng: number; lat: number; name: string } | null>(null);

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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap map={{ basemap: 'gaode', center: [121.434765, 31.256735], zoom: 14.83, style: 'dark' }}>
        {data && (
          <IconLayer
            source={data}
            sourceType="json"
            sourceConfig={{ x: 'longitude', y: 'latitude' }}
            iconField="name"
            iconMap={{
              '00': 'https://gw.alipayobjects.com/zos/basement_prod/604b5e7f-309e-40db-b95b-4fac746c5153.svg',
              '01': 'https://gw.alipayobjects.com/zos/basement_prod/30580bc9-506f-4438-8c1a-744e082054ec.svg',
              '02': 'https://gw.alipayobjects.com/zos/basement_prod/7aa1f460-9f9f-499f-afdf-13424aa26bbf.svg',
            }}
            iconSize={12}
            iconAnchor="bottom"
            labelAnchor="top"
            labelOffset={[0, -10]}
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
    </div>
  );
}