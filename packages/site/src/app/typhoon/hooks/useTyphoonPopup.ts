/* ================================================================
   Popup/Tooltip 交互钩子
   管理：节点/预报 hover & click 事件、Popup/Tooltip 状态
   ================================================================ */

import { useState, useCallback, useRef } from 'react';
import type { LayerEventPayload, PopupAttribute } from '@antv/aimapui';
import type { TyphoonInfo, PopupData, TooltipState } from '../types';
import { GRADE_COLOR, STRENGTH_TO_KEY, AGENCY_COLOR } from '../constants';

export interface TyphoonPopupState {
  popup: PopupData | null;
  tooltip: TooltipState;

  setPopup: (v: PopupData | null) => void;

  handleNodeHover: (payload: LayerEventPayload) => void;
  handleNodeLeave: () => void;
  handleNodeClick: (payload: LayerEventPayload) => void;

  handleForecastClick: (payload: LayerEventPayload) => void;
  handleForecastPointHover: (payload: LayerEventPayload) => void;
  handleForecastPointLeave: () => void;
  handleForecastPointClick: (payload: LayerEventPayload) => void;
}

export function useTyphoonPopup(
  deps: { info: TyphoonInfo | null; selectedAgency: string },
): TyphoonPopupState {
  const { info, selectedAgency } = deps;
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, lng: 0, lat: 0, time: '', strong: '', power: '', speed: '', pressure: '' });
  const hoverRef = useRef<{ lng: number; lat: number; time: string; strong: string; power: string; speed: string; pressure: string } | null>(null);

  // ── 节点交互 ──
  const handleNodeHover = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (!f) return;
    hoverRef.current = {
      lng: payload.lng, lat: payload.lat,
      time: String(f.time ?? ''), strong: String(f.strong ?? ''), power: String(f.power ?? ''),
      speed: String(f.speed ?? ''), pressure: String(f.pressure ?? ''),
    };
    setTooltip({ visible: true, ...hoverRef.current });
  }, []);

  const handleNodeLeave = useCallback(() => setTooltip(t => ({ ...t, visible: false })), []);

  const handleNodeClick = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (!f) return;
    const lng = payload.lng, lat = payload.lat;
    const strong = String(f.strong ?? ''), power = String(f.power ?? ''), speed = String(f.speed ?? ''),
      pressure = String(f.pressure ?? ''), time = String(f.time ?? ''),
      movespeed = String(f.movespeed ?? ''), movedirection = String(f.movedirection ?? ''),
      radius7 = String(f.radius7 ?? ''), radius10 = String(f.radius10 ?? ''), radius12 = String(f.radius12 ?? '');
    const key = STRENGTH_TO_KEY[strong] ?? 'TS';
    const formatRadius = (r: string) => {
      if (!r || r === 'undefined') return '—';
      const vals = r.split('|').map(Number).filter(Number.isFinite);
      if (vals.length === 0) return '—';
      const min = Math.min(...vals), max = Math.max(...vals);
      return min === max ? `${min}公里` : `${min}-${max}公里`;
    };
    setPopup({
      lng, lat,
      title: info?.name ? `${info.name}(${info.enname})` : '台风',
      statusLabel: strong,
      statusColor: GRADE_COLOR[key],
      attrs: [
        { label: '时间', value: time.slice(0, 16).replace('T', ' ') || '—' },
        { label: '中心位置', value: `${Number(lng).toFixed(2)}° / ${Number(lat).toFixed(2)}°` },
        { label: '风速风力', value: speed && power ? `${speed}米/秒，${power}级(${strong})` : '—', valueColor: GRADE_COLOR[key] },
        { label: '中心气压', value: pressure ? `${pressure}百帕` : '—' },
        { label: '移速移向', value: movespeed && movedirection ? `${movespeed}公里/小时，${movedirection}` : '—' },
        { label: '七级半径', value: formatRadius(radius7) },
        { label: '十级半径', value: formatRadius(radius10) },
        { label: '十二级半径', value: formatRadius(radius12) },
      ],
    });
  }, [info]);

  // ── 预报交互 ──
  const handleForecastClick = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    const agencyName = String(f?.agency ?? selectedAgency);
    setPopup({
      lng: payload.lng, lat: payload.lat,
      title: `${agencyName} 预报路径`, statusLabel: '预报', statusColor: AGENCY_COLOR[agencyName],
      attrs: [
        { label: '机构', value: agencyName },
        { label: '路径类型', value: '预报(虚线)' },
        { label: '经度', value: `${Number(payload.lng).toFixed(1)}°` },
        { label: '纬度', value: `${Number(payload.lat).toFixed(1)}°` },
      ],
    });
  }, [selectedAgency]);

  const handleForecastPointHover = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (!f) return;
    hoverRef.current = {
      lng: payload.lng, lat: payload.lat,
      time: String(f.time ?? ''), strong: String(f.strong ?? ''), power: '',
      speed: String(f.speed ?? ''), pressure: String(f.pressure ?? ''),
    };
    setTooltip({ visible: true, ...hoverRef.current });
  }, []);

  const handleForecastPointLeave = useCallback(() => setTooltip(t => ({ ...t, visible: false })), []);

  const handleForecastPointClick = useCallback((payload: LayerEventPayload) => {
    const f = payload.feature as Record<string, unknown> | undefined;
    if (!f) return;
    const agencyName = String(f.agency ?? '');
    const time = String(f.time ?? ''), strong = String(f.strong ?? ''),
      speed = String(f.speed ?? ''), pressure = String(f.pressure ?? '');
    setPopup({
      lng: payload.lng, lat: payload.lat,
      title: `${agencyName} 预报点`, statusLabel: strong || '预报', statusColor: AGENCY_COLOR[agencyName] ?? '#22d3ee',
      attrs: [
        { label: '机构', value: agencyName },
        { label: '时间', value: time.slice(0, 16).replace('T', ' ') || '—' },
        { label: '中心位置', value: `${Number(payload.lng).toFixed(2)}° / ${Number(payload.lat).toFixed(2)}°` },
        { label: '风速', value: speed ? `${speed}米/秒` : '—' },
        { label: '强度', value: strong || '—' },
        { label: '中心气压', value: pressure ? `${pressure}百帕` : '—' },
      ],
    });
  }, []);

  return {
    popup, tooltip, setPopup,
    handleNodeHover, handleNodeLeave, handleNodeClick,
    handleForecastClick, handleForecastPointHover, handleForecastPointLeave, handleForecastPointClick,
  };
}