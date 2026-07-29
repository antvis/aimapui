/* ================================================================
   WindFieldLayer — Canvas 粒子风场复合图层

   基于 Canvas 2D 的粒子动画风场可视化，支持 U/V 分量网格数据。
   粒子沿风向移动，拖尾淡出，风速→HSL 颜色映射。

   标准数据格式:
   ```ts
   interface WindFieldData {
     uData: Float32Array | number[];  // U 分量（经向风，正值向东）
     vData: Float32Array | number[];  // V 分量（纬向风，正值向北）
     cols: number;                     // 网格列数
     rows: number;                     // 网格行数
     originLng: number;               // 起始经度
     originLat: number;               // 起始纬度
     deltaLng: number;                // 经度步长（度）
     deltaLat: number;                // 纬度步长（度）
   }
   ```

   @example
   ```tsx
   <WindFieldLayer
     source={{ uData, vData, cols: 360, rows: 181, originLng: -180, originLat: 90, deltaLng: 1, deltaLat: 1 }}
     particleCount={8000}
   />
   ```
   ================================================================ */

import { useEffect, useRef, useCallback } from 'react';
import { useScene } from '../../context/SceneContext';
import type { Scene } from '@antv/l7';

// ── 标准数据格式 ──────────────────────────────────────────────────

export interface WindFieldData {
  /** U 方向分量（经向风，正值=向东） */
  uData: Float32Array | number[];
  /** V 方向分量（纬向风，正值=向北） */
  vData: Float32Array | number[];
  /** 网格列数 */
  cols: number;
  /** 网格行数 */
  rows: number;
  /** 起始经度（网格左上角） */
  originLng: number;
  /** 起始纬度（网格左上角） */
  originLat: number;
  /** 经度步长（度） */
  deltaLng: number;
  /** 纬度步长（度） */
  deltaLat: number;
}

// ── Props ─────────────────────────────────────────────────────────

export interface WindFieldLayerProps {
  /** 风场网格数据 */
  source: WindFieldData;
  /** 粒子数量，默认 12000 */
  particleCount?: number;
  /** 粒子速度缩放，默认 0.35 */
  speedScale?: number;
  /** 粒子最大年龄（帧），默认 180 */
  particleMaxAge?: number;
  /** 轨迹淡出速率 0~1，默认 0.96（越大淡出越慢） */
  fadeOpacity?: number;
  /** 线宽，默认 1.0 */
  lineWidth?: number;
  /** 透明度，默认 0.8 */
  opacity?: number;
  /** 是否可见，默认 true */
  visible?: boolean;
  /** z-index，默认 0 */
  zIndex?: number;
  /** 是否显示风速背景渐变，默认 true */
  showSpeedBackground?: boolean;
  /** 风速背景透明度 0~1，默认 0.15 */
  speedBgOpacity?: number;
}

// ── 默认值 ────────────────────────────────────────────────────────

const DEFAULT_PARTICLE_COUNT = 12000;
const DEFAULT_SPEED_SCALE = 0.35;
const DEFAULT_PARTICLE_MAX_AGE = 180;
const DEFAULT_FADE_OPACITY = 0.96;
const DEFAULT_LINE_WIDTH = 1.0;

// ── 风速 → HSL 颜色映射 ───────────────────────────────────────────

function windSpeedToColor(speed: number): string {
  if (speed < 5) return `hsla(220, 80%, ${55 + speed * 3}%, 0.7)`;
  if (speed < 15) return `hsla(${190 - (speed - 5) * 3}, 85%, 55%, 0.75)`;
  if (speed < 30) return `hsla(${140 - (speed - 15) * 4}, 90%, 50%, 0.8)`;
  return `hsla(${Math.max(0, 80 - (speed - 30) * 3)}, 95%, 50%, 0.85)`;
}

// ── HSL → RGBA 转换（用于热力图 ImageData）───────────────────────

function hslToRgba(hsl: string): [number, number, number, number] {
  const match = hsl.match(/hsla?\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)/);
  if (!match) return [0, 0, 0, 255];
  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;
  const a = match[4] ? Number(match[4]) : 1;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v, Math.round(a * 255)];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    Math.round(a * 255),
  ];
}

// ── 经度标准化（支持地图循环/世界环绕）────────────────────────────

function normalizeLng(
  lng: number,
  originLng: number,
  cols: number,
  deltaLng: number,
): number {
  const gridWidth = cols * deltaLng;
  let n = lng;
  while (n < originLng) n += gridWidth;
  while (n >= originLng + gridWidth) n -= gridWidth;
  return n;
}

// ── 双线性插值 ────────────────────────────────────────────────────

function bilinearInterp(
  data: Float32Array | number[],
  cols: number,
  rows: number,
  originLng: number,
  originLat: number,
  deltaLng: number,
  deltaLat: number,
  lng: number,
  lat: number,
): number {
  const normLng = normalizeLng(lng, originLng, cols, deltaLng);
  const x = (normLng - originLng) / deltaLng;
  const y = (originLat - lat) / deltaLat;

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  if (x0 < 0 || x1 >= cols || y0 < 0 || y1 >= rows) return NaN;

  const fx = x - x0;
  const fy = y - y0;

  const i00 = y0 * cols + x0;
  const i10 = y0 * cols + x1;
  const i01 = y1 * cols + x0;
  const i11 = y1 * cols + x1;

  return (
    data[i00] * (1 - fx) * (1 - fy) +
    data[i10] * fx * (1 - fy) +
    data[i01] * (1 - fx) * fy +
    data[i11] * fx * fy
  );
}

// ── 粒子系统 ──────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  age: number;
  speed: number;
}

interface MapBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

function createParticles(count: number, bounds: MapBounds): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: bounds.west + Math.random() * (bounds.east - bounds.west),
      y: bounds.south + Math.random() * (bounds.north - bounds.south),
      age: Math.floor(Math.random() * DEFAULT_PARTICLE_MAX_AGE),
      speed: 0,
    });
  }
  return particles;
}

function getMapBounds(scene: Scene): MapBounds {
  const bounds = scene.getBounds();

  // L7 AMap 包装格式: getBounds() 返回 AMap.Bounds 实例
  if (bounds && typeof (bounds as any).getSouthWest === 'function') {
    const sw = (bounds as any).getSouthWest();
    const ne = (bounds as any).getNorthEast();
    return { west: sw.lng, east: ne.lng, south: sw.lat, north: ne.lat };
  }
  // L7 数组格式: [[west, south], [east, north]]
  if (Array.isArray(bounds) && bounds.length >= 2) {
    return {
      west: bounds[0][0],
      south: bounds[0][1],
      east: bounds[1][0],
      north: bounds[1][1],
    };
  }
  // fallback: center + zoom 估算
  const center = scene.getCenter();
  const zoom = scene.getZoom();
  const span = 180 / Math.pow(2, zoom - 1);
  return {
    west: center.lng - span,
    east: center.lng + span,
    south: center.lat - span,
    north: center.lat + span,
  };
}

// ── 组件 ──────────────────────────────────────────────────────────

export function WindFieldLayer({
  source,
  particleCount = DEFAULT_PARTICLE_COUNT,
  speedScale = DEFAULT_SPEED_SCALE,
  particleMaxAge = DEFAULT_PARTICLE_MAX_AGE,
  fadeOpacity = DEFAULT_FADE_OPACITY,
  lineWidth = DEFAULT_LINE_WIDTH,
  opacity = 0.8,
  visible = true,
  zIndex = 0,
  showSpeedBackground = true,
  speedBgOpacity = 0.15,
}: WindFieldLayerProps) {
  const scene = useScene();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const prevBoundsRef = useRef<string>('');

  // ── Canvas 创建/销毁 ──────────────────────────────────────────
  useEffect(() => {
    if (!scene || !visible) return;

    let targetContainer: HTMLElement | null = null;
    try {
      targetContainer = (scene as any).getMapCanvasContainer?.() || null;
    } catch { /* ignore */ }

    if (!targetContainer) {
      const mapEl = (scene as any).getContainer?.()
        || document.querySelector('.l7-container, .amap-container');
      if (mapEl) {
        targetContainer = mapEl.querySelector('canvas')?.parentElement || mapEl;
      }
    }
    if (!targetContainer) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = String(zIndex);
    canvas.style.opacity = String(opacity);
    targetContainer.appendChild(canvas);
    canvasRef.current = canvas;

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      canvasRef.current = null;
      particlesRef.current = [];
    };
  }, [scene, visible, zIndex, opacity]);

  // ── 动画循环 ──────────────────────────────────────────────────
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source || !visible || !scene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 同步尺寸（响应容器变化）
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const mapBounds = getMapBounds(scene);
    const boundsKey = [
      mapBounds.west.toFixed(2),
      mapBounds.east.toFixed(2),
      mapBounds.south.toFixed(2),
      mapBounds.north.toFixed(2),
    ].join(',');

    // 地图范围变化时重新生成粒子
    if (boundsKey !== prevBoundsRef.current || particlesRef.current.length === 0) {
      prevBoundsRef.current = boundsKey;
      particlesRef.current = createParticles(particleCount, mapBounds);
    }

    const { uData, vData, cols, rows, originLng, originLat, deltaLng, deltaLat } = source;

    // 淡出旧轨迹
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
    ctx.fillRect(0, 0, width, height);

    // 半透明背景底色，增强粒子可见性
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'rgba(10, 15, 30, 0.6)';
    ctx.fillRect(0, 0, width, height);

    // ── 风速热力图背景 ──────────────────────────────────────
    if (showSpeedBackground) {
      ctx.globalCompositeOperation = 'source-over';
      const prevAlpha = ctx.globalAlpha;
      // 低分辨率离屏 canvas 生成热力图纹理，仅在地图范围变化时重建
      const hmWidth = 160;
      const hmHeight = 80;
      let hm = heatmapRef.current;
      if (!hm || hm.width !== hmWidth || hm.height !== hmHeight) {
        hm = document.createElement('canvas');
        hm.width = hmWidth;
        hm.height = hmHeight;
        heatmapRef.current = hm;
      }

      if (boundsKey !== prevBoundsRef.current) {
        const hmCtx = hm.getContext('2d');
        if (hmCtx) {
          const imgData = hmCtx.createImageData(hmWidth, hmHeight);
          const lngSpan = mapBounds.east - mapBounds.west;
          const latSpan = mapBounds.north - mapBounds.south;

          for (let py = 0; py < hmHeight; py++) {
            for (let px = 0; px < hmWidth; px++) {
              // 屏幕像素 → 地理坐标（线性映射，适配 Mercator 投影）
              const lng = mapBounds.west + (px / hmWidth) * lngSpan;
              const lat = mapBounds.north - (py / hmHeight) * latSpan;

              const u = bilinearInterp(uData, cols, rows, originLng, originLat, deltaLng, deltaLat, lng, lat);
              const v = bilinearInterp(vData, cols, rows, originLng, originLat, deltaLng, deltaLat, lng, lat);
              if (isNaN(u) || isNaN(v)) continue;
              const speed = Math.sqrt(u * u + v * v);

              const color = windSpeedToColor(speed);
              const rgba = hslToRgba(color);
              const idx = (py * hmWidth + px) * 4;
              imgData.data[idx] = rgba[0];
              imgData.data[idx + 1] = rgba[1];
              imgData.data[idx + 2] = rgba[2];
              imgData.data[idx + 3] = rgba[3];
            }
          }
          hmCtx.putImageData(imgData, 0, 0);
        }
      }

      ctx.globalAlpha = speedBgOpacity;
      ctx.drawImage(hm, 0, 0, width, height);
      ctx.globalAlpha = prevAlpha;
    }

    // 绘制新轨迹段
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = lineWidth;

    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 采样当前位置的风速
      const u = bilinearInterp(uData, cols, rows, originLng, originLat, deltaLng, deltaLat, p.x, p.y);
      const v = bilinearInterp(vData, cols, rows, originLng, originLat, deltaLng, deltaLat, p.x, p.y);

      if (isNaN(u) || isNaN(v)) {
        p.x = mapBounds.west + Math.random() * (mapBounds.east - mapBounds.west);
        p.y = mapBounds.south + Math.random() * (mapBounds.north - mapBounds.south);
        p.age = 0;
        continue;
      }

      const speed = Math.sqrt(u * u + v * v);
      p.speed = speed;

      // 坐标投影
      const pixelStart = scene.lngLatToContainer([p.x, p.y]);
      if (!pixelStart) continue;

      // 欧拉积分前进
      const dt = speedScale;
      const nextX = p.x + u * dt * 0.01;
      const nextY = p.y + v * dt * 0.01;

      const pixelEnd = scene.lngLatToContainer([nextX, nextY]);
      if (!pixelEnd) continue;

      // 绘制风迹线段
      ctx.beginPath();
      ctx.moveTo(pixelStart.x, pixelStart.y);
      ctx.lineTo(pixelEnd.x, pixelEnd.y);
      ctx.strokeStyle = windSpeedToColor(speed);
      ctx.stroke();

      // 更新位置
      p.x = nextX;
      p.y = nextY;
      p.age++;

      // 经度环绕：支持地图循环/世界副本
      const gridWidth = cols * deltaLng;
      const maxLng = originLng + gridWidth;
      if (p.x < originLng) p.x += gridWidth;
      else if (p.x > maxLng) p.x -= gridWidth;

      // 纬度越界或老化 → 重生
      if (
        p.age > particleMaxAge ||
        p.y < mapBounds.south || p.y > mapBounds.north
      ) {
        p.x = mapBounds.west + Math.random() * (mapBounds.east - mapBounds.west);
        p.y = mapBounds.south + Math.random() * (mapBounds.north - mapBounds.south);
        p.age = 0;
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [scene, visible, particleCount, particleMaxAge, speedScale, fadeOpacity, lineWidth, source]);

  // ── 启动/停止动画 ────────────────────────────────────────────
  useEffect(() => {
    if (!visible || !source) {
      cancelAnimationFrame(animFrameRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [visible, animate, source]);

  // ── 监听地图移动/缩放以重建粒子 ──────────────────────────────
  useEffect(() => {
    if (!scene || !visible) return;

    const handleViewChange = () => {
      prevBoundsRef.current = '';
    };

    scene.on('mapmove', handleViewChange);
    scene.on('zoomchange', handleViewChange);
    return () => {
      scene.off('mapmove', handleViewChange);
      scene.off('zoomchange', handleViewChange);
    };
  }, [scene, visible]);

  return null;
}

export default WindFieldLayer;