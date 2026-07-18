/* ================================================================
   气象图层数据获取钩子
   管理：图层切换、云图/雷达/降雨状态、透明度
   ================================================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CloudData, RadarData, RainData, RainTooltipState, WindFieldRawData } from '../types';
import { fetchCloud, fetchRadar, fetchRain, fetchWindFieldRaw } from '../api';
import type { LayerEventPayload } from '@antv/aimapui';

export interface WeatherDataState {
  weatherLayer: 'none' | 'cloud' | 'radar' | 'rain' | 'satellite' | 'wind';
  weatherOpacity: number;
  cloudType: 0.5 | 1 | 3 | 6;
  rainHours: 24 | 48 | 72;
  cloud: CloudData | null;
  radar: RadarData | null;
  rain: RainData | null;
  satellite: boolean;
  satProvider: 'gaode' | 'tianditu' | 'google';
  satOpacity: number;
  windField: WindFieldRawData | null;

  rainTooltip: RainTooltipState;

  setWeatherLayer: (v: 'none' | 'cloud' | 'radar' | 'rain' | 'satellite' | 'wind') => void;
  setWeatherOpacity: (v: number) => void;
  setCloudType: (v: 0.5 | 1 | 3 | 6) => void;
  setRainHours: (v: 24 | 48 | 72) => void;
  setSatellite: (v: boolean) => void;
  setSatProvider: (v: 'gaode' | 'tianditu' | 'google') => void;
  setSatOpacity: (v: number) => void;

  handleRainTooltipMove: (payload: LayerEventPayload) => void;
  handleRainTooltipLeave: () => void;
}

export function useWeatherData(): WeatherDataState {
  const [weatherLayer, setWeatherLayer] = useState<'none' | 'cloud' | 'radar' | 'rain' | 'satellite' | 'wind'>('none');
  const [weatherOpacity, setWeatherOpacity] = useState(0.7);
  const [cloudType, setCloudType] = useState<0.5 | 1 | 3 | 6>(1);
  const [rainHours, setRainHours] = useState<24 | 48 | 72>(24);
  const [cloud, setCloud] = useState<CloudData | null>(null);
  const [radar, setRadar] = useState<RadarData | null>(null);
  const [rain, setRain] = useState<RainData | null>(null);
  const [satellite, setSatellite] = useState(false);
  const [satProvider, setSatProvider] = useState<'gaode' | 'tianditu' | 'google'>('gaode');
  const [satOpacity, setSatOpacity] = useState(0.8);
  const [windField, setWindField] = useState<WindFieldRawData | null>(null);

  const [rainTooltip, setRainTooltip] = useState<RainTooltipState>({ visible: false, lng: 0, lat: 0, symbol: '', color: '' });

  // ── 气象图层按需拉取 ──
  useEffect(() => {
    if (weatherLayer === 'cloud' && !cloud) {
      fetchCloud(cloudType).then(d => { if (d) setCloud(d); });
    } else if (weatherLayer === 'radar' && !radar) {
      fetchRadar().then(d => { if (d) setRadar(d); });
    } else if (weatherLayer === 'rain' && !rain) {
      fetchRain(rainHours).then(d => { if (d) setRain(d); });
    } else if (weatherLayer === 'wind' && !windField) {
      fetchWindFieldRaw().then(d => { if (d) setWindField(d); });
    }
  }, [weatherLayer, cloudType, rainHours, cloud, radar, rain, windField]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 云图时段切换 ──
  useEffect(() => { if (weatherLayer === 'cloud') setCloud(null); }, [cloudType]);

  // ── 降雨时段切换 ──
  useEffect(() => { if (weatherLayer === 'rain') setRain(null); }, [rainHours]);

  const handleRainTooltipMove = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    const symbol = String(f?.symbol ?? '');
    setRainTooltip({
      visible: true,
      lng: payload.lng, lat: payload.lat,
      symbol,
      color: String(f?.color ?? ''),
    });
  }, []);

  const handleRainTooltipLeave = useCallback(() => {
    setRainTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    weatherLayer, weatherOpacity, cloudType, rainHours,
    cloud, radar, rain, satellite, satProvider, satOpacity, windField,
    rainTooltip,
    setWeatherLayer, setWeatherOpacity, setCloudType, setRainHours,
    setSatellite, setSatProvider, setSatOpacity,
    handleRainTooltipMove, handleRainTooltipLeave,
  };
}