import React from 'react';
import { Aimap, MarkerClusterLayer } from '../../index';
/**
 * 聚合标注 — MarkerClusterLayer 组件
 *
 * 演示大规模地理数据的聚合可视化效果：
 * - 小规模聚合 (2-99): 32px，实心内圈 + 半透明外圈
 * - 中规模聚合 (100-999): 40px，半透明容器 + 白色边框
 * - 大规模聚合 (1000+): 48px，渐变 + 脉冲光晕
 * - 交互：悬停放大、点击缩放、最大级别蜘蛛布局展开
 */
export default function Demo33MarkerCluster() {
  // 生成模拟数据：北京市区范围内的随机点位
  const points = React.useMemo(() => {
    const data: Array<{ lng: number; lat: number; name: string; type: string }> = [];
    const centerLng = 116.397;
    const centerLat = 39.909;

    // 核心区域高密度点（模拟商圈/写字楼）
    for (let i = 0; i < 800; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.06;
      data.push({
        lng: centerLng + Math.cos(angle) * radius,
        lat: centerLat + Math.sin(angle) * radius,
        name: `核心站点 ${i + 1}`,
        type: '核心',
      });
    }

    // 外围区域中密度点（模拟社区/门店）
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.06 + Math.random() * 0.1;
      data.push({
        lng: centerLng + Math.cos(angle) * radius,
        lat: centerLat + Math.sin(angle) * radius,
        name: `外围站点 ${i + 1}`,
        type: '外围',
      });
    }

    // 边缘区域低密度点（模拟郊区）
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.16 + Math.random() * 0.14;
      data.push({
        lng: centerLng + Math.cos(angle) * radius,
        lat: centerLat + Math.sin(angle) * radius,
        name: `边缘站点 ${i + 1}`,
        type: '边缘',
      });
    }

    return data;
  }, []);

  const geojson = React.useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: points.map((p, i) => ({
        type: 'Feature' as const,
        properties: { id: String(i), name: p.name, type: p.type },
        geometry: {
          type: 'Point' as const,
          coordinates: [p.lng, p.lat],
        },
      })),
    }),
    [points],
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 11,
          style: 'light',
        }}
      >
        <MarkerClusterLayer
          source={geojson}
          sourceType="geojson"
          gridSize={60}
          minClusterSize={2}
          animationDuration={300}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          onPointClick={(point: any) => {
            // eslint-disable-next-line no-console
            console.log('点击点位:', point.properties?.name);
          }}
          onClusterClick={(cluster: any) => {
            // eslint-disable-next-line no-console
            console.log('点击聚合点:', cluster.points.length, '个要素');
          }}
        />
      </Aimap>
{/* 图例说明 */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 100,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 8,
          padding: '12px 16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          fontSize: 12,
          lineHeight: 1.8,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>聚合图例</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              background: 'radial-gradient(circle, #2563eb 60%, rgba(37,99,235,0.20) 61%)',
              border: '1px solid rgba(255,255,255,0.55)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            12
          </span>
          <span style={{ color: '#666' }}>小规模 (2-99)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: 'rgba(37,99,235,0.30)',
              border: '2px solid rgba(255,255,255,0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            256
          </span>
          <span style={{ color: '#666' }}>中规模 (100-999)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: 9999,
              background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
              border: '2px solid rgba(255,255,255,0.55)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              position: 'relative',
            }}
          >
            1.2k
          </span>
          <span style={{ color: '#666' }}>大规模 (1000+)</span>
        </div>
      </div>
    </div>
  );
}
