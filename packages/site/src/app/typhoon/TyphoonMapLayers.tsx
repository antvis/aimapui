/* ================================================================
   地图图层子组件
   包含：气象覆盖层、风圈、警戒线、轨迹段、预报路径、
         标注、Tooltip、Popup
   ================================================================ */

import { Marker, Tooltip, Popup, ImageLayer, FillLayer, LineLayer, PointLayer, SatelliteLayer } from '@antv/aimapui';
import type { TyphoonPoint, WindPolygon, TrackNode, LandPoint, PopupData, TooltipState, RainTooltipState } from './types';
import {
  GRADE_ORDER, GRADE_COLOR, WIND_LEVEL_KEY, WIND_LEVEL_COLOR,
  AGENCIES, AGENCY_COLOR, WARNING_LINE_24H, WARNING_LINE_48H, WARNING_LINE_COLORS,
  C,
} from './constants';
import { getRainLevelLabel } from './constants';
import { pointGrade } from './transform';
import type { LayerEventPayload } from '@antv/aimapui';

interface TyphoonMapLayersProps {
  // typhoon data
  trackSegments: { path: [number, number][]; grade: string }[];
  nodes: TrackNode[];
  windPolygons: WindPolygon[];
  showWindCircles: boolean;
  landMarks: LandPoint[];
  forecastSrc: { tm: string; forecastpoints: TyphoonPoint[] }[];
  selectedAgency: string;
  activeForecastSegs: { path: [number, number][]; agency: string }[];
  otherForecastSegs: { path: [number, number][]; agency: string }[];
  forecastPoints: { lng: number; lat: number; agency: string; time: string; strong: string; speed: string; pressure: string }[];
  info: { name?: string; enname?: string } | null;
  currentPoint: TyphoonPoint | undefined;

  // weather
  weatherLayer: 'none' | 'cloud' | 'radar' | 'rain' | 'satellite';
  weatherOpacity: number;
  satellite: boolean;
  satProvider: 'gaode' | 'tianditu' | 'google';
  satOpacity: number;
  cloud: { img: string; extent: [number, number, number, number] } | null;
  radar: { tiles: { img: string; extent: [number, number, number, number] }[] } | null;
  rain: { features: { type: 'Feature'; properties: { color: string; symbol: string }; geometry: { type: 'Polygon'; coordinates: [number, number][][] } }[]; colors: string[] } | null;

  // interactions
  popup: PopupData | null;
  tooltip: TooltipState;
  rainTooltip: RainTooltipState;
  satelliteMode: boolean;
  onPopupClose: () => void;
  onNodeHover: (payload: LayerEventPayload) => void;
  onNodeLeave: () => void;
  onNodeClick: (payload: LayerEventPayload) => void;
  onForecastClick: (payload: LayerEventPayload) => void;
  onForecastPointHover: (payload: LayerEventPayload) => void;
  onForecastPointLeave: () => void;
  onForecastPointClick: (payload: LayerEventPayload) => void;
  onRainTooltipMove: (payload: LayerEventPayload) => void;
  onRainTooltipLeave: () => void;
}

export default function TyphoonMapLayers({
  trackSegments, nodes, windPolygons, showWindCircles, landMarks,
  forecastSrc, selectedAgency, activeForecastSegs, otherForecastSegs, forecastPoints,
  info, currentPoint,
  weatherLayer, weatherOpacity, satellite, satProvider, satOpacity,
  cloud, radar, rain,
  popup, tooltip, rainTooltip, satelliteMode,
  onPopupClose, onNodeHover, onNodeLeave, onNodeClick,
  onForecastClick, onForecastPointHover, onForecastPointLeave, onForecastPointClick,
  onRainTooltipMove, onRainTooltipLeave,
}: TyphoonMapLayersProps) {
  const eyeColor = currentPoint ? GRADE_COLOR[pointGrade(currentPoint)] : C.accent;
  const eyeLng = currentPoint ? Number(currentPoint.lng) : NaN;
  const eyeLat = currentPoint ? Number(currentPoint.lat) : NaN;

  return (
    <>
      {/* ⓪ 气象覆盖层 */}
      {satellite && (<SatelliteLayer provider={satProvider} zIndex={-2} opacity={satOpacity} visible={satellite} />)}
      {weatherLayer === 'cloud' && cloud && (
        <ImageLayer
          source={cloud.img}
          sourceType="image"
          sourceConfig={{ parser: { type: 'image', extent: cloud.extent } }}
          style={{ opacity: weatherOpacity } as Record<string, unknown>}
          zIndex={-1}
        />
      )}
      {weatherLayer === 'radar' && radar && radar.tiles.map((t, i) => (
        <ImageLayer
          key={`radar-${i}`}
          source={t.img}
          sourceType="image"
          sourceConfig={{ parser: { type: 'image', extent: t.extent } }}
          style={{ opacity: weatherOpacity } as Record<string, unknown>}
          zIndex={-1}
        />
      ))}
      {weatherLayer === 'rain' && rain && (
        <FillLayer
          source={{ type: 'FeatureCollection', features: rain.features }}
          sourceType="geojson"
          colorField="color"
          colorValues={rain.colors}
          style={{ opacity: weatherOpacity } as Record<string, unknown>}
          zIndex={-1}
          hoverEffect={false}
          clickEffect={false}
          tooltipEffect={false}
          onMouseMove={onRainTooltipMove}
          onMouseLeave={onRainTooltipLeave}
        />
      )}

      {/* 风圈 */}
      {showWindCircles && windPolygons.length > 0 && (
        <>
          <FillLayer
            source={{ type: 'FeatureCollection', features: windPolygons.map(w => ({ type: 'Feature' as const, properties: { level: w.level }, geometry: { type: 'Polygon' as const, coordinates: w.coordinates } })) }}
            sourceType="geojson"
            shape="fill"
            colorField="level"
            colorValues={WIND_LEVEL_KEY.map(k => WIND_LEVEL_COLOR[k])}
            style={{ opacity: 0.25 } as Record<string, unknown>}
            zIndex={0}
          />
          <LineLayer
            source={{ type: 'FeatureCollection', features: windPolygons.map(w => ({ type: 'Feature' as const, properties: { level: w.level }, geometry: { type: 'Polygon' as const, coordinates: w.coordinates } })) }}
            sourceType="geojson"
            shape="line"
            size={1}
            colorField="level"
            colorValues={WIND_LEVEL_KEY.map(k => WIND_LEVEL_COLOR[k])}
            style={{ opacity: 0.8 } as Record<string, unknown>}
            zIndex={2}
          />
          <PointLayer
            source={{ type: 'FeatureCollection' as const, features: windPolygons.map(w => {
              const coords = w.coordinates[0];
              const midIdx = Math.floor(coords.length / 4);
              const pt = coords[midIdx] || coords[0];
              return {
                type: 'Feature' as const,
                properties: { label: `${w.level}级风圈`, level: w.level },
                geometry: { type: 'Point' as const, coordinates: pt },
              };
            }) }}
            sourceType="geojson"
            shapeField="label"
            shapeValues="text"
            colorField="level"
            colorValues={WIND_LEVEL_KEY.map(k => WIND_LEVEL_COLOR[k])}
            size={11}
            zIndex={5}
            style={{
              textAnchor: 'center',
              textOffset: [0, -8],
              fontWeight: 600,
              stroke: '#0f172a',
              strokeWidth: 3,
            } as Record<string, unknown>}
          />
        </>
      )}

      {/* 警戒线 */}
      <LineLayer
        source={{ type: 'FeatureCollection' as const, features: [
          { type: 'Feature' as const, properties: { type: '24h', label: '24小时警戒线' }, geometry: { type: 'LineString' as const, coordinates: WARNING_LINE_24H } },
          { type: 'Feature' as const, properties: { type: '48h', label: '48小时警戒线' }, geometry: { type: 'LineString' as const, coordinates: WARNING_LINE_48H } },
        ] }}
        sourceType="geojson"
        shape="line"
        size={1.5}
        colorField="type"
        colorValues={[WARNING_LINE_COLORS['24h'], WARNING_LINE_COLORS['48h']]}
        style={{ opacity: 0.9, lineType: 'dash', dashArray: [8, 5] } as Record<string, unknown>}
        zIndex={3}
      />
      <PointLayer
        source={{ type: 'FeatureCollection' as const, features: [
          { type: 'Feature' as const, properties: { label: '24小时警戒线', type: '24h' }, geometry: { type: 'Point' as const, coordinates: [119, 18] } },
          { type: 'Feature' as const, properties: { label: '48小时警戒线', type: '48h' }, geometry: { type: 'Point' as const, coordinates: [132, 15] } },
        ] }}
        sourceType="geojson"
        shapeField="label"
        shapeValues="text"
        colorField="type"
        colorValues={[WARNING_LINE_COLORS['24h'], WARNING_LINE_COLORS['48h']]}
        size={12}
        zIndex={4}
        style={{
          textAnchor: 'center',
          textOffset: [0, -10],
          fontWeight: 600,
          stroke: '#0f172a',
          strokeWidth: 3,
        } as Record<string, unknown>}
      />

      {/* 历史轨迹段 */}
      {trackSegments.length > 0 && (
        <LineLayer
          source={trackSegments}
          sourceType="json"
          sourceConfig={{ coordinates: 'path' }}
          shape="line"
          size={1.5}
          colorField="grade"
          colorValues={GRADE_ORDER.map(g => GRADE_COLOR[g])}
          zIndex={1}
        />
      )}

      {/* 其他机构预报（淡显） */}
      {otherForecastSegs.length > 0 && (
        <LineLayer
          source={otherForecastSegs}
          sourceType="json"
          sourceConfig={{ coordinates: 'path' }}
          shape="line"
          size={2}
          colorField="agency"
          colorValues={AGENCIES.filter(a => a !== selectedAgency).map(a => AGENCY_COLOR[a])}
          style={{ opacity: 0.55, lineType: 'dash', dashArray: [8, 8] } as Record<string, unknown>}
          active={{ color: '#fff' }}
          onClick={onForecastClick}
          zIndex={1}
        />
      )}

      {/* 选中机构预报（高亮） */}
      {activeForecastSegs.length > 0 && (
        <LineLayer
          source={activeForecastSegs}
          sourceType="json"
          sourceConfig={{ coordinates: 'path' }}
          shape="line"
          size={2.5}
          colorField="agency"
          colorValues={[AGENCY_COLOR[selectedAgency]]}
          style={{ opacity: 0.95, lineType: 'dash', dashArray: [12, 8] } as Record<string, unknown>}
          active={{ color: '#fff' }}
          onClick={onForecastClick}
          zIndex={2}
        />
      )}

      {/* 预报路径点位 */}
      {forecastPoints.length > 0 && (
        <PointLayer
          source={forecastPoints}
          sourceType="json"
          sourceConfig={{ x: 'lng', y: 'lat' }}
          shape="circle"
          size={3}
          colorField="agency"
          colorValues={AGENCIES.map(a => AGENCY_COLOR[a])}
          style={{ opacity: 0.7, stroke: '#fff', strokeWidth: 0.5 } as Record<string, unknown>}
          active={{ color: '#fff' }}
          onMouseMove={onForecastPointHover}
          onMouseLeave={onForecastPointLeave}
          onClick={onForecastPointClick}
          zIndex={7}
        />
      )}

      {/* 预报路径日期标注（仅中国机构） */}
      {(() => {
        const chinaPoints = forecastSrc.find(f => f.tm === '中国')?.forecastpoints ?? [];
        const dailyLabels: { lng: number; lat: number; dateLabel: string }[] = [];
        const seenDates = new Set<string>();
        for (const pt of chinaPoints) {
          const timeStr = String(pt.time ?? '');
          const datePart = timeStr.slice(0, 10);
          if (!datePart || seenDates.has(datePart)) continue;
          seenDates.add(datePart);
          const lng = Number(pt.lng), lat = Number(pt.lat);
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
          const month = datePart.slice(5, 7);
          const day = datePart.slice(8, 10);
          dailyLabels.push({ lng, lat, dateLabel: `${month}/${day}` });
        }
        if (dailyLabels.length === 0) return null;
        return (
          <PointLayer
            source={{ type: 'FeatureCollection' as const, features: dailyLabels.map(d => ({
              type: 'Feature' as const,
              properties: { label: d.dateLabel },
              geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] },
            })) }}
            sourceType="geojson"
            shapeField="label"
            shapeValues="text"
            color="#22d3ee"
            size={11}
            zIndex={8}
            style={{
              textAnchor: 'center',
              textOffset: [0, -12],
              fontWeight: 700,
              stroke: '#0f172a',
              strokeWidth: 3,
            } as Record<string, unknown>}
          />
        );
      })()}

      {/* 路径节点 */}
      {nodes.length > 0 && (
        <PointLayer
          source={nodes}
          sourceType="json"
          sourceConfig={{ x: 'lng', y: 'lat' }}
          shape="circle"
          size={5}
          colorField="grade"
          colorValues={GRADE_ORDER.map(g => GRADE_COLOR[g])}
          active={{ color: '#fff' }}
          onMouseMove={onNodeHover}
          onMouseLeave={onNodeLeave}
          onClick={onNodeClick}
          zIndex={6}
        />
      )}

      {/* 台风眼 */}
      {Number.isFinite(eyeLng) && Number.isFinite(eyeLat) && (
        <Marker
          longitude={eyeLng}
          latitude={eyeLat}
          anchor="center"
          offsets={[0, 0]}
          content={
            <img
              className="typhoon-eye-spin"
              src="https://mdn.alipayobjects.com/huamei_b5qxsh/afts/img/A*WGCYS7D5AI0AAAAAQGAAAAgAerZ5AQ/original"
              alt="台风眼"
              style={{ width: 40, height: 40, pointerEvents: 'none' }}
            />
          }
        />
      )}

      {/* 登陆点标注 */}
      {landMarks.map((land) => {
        const lng = Number(land.lng), lat = Number(land.lat);
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
        return (
          <Marker
            key={`${land.landtime}-${land.landaddress}`}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            offsets={[0, 0]}
            content={
              <img
                src="https://mdn.alipayobjects.com/huamei_b5qxsh/afts/img/A*ADaqSZdQm0wAAAAAPSAAAAgAerZ5AQ/original"
                alt="登陆点"
                title={land.info}
                style={{ width: 32, height: 40, cursor: 'pointer' }}
              />
            }
          />
        );
      })}

      {/* 节点 Tooltip */}
      <Tooltip
        longitude={tooltip.lng}
        latitude={tooltip.lat}
        variant="dark"
        visible={tooltip.visible}
        items={[
          { label: '时间', value: tooltip.time },
          { label: '强度', value: tooltip.strong },
          { label: '风力', value: tooltip.power ? `${tooltip.power}级` : '' },
          { label: '风速', value: tooltip.speed ? `${tooltip.speed}m/s` : '' },
          { label: '气压', value: tooltip.pressure ? `${tooltip.pressure}hPa` : '' },
        ]}
      />

      {/* 降雨 Tooltip */}
      <Tooltip
        longitude={rainTooltip.lng}
        latitude={rainTooltip.lat}
        variant="dark"
        visible={rainTooltip.visible}
        items={[
          { label: '降水等级', value: getRainLevelLabel(rainTooltip.symbol) },
        ]}
      />

      {/* 点击 Popup */}
      {popup && (
        <Popup
          longitude={popup.lng}
          latitude={popup.lat}
          size="standard"
          singleton
          closeButton
          visible
          onClose={onPopupClose}
          header={{ title: popup.title, statusLabel: popup.statusLabel, statusColor: popup.statusColor }}
          attributes={popup.attrs}
        />
      )}
    </>
  );
}