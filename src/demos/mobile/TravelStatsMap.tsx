import React, { useEffect, useState, useMemo } from 'react';
import { Aimap, FillLayer, ZoomControl } from '../../index';
import { Legend } from '../components/Legend';

/* ================================================================
   旅行足迹统计地图 — 移动端应用 Demo
   设计参考：小红书旅行足迹统计界面
   - 左侧：横向条形图展示各省旅行覆盖率
   - 右侧：色带图例（覆盖率 90%-100% 到 0%-9%）
   - 地图：中国各省分级统计图
   ================================================================ */

/** 行政区划数据项 */
interface AreaItem {
  name: string;
  level: 'country' | 'province' | 'city' | 'district';
  adcode: string | number;
  lng: number;
  lat: number;
  childrenNum: number;
  parent: string | number | null;
}

/** 覆盖率等级色阶 */
const COVERAGE_COLORS = [
  { min: 90, max: 100, color: '#0066CC', label: '90%-100%' },
  { min: 80, max: 89, color: '#0099CC', label: '80%-89%' },
  { min: 70, max: 79, color: '#00CCCC', label: '70%-79%' },
  { min: 60, max: 69, color: '#1ECC99', label: '60%-69%' },
  { min: 50, max: 59, color: '#1ECC1E', label: '50%-59%' },
  { min: 40, max: 49, color: '#CCCC00', label: '40%-49%' },
  { min: 30, max: 39, color: '#CC9930', label: '30%-39%' },
  { min: 20, max: 29, color: '#CC6600', label: '20%-29%' },
  { min: 10, max: 19, color: '#CC3300', label: '10%-19%' },
  { min: 0, max: 9, color: '#993333', label: '0%-9%' },
];

/** 根据覆盖率获取颜色 */
function getCoverageColor(value: number): string {
  const level = COVERAGE_COLORS.find((c) => value >= c.min && value <= c.max);
  return level?.color ?? '#CCCCCC';
}

/** 模拟覆盖率数据（实际应用中从用户足迹计算） */
function generateMockCoverage(): Record<string, number> {
  const provinces = [
    '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
    '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
    '浙江省', '安徽省', '福建省', '江西省', '山东省',
    '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
    '海南省', '重庆市', '四川省', '贵州省', '云南省',
    '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
    '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区',
  ];
  const coverage: Record<string, number> = {};
  provinces.forEach((name) => {
    // 随机生成覆盖率，热门省份概率更高
    const rand = Math.random();
    if (rand > 0.8) coverage[name] = Math.floor(Math.random() * 10) + 90;
    else if (rand > 0.6) coverage[name] = Math.floor(Math.random() * 10) + 80;
    else if (rand > 0.5) coverage[name] = Math.floor(Math.random() * 10) + 70;
    else if (rand > 0.4) coverage[name] = Math.floor(Math.random() * 10) + 60;
    else coverage[name] = Math.floor(Math.random() * 60);
  });
  return coverage;
}

export default function TravelStatsMap() {
  const [areaData, setAreaData] = useState<AreaItem[]>([]);
  const [coverage, setCoverage] = useState<Record<string, number>>({});
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  /** 加载行政区划数据 */
  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/alisis/geo-data-v0.1.1/administrative-data/area-list.json')
      .then((res) => res.json())
      .then((data: AreaItem[]) => {
        setAreaData(data);
        setCoverage(generateMockCoverage());
      })
      .catch(() => setAreaData([]));
  }, []);

  /** 提取省份列表 */
  const provinces = useMemo(() => {
    return areaData
      .filter((item) => item.level === 'province')
      .sort((a, b) => (coverage[b.name] ?? 0) - (coverage[a.name] ?? 0));
  }, [areaData, coverage]);

  /** 构建地图数据 */
  const mapData = useMemo(() => {
    return provinces.map((p) => ({
      name: p.name,
      adcode: p.adcode,
      value: coverage[p.name] ?? 0,
      lng: p.lng,
      lat: p.lat,
    }));
  }, [provinces, coverage]);

  /** 计算统计数据 */
  const stats = useMemo(() => {
    const values = Object.values(coverage);
    if (values.length === 0) return { visited: 0, total: 34, avg: 0 };
    const visited = values.filter((v) => v > 0).length;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { visited, total: 34, avg: Math.round(avg * 10) / 10 };
  }, [coverage]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* ── 地图区域 ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Aimap
          map={{
            basemap: 'gaode',
            center: [105, 36],
            zoom: 3.5,
            style: 'light',
          }}
        >
          {mapData.length > 0 && (
            <FillLayer
              source={{
                type: 'FeatureCollection',
                features: mapData.map((d) => ({
                  type: 'Feature',
                  properties: { name: d.name, value: d.value },
                  geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
                })),
              }}
              sourceType="geojson"
              color={{
                field: 'value',
                values: COVERAGE_COLORS.map((c) => ({ value: c.max, color: c.color })),
              }}
              stroke="#fff"
              strokeWidth={1}
              onClick={(payload) => {
                const name = payload.feature?.properties?.name as string;
                setSelectedProvince(name);
              }}
            />
          )}
          <ZoomControl position="bottomright" />
        </Aimap>
      </div>

      {/* ── 顶部统计卡片 ── */}
      <div style={{
        position: 'absolute', top: 48, left: 16, right: 16, zIndex: 50,
      }}>
        <div style={{
          padding: 16,
          background: 'rgba(250, 248, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#131b2e', fontFamily: "'Plus Jakarta Sans'" }}>
                旅行足迹统计
              </div>
              <div style={{ fontSize: 14, color: '#4a4455', marginTop: 4, fontFamily: 'Inter' }}>
                已探索 {stats.visited}/{stats.total} 个省份 · 平均覆盖率 {stats.avg}%
              </div>
            </div>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #0066CC, #0099CC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#fff' }}>explore</span>
            </div>
          </div>

          {/* 进度条 */}
          <div style={{
            marginTop: 12, height: 8, borderRadius: 4,
            background: 'rgba(195, 198, 215, 0.3)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 4,
              background: 'linear-gradient(90deg, #0066CC, #00CCCC)',
              width: `${(stats.visited / stats.total) * 100}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── 左侧省份排名列表 ── */}
      <div style={{
        position: 'absolute', top: 140, left: 16, bottom: 120, zIndex: 40,
        width: 200,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', overflowY: 'auto',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          <div style={{
            padding: 12,
            background: 'rgba(250, 248, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#4a4455',
              marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              省份覆盖率排名
            </div>

            {provinces.slice(0, 10).map((province, idx) => {
              const value = coverage[province.name] ?? 0;
              const isSelected = selectedProvince === province.name;
              return (
                <div
                  key={province.adcode}
                  onClick={() => setSelectedProvince(province.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 0',
                    borderBottom: idx < 9 ? '1px solid rgba(195, 198, 215, 0.2)' : 'none',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(0, 102, 204, 0.08)' : 'transparent',
                    margin: '0 -8px', paddingLeft: 8, paddingRight: 8,
                    borderRadius: isSelected ? 8 : 0,
                  }}
                >
                  {/* 排名 */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: idx < 3 ? getCoverageColor(value) : 'rgba(195, 198, 215, 0.3)',
                    color: idx < 3 ? '#fff' : '#4a4455',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {idx + 1}
                  </div>

                  {/* 省份名 */}
                  <div style={{ flex: 1, fontSize: 13, color: '#131b2e', fontWeight: 500 }}>
                    {province.name.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '')}
                  </div>

                  {/* 覆盖率 */}
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: getCoverageColor(value),
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {value}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 右下角图例 ── */}
      <div style={{ position: 'absolute', bottom: 100, right: 16, zIndex: 40 }}>
        <Legend
          type="ramp"
          title="覆盖率"
          colors={COVERAGE_COLORS.map((c) => c.color).reverse()}
          labels={['0%', '100%']}
        />
      </div>

      {/* ── 底部导航栏 ── */}
      <nav style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(250, 248, 255, 0.9)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.05)',
        borderRadius: '24px 24px 0 0',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '10px 24px 34px',
        }}>
          {[
            { key: 'map', label: '地图', icon: 'map', active: true },
            { key: 'list', label: '列表', icon: 'list', active: false },
            { key: 'stats', label: '统计', icon: 'bar_chart', active: false },
            { key: 'profile', label: '我的', icon: 'person', active: false },
          ].map((item) => (
            <button
              key={item.key}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, padding: '4px 16px', borderRadius: 16, border: 'none',
                background: item.active ? 'rgba(0, 102, 204, 0.12)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 22,
                  color: item.active ? '#0066CC' : '#7b7487',
                  fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: item.active ? '#0066CC' : '#7b7487' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
