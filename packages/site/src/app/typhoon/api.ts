/* ================================================================
   台风路径地图 — 气象数据获取 API
   数据来源：浙江水利台风 API
   ================================================================ */

import {
  API_LEASTCLOUD, API_LASTRADAR, API_LEASTRAIN, API_LASTWIND,
  RADAR_FULL_EXTENT, RADAR_TILES,
} from './constants';
import type {
  CloudData, RadarData, RadarTileData,
  RainData, RainFeature,
  WindData,
} from './types';

// ── 云图 ──────────────────────────────────────────────────────────
export async function fetchCloud(type: 0.5 | 1 | 3 | 6 = 1): Promise<CloudData | null> {
  try {
    const r = await fetch(API_LEASTCLOUD(type), { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json() as Record<string, string | undefined>;
    const typeKey = type === 0.5 ? '05' : String(type);
    const imgKey = `cloud${typeKey}h`;
    const timeKey = `timeStr${typeKey}h`;
    const img = j[imgKey]?.startsWith('data:image') ? j[imgKey] : (j[imgKey] ? `data:image/png;base64,${j[imgKey]}` : undefined);
    if (!img) return null;
    const minLng = Number(j.minLng), minLat = Number(j.minLat), maxLng = Number(j.maxLng), maxLat = Number(j.maxLat);
    if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
    return { img, time: j[timeKey] ?? '', extent: [minLng, minLat, maxLng, maxLat] };
  } catch { return null; }
}

// ── 雷达 ──────────────────────────────────────────────────────────
export async function fetchRadar(): Promise<RadarData | null> {
  try {
    const r = await fetch(API_LASTRADAR, { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json() as Record<string, string>;
    const synTime = j.synTime ?? '';
    const radarType = j.radarType ?? '1';
    if (radarType === '2' && j.radar0_0?.startsWith('data:image')) {
      return { tiles: [{ img: j.radar0_0, extent: RADAR_FULL_EXTENT }], time: synTime };
    }
    const tiles: RadarTileData[] = [];
    for (const t of RADAR_TILES) {
      const raw = j[t.key];
      if (!raw) continue;
      const img = raw.startsWith('data:image') ? raw : `data:image/png;base64,${raw}`;
      tiles.push({ img, extent: t.extent });
    }
    if (tiles.length === 0) return null;
    return { tiles, time: synTime };
  } catch { return null; }
}

// ── 降雨 ──────────────────────────────────────────────────────────
export async function fetchRain(hours: number = 24): Promise<RainData | null> {
  try {
    const r = await fetch(API_LEASTRAIN(hours), { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json() as { contours?: string; time?: string };
    const raw = typeof j.contours === 'string' ? JSON.parse(j.contours) : j.contours;
    if (!Array.isArray(raw)) return null;
    const features: RainFeature[] = [];
    const colorSet = new Set<string>();
    const colorToSymbol: Record<string, string> = {};
    for (const c of raw as Array<{ color?: string; latAndLong?: number[][]; symbol?: string }>) {
      const ll = c.latAndLong;
      if (!Array.isArray(ll) || ll.length < 3) continue;
      const ring: [number, number][] = ll.map(p => {
        const lat = Number(p[0]), lng = Number(p[1]);
        return [Number.isFinite(lng) && Number.isFinite(lat) ? lng : NaN, lat] as [number, number];
      }).filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1])) as [number, number][];
      if (ring.length < 3) continue;
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ring.push(ring[0]);
      const rgba = String(c.color ?? '120,180,255,255').split(',').map(Number);
      const hex = `#${rgba.slice(0, 3).map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join('')}`;
      colorSet.add(hex);
      const sym = String(c.symbol ?? '0');
      colorToSymbol[hex] = sym;
      features.push({
        type: 'Feature',
        properties: { color: hex, symbol: sym },
        geometry: { type: 'Polygon', coordinates: [ring] },
      });
    }
    if (features.length === 0) return null;
    return { features, colors: [...colorSet], time: j.time ?? '', colorToSymbol };
  } catch { return null; }
}

// ── 风场 ──────────────────────────────────────────────────────────
function windDataToImage(uData: number[], vData: number[], nx: number, ny: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = nx;
  canvas.height = ny;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  const imageData = ctx.createImageData(nx, ny);
  const pixels = imageData.data;

  let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
  for (let i = 0; i < uData.length; i++) {
    const u = uData[i], v = vData[i];
    if (u < uMin) uMin = u;
    if (u > uMax) uMax = u;
    if (v < vMin) vMin = v;
    if (v > vMax) vMax = v;
  }

  const uRange = uMax - uMin || 1;
  const vRange = vMax - vMin || 1;

  for (let i = 0; i < uData.length; i++) {
    const idx = i * 4;
    const uNorm = ((uData[i] - uMin) / uRange) * 255;
    const vNorm = ((vData[i] - vMin) / vRange) * 255;
    pixels[idx] = uNorm;
    pixels[idx + 1] = vNorm;
    pixels[idx + 2] = 0;
    pixels[idx + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export async function fetchWind(): Promise<WindData | null> {
  try {
    const res = await fetch(API_LASTWIND, { cache: 'no-store' });
    if (!res.ok) return null;

    const json = await res.json();
    const rawWindData = json.windData;

    const windArray = typeof rawWindData === 'string' ? JSON.parse(rawWindData) : rawWindData;
    if (!Array.isArray(windArray) || windArray.length < 2) return null;

    const uItem = windArray[0];
    const vItem = windArray[1];
    const uHeader = uItem.header;
    const vHeader = vItem.header;

    if (uHeader.nx !== vHeader.nx || uHeader.ny !== vHeader.ny) return null;

    const nx = uHeader.nx;
    const ny = uHeader.ny;

    const imageUrl = windDataToImage(uItem.data, vItem.data, nx, ny);
    if (!imageUrl) return null;

    const minLng = uHeader.lo1;
    const maxLng = uHeader.lo2;
    const maxLat = uHeader.la1;
    const minLat = uHeader.la2;

    return {
      imageUrl,
      time: json.synTime ?? '',
      extent: [minLng, minLat, maxLng, maxLat],
      uMin: -21.32,
      uMax: 26.8,
      vMin: -21.57,
      vMax: 21.42,
    };
  } catch { return null; }
}