import React, { useEffect, useState, useMemo } from 'react';
import { AiMap, GlyphLayer, ZoomControl } from '../../index';

/**
 * 字体图标标注（GlyphLayer + Material Symbols Demo）
 *
 * 展示特性：
 * - 使用 Material Symbols Outlined 字体图标（Google Material Design 图标）
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

  // 将原始数据随机分配 Material Symbols 图标
  const mappedData = useMemo(() => {
    if (!data) return null;
    const iconNames = ['restaurant', 'hotel', 'school', 'local_cafe', 'park', 'museum', 'hospital', 'store', 'local_bar', 'fitness_center'];
    return data.map((item, index) => ({
      ...item,
      icon: iconNames[index % iconNames.length],
    }));
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap map={{ basemap: 'gaode', center: [121.434765, 31.256735], zoom: 14.83, style: 'dark' }}>
        {mappedData && (
          <GlyphLayer
            source={mappedData}
            sourceType="json"
            sourceConfig={{ x: 'longitude', y: 'latitude' }}
            iconFontFamily="material-symbols"
            iconField="icon"
            iconColor="#06b6d4"
            iconSize={20}
            iconHaloColor="#0d1117"
            iconHaloWidth={1}
            showLabel={true}
            labelField="name"
            labelColor="#e2e8f0"
            labelSize={11}
            labelAnchor="top"
            labelOffset={[0, -20]}
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
      </AiMap>
    </div>
  );
}