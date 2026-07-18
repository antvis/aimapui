import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export interface ChinaDistrictProps {
  /** 省级 GeoJSON 数据 URL 或对象，默认内置全国省级数据 */
  provinceSource?: string | Record<string, unknown>;
  /** 市级 GeoJSON 数据 URL 或对象，默认内置全国市级数据 */
  citySource?: string | Record<string, unknown>;
  /** 县级 GeoJSON 数据 URL 或对象，默认内置全国县级数据 */
  districtSource?: string | Record<string, unknown>;

  /** 当前显示层级（非下钻模式时使用） */
  level?: AdministrativeLevel;
  /** 是否启用下钻模式，默认 true */
  drillEnabled?: boolean;
  /** 下钻路径（受控模式） */
  drillPath?: DrillPathNode[];
  /** 下钻回调，点击区域进入下一级时触发 */
  onDrill?: (path: DrillPathNode[]) => void;
  /** 上钻回调，用于面包屑导航返回上级 */
  onDrillUp?: (path: DrillPathNode[]) => void;
  /** 下钻时是否自动适配视口（fitBounds），默认 true */
  autoFitOnDrill?: boolean;

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

  /** 区域单击事件 */
  onRegionClick?: (feature: Record<string, unknown>, level: AdministrativeLevel) => void;
  /** 区域双击事件（上卷时触发） */
  onRegionDblclick?: (feature: Record<string, unknown>, level: AdministrativeLevel) => void;
  /** 图层 zIndex */
  zIndex?: number;
}

/** ChinaDistrict 命令式 API，通过 ref 获取 */
export interface ChinaDistrictHandle {
  /** 返回上一级 */
  drillUp: () => void;
  /** 返回到指定层级（面包屑导航） */
  drillUpTo: (targetIndex: number) => void;
  /** 当前下钻路径 */
  getDrillPath: () => DrillPathNode[];
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
 * 中国行政区划图层（ChinaDistrict）
 *
 * 内置全国省/市/县三级 GeoJSON 数据，支持下钻模式与业务数据关联色阶映射。
 */
export const ChinaDistrict = React.forwardRef<ChinaDistrictHandle, ChinaDistrictProps>(function ChinaDistrict(props, ref) {
  const {
  provinceSource = DEFAULT_PROVINCE_SOURCE,
  citySource = DEFAULT_CITY_SOURCE,
  districtSource = DEFAULT_DISTRICT_SOURCE,
  level = 'province',
  drillEnabled = true,
  drillPath: controlledDrillPath,
  onDrill,
  onDrillUp,
  autoFitOnDrill = true,
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
  hoverHighlight = false,
  clickSelect = false,
  showTooltip = false,
  tooltipFields,
  onRegionClick,
  onRegionDblclick,
  zIndex = 0,
} = props;
  const scene = useScene();

  // 数据加载状态
  const [provinceData, setProvinceData] = useState<GeoJSONFeatureCollection | null>(null);
  const [cityData, setCityData] = useState<GeoJSONFeatureCollection | null>(null);
  const [districtData, setDistrictData] = useState<GeoJSONFeatureCollection | null>(null);
  const [dashLineData, setDashLineData] = useState<GeoJSONFeatureCollection | null>(null);

  // 内部下钻路径
  const [internalDrillPath, setInternalDrillPath] = useState<DrillPathNode[]>([
    { level: 'province', name: '中国' },
  ]);

  const drillPath = controlledDrillPath ?? internalDrillPath;

  // 当前激活层级
  const currentLevel: AdministrativeLevel = drillEnabled
    ? inferLevelFromPath(drillPath)
    : level;

  // 上钻（返回上一级）
  const drillUp = useCallback(() => {
    if (drillPath.length <= 1) return;
    const newPath = drillPath.slice(0, -1);
    if (controlledDrillPath) {
      onDrillUp?.(newPath);
    } else {
      setInternalDrillPath(newPath);
      onDrillUp?.(newPath);
      onDrill?.(newPath);
    }
    setSelectedName(null);
  }, [drillPath, controlledDrillPath, onDrillUp, onDrill]);

  // 上钻到指定层级
  const drillUpTo = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= drillPath.length - 1) return;
    const newPath = drillPath.slice(0, targetIndex + 1);
    if (controlledDrillPath) {
      onDrillUp?.(newPath);
    } else {
      setInternalDrillPath(newPath);
      onDrillUp?.(newPath);
      onDrill?.(newPath);
    }
    setSelectedName(null);
  }, [drillPath, controlledDrillPath, onDrillUp, onDrill]);

  // 选中与 hover 状态
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // 暴露命令式 API
  React.useImperativeHandle(ref, () => ({
    drillUp,
    drillUpTo,
    getDrillPath: () => drillPath,
  }), [drillUp, drillUpTo, drillPath]);

  // 上次下钻路径长度，用于检测下钻/上钻变化并自动 fitBounds
  const prevDrillPathLengthRef = useRef(drillPath.length);

  // 加载远程数据
  useEffect(() => {
    loadGeoJSON(provinceSource, setProvinceData, setDashLineData);
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

  // 计算展示数据（派生值，用 useMemo 保持引用稳定，避免 hooks 顺序问题）
  const hasBusinessData = Boolean(data && data.length > 0);
  const displayData = useMemo(() => {
    if (!mergedGeoData) return null;
    return filteredGeoData ?? mergedGeoData;
  }, [filteredGeoData, mergedGeoData]);

  const strokeWidthByLevel = currentLevel === 'province' ? strokeWidth : strokeWidth * 0.6;

  // 下钻/上钻时自动 fitBounds 到当前区域
  useEffect(() => {
    if (!autoFitOnDrill || !scene || !displayData) return;
    const prevLength = prevDrillPathLengthRef.current;
    if (prevLength === drillPath.length) return;
    prevDrillPathLengthRef.current = drillPath.length;

    try {
      const bounds = computeBounds(displayData);
      if (bounds) {
        scene.fitBounds(bounds, { padding: [40, 40, 40, 40] });
      }
    } catch {
      // fitBounds 可能因为底图不支持而抛错
    }
  }, [autoFitOnDrill, scene, displayData, drillPath.length]);

  // 事件处理：单击下钻
  const handleClick = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    if (!feature) return;

    const name = String(feature[labelField] ?? feature.name ?? '');
    // 优先取 adcode，备选取 gb（国家行政区划编码，如 "156330000"）
    const adcode = (feature.adcode ?? feature.gb) as string | number | undefined;

    onRegionClick?.(feature, currentLevel);

    if (clickSelect) {
      setSelectedName((prev) => (prev === name ? null : name));
    }

    if (drillEnabled && canDrillDeeper(currentLevel)) {
      // level 记录被点击实体的真实层级（而非目标层级），供 filterByParent 判断前缀长度
      const newPath = [...drillPath, { level: currentLevel, name, adcode }];
      if (controlledDrillPath) {
        onDrill?.(newPath);
      } else {
        setInternalDrillPath(newPath);
        onDrill?.(newPath);
      }
      setSelectedName(null);
    }
  }, [labelField, currentLevel, clickSelect, drillEnabled, drillPath, controlledDrillPath, onDrill, onRegionClick]);

  // 事件处理：undblclick 上卷（确认单击未触发双击时回退一级）
  const handleUndblclick = useCallback(() => {
    if (drillEnabled) {
      drillUp();
    }
  }, [drillEnabled, drillUp]);

  // 所有 hooks 必须在 conditional return 之前
  if (!scene || !displayData) return null;

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
        active={hoverHighlight ? { color: '#ffffff', duration: 150 } : undefined}
        select={clickSelect ? { color: '#0f172a', duration: 150 } : undefined}
        style={{ opacity: fillOpacity }}
        onClick={handleClick}
        onDblclick={handleUndblclick}
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

      {/* 九段线 */}
      {dashLineData && currentLevel === 'province' && drillPath.length <= 1 && (
        <LineLayer
          source={dashLineData}
          sourceType="geojson"
          color="#94a3b8"
          size={1}
          zIndex={zIndex + 3}
        />
      )}

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
});

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

/** 非行政区 feature 名称黑名单（国界线等辅助要素，九段线单独提取绘制） */
const NON_ADMIN_NAMES = new Set(['境界线', '边界线', '九段线', '十段线']);

function isDashLineFeature(feature: GeoJSONFeatureCollection['features'][number]): boolean {
  const name = feature.properties?.name;
  if (typeof name !== 'string') return false;
  if (name === '九段线' || name === '十段线') return true;
  // 源数据中九段线常以"境界线"命名，通过南海区域坐标识别
  if (name === '境界线') {
    const geomType = feature.geometry?.type as string | undefined;
    if (geomType !== 'MultiLineString' && geomType !== 'LineString') return false;
    const coords = feature.geometry?.coordinates as number[][][] | number[][] | undefined;
    if (!coords) return false;
    const points = geomType === 'MultiLineString'
      ? (coords as number[][][]).flat()
      : coords as number[][];
    const minLat = Math.min(...points.map((p) => p[1]));
    if (minLat < 10) return true;
  }
  return false;
}

function isAdminFeature(feature: GeoJSONFeatureCollection['features'][number]): boolean {
  const name = feature.properties?.name;
  if (!name || typeof name !== 'string') return false;
  if (NON_ADMIN_NAMES.has(name)) return false;
  const geometryType = feature.geometry?.type as string | undefined;
  if (geometryType === 'LineString' || geometryType === 'MultiLineString') return false;
  return true;
}

interface SanitizedResult {
  admin: GeoJSONFeatureCollection;
  dashLine: GeoJSONFeatureCollection | null;
}

function sanitizeGeoJSON(raw: GeoJSONFeatureCollection): SanitizedResult {
  const adminFeatures: GeoJSONFeatureCollection['features'] = [];
  const dashLineFeatures: GeoJSONFeatureCollection['features'] = [];

  for (const f of raw.features) {
    if (isDashLineFeature(f)) {
      dashLineFeatures.push(f);
    } else if (isAdminFeature(f)) {
      adminFeatures.push(f);
    }
  }

  return {
    admin: { type: 'FeatureCollection', features: adminFeatures },
    dashLine: dashLineFeatures.length > 0
      ? { type: 'FeatureCollection', features: dashLineFeatures }
      : null,
  };
}

function loadGeoJSON(
  source: string | Record<string, unknown>,
  setter: (data: GeoJSONFeatureCollection) => void,
  dashLineSetter?: (data: GeoJSONFeatureCollection | null) => void,
) {
  if (typeof source === 'string') {
    fetch(source)
      .then((res) => res.json())
      .then((json) => {
        if (json && json.type === 'FeatureCollection') {
          const result = sanitizeGeoJSON(json as GeoJSONFeatureCollection);
          setter(result.admin);
          dashLineSetter?.(result.dashLine);
        }
      })
      .catch(() => { /* silently ignore */ });
  } else if (source && (source as unknown as GeoJSONFeatureCollection).type === 'FeatureCollection') {
    const result = sanitizeGeoJSON(source as unknown as GeoJSONFeatureCollection);
    setter(result.admin);
    dashLineSetter?.(result.dashLine);
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

/** 提取行政区划码：去除 "156" 国家前缀，返回标准 6 位码 */
function normalizeAdcode(code: string | number): string {
  const s = String(code);
  if (s.startsWith('156') && s.length >= 9) return s.slice(3);
  return s;
}

/** 常见行政后缀，用于名称模糊匹配 */
const ADMIN_SUFFIXES = ['省', '市', '自治区', '特别行政区', '壮族', '回族', '维吾尔', '藏族', '彝族', '苗', '侗', '瑶', '白', '哈尼', '傣', '傈僳', '佤', '畲', '拉祜', '水', '景颇', '土家', '羌', '毛南', '仫佬', '布朗', '撒拉', '裕固', '塔吉克', '柯尔克孜', '锡伯', '达斡尔', '鄂温克', '鄂伦春', '赫哲', '德昂', '门巴', '珞巴', '基诺', '怒', '保安', '京', '独龙', '仡佬', '阿昌', '普米'] as const;

/** 去除行政区划名称后的常见后缀，便于模糊匹配 */
function stripAdminSuffix(name: string): string {
  let stripped = name;
  for (const suffix of ADMIN_SUFFIXES) {
    if (stripped.endsWith(suffix)) {
      stripped = stripped.slice(0, -suffix.length);
      break;
    }
  }
  return stripped;
}

function filterByParent(
  geo: GeoJSONFeatureCollection,
  parentNode: DrillPathNode,
  joinField: string,
): GeoJSONFeatureCollection {
  const parentName = parentNode.name;
  const parentAdcode = parentNode.adcode;
  const parentLevel = parentNode.level;

  // 根据父级层级确定行政区划码前缀长度
  // 直辖市（北京/天津/上海/重庆）的市级 adcode 与省级相同（如 110000），
  // 其下辖区县的 adcode 前缀与市级不同（如 1101xx vs 110000），
  // 因此直辖市市级下钻到区县时需使用 2 位前缀匹配
  const parentCodeForPrefix = parentAdcode ? normalizeAdcode(String(parentAdcode)) : '';
  const isDirectMunicipality = parentLevel === 'city' && parentCodeForPrefix.endsWith('0000');
  const adcodePrefixLen = parentLevel === 'province' || isDirectMunicipality ? 2 : 4;

  const features = geo.features.filter((feature) => {
    const props = feature.properties;

    // 通过 parent / parentName 字段匹配
    if (props.parent && String(props.parent) === parentName) return true;
    if (props.parentName && String(props.parentName) === parentName) return true;

    // 通过行政区划码前缀匹配（支持 adcode 和 gb 字段，自动去除 "156" 国家前缀）
    const childCodeRaw = (props.adcode ?? props.gb) as string | number | undefined;
    if (parentAdcode && childCodeRaw) {
      const parentCode = normalizeAdcode(String(parentAdcode));
      const childCode = normalizeAdcode(String(childCodeRaw));
      if (childCode.length >= adcodePrefixLen
        && childCode.slice(0, adcodePrefixLen) === parentCode.slice(0, adcodePrefixLen)) {
        // 直辖市省级下钻时，市级 feature 与省级共享同一 adcode（如北京 110000），
        // 允许 childCode === parentCode 以匹配直辖市自身
        if (childCode !== parentCode || parentLevel === 'province') {
          return true;
        }
      }
    }

    // 通过省/市名字段匹配（精确匹配 + 去后缀模糊匹配）
    const parentBase = stripAdminSuffix(parentName);
    if (props.province) {
      if (String(props.province) === parentName) return true;
      if (stripAdminSuffix(String(props.province)) === parentBase) return true;
    }
    if (props.city) {
      if (String(props.city) === parentName) return true;
      if (stripAdminSuffix(String(props.city)) === parentBase) return true;
    }
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

/** 从 GeoJSON FeatureCollection 计算包围盒 [[minLng, minLat], [maxLng, maxLat]] */
function computeBounds(geo: GeoJSONFeatureCollection): [[number, number], [number, number]] | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const feature of geo.features) {
    traverseCoords(feature.geometry, (lng, lat) => {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    });
  }

  if (!isFinite(minLng) || !isFinite(minLat)) return null;
  return [[minLng, minLat], [maxLng, maxLat]];
}

/** 递归遍历 geometry 所有坐标点 */
function traverseCoords(
  geometry: Record<string, unknown>,
  visitor: (lng: number, lat: number) => void,
): void {
  const type = geometry.type as string;
  const coords = geometry.coordinates as unknown;
  if (!coords) return;

  if (type === 'Point') {
    const [lng, lat] = coords as [number, number];
    visitor(lng, lat);
  } else if (type === 'LineString' || type === 'MultiPoint') {
    for (const [lng, lat] of coords as [number, number][]) {
      visitor(lng, lat);
    }
  } else if (type === 'Polygon' || type === 'MultiLineString') {
    for (const ring of coords as [number, number][][]) {
      for (const [lng, lat] of ring) {
        visitor(lng, lat);
      }
    }
  } else if (type === 'MultiPolygon') {
    for (const polygon of coords as [number, number][][][]) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          visitor(lng, lat);
        }
      }
    }
  }
}
