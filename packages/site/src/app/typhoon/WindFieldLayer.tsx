/* ================================================================
   Canvas 风场图层 — 粒子动画渲染全球风场
   数据来源: https://typhoon.slt.zj.gov.cn/Api/LastWind
   GRIB2 U/V 分量, 360×181 网格 (1° 分辨率)
   ================================================================ */

import { useEffect, useRef, useCallback } from 'react';
import { useScene } from '@antv/aimapui';
import type { Scene } from '@antv/l7';
import type { WindFieldRawData } from './types';

// ── 配置常量 ──────────────────────────────────────────────────
const PARTICLE_COUNT = 12000;
const PARTICLE_AGE_MAX = 180;
const SPEED_SCALE = 0.35;
const FADE_OPACITY = 0.96;
const LINE_WIDTH = 1.0;

// 风速 → 颜色映射 (HSL)
function windSpeedToColor(speed: number): string {
  if (speed < 5) return `hsla(220, 80%, ${55 + speed * 3}%, 0.7)`;
  if (speed < 15) return `hsla(${190 - (speed - 5) * 3}, 85%, 55%, 0.75)`;
  if (speed < 30) return `hsla(${140 - (speed - 15) * 4}, 90%, 50%, 0.8)`;
  return `hsla(${Math.max(0, 80 - (speed - 30) * 3)}, 95%, 50%, 0.85)`;
}

// ── 双线性插值获取格点值 ──────────────────────────────────────
function interpolateValue(data: number[], nx: number, ny: number, lo1: number, la1: number, dx: number, dy: number, lng: number, lat: number): number {
  const x = (lng - lo1) / dx;
  const y = (la1 - lat) / dy;

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  if (x0 < 0 || x1 >= nx || y0 < 0 || y1 >= ny) return NaN;

  const fx = x - x0;
  const fy = y - y0;

  const i00 = y0 * nx + x0;
  const i10 = y0 * nx + x1;
  const i01 = y1 * nx + x0;
  const i11 = y1 * nx + x1;

  return (
    data[i00] * (1 - fx) * (1 - fy) +
    data[i10] * fx * (1 - fy) +
    data[i01] * (1 - fx) * fy +
    data[i11] * fx * fy
  );
}

// ── 粒子系统 ──────────────────────────────────────────────────
interface Particle {
  x: number;      // 经度
  y: number;      // 纬度
  age: number;
  speed: number;
}

function createParticles(count: number, bounds: { west: number; east: number; south: number; north: number }): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: bounds.west + Math.random() * (bounds.east - bounds.west),
      y: bounds.south + Math.random() * (bounds.north - bounds.south),
      age: Math.floor(Math.random() * PARTICLE_AGE_MAX),
      speed: 0,
    });
  }
  return particles;
}

// ── 组件 Props ────────────────────────────────────────────────
export interface WindFieldLayerProps {
  /** 风场原始网格数据 */
  windData: WindFieldRawData | null;
  /** 是否可见 */
  visible?: boolean;
  /** 透明度 0-1 */
  opacity?: number;
  /** 粒子数量 */
  particleCount?: number;
  /** z-index */
  zIndex?: number;
}

export default function WindFieldLayer({
  windData,
  visible = true,
  opacity = 0.8,
  particleCount = PARTICLE_COUNT,
  zIndex = -2,
}: WindFieldLayerProps) {
  const scene = useScene();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const prevBoundsRef = useRef<string>('');

  // 创建 Canvas 覆盖层 — 挂载到 L7 地图 Canvas 容器，确保在底图同级、所有图层下方
  useEffect(() => {
    if (!scene) return;

    // 优先使用 L7 提供的 getMapCanvasContainer 获取底图容器
    let targetContainer: HTMLElement | null = null;
    try {
      targetContainer = (scene as any).getMapCanvasContainer?.() || null;
    } catch { /* ignore */ }

    if (!targetContainer) {
      // fallback: 查找地图 canvas 容器
      const mapContainer = (scene as any).getContainer?.() || document.querySelector('.l7-container, .amap-container');
      if (mapContainer) {
        targetContainer = mapContainer.querySelector('canvas')?.parentElement || mapContainer;
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
    canvas.style.zIndex = '0';
    canvas.style.opacity = String(opacity);
    targetContainer.appendChild(canvas);
    canvasRef.current = canvas;

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      canvasRef.current = null;
    };
  }, [scene, opacity]);

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !windData || !visible) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 同步 canvas 尺寸
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // 获取当前地图范围（兼容 L7 不同版本的 getBounds 返回格式）
    const bounds = scene.getBounds();
    let mapBounds: { west: number; east: number; south: number; north: number };
    if (bounds && typeof (bounds as any).getSouthWest === 'function') {
      const sw = (bounds as any).getSouthWest();
      const ne = (bounds as any).getNorthEast();
      mapBounds = { west: sw.lng, east: ne.lng, south: sw.lat, north: ne.lat };
    } else if (Array.isArray(bounds) && bounds.length >= 2) {
      // L7 某些版本返回 [[west,south],[east,north]] 数组
      mapBounds = { west: bounds[0][0], south: bounds[0][1], east: bounds[1][0], north: bounds[1][1] };
    } else {
      // fallback: 使用 scene 的 center + zoom 估算
      const center = scene.getCenter();
      const zoom = scene.getZoom();
      const span = 180 / Math.pow(2, zoom - 1);
      mapBounds = { west: center.lng - span, east: center.lng + span, south: center.lat - span, north: center.lat + span };
    }
    const boundsKey = `${mapBounds.west.toFixed(2)},${mapBounds.east.toFixed(2)},${mapBounds.south.toFixed(2)},${mapBounds.north.toFixed(2)}`;

    // 地图范围变化时重新生成粒子
    if (boundsKey !== prevBoundsRef.current || particlesRef.current.length === 0) {
      prevBoundsRef.current = boundsKey;
      particlesRef.current = createParticles(particleCount, mapBounds);
    }

    // 淡出旧轨迹（保留背景色以增强对比）
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = `rgba(0,0,0,${FADE_OPACITY})`;
    ctx.fillRect(0, 0, width, height);

    // 绘制半透明背景底色，增强粒子轨迹可见性
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'rgba(10, 15, 30, 0.6)';
    ctx.fillRect(0, 0, width, height);

    // 绘制新轨迹段
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = LINE_WIDTH;

    const particles = particlesRef.current;
    const { uData, vData, nx, ny, lo1, la1, dx, dy } = windData;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 获取当前位置的风速
      const u = interpolateValue(uData, nx, ny, lo1, la1, dx, dy, p.x, p.y);
      const v = interpolateValue(vData, nx, ny, lo1, la1, dx, dy, p.x, p.y);

      if (isNaN(u) || isNaN(v)) {
        // 超出网格范围，重置粒子
        p.x = mapBounds.west + Math.random() * (mapBounds.east - mapBounds.west);
        p.y = mapBounds.south + Math.random() * (mapBounds.north - mapBounds.south);
        p.age = 0;
        continue;
      }

      const speed = Math.sqrt(u * u + v * v);
      p.speed = speed;

      // 将经纬度转换为屏幕像素
      const pixelStart = scene.lngLatToContainer([p.x, p.y]);
      if (!pixelStart) continue;

      // 计算下一位置 (简单欧拉积分)
      const dt = SPEED_SCALE;
      const nextX = p.x + u * dt * 0.01;
      const nextY = p.y + v * dt * 0.01;

      const pixelEnd = scene.lngLatToContainer([nextX, nextY]);
      if (!pixelEnd) continue;

      // 绘制线段
      ctx.beginPath();
      ctx.moveTo(pixelStart.x, pixelStart.y);
      ctx.lineTo(pixelEnd.x, pixelEnd.y);
      ctx.strokeStyle = windSpeedToColor(speed);
      ctx.stroke();

      // 更新粒子位置
      p.x = nextX;
      p.y = nextY;
      p.age++;

      // 老化或超出视口则重置
      if (
        p.age > PARTICLE_AGE_MAX ||
        p.x < mapBounds.west || p.x > mapBounds.east ||
        p.y < mapBounds.south || p.y > mapBounds.north
      ) {
        p.x = mapBounds.west + Math.random() * (mapBounds.east - mapBounds.west);
        p.y = mapBounds.south + Math.random() * (mapBounds.north - mapBounds.south);
        p.age = 0;
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [scene, visible, particleCount, windData]);

  // 启动/停止动画
  useEffect(() => {
    if (!visible || !windData) {
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
  }, [visible, animate, windData]);

  // 监听地图移动/缩放以重绘
  useEffect(() => {
    if (!scene || !visible) return;

    const handleViewChange = () => {
      prevBoundsRef.current = ''; // 强制下次帧重新检查边界
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
