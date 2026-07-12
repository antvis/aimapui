/* ================================================================
   台风路径地图 — 主组件
   组装所有子组件与 hooks
   ================================================================ */

import { useMemo, useCallback, useState } from 'react';
import { AiMap, ZoomControl, MapThemeControl, useResponsive } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';
import { C, CURRENT_YEAR } from './constants';
import { GRADE_COLOR } from './constants';
import { pointGrade } from './transform';
import { useTyphoonData } from './hooks/useTyphoonData';
import { useWeatherData } from './hooks/useWeatherData';
import { useTyphoonPopup } from './hooks/useTyphoonPopup';

import TyphoonMapLayers from './TyphoonMapLayers';
import TyphoonInfoCard from './TyphoonInfoCard';
import WeatherToolbar from './WeatherToolbar';
import LegendPanel from './LegendPanel';

export default function TyphoonMap({ mobilePreview }: { mobilePreview?: boolean } = {}) {
  const { isMobile: responsiveMobile } = useResponsive();
  const isMobile = mobilePreview ?? responsiveMobile;

  // ── Hooks ──
  const typhoon = useTyphoonData();
  const weather = useWeatherData();
  const popup = useTyphoonPopup({
    info: typhoon.info,
    selectedAgency: typhoon.selectedAgency,
  });

  // ── 本地 UI 状态 ──
  const [listExpanded, setListExpanded] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [showWindCircles, setShowWindCircles] = useState(true);

  // ── 派生计算 ──
  const eyeColor = typhoon.currentPoint ? GRADE_COLOR[pointGrade(typhoon.currentPoint)] : C.accent;
  const selectedWind = typhoon.selectedPoint ? {
    strong: typhoon.selectedPoint.strong,
    power: typhoon.selectedPoint.power,
    lng: Number(typhoon.selectedPoint.lng),
    lat: Number(typhoon.selectedPoint.lat),
    time: typhoon.selectedPoint.time,
  } : null;

  // ── 事件处理 ──
  const handleNodeClick = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (f && typeof f.index === 'number') typhoon.setSelectedPointIdx(f.index);
    popup.handleNodeClick(payload);
  }, [typhoon.setSelectedPointIdx, popup.handleNodeClick]);

  const handleSelectTfid = useCallback((id: string) => {
    typhoon.setTfid(id);
    typhoon.setPointsDetailExpanded(false);
  }, [typhoon.setTfid, typhoon.setPointsDetailExpanded]);

  return (
    <div data-theme="dark" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes typhoon-eye-rot { to { transform: rotate(360deg); } }
        .typhoon-eye-spin { animation: typhoon-eye-rot 4s linear infinite; }
      `}</style>

      {/* ── 地图 ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AiMap
          map={{ basemap: 'gaode', center: [127.6, 20.8], zoom: 4, pitch: 12, style: weather.satellite ? 'light' : 'dark' }}
          onSceneReady={typhoon.handleSceneReady}
        >
          <TyphoonMapLayers
            trackSegments={typhoon.trackSegments}
            nodes={typhoon.nodes}
            windPolygons={typhoon.windPolygons}
            showWindCircles={showWindCircles}
            landMarks={typhoon.landMarks}
            forecastSrc={typhoon.forecastSrc}
            selectedAgency={typhoon.selectedAgency}
            activeForecastSegs={typhoon.activeForecastSegs}
            otherForecastSegs={typhoon.otherForecastSegs}
            forecastPoints={typhoon.forecastPoints}
            info={typhoon.info}
            currentPoint={typhoon.currentPoint}
            weatherLayer={weather.weatherLayer}
            weatherOpacity={weather.weatherOpacity}
            satellite={weather.satellite}
            satProvider={weather.satProvider}
            satOpacity={weather.satOpacity}
            cloud={weather.cloud}
            radar={weather.radar}
            rain={weather.rain}
            windField={weather.windField}
            popup={popup.popup}
            tooltip={popup.tooltip}
            rainTooltip={weather.rainTooltip}
            satelliteMode={weather.satellite}
            onPopupClose={() => popup.setPopup(null)}
            onNodeHover={popup.handleNodeHover}
            onNodeLeave={popup.handleNodeLeave}
            onNodeClick={handleNodeClick}
            onForecastClick={popup.handleForecastClick}
            onForecastPointHover={popup.handleForecastPointHover}
            onForecastPointLeave={popup.handleForecastPointLeave}
            onForecastPointClick={popup.handleForecastPointClick}
            onRainTooltipMove={weather.handleRainTooltipMove}
            onRainTooltipLeave={weather.handleRainTooltipLeave}
          />
          <ZoomControl position="bottomleft" showZoom />
          <MapThemeControl position="bottomleft" defaultValue="dark" />
        </AiMap>
      </div>

      {/* ════════ 顶部导航条 ════════ */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: isMobile ? '100%' : 264, zIndex: 1000, padding: isMobile ? '8px 12px' : '12px 16px', background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0) 100%)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: isMobile ? 18 : 22, color: C.accent, pointerEvents: 'auto' }}>cyclone</span>
          <span style={{ fontSize: isMobile ? 14 : 17, fontWeight: 800, color: '#f1f5f9' }}>台风路径图</span>
          {!isMobile && <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{CURRENT_YEAR} 年 西太平洋</span>}
          {typhoon.error && (
            <span style={{ fontSize: 10, color: '#fca5a5', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: 6, pointerEvents: 'auto', marginLeft: 'auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 11, verticalAlign: 'middle' }}>wifi_off</span> 使用内置样本
            </span>
          )}
        </div>
      </div>

      {/* ═══════ 右上角面板：工具条 + 信息卡 ═══════ */}
      <div style={{ position: 'absolute', top: isMobile ? 44 : 8, right: isMobile ? 8 : 12, zIndex: 1002, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'auto', alignItems: 'flex-end' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <WeatherToolbar
            weatherLayer={weather.weatherLayer}
            weatherOpacity={weather.weatherOpacity}
            cloudType={weather.cloudType}
            rainHours={weather.rainHours}
            cloudTime={weather.cloud?.time}
            radarTime={weather.radar?.time}
            rainTime={weather.rain?.time}
            isMobile={isMobile}
            onSetWeatherLayer={weather.setWeatherLayer}
            onSetWeatherOpacity={weather.setWeatherOpacity}
            onSetCloudType={weather.setCloudType}
            onSetRainHours={weather.setRainHours}
            onSetSatellite={weather.setSatellite}
          />
        </div>
        <TyphoonInfoCard
          info={typhoon.info}
          currentPoint={typhoon.currentPoint}
          list={typhoon.list}
          activeIds={typhoon.activeIds}
          tfid={typhoon.tfid}
          points={typhoon.points}
          loading={typhoon.loading}
          listExpanded={listExpanded}
          pointsDetailExpanded={typhoon.pointsDetailExpanded}
          isMobile={isMobile}
          onToggleListExpanded={() => setListExpanded(!listExpanded)}
          onTogglePointsDetail={() => typhoon.setPointsDetailExpanded(!typhoon.pointsDetailExpanded)}
          onSelectTfid={handleSelectTfid}
        />
      </div>

      {/* ═══════ 图例 + 选中历史点提示 ═══════ */}
      <div style={{ position: 'absolute', right: isMobile ? 0 : 12, bottom: isMobile ? 60 : 12, left: isMobile ? 'auto' : 'auto', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <LegendPanel
          showWindCircles={showWindCircles}
          legendExpanded={legendExpanded}
          landMarks={typhoon.landMarks}
          isMobile={isMobile}
          onToggleLegend={() => setLegendExpanded(!legendExpanded)}
          onToggleWindCircles={() => setShowWindCircles(!showWindCircles)}
        />
        {/* 选中历史点提示 */}
        {selectedWind && typhoon.selectedIdx !== typhoon.currentIdx && (
          <div style={{ padding: '8px 12px', background: C.panel, backdropFilter: 'blur(12px)', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#f59e0b' }}>history</span>
            <span>历史点 · {selectedWind.time.slice(5)} · {selectedWind.strong} {selectedWind.power}级</span>
            <button onClick={() => typhoon.setSelectedPointIdx(-1)} style={{ marginLeft: 4, padding: 0, border: 'none', background: 'none', color: C.muted, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
            </button>
          </div>
        )}
        {/* 数据来源 */}
        <div style={{ fontSize: 9, color: C.muted, padding: '4px 0', textAlign: 'center' }}>数据来源:浙江水利 typhoon.slt.zj.gov.cn</div>
      </div>
    </div>
  );
}