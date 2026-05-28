import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { PointLayer } from '../Layer/PointLayer';

/** 标签锚点位置 */
export type LabelAnchor = 'right' | 'bottom' | 'top' | 'left' | 'center';

/**
 * Material Symbols Outlined 图标名称 → Unicode 映射
 *
 * 数据来源：Google material-design-icons 官方 codepoints 文件
 * https://github.com/google/material-design-icons/blob/master/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints
 *
 * ⚠️ 重要：L7 的 FontService.generateFontAtlas 在 iconfont 模式下，
 * 使用 `char.replace('&#x','').replace(';','')` 来解析 Unicode，
 * 因此映射值必须使用 HTML 实体格式 &#xHEX; ，而不能使用 JS Unicode 转义 \uXXXX。
 * 参考：node_modules/@antv/l7-core/es/services/asset/FontService.js:222-228
 */
export const MATERIAL_SYMBOLS_ICONS: Array<[string, string]> = [
  // ── 天气 ──
  ['sunny', '&#xe81a;'],
  ['cloud', '&#xf15c;'],
  ['cloudy', '&#xf15c;'],
  ['partly_cloudy_day', '&#xf172;'],
  ['partly_cloudy_night', '&#xf174;'],
  ['rainy', '&#xf176;'],
  ['rainy_heavy', '&#xf61f;'],
  ['rainy_light', '&#xf61e;'],
  ['rainy_snow', '&#xf61d;'],
  ['thunderstorm', '&#xebdb;'],
  ['foggy', '&#xe818;'],
  ['air', '&#xefd8;'],
  ['water_drop', '&#xe798;'],
  ['ac_unit', '&#xeb3b;'],
  ['filter_drama', '&#xe3dd;'],
  ['cloudy_snowing', '&#xe810;'],
  ['snowing', '&#xe80f;'],
  ['snowflake', '&#xed5b;'],
  ['severe_cold', '&#xebd3;'],
  ['umbrella', '&#xf1ad;'],
  ['storm', '&#xf070;'],
  ['tornado', '&#xe199;'],
  ['thermostat', '&#xf076;'],
  ['heat', '&#xf537;'],
  ['hot', '&#xef23;'],
  // ── 出行 / 交通 ──
  ['flight', '&#xe539;'],
  ['flight_takeoff', '&#xe905;'],
  ['flight_land', '&#xe904;'],
  ['train', '&#xe570;'],
  ['directions_transit', '&#xeffa;'],
  ['directions_railway', '&#xeff8;'],
  ['directions_bus', '&#xeff6;'],
  ['directions_car', '&#xeff7;'],
  ['directions_boat', '&#xeff5;'],
  ['directions_bike', '&#xe52f;'],
  ['directions_walk', '&#xe536;'],
  ['directions_run', '&#xe566;'],
  ['taxi', '&#xe559;'],
  ['local_taxi', '&#xe559;'],
  ['local_airport', '&#xe53d;'],
  ['connecting_airports', '&#xe7c9;'],
  ['two_wheeler', '&#xe9f9;'],
  ['tram', '&#xe571;'],
  ['subway', '&#xe56f;'],
  ['ferry', '&#xe572;'],
  ['cable_car', '&#xf479;'],
  ['ev_station', '&#xe56d;'],
  ['local_gas_station', '&#xe546;'],
  // ── 地点 / 设施 ──
  ['location_on', '&#xf1db;'],
  ['place', '&#xf1db;'],
  ['room', '&#xf1db;'],
  ['pin', '&#xf045;'],
  ['pin_drop', '&#xe55e;'],
  ['near_me', '&#xe569;'],
  ['my_location', '&#xe55c;'],
  ['gps_fixed', '&#xe55c;'],
  ['navigation', '&#xe55d;'],
  ['explore', '&#xe87a;'],
  ['map', '&#xe55b;'],
  // ── 城市 / 生活 ──
  ['restaurant', '&#xe56c;'],
  ['local_cafe', '&#xeb44;'],
  ['coffee', '&#xefef;'],
  ['local_bar', '&#xe540;'],
  ['hotel', '&#xe549;'],
  ['local_hospital', '&#xe548;'],
  ['local_pharmacy', '&#xe550;'],
  ['local_atm', '&#xe53e;'],
  ['local_police', '&#xef56;'],
  ['local_fire_department', '&#xef55;'],
  ['local_post_office', '&#xe554;'],
  ['local_library', '&#xe54b;'],
  ['local_mall', '&#xe54c;'],
  ['local_grocery_store', '&#xe8cc;'],
  ['store', '&#xe8d1;'],
  ['school', '&#xe80c;'],
  ['church', '&#xeaae;'],
  ['mosque', '&#xeab2;'],
  ['synagogue', '&#xeab0;'],
  ['temple_buddhist', '&#xeab3;'],
  ['temple_hindu', '&#xeaaf;'],
  ['museum', '&#xea36;'],
  ['castle', '&#xeab1;'],
  ['stadium', '&#xeb90;'],
  ['theater_comedy', '&#xea66;'],
  ['pool', '&#xeb48;'],
  ['fitness_center', '&#xeb43;'],
  ['spa', '&#xeb4c;'],
  ['park', '&#xea63;'],
  ['forest', '&#xea99;'],
  // ── 活动 ──
  ['attractions', '&#xea52;'],
  ['celebration', '&#xea65;'],
  ['festival', '&#xea68;'],
  ['nightlife', '&#xea62;'],
  ['sports', '&#xea30;'],
  ['sports_soccer', '&#xea2f;'],
  ['sports_basketball', '&#xea26;'],
  ['sports_football', '&#xea29;'],
  ['sports_tennis', '&#xea32;'],
  ['sports_golf', '&#xea2a;'],
  // ── 地图功能 ──
  ['layers', '&#xe53b;'],
  ['layers_clear', '&#xe53c;'],
  ['terrain', '&#xe564;'],
  ['landscape', '&#xe564;'],
  ['share', '&#xe80d;'],
  ['favorite', '&#xe87e;'],
  ['star', '&#xf09a;'],
  ['home', '&#xe9b2;'],
  ['work', '&#xe943;'],
  ['person', '&#xf0d3;'],
  ['people', '&#xea21;'],
  ['trip', '&#xe6fb;'],
  ['warning', '&#xf083;'],
  ['emergency', '&#xe1eb;'],
  ['photo_camera', '&#xe412;'],
  ['shopping_bag', '&#xf1cc;'],
  // ── 通用 ──
  ['search', '&#xe8b6;'],
  ['settings', '&#xe8b8;'],
  ['info', '&#xe88e;'],
  ['help', '&#xe8fd;'],
  ['close', '&#xe5cd;'],
  ['check', '&#xe876;'],
  ['add', '&#xe145;'],
  ['remove', '&#xe15b;'],
  ['edit', '&#xe254;'],
  ['delete', '&#xe872;'],
  ['refresh', '&#xe5d5;'],
  ['download', '&#xe2c4;'],
  ['upload', '&#xe2c3;'],
  ['visibility', '&#xe8f4;'],
  ['visibility_off', '&#xe8f6;'],
];

/**
 * 内置天气 iconfont 图标映射（at.alicdn.com 字体）
 * key 为语义化名称，value 为 HTML 实体格式的 iconfont unicode（&#xHEX;）
 */
export const BUILTIN_ICON_FONTS: Array<[string, string]> = [
  ['smallRain', '&#xe6f7;'],
  ['middleRain', '&#xe61c;'],
  ['hugeRain', '&#xe6a6;'],
  ['sun', '&#xe6da;'],
  ['cloud', '&#xe8da;'],
];

/** Material Symbols Outlined CSS 字体族名 */
const MATERIAL_SYMBOLS_FONT_FAMILY = 'Material Symbols Outlined';
const MATERIAL_SYMBOLS_FONT_PATH = 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v261/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2';

/** 默认 iconfont 字体（at.alicdn.com） */
const ALICDN_FONT_FAMILY = 'iconfont';
const ALICDN_FONT_PATH = '//at.alicdn.com/t/font_2534097_ao9soua2obv.woff2?t=1622021146076';

export interface GlyphLayerProps extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  // ===== 字体图标配置 =====
  /** 图标内容字段（数据中每个要素的该字段值将作为图标文本渲染） */
  iconField: string;
  /**
   * 字体族模式
   * - 'material-symbols'（默认）：使用 Material Symbols Outlined 字体，图标名需使用官方名称（如 sunny / flight / restaurant）
   * - 'iconfont'：使用 at.alicdn.com 内置 iconfont 字体，图标名需使用 BUILTIN_ICON_FONTS 中的名称
   * - 自定义字符串：自行通过 scene.addFontFace / addIconFonts 注册的字体族名
   */
  iconFontFamily?: string;
  /**
   * 自定义字体文件 URL，仅在 iconFontFamily 为自定义字符串时需要
   * Material Symbols 自动从页面已加载的字体中获取；iconfont 使用内置 URL
   */
  iconFontPath?: string;
  /**
   * 自定义图标映射表，仅在 iconFontFamily 为自定义字符串时需要
   * 格式同 addIconFonts：[['iconName', '&#xHEX;'], ...]
   * 注意：Unicode 值必须使用 HTML 实体格式 &#xHEX; ，而非 JS \uXXXX 转义
   */
  iconFontMap?: Array<[string, string]>;
  /** 图标颜色，支持单色或数据驱动映射 */
  iconColor?: LayerSchema['color'];
  /** 图标尺寸 (16-24px)，默认 20 */
  iconSize?: number;
  /** 图标光晕颜色，默认白色 */
  iconHaloColor?: string;
  /** 图标光晕宽度 (1-2px)，默认 1 */
  iconHaloWidth?: number;
  /** 图标样式扩展 */
  iconStyle?: Record<string, unknown>;

  // ===== 文字标签配置 =====
  /** 是否显示文字标签，默认 true */
  showLabel?: boolean;
  /** 文字标签字段，默认取 iconField */
  labelField?: string;
  /** 标签颜色 */
  labelColor?: string;
  /** 标签字号 (10-14px)，默认 11 */
  labelSize?: number;
  /** 文字锚点位置（直接透传给 L7 textAnchor），默认 'top' */
  labelAnchor?: LabelAnchor;
  /** 标签偏移量 [x, y]，默认 [0, 0] */
  labelOffset?: [number, number];
  /** 标签光晕颜色，默认白色 */
  labelHaloColor?: string;
  /** 标签光晕宽度，默认 2px */
  labelHaloWidth?: number;
  /** 标签样式扩展 */
  labelStyle?: Record<string, unknown>;

  // ===== 碰撞检测 =====
  /** 文本标签是否允许重叠，默认 false（开启碰撞检测，仅隐藏文本） */
  textAllowOverlap?: boolean;
  /** 图标是否允许重叠，默认 true（图标始终保持可见） */
  iconAllowOverlap?: boolean;

  // ===== 缩放适配 =====
  /** 是否开启缩放适配，默认 true */
  zoomAdaption?: boolean;
  /** 高缩放级阈值（显示图标+文字），默认 14 */
  zoomShowLabel?: number;
  /** 低缩放级阈值（降级为圆点），默认 10 */
  zoomDegradeToPoint?: number;

  // ===== 交互 =====
  onClick?: (payload: LayerEventPayload) => void;
  onMouseEnter?: (payload: LayerEventPayload) => void;
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

/**
 * 字体图标标注图层（GlyphLayer）
 *
 * 支持 Material Symbols Outlined 及自定义 iconfont 字体：
 * - Material Symbols: 页面已加载 Google 字体，组件自动注册映射表，开箱即用
 * - 内置 iconfont: at.alicdn.com 天气字体，内置 5 个图标
 * - 自定义: 传入 iconFontFamily + iconFontPath + iconFontMap
 *
 * 特性：
 * - SDF 渲染确保任意缩放下边缘锐利
 * - 图标 1-2px 光晕增强复杂底图辨识度
 * - 文字 2px 光晕确保可读性
 * - 碰撞检测：图标始终可见，仅文本被避让
 * - 缩放适配：L1(14+) 全显示 → L2(10-13) 仅图标 → L3(<10) 降级圆点
 */
export function GlyphLayer({
  source,
  sourceType = 'json',
  sourceConfig,
  iconField,
  iconFontFamily = 'material-symbols',
  iconFontPath,
  iconFontMap,
  iconColor = '#3b82f6',
  iconSize = 20,
  iconHaloColor = '#fff',
  iconHaloWidth = 1,
  iconStyle,
  showLabel = true,
  labelField,
  labelColor = '#333',
  labelSize = 11,
  labelAnchor = 'top',
  labelOffset = [0, 0],
  labelHaloColor = '#fff',
  labelHaloWidth = 2,
  labelStyle,
  textAllowOverlap = false,
  iconAllowOverlap = true,
  zoomAdaption = true,
  zoomShowLabel = 14,
  zoomDegradeToPoint = 10,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: GlyphLayerProps) {
  const scene = useScene();
  const [fontReady, setFontReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const fontRegisteredRef = useRef(false);

  // 确定最终字体族和图标映射
  const { fontFamily, fontPath, iconMappings } = useMemo(() => {
    switch (iconFontFamily) {
      case 'material-symbols':
        return {
          fontFamily: MATERIAL_SYMBOLS_FONT_FAMILY,
          fontPath: MATERIAL_SYMBOLS_FONT_PATH,
          iconMappings: MATERIAL_SYMBOLS_ICONS,
        };
      case 'iconfont':
        return {
          fontFamily: ALICDN_FONT_FAMILY,
          fontPath: ALICDN_FONT_PATH,
          iconMappings: BUILTIN_ICON_FONTS,
        };
      default:
        return {
          fontFamily: iconFontFamily,
          fontPath: iconFontPath ?? null,
          iconMappings: iconFontMap ?? [],
        };
    }
  }, [iconFontFamily, iconFontPath, iconFontMap]);

  // 注册字体和图标映射，等待字体加载完成
  useEffect(() => {
    if (!scene) return;
    if (fontRegisteredRef.current) return;
    fontRegisteredRef.current = true;

    let cancelled = false;

    const registerFont = async () => {
      // 1. 如果有字体文件路径，通过 L7 addFontFace 注册
      if (fontPath) {
        scene.addFontFace(fontFamily, fontPath);
      }

      // 2. 注册图标名称 → Unicode 映射
      //    注意：L7 要求 &#xHEX; 格式的 HTML 实体字符串，而非 JS Unicode 转义
      if (iconMappings.length > 0) {
        scene.addIconFonts(iconMappings);
      }

      // 3. 等待字体实际加载完成
      try {
        if (fontFamily === MATERIAL_SYMBOLS_FONT_FAMILY) {
          // Material Symbols: 通过 CSS <link> 已加载，用 document.fonts API 确保就绪
          // 传入 PUA 字符作为测试文本，确保包含图标字形的子集被下载
          const testChars = iconMappings
            .slice(0, 10)
            .map(([, v]) => String.fromCharCode(parseInt(v.replace('&#x', '').replace(';', ''), 16)))
            .join('');
          await document.fonts.load(`${iconSize}px "${fontFamily}"`, testChars);
        } else if (fontPath) {
          // 自定义字体: 等待 L7 的 fontloaded 事件，带超时
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              resolve();
            }, 3000); // 3 秒超时

            const onFontLoaded = () => {
              clearTimeout(timeout);
              scene.off('fontloaded', onFontLoaded);
              resolve();
            };

            scene.on('fontloaded', onFontLoaded);

            // 如果字体已经加载完成（document.fonts），也立即 resolve
            document.fonts.load(`${iconSize}px "${fontFamily}"`).then(() => {
              clearTimeout(timeout);
              scene.off('fontloaded', onFontLoaded);
              resolve();
            }).catch(() => {
              // 加载失败也继续，至少尝试渲染
              clearTimeout(timeout);
              scene.off('fontloaded', onFontLoaded);
              resolve();
            });
          });
        }
      } catch {
        // 字体加载失败，仍然尝试渲染
        console.warn(`[GlyphLayer] 字体 "${fontFamily}" 加载超时，尝试继续渲染`);
      }

      // 4. 验证字体确实可用
      try {
        const checkStr = 'X';
        const fontStr = `${iconSize}px "${fontFamily}"`;
        if (document.fonts.check(fontStr, checkStr)) {
          // 字体就绪
        } else {
          // 等待 fonts.ready
          await document.fonts.ready;
        }
      } catch {
        // 忽略
      }

      if (!cancelled) {
        setFontReady(true);
      }
    };

    registerFont();

    return () => {
      cancelled = true;
    };
  }, [scene, fontFamily, fontPath, iconMappings, iconSize]);

  // Scene 就绪检测
  useEffect(() => {
    if (!scene) return;
    const onLoaded = () => setSceneReady(true);
    // 如果 scene 已经 loaded
    if ((scene as any).loaded) {
      onLoaded();
    } else {
      scene.on('loaded', onLoaded);
    }
    return () => {
      scene.off('loaded', onLoaded);
    };
  }, [scene]);


  // 缩放适配监听
  useEffect(() => {
    if (!scene || !zoomAdaption) return;
    const handleZoomChange = () => {
      setCurrentZoom(scene.getZoom());
    };
    handleZoomChange();
    scene.on('zoomchange', handleZoomChange);
    return () => {
      scene.off('zoomchange', handleZoomChange);
    };
  }, [scene, zoomAdaption]);

  // 所有 hooks 已在此之上调用完毕
  // 等待字体就绪 + 场景就绪
  if (!fontReady || !sceneReady) return null;

  const resolvedLabelField = labelField ?? iconField;

  // 缩放适配：判断当前显示级别
  const shouldShowLabel = !zoomAdaption || currentZoom >= zoomShowLabel;
  const shouldDegradeToPoint = zoomAdaption && currentZoom < zoomDegradeToPoint;

  // L3: 降级为圆点模式
  if (shouldDegradeToPoint) {
    return (
      <PointLayer
        source={source}
        sourceType={sourceType}
        sourceConfig={sourceConfig}
        shape="circle"
        color={typeof iconColor === 'string' ? iconColor : '#3b82f6'}
        size={4}
        style={{ opacity: 0.7 }}
      />
    );
  }

  return (
    <>
      {/* 字体图标图层 — 始终可见 */}
      <PointLayer
        {...rest}
        source={source}
        sourceType={sourceType}
        sourceConfig={sourceConfig}
        shapeField={iconField}
        shapeValues="text"
        color={iconColor}
        size={iconSize}
        style={{
          fontFamily: fontFamily,
          iconfont: true,
          textAllowOverlap: iconAllowOverlap,
          stroke: iconHaloColor,
          strokeWidth: iconHaloWidth,
          ...(iconStyle ?? {}),
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />

      {/* 文字标签图层 — 碰撞检测控制 */}
      {showLabel && shouldShowLabel && (
        <PointLayer
          source={source}
          sourceType={sourceType}
          sourceConfig={sourceConfig}
          shapeField={resolvedLabelField}
          shapeValues="text"
          color={labelColor}
          size={labelSize}
          style={{
            textAnchor: labelAnchor,
            textOffset: labelOffset,
            stroke: labelHaloColor,
            strokeWidth: labelHaloWidth,
            fontWeight: '500',
            textAllowOverlap,
            ...(labelStyle ?? {}),
          }}
        />
      )}
    </>
  );
}

export default GlyphLayer;