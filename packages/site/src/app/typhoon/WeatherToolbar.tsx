/* ================================================================
   气象图层工具条
   图层切换按钮组 + 时段/透明度/时间面板
   ================================================================ */

import { C } from './constants';

interface WeatherToolbarProps {
  weatherLayer: 'none' | 'cloud' | 'radar' | 'rain' | 'satellite' | 'wind';
  weatherOpacity: number;
  cloudType: 0.5 | 1 | 3 | 6;
  rainHours: 24 | 48 | 72;
  cloudTime?: string;
  radarTime?: string;
  rainTime?: string;
  isMobile: boolean;
  onSetWeatherLayer: (v: 'none' | 'cloud' | 'radar' | 'rain' | 'satellite' | 'wind') => void;
  onSetWeatherOpacity: (v: number) => void;
  onSetCloudType: (v: 0.5 | 1 | 3 | 6) => void;
  onSetRainHours: (v: 24 | 48 | 72) => void;
  onSetSatellite: (v: boolean) => void;
}

export default function WeatherToolbar({
  weatherLayer, weatherOpacity, cloudType, rainHours,
  cloudTime, radarTime, rainTime,
  isMobile,
  onSetWeatherLayer, onSetWeatherOpacity, onSetCloudType, onSetRainHours, onSetSatellite,
}: WeatherToolbarProps) {
  const wl = weatherLayer;
  const showTime = (wl === 'cloud' && cloudTime) || (wl === 'radar' && radarTime) || (wl === 'rain' && rainTime);
  const timeStr = wl === 'cloud' ? cloudTime : wl === 'radar' ? radarTime : wl === 'rain' ? rainTime : undefined;

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      {/* 图层切换按钮组 */}
      <div style={{
        padding: isMobile ? '6px 10px' : '8px 14px', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start',
      }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {([
            { k: 'none', label: '无', icon: 'block' },
            { k: 'cloud', label: '云图', icon: 'cloud' },
            { k: 'radar', label: '雷达', icon: 'radar' },
            { k: 'rain', label: '降雨', icon: 'rainy' },
            { k: 'wind', label: '风场', icon: 'air' },
            { k: 'satellite', label: '卫星', icon: 'satellite_alt' },
          ] as { k: typeof weatherLayer; label: string; icon: string }[]).map(o => {
            const sel = weatherLayer === o.k;
            return (
              <button key={o.k} onClick={() => {
                onSetWeatherLayer(o.k as typeof weatherLayer);
                if (o.k === 'satellite') onSetSatellite(true);
                else if (o.k !== 'none') onSetSatellite(false);
              }} title={o.label} style={{
                padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3,
                transition: 'all 0.15s',
                background: sel ? 'rgba(34,211,238,0.18)' : 'transparent',
                color: sel ? C.accent : 'rgba(148,163,184,0.7)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{o.icon}</span>{o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 下方按需显示：时段 / 透明度 / 数据时间 */}
      {wl === 'none' ? null : (
        <div style={{ marginTop: 4, padding: '6px 12px', background: C.panel, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', alignSelf: 'flex-end' }}>
          {wl === 'cloud' && (
            <div style={{ display: 'flex', gap: 2 }}>
              {([0.5, 1, 3, 6] as const).map(h => (
                <button key={h} onClick={() => onSetCloudType(h)} style={{
                  padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 500,
                  background: cloudType === h ? 'rgba(34,211,238,0.18)' : 'transparent',
                  color: cloudType === h ? C.accent : 'rgba(148,163,184,0.7)',
                }}>{h < 1 ? '30m' : `${h}h`}</button>
              ))}
            </div>
          )}
          {wl === 'rain' && (
            <div style={{ display: 'flex', gap: 2 }}>
              {([24, 48, 72] as const).map(h => (
                <button key={h} onClick={() => onSetRainHours(h)} style={{
                  padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 500,
                  background: rainHours === h ? 'rgba(34,211,238,0.18)' : 'transparent',
                  color: rainHours === h ? C.accent : 'rgba(148,163,184,0.7)',
                }}>{h}h</button>
              ))}
            </div>
          )}
          {wl !== 'satellite' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9, color: C.muted }}>透明度</span>
              <input type="range" min={0} max={1} step={0.05} value={weatherOpacity} onChange={e => onSetWeatherOpacity(Number(e.target.value))}
                style={{ width: 60, accentColor: C.accent, height: 3 }} />
              <span style={{ fontSize: 9, color: C.muted, minWidth: 24 }}>{Math.round(weatherOpacity * 100)}%</span>
            </div>
          )}
          {showTime && timeStr && (
            <div style={{ fontSize: 9, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>
              {timeStr}
            </div>
          )}
        </div>
      )}
    </div>
  );
}