/* ================================================================
   台风数据获取钩子
   管理：台风列表、活跃状态、选中台风详情、派生数据
   ================================================================ */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Scene } from '@antv/l7';
import type {
  TyphoonListItem, TyphoonInfo, TyphoonPoint,
  TrackSegment, TrackNode, WindPolygon, LandPoint,
} from '../types';
import type { GradeKey } from '../constants';
import {
  API_ACTIVITY, API_LIST, API_INFO,
  FALLBACK_LIST, FALLBACK_INFO, CURRENT_YEAR,
  AGENCIES, AGENCY_COLOR,
} from '../constants';
import { toTrackSegments, toNodes, toWindPolygons, toForecastSegments } from '../transform';

export interface TyphoonDataState {
  // raw data
  list: TyphoonListItem[];
  activeIds: string[];
  tfid: string;
  info: TyphoonInfo | null;
  loading: boolean;
  error: boolean;

  // selection
  selectedPointIdx: number;
  selectedAgency: string;
  pointsDetailExpanded: boolean;

  // derived
  points: TyphoonPoint[];
  trackSegments: TrackSegment[];
  nodes: TrackNode[];
  currentIdx: number;
  selectedIdx: number;
  selectedPoint: TyphoonPoint | undefined;
  currentPoint: TyphoonPoint | undefined;
  windPolygons: WindPolygon[];

  // forecast
  forecastSrc: { tm: string; forecastpoints: TyphoonPoint[] }[];
  presentAgencies: Set<string>;
  activeForecastSegs: { path: [number, number][]; agency: string }[];
  otherForecastSegs: { path: [number, number][]; agency: string }[];
  forecastPoints: { lng: number; lat: number; agency: string; time: string; strong: string; speed: string; pressure: string }[];

  // land
  landMarks: LandPoint[];

  // setters
  setTfid: (v: string) => void;
  setSelectedPointIdx: (v: number) => void;
  setSelectedAgency: (v: string) => void;
  setPointsDetailExpanded: (v: boolean) => void;

  // scene
  sceneRef: React.MutableRefObject<Scene | null>;
  handleSceneReady: (scene: Scene) => () => void;
}

export function useTyphoonData(): TyphoonDataState {
  // ── 基础状态 ──
  const [list, setList] = useState<TyphoonListItem[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [tfid, setTfid] = useState<string>('');
  const [info, setInfo] = useState<TyphoonInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedAgency, setSelectedAgency] = useState<string>('中国');
  const [selectedPointIdx, setSelectedPointIdx] = useState<number>(-1);
  const [pointsDetailExpanded, setPointsDetailExpanded] = useState(false);

  const sceneRef = useRef<Scene | null>(null);

  // ── 1. 拉取当年台风列表 ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let active: string[] = [];
      try {
        const ar = await fetch(API_ACTIVITY, { cache: 'no-store' });
        if (ar.ok) {
          const aj = await ar.json() as TyphoonListItem[];
          active = (Array.isArray(aj) ? aj : []).map(t => t.tfid);
        }
      } catch { /* ignore */ }
      try {
        const r = await fetch(API_LIST(CURRENT_YEAR), { cache: 'no-store' });
        if (!r.ok) throw new Error('list');
        const j = (await r.json()) as TyphoonListItem[];
        if (cancelled) return;
        const arr = Array.isArray(j) ? j : [];
        if (arr.length === 0) throw new Error('empty');
        setList(arr);
        setActiveIds(active);
        const chosen = active[0] ?? [...arr].sort((a, b) => (b.starttime || '').localeCompare(a.starttime || ''))[0]?.tfid;
        setTfid(chosen ?? arr[0].tfid);
        setError(false);
      } catch {
        if (cancelled) return;
        setList(FALLBACK_LIST);
        setActiveIds(['202609']);
        setTfid('202609');
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── 2. 选中 tfid → 拉取详情 ──
  useEffect(() => {
    if (!tfid) return;
    let cancelled = false;
    (async () => {
      if (tfid === FALLBACK_INFO.tfid) setInfo(FALLBACK_INFO);
      try {
        const r = await fetch(API_INFO(tfid), { cache: 'no-store' });
        if (!r.ok) throw new Error('info');
        const j = (await r.json()) as TyphoonInfo;
        if (cancelled) return;
        if (j && Array.isArray(j.points) && j.points.length > 0) {
          setInfo(j);
          setError(false);
        } else {
          throw new Error('empty');
        }
      } catch {
        if (cancelled) return;
        setInfo(FALLBACK_INFO);
        setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [tfid]);

  // ── 3. 派生数据 ──
  const points = info?.points ?? [];
  const trackSegments = useMemo(() => toTrackSegments(points), [points]);
  const nodes = useMemo(() => toNodes(points), [points]);
  const currentIdx = points.length - 1;
  const selectedIdx = selectedPointIdx >= 0 && selectedPointIdx < points.length ? selectedPointIdx : currentIdx;
  const selectedPoint = points[selectedIdx];
  const currentPoint = points[currentIdx];

  const windPolygons = useMemo(() => toWindPolygons(selectedPoint), [selectedPoint]);

  const forecastSrc = useMemo(
    () => selectedPoint?.forecast ?? currentPoint?.forecast ?? [],
    [selectedPoint, currentPoint],
  );
  const presentAgencies = useMemo(() => new Set(forecastSrc.map(f => f.tm)), [forecastSrc]);

  const activeForecastSegs = useMemo(() => {
    const a = forecastSrc.find(f => f.tm === selectedAgency);
    return toForecastSegments(a).map(s => ({ path: s.path, agency: selectedAgency }));
  }, [forecastSrc, selectedAgency]);

  const otherForecastSegs = useMemo(() => {
    const out: { path: [number, number][]; agency: string }[] = [];
    for (const a of forecastSrc) {
      if (a.tm === selectedAgency) continue;
      for (const seg of toForecastSegments(a)) out.push({ path: seg.path, agency: a.tm });
    }
    return out;
  }, [forecastSrc, selectedAgency]);

  const forecastPoints = useMemo(() => {
    const pts: { lng: number; lat: number; agency: string; time: string; strong: string; speed: string; pressure: string }[] = [];
    for (const a of forecastSrc) {
      for (const pt of a.forecastpoints ?? []) {
        const lng = Number(pt.lng), lat = Number(pt.lat);
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          pts.push({ lng, lat, agency: a.tm, time: String(pt.time ?? ''), strong: String(pt.strong ?? ''), speed: String(pt.speed ?? ''), pressure: String(pt.pressure ?? '') });
        }
      }
    }
    return pts;
  }, [forecastSrc]);

  const landMarks = useMemo(() => {
    const lands = info?.land ?? [];
    return lands.filter(l => {
      const lng = Number(l.lng), lat = Number(l.lat);
      return Number.isFinite(lng) && Number.isFinite(lat);
    });
  }, [info]);

  // ── Scene ready ──
  const handleSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    return () => {};
  }, []);

  // ── fitBounds ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || trackSegments.length === 0) return;
    const coords = points.map(p => [Number(p.lng), Number(p.lat)] as [number, number]).filter(c => Number.isFinite(c[0]) && Number.isFinite(c[1]));
    if (coords.length === 0) return;
    const lngs = coords.map(c => c[0]), lats = coords.map(c => c[1]);
    const pad = 4;
    scene.fitBounds(
      [[Math.min(...lngs) - pad, Math.min(...lats) - pad], [Math.max(...lngs) + pad, Math.max(...lats) + pad]],
      { padding: [80, 80, 80, 80] },
    );
    setSelectedPointIdx(-1);
  }, [tfid, trackSegments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    list, activeIds, tfid, info, loading, error,
    selectedPointIdx, selectedAgency, pointsDetailExpanded,
    points, trackSegments, nodes,
    currentIdx, selectedIdx, selectedPoint, currentPoint,
    windPolygons,
    forecastSrc, presentAgencies, activeForecastSegs, otherForecastSegs, forecastPoints,
    landMarks,
    setTfid, setSelectedPointIdx, setSelectedAgency, setPointsDetailExpanded,
    sceneRef, handleSceneReady,
  };
}