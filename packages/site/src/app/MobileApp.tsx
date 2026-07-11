import { useCallback, useEffect, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, RouteLayer, Popup } from '@antv/aimapui';

/* ================================================================
   杭州 3 日游旅游攻略 — Google Maps Mobile 设计规范
   Design Tokens: Primary #1A73E8, Surface #FFF
   ================================================================ */

// ── Google Maps Design Tokens ───────────────────────────────────
const T = {
  primary: '#1A73E8', secondary: '#0B57D0',
  highlightBg: '#D3E3FD', highlightBgAlt: '#E8F0FE',
  surface: '#FFFFFF',
  textPrimary: '#1C1B1F', textSecondary: '#5E5E5E',
  textTertiary: '#707070', textQuaternary: '#867F7F',
  borderLight: '#F3F2F2', borderMedium: '#D9D9D9',
  shadowLight: '0px 1px 2px rgba(0,0,0,0.25)',
  shadowMedium: '0px 4px 4px rgba(0,0,0,0.25)',
  shadowHeavy: '0px 4px 12px rgba(0,0,0,0.25)',
  tabInactive: '#7F7F7F',
};

// ── Data ────────────────────────────────────────────────────────
interface Spot {
  id: string; name: string; lng: number; lat: number; icon: string;
  duration: string; tips: string; image: string;
}
interface DayRoute {
  day: number; title: string; theme: string; color: string; spots: Spot[];
}

const TRAVEL_ROUTES: DayRoute[] = [
  { day: 1, title: '西湖经典环游', theme: '湖光山色 · 文化之旅', color: '#2563eb', spots: [
    { id: 'd1-1', name: '断桥残雪', lng: 120.155, lat: 30.261, icon: 'landscape', duration: '40min', tips: '清晨人少，推荐日出前到达', image: 'https://gw.alipayobjects.com/zos/rmsportal/NeUTMwKtPcPxIFNTWZOZ.png' },
    { id: 'd1-2', name: '白堤', lng: 120.152, lat: 30.257, icon: 'directions_walk', duration: '30min', tips: '沿白堤漫步至孤山，两侧桃柳交替', image: 'https://gw.alipayobjects.com/zos/rmsportal/cjHbStmRxBSLsOiZWJql.png' },
    { id: 'd1-3', name: '苏堤春晓', lng: 120.14, lat: 30.245, icon: 'nature', duration: '1h', tips: '骑行通过六桥，感受西湖全景', image: 'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png' },
    { id: 'd1-4', name: '雷峰塔', lng: 120.149, lat: 30.232, icon: 'temple_buddhist', duration: '1.5h', tips: '登塔俯瞰西湖，黄昏时分最佳', image: 'https://gw.alipayobjects.com/zos/rmsportal/IhosLpSUSQEHbuMxCbvr.png' },
    { id: 'd1-5', name: '河坊街', lng: 120.17, lat: 30.245, icon: 'restaurant', duration: '2h', tips: '晚餐推荐知味观，叫化鸡必点', image: 'https://gw.alipayobjects.com/zos/rmsportal/mqaQJPlMSJALyixnfogy.png' },
  ]},
  { day: 2, title: '灵隐禅意之旅', theme: '山林古刹 · 茶韵悠然', color: '#10b981', spots: [
    { id: 'd2-1', name: '灵隐寺', lng: 120.1, lat: 30.24, icon: 'temple_buddhist', duration: '2h', tips: '上午去人少，飞来峰石窟值得细看', image: 'https://gw.alipayobjects.com/zos/rmsportal/psUFoAMjkCcjqtUCNPSB.png' },
    { id: 'd2-2', name: '北高峰', lng: 120.095, lat: 30.248, icon: 'hiking', duration: '1.5h', tips: '灵隐后山登顶，可选缆车', image: 'https://gw.alipayobjects.com/zos/rmsportal/RmczdrAcbEOqLmHinhKB.png' },
    { id: 'd2-3', name: '龙井村', lng: 120.115, lat: 30.225, icon: 'local_cafe', duration: '2h', tips: '品正宗西湖龙井，春季可体验采茶', image: 'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.png' },
    { id: 'd2-4', name: '九溪烟树', lng: 120.115, lat: 30.205, icon: 'forest', duration: '1.5h', tips: '溪水潺潺，适合徒步纳凉', image: 'https://gw.alipayobjects.com/zos/rmsportal/ZBfODzMWLaEHkFEfJQmp.png' },
    { id: 'd2-5', name: '宋城', lng: 120.115, lat: 30.18, icon: 'theater_comedy', duration: '3h', tips: '《宋城千古情》演出 17:30 场最佳', image: 'https://gw.alipayobjects.com/zos/rmsportal/bFJWCjZnNxMdcDCvAtmC.png' },
  ]},
  { day: 3, title: '运河与现代杭州', theme: '古运河 · 科技城 · 美食', color: '#f59e0b', spots: [
    { id: 'd3-1', name: '京杭大运河', lng: 120.13, lat: 30.32, icon: 'directions_boat', duration: '1.5h', tips: '水上巴士体验运河风光，从武林门出发', image: 'https://gw.alipayobjects.com/zos/rmsportal/komGVRUxIAMorSZflTvl.png' },
    { id: 'd3-2', name: '拱宸桥', lng: 120.12, lat: 30.325, icon: 'museum', duration: '1h', tips: '参观运河博物馆，了解漕运历史', image: 'https://gw.alipayobjects.com/zos/rmsportal/zlYzVCeQrTXRqpHXSfUr.png' },
    { id: 'd3-3', name: '西溪湿地', lng: 120.06, lat: 30.27, icon: 'park', duration: '3h', tips: '电瓶船深入湿地，看白鹭翩飞', image: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png' },
    { id: 'd3-4', name: '天目里', lng: 120.08, lat: 30.285, icon: 'shopping_bag', duration: '2h', tips: '隈研吾设计的文艺综合体，茑屋书店打卡', image: 'https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlhEQIn.png' },
    { id: 'd3-5', name: '武林夜市', lng: 120.165, lat: 30.275, icon: 'nightlife', duration: '2h', tips: '杭帮菜小吃一条街，片儿川必吃', image: 'https://gw.alipayobjects.com/zos/rmsportal/PvjLTFaqIVHCOacTfknB.png' },
  ]},
];

function spotsToPath(spots: Spot[]): [number, number][] {
  return spots.map(s => [s.lng, s.lat]);
}
function spotsToStops(spots: Spot[]) {
  return spots.map(s => ({ id: s.id, lng: s.lng, lat: s.lat, name: s.name, icon: s.icon }));
}

const CARD_COLLAPSED_H = 104;
const CARD_EXPANDED_H = 458;

// ── Custom Zoom Buttons (Google Maps style) ─────────────────────
function ZoomButtons({ scene }: { scene: Scene | null }) {
  const [zoom, setZoom] = useState(12);
  useEffect(() => {
    if (!scene) return;
    const onZoom = () => setZoom(scene.getZoom());
    scene.on('zoomend', onZoom);
    return () => { scene.off('zoomend', onZoom); };
  }, [scene]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', background: T.surface, boxShadow: T.shadowLight }}>
      <button onClick={() => { scene?.setZoom(Math.min(18, scene.getZoom() + 1)); }}
        style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.textSecondary }}>add</span>
      </button>
      <div style={{ height: 1, background: T.borderLight }} />
      <button onClick={() => { scene?.setZoom(Math.max(3, scene.getZoom() - 1)); }}
        style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.textSecondary }}>remove</span>
      </button>
    </div>
  );
}

// ── Bottom Card per Google Maps spec ────────────────────────────
function BottomCard({
  routes, activeDay, selectedSpot, onDayChange, onSpotSelect,
}: {
  routes: DayRoute[]; activeDay: number; selectedSpot: Spot | null;
  onDayChange: (d: number) => void; onSpotSelect: (s: Spot) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const route = routes[activeDay];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2501,
      height: expanded ? CARD_EXPANDED_H : CARD_COLLAPSED_H,
      background: T.surface, boxShadow: '-2px 0px 11px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', padding: 12, gap: 12,
      transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
    }}>
      {/* Handle */}
      <div onMouseDown={() => setExpanded(!expanded)} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ width: 73, height: 4, borderRadius: 12, background: '#C5C6CD' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12, background: T.highlightBgAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.primary }}>route</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: T.textPrimary }}>Day{route.day} · {route.title}</div>
          <div style={{ fontSize: 12, color: T.textTertiary }}>{route.theme} · {route.spots.length} 个景点</div>
        </div>
      </div>

      {/* Day tabs — Google Maps pill style */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
        {routes.map((r, i) => {
          const isActive = i === activeDay;
          return (
            <button key={r.day} onClick={() => onDayChange(i)}
              style={{
                flexShrink: 0, height: 30, borderRadius: 24, border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 11px 5px 7px', fontSize: 11, fontWeight: 500,
                fontFamily: 'Roboto, system-ui, sans-serif',
                background: isActive ? T.textPrimary : T.surface,
                color: isActive ? T.surface : T.textSecondary,
                boxShadow: isActive ? undefined : T.shadowLight,
                transition: 'all 0.15s',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>looks_one</span>
              Day{r.day}
            </button>
          );
        })}
      </div>

      {/* Spot timeline list */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {route.spots.map((spot, i) => {
          const isSel = selectedSpot?.id === spot.id;
          const isLast = i === route.spots.length - 1;
          return (
            <div key={spot.id} style={{ display: 'flex', gap: 12 }}>
              {/* Timeline: number + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isSel ? route.color : T.highlightBgAlt,
                  color: isSel ? '#fff' : route.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s',
                }}>{i + 1}</div>
                {!isLast && <div style={{ width: 2, flex: 1, minHeight: 12, background: T.borderLight, borderRadius: 1 }} />}
              </div>
              {/* Card */}
              <div onClick={() => onSpotSelect(spot)}
                style={{
                  flex: 1, display: 'flex', gap: 10, padding: 12,
                  borderRadius: 12, cursor: 'pointer', marginBottom: 8,
                  background: isSel ? T.highlightBgAlt : T.surface,
                  border: isSel ? `1.5px solid ${route.color}` : `1px solid ${T.borderLight}`,
                  transition: 'all 0.15s',
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                  border: `1px solid ${T.borderLight}`,
                }}>
                  <img src={spot.image} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>{spot.name}</span>
                    <span style={{ fontSize: 11, color: route.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
                      {spot.duration}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {spot.tips}
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.borderMedium, flexShrink: 0 }}>chevron_right</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────
export default function MobileApp() {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const route = TRAVEL_ROUTES[activeDay];

  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    const spots = TRAVEL_ROUTES[0].spots;
    setTimeout(() => {
      const lngs = spots.map(s => s.lng), lats = spots.map(s => s.lat);
      const pad = 0.05;
      scene.fitBounds(
        [[Math.min(...lngs) - pad, Math.min(...lats) - pad], [Math.max(...lngs) + pad, Math.max(...lats) + pad]],
        { padding: [80, 40, CARD_COLLAPSED_H + 20, 40] },
      );
    }, 400);
  }, []);

  const handleDayChange = useCallback((dayIndex: number) => {
    setActiveDay(dayIndex);
    setSelectedSpot(null);
    const spots = TRAVEL_ROUTES[dayIndex].spots;
    const scene = sceneRef.current;
    if (!scene) return;
    const lngs = spots.map(s => s.lng), lats = spots.map(s => s.lat);
    const pad = 0.05;
    scene.fitBounds(
      [[Math.min(...lngs) - pad, Math.min(...lats) - pad], [Math.max(...lngs) + pad, Math.max(...lats) + pad]],
      { padding: [80, 40, CARD_COLLAPSED_H + 20, 40], animate: true },
    );
  }, []);

  const handleSpotClick = useCallback((spot: Spot) => {
    setSelectedSpot(prev => prev?.id === spot.id ? null : spot);
    const scene = sceneRef.current;
    if (!scene) return;
    scene.setZoomAndCenter(14, [spot.lng, spot.lat]);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: 'Roboto, system-ui, sans-serif', background: '#E8EAED' }}>
      {/* Map */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AiMap autoFit={false} map={{ basemap: 'gaode', center: [120.13, 30.25], zoom: 12, style: 'light' }} onSceneReady={handleSceneReady}>
          <RouteLayer
            key={route.day}
            path={spotsToPath(route.spots)}
            stops={spotsToStops(route.spots)}
            onStopClick={(p) => {
    const stopId = typeof p.feature?.id === 'string' ? p.feature.id : undefined;
    const spot = route.spots.find(s => s.id === stopId);
    if (spot) handleSpotClick(spot);
  }}
            color={route.color}
            lineWidth={3}
            glow
            stopSize={10}
            stopRenderer="icon"
            stopIconSize={24}
            stopColor={route.color}
            showStopIndex={false}
          />
        </AiMap>
      </div>

      {/* Right FAB column */}
      <div style={{ position: 'absolute', right: 10, bottom: CARD_COLLAPSED_H + 12, zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <ZoomButtons scene={sceneRef.current} />
        <button onClick={() => { if (!selectedSpot) return; sceneRef.current?.setZoomAndCenter(14, [selectedSpot.lng, selectedSpot.lat]); }}
          style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', background: T.surface, boxShadow: T.shadowLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.textSecondary }}>my_location</span>
        </button>
      </div>

      {/* Bottom Card */}
      <BottomCard routes={TRAVEL_ROUTES} activeDay={activeDay} selectedSpot={selectedSpot} onDayChange={handleDayChange} onSpotSelect={handleSpotClick} />

      {/* Popup on selected spot */}
      {selectedSpot && (
        <Popup
          longitude={selectedSpot.lng} latitude={selectedSpot.lat}
          size="standard" singleton closeButton visible
          onClose={() => setSelectedSpot(null)}
          header={{ title: selectedSpot.name, statusLabel: selectedSpot.duration, statusColor: route.color }}
          attributes={[
            { label: '路线', value: `Day${route.day} · ${route.title}` },
            { label: '贴士', value: selectedSpot.tips },
          ]}
          actions={[
            { variant: 'primary' as const, label: '导航到这里', onClick: () => {} },
            { variant: 'secondary' as const, label: '查看详情', onClick: () => {} },
          ]}
        />
      )}
    </div>
  );
}