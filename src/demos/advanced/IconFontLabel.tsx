import React, { useEffect, useState, useMemo } from 'react';
import { Aimap, IconFontLayer, ZoomControl } from '../../index';

/**
 * 字体图标标注（IconFontLayer 设计规范 Demo）
 *
 * 展示特性：
 * - 内置 Google Material Symbols 字体图标
 * - 字体图标 + 文字标签组合
 * - 缩放适配：L1(14+) 全显示 → L2(10-13) 仅图标 → L3(<10) 4px 圆点
 * - 碰撞检测：图标始终可见，仅文本被避让
 * - 1px 光晕增强底图辨识度
 */
export default function DemoIconFontLabel() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/893d1d5f-11d9-45f3-8322-ee9140d288ae.json')
      .then((res) => res.json())
      .then((json) => setData(Array.isArray(json) ? json : []))
      .catch(() => setData(null));
  }, []);

  // 将原始数据中的 name 字段映射为内置 iconfont 图标名
  const mappedData = useMemo(() => {
    if (!data) return null;
    const iconMapping: Record<string, string> = {
      '00': 'smallRain',
      '01': 'middleRain',
      '02': 'hugeRain',
    };
    return data.map((item) => ({
      ...item,
      icon: iconMapping[item.name as string] ?? 'sun',
    }));
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [121.434765, 31.256735], zoom: 14.83, style: 'dark' }}>
        {mappedData && (
          <IconFontLayer
            source={mappedData}
            sourceType="json"
            sourceConfig={{ x: 'longitude', y: 'latitude' }}
            iconField="icon"
            iconColor="#06b6d4"
            iconSize={20}
            iconHaloColor="#0d1117"
            iconHaloWidth={1}
            showLabel={true}
            labelField="name"
            labelColor="#e2e8f0"
            labelSize={11}
            labelAnchor="bottom"
            labelHaloColor="#0d1117"
            labelHaloWidth={2}
            textAllowOverlap={false}
            iconAllowOverlap={true}
            zoomAdaption={true}
            zoomShowLabel={14}
            zoomDegradeToPoint={10}
          />
        )}
        <ZoomControl />
      </Aimap>
    </div>
  );
}
