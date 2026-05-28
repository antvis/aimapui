import React, { useCallback, useState } from 'react';
import { AiMap, ZoomControl, ChinaDistrict } from '@antv/aimapui';
import type { AdministrativeLevel, DrillPathNode, BusinessDataItem } from '@antv/aimapui';

/**
 * 2025 年中国各省 GDP 数据（单位：亿元）
 * 数据来源：国家统计局 / 各省统计局 2026 年 1 月发布
 */
const GDP_2025: BusinessDataItem[] = [
  { name: '广东省', value: 145847 },
  { name: '江苏省', value: 142351 },
  { name: '山东省', value: 103197 },
  { name: '浙江省', value: 94545 },
  { name: '四川省', value: 67665 },
  { name: '河南省', value: 66633 },
  { name: '湖北省', value: 62661 },
  { name: '福建省', value: 60199 },
  { name: '上海市', value: 56709 },
  { name: '湖南省', value: 55309 },
  { name: '安徽省', value: 50718 },
  { name: '河北省', value: 44672 },
  { name: '北京市', value: 46760 },
  { name: '陕西省', value: 34110 },
  { name: '江西省', value: 33567 },
  { name: '重庆市', value: 32990 },
  { name: '辽宁省', value: 31742 },
  { name: '云南省', value: 30485 },
  { name: '广西壮族自治区', value: 27903 },
  { name: '山西省', value: 25642 },
  { name: '内蒙古自治区', value: 25267 },
  { name: '贵州省', value: 21901 },
  { name: '新疆维吾尔自治区', value: 20619 },
  { name: '天津市', value: 17789 },
  { name: '黑龙江省', value: 16286 },
  { name: '吉林省', value: 14062 },
  { name: '甘肃省', value: 12580 },
  { name: '海南省', value: 8109 },
  { name: '宁夏回族自治区', value: 5696 },
  { name: '青海省', value: 3951 },
  { name: '西藏自治区', value: 2765 },
];

/**
 * 中国各省 2025 GDP 分布图
 *
 * 基于 ChinaDistrict 组件，展示全国省级 GDP 色阶分布，
 * 支持省/市/县下钻与锁定模式切换。
 */
export default function AdministrativeMap() {
  const [drillEnabled, setDrillEnabled] = useState(true);
  const [drillPath, setDrillPath] = useState<DrillPathNode[]>([
    { level: 'province', name: '中国' },
  ]);
  const [level, setLevel] = useState<AdministrativeLevel>('province');
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null);

  const currentLevel = drillEnabled ? inferLevel(drillPath) : level;

  const handleDrill = useCallback((path: DrillPathNode[]) => {
    setDrillPath(path);
    setSelectedInfo(null);
  }, []);

  const handleDrillUp = useCallback((targetIndex: number) => {
    setDrillPath((prev) => prev.slice(0, targetIndex + 1));
    setSelectedInfo(null);
  }, []);

  const handleRegionClick = useCallback((feature: Record<string, unknown>, featureLevel: AdministrativeLevel) => {
    const name = feature.name as string ?? '未知';
    const value = feature.value as number;
    setSelectedInfo(`${name}${value !== undefined ? ` | GDP: ${value} 亿` : ''}`);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 控制面板 */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderRadius: 10, padding: '12px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12,
      }}>
        {/* 模式切换 */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 6, padding: 3 }}>
          <button
            onClick={() => setDrillEnabled(false)}
            style={{
              padding: '5px 12px', border: 'none', borderRadius: 4, cursor: 'pointer',
              fontSize: 11, fontWeight: 600, transition: 'all 0.2s',
              background: !drillEnabled ? '#2563eb' : 'transparent',
              color: !drillEnabled ? '#fff' : '#475569',
            }}
          >
            🔒 锁定模式
          </button>
          <button
            onClick={() => setDrillEnabled(true)}
            style={{
              padding: '5px 12px', border: 'none', borderRadius: 4, cursor: 'pointer',
              fontSize: 11, fontWeight: 600, transition: 'all 0.2s',
              background: drillEnabled ? '#2563eb' : 'transparent',
              color: drillEnabled ? '#fff' : '#475569',
            }}
          >
            🔍 深度模式
          </button>
        </div>

        {/* 非下钻模式层级选择 */}
        {!drillEnabled && (
          <div style={{ display: 'flex', gap: 4 }}>
            {(['province', 'city', 'district'] as AdministrativeLevel[]).map((lv) => (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                style={{
                  padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 4,
                  cursor: 'pointer', fontSize: 11, transition: 'all 0.2s',
                  background: level === lv ? '#eef2ff' : '#fff',
                  color: level === lv ? '#2563eb' : '#64748b',
                  borderColor: level === lv ? '#2563eb' : '#e2e8f0',
                }}
              >
                {lv === 'province' ? '省' : lv === 'city' ? '市' : '县'}
              </button>
            ))}
          </div>
        )}

        {/* 面包屑导航（下钻模式） */}
        {drillEnabled && drillPath.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            {drillPath.map((node, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span style={{ color: '#94a3b8', fontSize: 10 }}>›</span>}
                <span
                  onClick={() => handleDrillUp(index)}
                  style={{
                    cursor: 'pointer', color: index === drillPath.length - 1 ? '#2563eb' : '#64748b',
                    fontWeight: index === drillPath.length - 1 ? 600 : 400,
                    fontSize: 11,
                  }}
                >
                  {node.name}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 选中信息 */}
        {selectedInfo && (
          <div style={{ padding: '6px 10px', background: '#f0fdf4', borderRadius: 4, color: '#166534', fontSize: 11, fontWeight: 500 }}>
            {selectedInfo}
          </div>
        )}

        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          当前层级: <strong style={{ color: '#475569' }}>{currentLevel === 'province' ? '省' : currentLevel === 'city' ? '市' : '县'}</strong>
          {drillEnabled && ' | 点击区域下钻'}
        </div>
      </div>

      <AiMap
        map={{
          basemap: 'gaode',
          center: [104.5, 36.5],
          zoom: 3.8,
          style: 'light',
        }}
      >
        <ChinaDistrict
          level={level}
          drillEnabled={drillEnabled}
          drillPath={drillPath}
          onDrill={handleDrill}
          data={GDP_2025}
          joinField="name"
          dataJoinField="name"
          valueField="value"
          showLabel={true}
          labelField="name"
          showTooltip={true}
          onRegionClick={handleRegionClick}
        />
        <ZoomControl position="bottomright" />
      </AiMap>
    </div>
  );
}

function inferLevel(path: DrillPathNode[]): AdministrativeLevel {
  if (path.length <= 1) return 'province';
  if (path.length === 2) return 'city';
  return 'district';
}
