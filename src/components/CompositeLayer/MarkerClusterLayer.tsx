import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import type { LayerSchema } from '../../schema/types';
import { Marker } from '../Interaction/Marker';

interface ClusterPoint {
  id: string;
  lng: number;
  lat: number;
  properties: Record<string, unknown>;
}

interface ClusterItem {
  id: string;
  lng: number;
  lat: number;
  points: ClusterPoint[];
  isCluster: boolean;
}

export interface MarkerClusterLayerProps {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  gridSize?: number;
  minClusterSize?: number;
  animationDuration?: number;
  easing?: string;

  onPointClick?: (point: ClusterPoint) => void;
  onClusterClick?: (cluster: ClusterItem) => void;
}

/**
 * Marker 聚合图层（基于 DOM Marker）
 *
 * 设计规范：Cartographic Precision System v1.2.0
 * - 视觉分级：小规模(2-99)、中规模(100-999)、大规模(1000+)
 * - 网格大小：60px，最小聚合阈值：2 pts
 * - 动画时长：300ms，插值：cubic-bezier(0.4, 0, 0.2, 1)
 * - 交互：悬停放大(scale-110)、点击缩放(FitBounds)、最大级别蜘蛛布局(Spiderfier)
 */
export function MarkerClusterLayer({
  source,
  sourceType = 'geojson',
  sourceConfig,
  gridSize = 60,
  minClusterSize = 2,
  animationDuration = 300,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  onPointClick,
  onClusterClick,
}: MarkerClusterLayerProps) {
  const scene = useScene();
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const prevClustersRef = useRef<Map<string, ClusterItem>>(new Map());

  const points = useMemo(() => normalizePoints(source, sourceType, sourceConfig), [source, sourceType, sourceConfig]);

  const recomputeClusters = useCallback(() => {
    if (!scene || points.length === 0) {
      setClusters([]);
      prevClustersRef.current.clear();
      return;
    }

    try {
      const mapsService = (scene as any).mapService;
      if (!mapsService) return;

      const cells = new Map<string, ClusterPoint[]>();

      for (const p of points) {
        const pixel = mapsService.lngLatToContainer([p.lng, p.lat]);
        if (!pixel) continue;

        const gx = Math.floor(pixel.x / gridSize);
        const gy = Math.floor(pixel.y / gridSize);
        const key = `${gx}:${gy}`;

        const arr = cells.get(key);
        if (arr) arr.push(p);
        else cells.set(key, [p]);
      }

      const next: ClusterItem[] = [];
      cells.forEach((arr, key) => {
        if (arr.length >= minClusterSize) {
          const lng = arr.reduce((s, i) => s + i.lng, 0) / arr.length;
          const lat = arr.reduce((s, i) => s + i.lat, 0) / arr.length;
          next.push({ id: `cluster-${key}`, lng, lat, points: arr, isCluster: true });
        } else {
          arr.forEach((p) => {
            next.push({ id: `point-${p.id}-${p.lng}-${p.lat}`, lng: p.lng, lat: p.lat, points: [p], isCluster: false });
          });
        }
      });

      // 边界吸附：保留前一帧位置用于平滑过渡
      const prevMap = prevClustersRef.current;
      const merged = next.map((item) => {
        const prev = prevMap.get(item.id);
        if (prev && prev.isCluster === item.isCluster) {
          return { ...item, lng: prev.lng * 0.7 + item.lng * 0.3, lat: prev.lat * 0.7 + item.lat * 0.3 };
        }
        return item;
      });

      prevClustersRef.current = new Map(merged.map((c) => [c.id, c]));
      setClusters(merged);
    } catch {
      // ignore
    }
  }, [scene, points, gridSize, minClusterSize]);

  useEffect(() => {
    if (!scene) return;

    const mapsService = (scene as any).mapService;

    // 确保地图完全加载后再计算聚合
    const doInit = () => {
      // 延迟一帧，确保地图视口已准备好
      requestAnimationFrame(() => {
        recomputeClusters();
      });
    };

    if ((scene as any).loaded) {
      doInit();
    } else {
      scene.once('loaded', doInit);
    }

    const onCam = () => {
      setExpandedClusterId(null);
      recomputeClusters();
    };

    mapsService?.on?.('camerachange', onCam);
    mapsService?.on?.('zoomchange', onCam);
    mapsService?.on?.('move', onCam);

    return () => {
      scene.off('loaded', doInit);
      mapsService?.off?.('camerachange', onCam);
      mapsService?.off?.('zoomchange', onCam);
      mapsService?.off?.('move', onCam);
    };
  }, [scene, recomputeClusters]);

  const handleClusterClick = useCallback((cluster: ClusterItem) => {
    if (!scene || !cluster.isCluster) return;
    onClusterClick?.(cluster);

    try {
      const mapsService = (scene as any).mapService;
      const zoom = scene.getZoom();
      const maxZoom = mapsService?.getMaxZoom?.() ?? 18;

      if (zoom >= maxZoom - 0.1) {
        setExpandedClusterId((prev) => (prev === cluster.id ? null : cluster.id));
        return;
      }

      const lons = cluster.points.map((p) => p.lng);
      const lats = cluster.points.map((p) => p.lat);
      const sw: [number, number] = [Math.min(...lons), Math.min(...lats)];
      const ne: [number, number] = [Math.max(...lons), Math.max(...lats)];

      scene.fitBounds([sw, ne], { padding: [40, 40, 40, 40], duration: animationDuration, easing });
    } catch {
      // ignore
    }
  }, [scene, onClusterClick, animationDuration, easing]);

  const spiderItems = useMemo(() => {
    if (!scene || !expandedClusterId) return [] as Array<{ id: string; lng: number; lat: number; point: ClusterPoint }>;
    const cluster = clusters.find((c) => c.id === expandedClusterId && c.isCluster);
    if (!cluster) return [];

    const mapsService = (scene as any).mapService;
    if (!mapsService) return [];

    const centerPixel = mapsService.lngLatToContainer([cluster.lng, cluster.lat]);
    if (!centerPixel) return [];

    const n = cluster.points.length;
    const radius = Math.max(24, Math.min(72, 18 + n * 2));

    return cluster.points.map((p, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const px = centerPixel.x + Math.cos(angle) * radius;
      const py = centerPixel.y + Math.sin(angle) * radius;
      const ll = mapsService.containerToLngLat([px, py]);
      return {
        id: `spider-${cluster.id}-${p.id}`,
        lng: ll.lng,
        lat: ll.lat,
        point: p,
      };
    });
  }, [scene, expandedClusterId, clusters]);

  // Spiderfier 连线端点（用于绘制连接线）
  const spiderLines = useMemo(() => {
    if (!scene || !expandedClusterId) return [] as Array<{ id: string; lng: number; lat: number }>;
    const cluster = clusters.find((c) => c.id === expandedClusterId && c.isCluster);
    if (!cluster) return [];

    const mapsService = (scene as any).mapService;
    if (!mapsService) return [];

    const centerPixel = mapsService.lngLatToContainer([cluster.lng, cluster.lat]);
    if (!centerPixel) return [];

    const n = cluster.points.length;
    const radius = Math.max(24, Math.min(72, 18 + n * 2));

    return cluster.points.map((p, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const px = centerPixel.x + Math.cos(angle) * radius;
      const py = centerPixel.y + Math.sin(angle) * radius;
      const ll = mapsService.containerToLngLat([px, py]);
      return {
        id: `spider-line-${cluster.id}-${p.id}`,
        lng: ll.lng,
        lat: ll.lat,
      };
    });
  }, [scene, expandedClusterId, clusters]);

  return (
    <>
      {/* Spiderfier 连接线 */}
      {expandedClusterId && spiderLines.length > 0 && (() => {
        const cluster = clusters.find((c) => c.id === expandedClusterId && c.isCluster);
        if (!cluster) return null;
        return spiderLines.map((line) => (
          <Marker
            key={line.id}
            longitude={line.lng}
            latitude={line.lat}
            content={
              <SpiderLine
                centerLng={cluster.lng}
                centerLat={cluster.lat}
                lineLng={line.lng}
                lineLat={line.lat}
                animationDuration={animationDuration}
                easing={easing}
              />
            }
          />
        ));
      })()}

      {clusters.map((item) => {
        if (!item.isCluster) {
          return (
            <Marker
              key={item.id}
              longitude={item.lng}
              latitude={item.lat}
              content={
                <div
                  title={String(item.points[0]?.properties?.name ?? '单点')}
                  onClick={() => onPointClick?.(item.points[0])}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 9999,
                    background: '#2563eb',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 10px rgba(37,99,235,.5), 0 0 0 3px rgba(37,99,235,.15)',
                    transition: `transform ${animationDuration}ms ${easing}`,
                    cursor: 'pointer',
                  }}
                />
              }
            />
          );
        }

        const count = item.points.length;
        const visual = getClusterVisual(count);
        const isHovered = hoveredClusterId === item.id;

        return (
          <Marker
            key={item.id}
            longitude={item.lng}
            latitude={item.lat}
            content={
              <div
                title={`包含 ${count} 个要素`}
                onClick={() => handleClusterClick(item)}
                onMouseEnter={() => setHoveredClusterId(item.id)}
                onMouseLeave={() => setHoveredClusterId((prev) => (prev === item.id ? null : prev))}
                style={{
                  width: visual.size,
                  height: visual.size,
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: visual.fontWeight,
                  fontSize: visual.fontSize,
                  background: visual.background,
                  border: visual.border,
                  boxShadow: visual.shadow,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: `all ${animationDuration}ms ${easing}`,
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {visual.pulse && (
                  <span
                    style={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: 9999,
                      background: 'rgba(37,99,235,0.25)',
                      animation: 'aimapkit-cluster-pulse 1.6s ease-out infinite',
                    }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{count}</span>
              </div>
            }
          />
        );
      })}

      {spiderItems.map((s) => (
        <Marker
          key={s.id}
          longitude={s.lng}
          latitude={s.lat}
          content={
            <div
              title={String(s.point.properties?.name ?? s.point.id)}
              onClick={() => onPointClick?.(s.point)}
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: '#fff',
                border: '2px solid #2563eb',
                boxShadow: '0 2px 8px rgba(0,0,0,.2)',
                cursor: 'pointer',
              }}
            />
          }
        />
      ))}
    </>
  );
}

/**
 * Spiderfier 连接线组件
 * 从中心点延伸至具体 Marker 的细实线
 */
function SpiderLine({
  centerLng,
  centerLat,
  lineLng,
  lineLat,
  animationDuration,
  easing,
}: {
  centerLng: number;
  centerLat: number;
  lineLng: number;
  lineLat: number;
  animationDuration: number;
  easing: string;
}) {
  const scene = useScene();
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!scene) return;
    const mapsService = (scene as any).mapService;
    if (!mapsService) return;

    const update = () => {
      const start = mapsService.lngLatToContainer([centerLng, centerLat]);
      const end = mapsService.lngLatToContainer([lineLng, lineLat]);
      if (!start || !end) return;

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      setStyle({
        position: 'absolute',
        left: 0,
        top: 0,
        width: length,
        height: 1,
        background: 'rgba(195, 198, 215, 0.5)',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        transition: `width ${animationDuration}ms ${easing}`,
        pointerEvents: 'none',
      });
    };

    update();
    mapsService?.on?.('move', update);
    mapsService?.on?.('zoomchange', update);

    return () => {
      mapsService?.off?.('move', update);
      mapsService?.off?.('zoomchange', update);
    };
  }, [scene, centerLng, centerLat, lineLng, lineLat, animationDuration, easing]);

  return <div style={style} />;
}

/**
 * 获取聚合点视觉样式
 * 严格遵循设计规范分级系统
 */
function getClusterVisual(count: number) {
  if (count >= 1000) {
    return {
      size: 48,
      fontSize: 14,
      fontWeight: 700,
      background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
      border: '2px solid rgba(255,255,255,0.55)',
      shadow: '0 10px 24px rgba(37,99,235,.45)',
      pulse: true,
    };
  }
  if (count >= 100) {
    return {
      size: 40,
      fontSize: 13,
      fontWeight: 700,
      background: 'rgba(37,99,235,0.30)',
      border: '2px solid rgba(255,255,255,0.5)',
      shadow: '0 6px 16px rgba(37,99,235,.25)',
      pulse: false,
    };
  }
  return {
    size: 32,
    fontSize: 12,
    fontWeight: 600,
    background: 'radial-gradient(circle, #2563eb 60%, rgba(37,99,235,0.20) 61%)',
    border: '1px solid rgba(255,255,255,0.55)',
    shadow: '0 4px 12px rgba(37,99,235,.2)',
    pulse: false,
  };
}

function normalizePoints(source: unknown, sourceType?: string, sourceConfig?: LayerSchema['sourceConfig']): ClusterPoint[] {
  if (!source) return [];

  if (sourceType === 'geojson' && typeof source === 'object' && source !== null) {
    const geo = source as Record<string, unknown>;
    const features = Array.isArray(geo.features) ? geo.features : [];
    return features
      .map((f, idx) => {
        const ff = f as any;
        const coords = ff?.geometry?.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) return null;
        return {
          id: String(ff?.properties?.id ?? ff?.properties?.Id ?? idx),
          lng: Number(coords[0]),
          lat: Number(coords[1]),
          properties: (ff?.properties ?? {}) as Record<string, unknown>,
        } as ClusterPoint;
      })
      .filter(Boolean) as ClusterPoint[];
  }

  if (Array.isArray(source)) {
    const xKey = sourceConfig?.x ?? 'lng';
    const yKey = sourceConfig?.y ?? 'lat';

    return source
      .map((item, idx) => {
        const obj = item as Record<string, unknown>;
        const lng = Number(obj[xKey]);
        const lat = Number(obj[yKey]);
        if (Number.isNaN(lng) || Number.isNaN(lat)) return null;
        return {
          id: String(obj.id ?? idx),
          lng,
          lat,
          properties: obj,
        } as ClusterPoint;
      })
      .filter(Boolean) as ClusterPoint[];
  }

  return [];
}

export default MarkerClusterLayer;
