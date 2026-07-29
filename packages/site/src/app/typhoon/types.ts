/* ================================================================
   台风路径地图 — 类型定义
   ================================================================ */

import type { GradeKey } from './constants';
import type { PopupAttribute } from '@antv/aimapui';

// ── 台风数据 ─────────────────────────────────────────────────────
export interface TyphoonPoint {
  time: string;
  lng: string;
  lat: string;
  strong: string;
  power: string;
  speed: string;
  pressure: string;
  movespeed?: string;
  movedirection?: string;
  radius7?: string;
  radius10?: string;
  radius12?: string;
  forecast?: ForecastAgency[];
}

export interface ForecastAgency {
  tm: string;
  forecastpoints: TyphoonPoint[];
}

export interface LandPoint {
  landaddress: string;
  landtime: string;
  lng: string;
  lat: string;
  info: string;
  strong: string | null;
}

export interface TyphoonInfo {
  tfid: string;
  name: string;
  enname: string;
  isactive?: string;
  starttime?: string;
  endtime?: string;
  warnlevel?: string;
  centerlng?: string;
  centerlat?: string;
  points: TyphoonPoint[];
  land?: LandPoint[];
}

export interface TyphoonListItem {
  tfid: string;
  name: string;
  enname: string;
  starttime: string;
  endtime: string;
  isactive: string;
  warnlevel?: string;
}

// ── 派生数据形状 ─────────────────────────────────────────────────
export interface TrackSegment { path: [number, number][]; grade: GradeKey; }
export interface TrackNode { lng: number; lat: number; grade: GradeKey; time: string; strong: string; power: string; speed: string; pressure: string; index: number; }
export interface WindPolygon { coordinates: [number, number][][]; level: string; }

// ── 气象数据 ─────────────────────────────────────────────────────
export interface CloudData { img: string; time: string; extent: [number, number, number, number]; }
export interface RadarTileData { img: string; extent: [number, number, number, number]; }
export interface RadarData { tiles: RadarTileData[]; time: string; }
export interface RainFeature { type: 'Feature'; properties: { color: string; symbol: string }; geometry: { type: 'Polygon'; coordinates: [number, number][][] } }
export interface RainData { features: RainFeature[]; colors: string[]; time: string; colorToSymbol: Record<string, string>; }

export interface WindData {
  imageUrl: string;
  time: string;
  extent: [number, number, number, number];
  uMin: number; uMax: number;
  vMin: number; vMax: number;
}

/**
 * Canvas 粒子风场所需的原始 U/V 网格数据
 * @deprecated 请使用 @antv/aimapui 的 WindFieldData 类型
 */
export interface WindFieldRawData {
  uData: number[];
  vData: number[];
  nx: number;
  ny: number;
  lo1: number;
  la1: number;
  dx: number;
  dy: number;
  time: string;
}

export interface WindGribHeader {
  nx: number; ny: number;
  lo1: number; la1: number;
  dx: number; dy: number;
  parameterNumberName: string;
  parameterUnit: string;
}

export interface WindGribResponse {
  header: WindGribHeader;
  data: number[];
}

// ── UI 状态 ──────────────────────────────────────────────────────
export interface PopupData {
  lng: number; lat: number;
  title: string; statusLabel: string; statusColor: string;
  attrs: PopupAttribute[];
}

export interface TooltipState {
  visible: boolean;
  lng: number;
  lat: number;
  time: string;
  strong: string;
  power: string;
  speed: string;
  pressure: string;
}

export interface RainTooltipState {
  visible: boolean;
  lng: number;
  lat: number;
  symbol: string;
  color: string;
}