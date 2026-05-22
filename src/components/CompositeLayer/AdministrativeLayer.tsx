import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { PolygonLayer } from '../Layer/PolygonLayer';
import { LineLayer } from '../Layer/LineLayer';
import { PointLayer } from '../Layer/PointLayer';

/** 行政层级 */
export type AdministrativeLevel = 'province' | 'city' | 'district';

/** 下钻路径节点 */
export interface DrillPathNode {
  level: AdministrativeLevel;
  name: string;
  adcode?: string | number;
}

/** 业务数据匹配项 */
export interface BusinessDataItem {
  name?: string;
  adcode?: string | number;
  value?: number;
  [key: string]: unknown;
}

/** 色阶预设（低值到高值，确保低值区域也有足够辨识度） */
export const ADMIN_SEQUENTIAL_COLORS = ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1d4ed8', '#1e3a8a'] as const;

/** 内置行政区划数据源 */
export const DEFAULT_PROVINCE_SOURCE = 'https://mdn.alipayobjects.com/antforest/afts/file/A*T2OJQ7XZzeEAAAAAgCAAAAgAerd2AQ/original_中国_省.json';
export const DEFAULT_CITY_SOURCE = 'https://mdn.alipayobjects.com/antforest/afts/file/A*Xd8TQoduwj8AAAAAgEAAAAgAerd2AQ/original_中国_市.json';
export const DEFAULT_DISTRICT_SOURCE = 'https://mdn.alipayobjects.com/portal_moelhz/afts/file/A*Rb96Tac1p8EAAAAAgKAAAAgAegAAAQ';

export interface AdministrativeLayerProps {
  /** 省级 GeoJSON 数据 URL 或对象，默认内置全国省级数据 */
  provinceSource?: string | Record<string, unknown>;
  /** 市级 GeoJSON 数据 URL 或对象，默认内置全国市级数据 */
  citySource?: string | Record<string, unknown>;
  /** 县级 GeoJSON 数据 URL 或对象，默认内置全国县级数据 */
  districtSource?: string | Record<string, unknown>;

  /** 当前显示层级（非下钻模式时使用） */
  level?: AdministrativeLevel;
  /** 是否启用下钻模式 */
  drillEnabled?: boolean;
  /** 下钻路径（受控模式） */
  drillPath?: DrillPathNode[];
  /** 下钻回调 */
  onDrill?: (path: DrillPathNode[]) => void;

  /** 业务数据，通过 name 或 adcode 与地理数据关联 */
  data?: BusinessDataItem[];
  /** 关联字段（地理数据属性名） */
  joinField?: string;
  /** 业务数据匹配字段 */
  dataJoinField?: string;
  /** 数值字段名（用于色阶映射） */
  valueField?: string;

  /** 色阶颜色数组 */
  colors?: string[];
  /** 填充透明度 */
  fillOpacity?: number;
  /** 描边颜色 */
  strokeColor?: string;
  /** 描边宽度 */
  strokeWidth?: number;
  /** 非焦点区域透明度（下钻时） */
  dimOpacity?: number;

  /** 是否显示标签 */
  showLabel?: boolean;
  /** 标签字段名 */
  labelField?: string;
  /** 标签字号 */
  labelSize?: number;

  /** hover 高亮 */
  hoverHighlight?: boolean;
  /** 点击选中 */
  clickSelect?: boolean;
  /** Tooltip 显示 */
  showTooltip?: boolean;
  /** Tooltip 自定义字段 */
  tooltipFields?: string[];

  /** 区域点击事件 */
  onRegionClick?: (feature: Record<string, unknown>, level: AdministrativeLevel) => void;
  /** 图层 zIndex */
  zIndex?: number;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, unknown>;
    geometry: Record<string, unknown>;
  }>;
}

/**
 * 中国行政区划复合图层
 *
 * 内置全国省/市/县三级 GeoJSON 数据，支持下钻模式与业务数据关联色阶映射。
 * 设计参考 src/design/administrative-layer.md
 */
export function ChinaAdministrativeLayer({
  provinceSource = DEFAULT_PROVINCE_SOURCE,
  citySource = DEFAULT_CITY_SOURCE,
  districtSource = DEFAULT_DISTRICT_SOURCE,
  level = 'province',
  drillEnabled = false,
  drillPath: controlledDrillPath,
  onDrill,
  data,
  joinField = 'name',
  dataJoinField = 'name',
  valueField = 'value',
  colors = [...ADMIN_SEQUENTIAL_COLORS],
  fillOpacity = 0.8,
  strokeColor = 'rgba(255,255,255,0.5)',
  strokeWidth = 1.5,
  dimOpacity = 0.12,
  showLabel = true,
  labelField = 'name',
  labelSize = 12,
  hoverHighlight = true,
  clickSelect = true,
  showTooltip = true,
  tooltipFields,
  onRegionClick,
  zIndex = 0,
}: AdministrativeLayerProps) {
  const scene = useScene();

  // 数据加载状态
  const [provinceData, setProvinceData] = useState<GeoJSONFeatureCollection | null>(null);
  const [cityData, setCityData] = useState<GeoJSONFeatureCollection | null>(null);
  const [districtData, setDistrictData] = useState<GeoJSONFeatureCollection | null>(null);

  // 内部下钻路径
  const [internalDrillPath, setInternalDrillPath] = useState<DrillPathNode[]>([
    { level: 'province', name: '中国' },
  ]);

  const drillPath = controlledDrillPath ?? internalDrillPath;

  // 当前激活层级
  const currentLevel: AdministrativeLevel = drillEnabled
    ? inferLevelFromPath(drillPath)
    : level;

  // 选中与 hover 状态
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // 加载远程数据
  useEffect(() => {
    loadGeoJSON(provinceSource, setProvinceData);
  }, [provinceSource]);

  useEffect(() => {
    if (citySource) loadGeoJSON(citySource, setCityData);
  }, [citySource]);

  useEffect(() => {
    if (districtSource) loadGeoJSON(districtSource, setDistrictData);
  }, [districtSource]);

  // 根据当前层级获取活动数据源
  const activeGeoData = useMemo(() => {
    switch (currentLevel) {
      case 'city': return cityData;
      case 'district': return districtData;
      default: return provinceData;
    }
  }, [currentLevel, provinceData, cityData, districtData]);

  // 业务数据关联：将数值注入 GeoJSON properties
  const mergedGeoData = useMemo(() => {
    if (!activeGeoData || !data || data.length === 0) return activeGeoData;
    return mergeBusinessData(activeGeoData, data, joinField, dataJoinField, valueField);
  }, [activeGeoData, data, joinField, dataJoinField, valueField]);

  // 下钻模式下，筛选子级数据
  const filteredGeoData = useMemo(() => {
    if (!drillEnabled || drillPath.length <= 1) return mergedGeoData;
    if (!mergedGeoData) return null;

    const parentNode = drillPath[drillPath.length - 1];
    if (!parentNode.adcode && !parentNode.name) return mergedGeoData;

    return filterByParent(mergedGeoData, parentNode, joinField);
  }, [drillEnabled, drillPath, mergedGeoData, joinField]);

  // 父级数据（下钻时用于显示虚化背景）
  const parentGeoData = useMemo(() => {
    if (!drillEnabled || drillPath.length <= 1) return null;
    const parentLevel = drillPath.length === 2 ? provinceData : cityData;
    return parentLevel ?? null;
  }, [drillEnabled, drillPath, provinceData, cityData]);

  // Tooltip 模板
  const tooltipTemplate = useMemo(() => {
    const fields = tooltipFields ?? [labelField, valueField];
    const rows = fields.map((f) => `<tr><td style="padding-right:8px;color:#64748b">${f}</td><td style="font-weight:600">{{${f}}}</td></tr>`);
    return `<div style="min-width:140px"><table style="font-size:12px;line-height:1.6">${rows.join('')}</table></div>`;
  }, [tooltipFields, labelField, valueField]);

  // 事件处理
  const handleClick = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    if (!feature) return;

    const name = String(feature[labelField] ?? feature.name ?? '');
    const adcode = feature.adcode as string | number | undefined;

    onRegionClick?.(feature, currentLevel);

    if (clickSelect) {
      setSelectedName((prev) => (prev === name ? null : name));
    }

    if (drillEnabled && canDrillDeeper(currentLevel)) {
      const newPath = [...drillPath, { level: getNextLevel(currentLevel), name, adcode }];
      if (controlledDrillPath) {
        onDrill?.(newPath);
      } else {
        setInternalDrillPath(newPath);
        onDrill?.(newPath);
      }
      setSelectedName(null);
    }
  }, [labelField, currentLevel, clickSelect, drillEnabled, drillPath, controlledDrillPath, onDrill, onRegionClick]);

  if (!scene || !mergedGeoData) return null;

  const hasBusinessData = Boolean(data && data.length > 0);
  const displayData = filteredGeoData ?? mergedGeoData;
  const strokeWidthByLevel = currentLevel === 'province' ? strokeWidth : strokeWidth * 0.6;

  return (
    <>
      {/* 下钻模式：虚化的父级背景 */}
      {drillEnabled && parentGeoData && drillPath.length > 1 && (
        <>
          <PolygonLayer
            source={parentGeoData}
            sourceType="geojson"
            shape="fill"
            color="#94a3b8"
            style={{ opacity: dimOpacity }}
            zIndex={zIndex}
          />
          <LineLayer
            source={parentGeoData}
            sourceType="geojson"
            color="rgba(148,163,184,0.2)"
            size={0.5}
            zIndex={zIndex + 1}
          />
        </>
      )}

      {/* 主填充面图层 — 直接使用 PolygonLayer 精确控制颜色映射 */}
      <PolygonLayer
        source={displayData}
        sourceType="geojson"
        shape="fill"
        {...(hasBusinessData
          ? { colorField: valueField, colorValues: colors }
          : { color: colors[2] ?? '#3b82f6' }
        )}
        active={hoverHighlight ? { color: '#ffffff' } : undefined}
        select={clickSelect ? { color: '#0f172a' } : undefined}
        style={{ opacity: fillOpacity }}
        onClick={handleClick}
        zIndex={zIndex + 2}
      />

      {/* 描边线图层 */}
      <LineLayer
        source={displayData}
        sourceType="geojson"
        color={strokeColor}
        size={strokeWidthByLevel}
        zIndex={zIndex + 3}
      />

      {/* 文字标签图层 */}
      {showLabel && displayData && (
        <AdminLabelLayer
          geoData={displayData}
          labelField={labelField}
          labelSize={labelSize}
          zIndex={zIndex + 4}
        />
      )}
    </>
  );
}

// ─── 标签内部组件 ─────────────────────────────────────────

interface AdminLabelLayerProps {
  geoData: GeoJSONFeatureCollection;
  labelField: string;
  labelSize: number;
  zIndex: number;
}

function AdminLabelLayer({ geoData, labelField, labelSize, zIndex }: AdminLabelLayerProps) {
  const labelPoints = useMemo(() => buildLabelPoints(geoData, labelField), [geoData, labelField]);
  if (!labelPoints || labelPoints.data.length === 0) return null;

  return (
    <PointLayer
      source={labelPoints.data}
      sourceType={labelPoints.sourceType}
      sourceConfig={labelPoints.sourceConfig}
      shapeField={labelField}
      shapeValues="text"
      color="#0f172a"
      size={labelSize}
      style={{
        textAllowOverlap: false,
        stroke: '#ffffff',
        strokeWidth: 2,
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
      }}
      zIndex={zIndex}
    />
  );
}

// ─── 工具函数 ────────────────────────────────────────────

function inferLevelFromPath(path: DrillPathNode[]): AdministrativeLevel {
  if (path.length <= 1) return 'province';
  if (path.length === 2) return 'city';
  return 'district';
}

function canDrillDeeper(level: AdministrativeLevel): boolean {
  return level !== 'district';
}

function getNextLevel(level: AdministrativeLevel): AdministrativeLevel {
  if (level === 'province') return 'city';
  return 'district';
}

/** 非行政区 feature 名称黑名单（国界线、九段线等辅助要素） */
const NON_ADMIN_NAMES = new Set(['境界线', '边界线', '九段线', '十段线']);

function isAdminFeature(feature: GeoJSONFeatureCollection['features'][number]): boolean {
  const name = feature.properties?.name;
  if (!name || typeof name !== 'string') return false;
  if (NON_ADMIN_NAMES.has(name)) return false;
  // 过滤掉 geometry 为 LineString / MultiLineString 的辅助线要素
  const geometryType = feature.geometry?.type as string | undefined;
  if (geometryType === 'LineString' || geometryType === 'MultiLineString') return false;
  return true;
}

function sanitizeGeoJSON(raw: GeoJSONFeatureCollection): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: raw.features.filter(isAdminFeature),
  };
}

function loadGeoJSON(
  source: string | Record<string, unknown>,
  setter: (data: GeoJSONFeatureCollection) => void,
) {
  if (typeof source === 'string') {
    fetch(source)
      .then((res) => res.json())
      .then((json) => {
        if (json && json.type === 'FeatureCollection') {
          setter(sanitizeGeoJSON(json as GeoJSONFeatureCollection));
        }
      })
      .catch(() => { /* silently ignore */ });
  } else if (source && (source as unknown as GeoJSONFeatureCollection).type === 'FeatureCollection') {
    setter(sanitizeGeoJSON(source as unknown as GeoJSONFeatureCollection));
  }
}

function mergeBusinessData(
  geo: GeoJSONFeatureCollection,
  businessData: BusinessDataItem[],
  joinField: string,
  dataJoinField: string,
  valueField: string,
): GeoJSONFeatureCollection {
  const dataMap = new Map<string, BusinessDataItem>();
  for (const item of businessData) {
    const key = String(item[dataJoinField] ?? '');
    if (key) dataMap.set(key, item);
  }

  const features = geo.features.map((feature) => {
    const joinValue = String(feature.properties[joinField] ?? '');
    const matched = dataMap.get(joinValue);

    // 确保每个 feature 都有 valueField，未匹配到的赋 0 以避免色阶映射异常
    const resolvedValue = matched
      ? (matched[valueField] ?? matched.value ?? 0)
      : 0;

    return {
      ...feature,
      properties: {
        ...feature.properties,
        ...(matched ?? {}),
        [valueField]: resolvedValue,
      },
    };
  });

  return { type: 'FeatureCollection', features };
}

function filterByParent(
  geo: GeoJSONFeatureCollection,
  parentNode: DrillPathNode,
  joinField: string,
): GeoJSONFeatureCollection {
  const parentName = parentNode.name;
  const parentAdcode = parentNode.adcode;

  const features = geo.features.filter((feature) => {
    const props = feature.properties;
    // 通过 parent 字段匹配
    if (props.parent && String(props.parent) === parentName) return true;
    if (props.parentName && String(props.parentName) === parentName) return true;
    // 通过 adcode 前缀匹配
    if (parentAdcode && props.adcode) {
      const parentCode = String(parentAdcode);
      const childCode = String(props.adcode);
      if (childCode.startsWith(parentCode.slice(0, 2)) && childCode !== parentCode) return true;
    }
    // 通过省/市名字段匹配
    if (props.province && String(props.province) === parentName) return true;
    if (props.city && String(props.city) === parentName) return true;
    return false;
  });

  return { type: 'FeatureCollection', features };
}

function buildLabelPoints(
  geo: GeoJSONFeatureCollection,
  labelField: string,
): { data: Array<Record<string, unknown>>; sourceType: 'json'; sourceConfig: { x: string; y: string } } | null {
  const points: Array<Record<string, unknown>> = [];

  for (const feature of geo.features) {
    if (!feature.geometry || !feature.properties) continue;
    const center = computeCentroid(feature.geometry);
    if (!center) continue;

    points.push({
      lng: center[0],
      lat: center[1],
      [labelField]: feature.properties[labelField] ?? feature.properties.name ?? '',
    });
  }

  if (points.length === 0) return null;
  return { data: points, sourceType: 'json', sourceConfig: { x: 'lng', y: 'lat' } };
}

function computeCentroid(geometry: Record<string, unknown>): [number, number] | null {
  const type = geometry.type as string;
  const coordinates = geometry.coordinates as unknown;
  if (!coordinates) return null;

  if (type === 'Point') {
    const coords = coordinates as [number, number];
    return coords;
  }

  if (type === 'Polygon') {
    return polygonCentroid(coordinates as number[][][]);
  }

  if (type === 'MultiPolygon') {
    const polys = coordinates as number[][][][];
    // 取面积最大的 polygon 的质心
    let maxArea = 0;
    let result: [number, number] | null = null;
    for (const poly of polys) {
      const area = Math.abs(ringArea(poly[0]));
      if (area > maxArea) {
        maxArea = area;
        result = polygonCentroid(poly);
      }
    }
    return result;
  }

  return null;
}

function polygonCentroid(rings: number[][][]): [number, number] | null {
  const ring = rings[0];
  if (!ring || ring.length === 0) return null;

  let sumX = 0;
  let sumY = 0;
  const count = ring.length;
  for (const coord of ring) {
    sumX += coord[0];
    sumY += coord[1];
  }
  return [sumX / count, sumY / count];
}

function ringArea(ring: number[][]): number {
  let area = 0;
  const length = ring.length;
  for (let i = 0; i < length; i++) {
    const j = (i + 1) % length;
    area += ring[i][0] * ring[j][1];
    area -= ring[j][0] * ring[i][1];
  }
  return area / 2;
}
