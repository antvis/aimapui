import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from 'react';
import type { Scene } from '@antv/l7';
import type { MapSchema } from '../../schema/types';
import { ThemeProvider } from '../../context/ThemeContext';
import { EventBusProvider } from '../../context/EventBusContext';
import type { MapTheme } from '../../context/ThemeContext';
import { MapSceneRenderer } from '../MapScene/MapSceneRenderer';

/**
 * 对比模式
 * - `'split'`: 双屏对比 — 左右两个地图并排，拖动分隔条调整两侧比例
 * - `'swipe'`: 卷帘对比 — 两个地图叠放，拖动卷帘条揭示/遮罩上层地图
 */
export type LayerCompareMode = 'split' | 'swipe';

/**
 * 场景就绪回调参数
 */
export interface LayerCompareScenes {
  before: Scene;
  after: Scene;
}

export interface LayerCompareHandle {
  /** 获取两个场景实例 */
  getScenes: () => { before: Scene | null; after: Scene | null };
  /** 切换对比模式 */
  setMode: (mode: LayerCompareMode) => void;
  /** 设置分隔/卷帘位置（0-100） */
  setPosition: (pos: number) => void;
  /** 同步 after 场景视角到 before 场景（强制对齐） */
  syncCameras: () => void;
}

export interface LayerCompareProps {
  /**
   * 对比模式，默认 `'split'`
   *
   * - `'split'` 双屏：左右并排
   * - `'swipe'` 卷帘：上下叠放 + 卷帘条
   */
  mode?: LayerCompareMode;
  /** 共享的基础地图配置（center/zoom/basemap 等），两侧默认一致 */
  map: MapSchema;
  /** before（左侧/卷帘下层）地图配置覆盖，合并到 `map` 之上 */
  beforeMap?: Partial<MapSchema>;
  /** after（右侧/卷帘上层）地图配置覆盖，合并到 `map` 之上 */
  afterMap?: Partial<MapSchema>;
  /** before 侧图层（组件化 API，如 `<PointLayer />`） */
  before?: React.ReactNode;
  /** after 侧图层 */
  after?: React.ReactNode;
  /** 初始分隔/卷帘位置（0-100），默认 50 */
  defaultPosition?: number;
  /** 是否同步两侧相机（平移/缩放/旋转），默认 true */
  sync?: boolean;
  /** 是否显示模式切换工具栏（双屏 ↔ 卷帘），默认 true */
  showModeSwitch?: boolean;
  /** 是否显示 before/after 标签，默认 true */
  showLabels?: boolean;
  /** before 侧标签文案，默认 'Before' */
  beforeLabel?: string;
  /** after 侧标签文案，默认 'After' */
  afterLabel?: string;
  /** 主题，默认 'light' */
  theme?: MapTheme;
  /** 模式切换回调 */
  onModeChange?: (mode: LayerCompareMode) => void;
  /** 分隔/卷帘位置变化回调（0-100） */
  onPositionChange?: (pos: number) => void;
  /** 两个场景均就绪后回调 */
  onSceneReady?: (scenes: LayerCompareScenes) => void;
  /** 容器 className */
  className?: string;
  /** 容器 style */
  style?: React.CSSProperties;
}

/** L7 场景相机相关事件（用于逐帧同步） */
const CAMERA_EVENTS = ['mapmove', 'zoomchange', 'rotatechange', 'pitchchange'];
/** L7 场景移动结束事件（用于释放同步锁） */
const MOVE_END_EVENT = 'moveend';
/**
 * 合并基础 map 配置与单侧（before/after）覆盖配置。
 *
 * 卷帘（swipe）模式下默认关闭旋转手势 `dragRotate=false`：
 * 卷帘两层是全宽画布叠放，双指捏合/缩放手势一旦跨越卷帘边界，两指会分别落入
 * before / after 两个不同底图实例，被各自识别为单指拖动而误触旋转。
 * 关闭旋转手势既消除误触，也避免旋转破坏两图对齐（对比场景通常不需要旋转）。
 * 用户仍可通过 `map.gestureConfig.dragRotate = true`（或 beforeMap/afterMap）显式开启。
 */
function mergeMapSchema(
  base: MapSchema,
  override: Partial<MapSchema> | undefined,
  mode: LayerCompareMode,
): MapSchema {
  const merged: MapSchema = { ...base, ...override };
  const baseGesture = base.gestureConfig ?? {};
  const overrideGesture = override?.gestureConfig ?? {};
  // 用户显式值优先（侧边覆盖 > 基础配置）
  const userDragRotate = overrideGesture.dragRotate ?? baseGesture.dragRotate;
  merged.gestureConfig = {
    ...baseGesture,
    ...overrideGesture,
    dragRotate: mode === 'swipe' ? (userDragRotate ?? false) : (userDragRotate ?? true),
  };
  return merged;
}


/**
 * 图层对比组件 — 支持双屏对比与卷帘对比
 *
 * 内部创建两个独立的 L7 场景（before / after），并以可拖动分隔条控制两侧范围：
 *
 * - **双屏（split）**：左右并排，拖动分隔条调整两侧宽度比例；两侧相机自动同步。
 * - **卷帘（swipe）**：两个地图完全叠放，上层（after）通过 `clip-path` 被卷帘条裁切，
 *   拖动卷帘条即可揭示/遮挡下层（before）；两侧相机自动同步以保证像素级对齐。
 *
 * @example
 * ```tsx
 * <LayerCompare
 *   mode="swipe"
 *   map={{ basemap: 'gaode', center: [116.39, 39.9], zoom: 10 }}
 *   before={<SatelliteLayer />}
 *   after={<PointLayer source={data} color="#ef4444" size={8} />}
 * />
 * ```
 */
export const LayerCompare = forwardRef<LayerCompareHandle, LayerCompareProps>(
  function LayerCompare(
    {
      mode: modeProp,
      map,
      beforeMap,
      afterMap,
      before,
      after,
      defaultPosition = 50,
      sync = true,
      showModeSwitch = true,
      showLabels = true,
      beforeLabel = 'Before',
      afterLabel = 'After',
      theme = 'light',
      onModeChange,
      onPositionChange,
      onSceneReady,
      className,
      style,
    },
    ref,
  ) {
    const [mode, setMode] = useState<LayerCompareMode>(modeProp ?? 'split');
    const [position, setPosition] = useState<number>(
      Math.min(100, Math.max(0, defaultPosition)),
    );

    // 同步 prop 变化
    useEffect(() => {
      if (modeProp) setMode(modeProp);
    }, [modeProp]);

    const beforeSceneRef = useRef<Scene | null>(null);
    const afterSceneRef = useRef<Scene | null>(null);
    const [readyCount, setReadyCount] = useState(0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    // 同步「领航」机制：正在被用户操作的一侧为领航者，另一侧为跟随者。
    // 跟随者由程序化 setCenter 产生的回声事件一律忽略；领航者自身的 moveend 结束领航。
    // 该机制不依赖单次事件时序，逐帧同步且绝不会把 setCenter 回写到被拖动的一侧。
    const leaderRef = useRef<'before' | 'after' | null>(null);
    // 同步「武装」标志：仅在用户首次真实交互（指针按下 / 滚轮）后才激活实时同步。
    // 初始底图加载收敛、程序化 fitBounds/setCenter、resize 等产生的相机事件一律忽略，
    // 避免初始阶段一侧的相机回声把刚 fitBounds 定位好的另一侧拉回默认视角
    // （典型现象：PMTiles 图层 fitBounds 到 zoom≈14 后被另一侧底图 load 收敛的 zoom=4 回写）。
    // 初始对齐由下方「稳态对齐」useEffect 单独负责。
    const armedRef = useRef(false);

    // 回调 ref 化，避免在 scene 事件中持有陈旧闭包
    const onSceneReadyRef = useRef(onSceneReady);
    onSceneReadyRef.current = onSceneReady;

    const beforeMapSchema = useMemo<MapSchema>(
      () => mergeMapSchema(map, beforeMap, mode),
      [map, beforeMap, mode],
    );
    const afterMapSchema = useMemo<MapSchema>(
      () => mergeMapSchema(map, afterMap, mode),
      [map, afterMap, mode],
    );

    const handleBeforeReady = useCallback((scene: Scene) => {
      beforeSceneRef.current = scene;
      setReadyCount((c) => c + 1);
    }, []);

    const handleAfterReady = useCallback((scene: Scene) => {
      afterSceneRef.current = scene;
      setReadyCount((c) => c + 1);
    }, []);

    // 两个场景都就绪后通知外部
    useEffect(() => {
      const a = beforeSceneRef.current;
      const b = afterSceneRef.current;
      if (a && b && readyCount >= 2) {
        onSceneReadyRef.current?.({ before: a, after: b });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readyCount]);

    /** 将 source 场景的相机应用到 target 场景 */
    const applyCamera = useCallback(
      (target: Scene, source: Scene) => {
        try {
          const c = source.getCenter();
          target.setCenter([c.lng, c.lat]);
          target.setZoom(source.getZoom());
          target.setPitch(source.getPitch());
          target.setRotation(source.getRotation());
        } catch {
          // 部分底图/状态可能不支持，静默
        }
      },
      [],
    );

    /** 强制把 after 对齐到 before（外部可调用） */
    const syncCameras = useCallback(() => {
      const a = beforeSceneRef.current;
      const b = afterSceneRef.current;
      if (a && b) applyCamera(b, a);
    }, [applyCamera]);

    // 双向相机同步
    // 逐帧同步（无节流）以保证拖动流畅；用「领航者」机制阻断反馈环：
    //一旦某侧开始移动即成为领航者，另一侧（跟随者）被程序化 setCenter 产生的回声一律忽略，
    // 直到领航者自身的 moveend 才释放领航权。这样不会把相机回写到正在被用户拖动的一侧。
    //
    // ⚠️「武装」门控：仅用户首次真实交互后才激活实时同步；之前两侧底图加载收敛、
    // 程序化 fitBounds/setCenter、resize 产生的相机事件一律忽略，避免初始阶段一侧的相机回声
    // 把刚 fitBounds 定位好的另一侧拉回默认视角。初始对齐由下方「稳态对齐」单独负责。
    useEffect(() => {
      const a = beforeSceneRef.current;
      const b = afterSceneRef.current;
      if (!sync || !a || !b) return;

      // 首次真实交互即武装同步，并以交互侧作为初始领航者
      const armBefore = () => {
        if (!armedRef.current) {
          armedRef.current = true;
          leaderRef.current = 'before';
        }
      };
      const armAfter = () => {
        if (!armedRef.current) {
          armedRef.current = true;
          leaderRef.current = 'after';
        }
      };
      const root = containerRef.current;
      const beforePanel =
        root?.querySelector<HTMLElement>('.l7-compare__panel--before') ?? null;
      const afterPanel =
        root?.querySelector<HTMLElement>('.l7-compare__panel--after') ?? null;
      beforePanel?.addEventListener('pointerdown', armBefore);
      beforePanel?.addEventListener('wheel', armBefore, { passive: true });
      afterPanel?.addEventListener('pointerdown', armAfter);
      afterPanel?.addEventListener('wheel', armAfter, { passive: true });

      // before 发生相机变化 → 同步未武装 或 after 正在领航 → 视为回声忽略；否则 before 领航并同步到 after
      const onBefore = () => {
        if (!armedRef.current || leaderRef.current === 'after') return;
        leaderRef.current = 'before';
        applyCamera(b, a);
      };
      // after 发生相机变化 → 同步未武装 或 before 正在领航 → 视为回声忽略；否则 after 领航并同步到 before
      const onAfter = () => {
        if (!armedRef.current || leaderRef.current === 'before') return;
        leaderRef.current = 'after';
        applyCamera(a, b);
      };
      // 仅领航者自身的 moveend 释放领航权（跟随者的 moveend 回声不改变领航权）
      const onBeforeEnd = () => {
        if (leaderRef.current === 'before') leaderRef.current = null;
      };
      const onAfterEnd = () => {
        if (leaderRef.current === 'after') leaderRef.current = null;
      };

      CAMERA_EVENTS.forEach((evt) => {
        a.on(evt, onBefore);
        b.on(evt, onAfter);
      });
      a.on(MOVE_END_EVENT, onBeforeEnd);
      b.on(MOVE_END_EVENT, onAfterEnd);

      return () => {
        beforePanel?.removeEventListener('pointerdown', armBefore);
        beforePanel?.removeEventListener('wheel', armBefore);
        afterPanel?.removeEventListener('pointerdown', armAfter);
        afterPanel?.removeEventListener('wheel', armAfter);
        CAMERA_EVENTS.forEach((evt) => {
          try { a.off(evt, onBefore); } catch { /* 场景可能已销毁 */ }
          try { b.off(evt, onAfter); } catch { /* 场景可能已销毁 */ }
        });
        try { a.off(MOVE_END_EVENT, onBeforeEnd); } catch { /* ignore */ }
        try { b.off(MOVE_END_EVENT, onAfterEnd); } catch { /* ignore */ }
        leaderRef.current = null;
      };
    }, [sync, readyCount, applyCamera]);

    // 「稳态对齐」：两侧场景就绪后，轮询相机序列，待其收敛（含 before 侧 PMTiles 等
    // 图层的异步 fitBounds 完成）后，一次性把 after 对齐到 before，作为初始视角。
    // 此时双向同步尚未武装，对齐不会被底图 load 收敛回声覆盖。
    useEffect(() => {
      if (!sync) return;
      const a = beforeSceneRef.current;
      const b = afterSceneRef.current;
      if (!a || !b) return;
      let lastKey = '';
      let stableTicks = 0;
      let done = false;
      const started = Date.now();
      const tick = () => {
        if (done) return;
        try {
          const ca = a.getCenter();
          const cb = b.getCenter();
          const key =
            a.getZoom().toFixed(4) +
            '|' + ca.lng.toFixed(5) + ',' + ca.lat.toFixed(5) +
            '|' + b.getZoom().toFixed(4) +
            '|' + cb.lng.toFixed(5) + ',' + cb.lat.toFixed(5);
          if (key === lastKey) {
            stableTicks++;
          } else {
            stableTicks = 0;
            lastKey = key;
          }
          const elapsed = Date.now() - started;
          // 收敛：连续 3 次采样（~360ms）不变 且 至少经过 500ms（避开 mount 抖动）；
          // 超时兜底 4s 强制对齐一次。
          if ((stableTicks >= 3 && elapsed >= 500) || elapsed >= 4000) {
            done = true;
            applyCamera(b, a);
            return;
          }
        } catch {
          /* 场景可能已销毁 */
        }
        timer = window.setTimeout(tick, 120);
      };
      let timer = window.setTimeout(tick, 120);
      return () => {
        done = true;
        window.clearTimeout(timer);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sync, readyCount, applyCamera]);

    // 模式切换后触发两侧地图 resize（容器尺寸变化）
    const resizeScenes = useCallback(() => {
      [beforeSceneRef.current, afterSceneRef.current].forEach((s) => {
        if (!s) return;
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const m = (s as any).map;
          if (m && typeof m.resize === 'function') m.resize();
        } catch {
          /* ignore */
        }
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof (s as any).resize === 'function') (s as any).resize();
        } catch {
          /* ignore */
        }
      });
    }, []);

    useEffect(() => {
      // 布局变了之后下一帧 resize，再兜底一次
      const id = window.requestAnimationFrame(() => {
        resizeScenes();
        window.requestAnimationFrame(resizeScenes);
      });
      return () => window.cancelAnimationFrame(id);
    }, [mode, resizeScenes]);

    // ---- 分隔/卷帘条拖动 ----
    const updatePositionFromClientX = useCallback(
      (clientX: number) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0) return;
        const pct = ((clientX - rect.left) / rect.width) * 100;
        const clamped = Math.min(100, Math.max(0, pct));
        setPosition(clamped);
        onPositionChange?.(clamped);
      },
      [onPositionChange],
    );

    const onDividerPointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        (e.target as HTMLDivElement).setPointerCapture?.(e.pointerId);

        // 拖动过程中实时 resize（rAF 节流，每帧最多一次）。
        // 仅双屏模式需要：面板宽度变化时要同步更新画布分辨率，避免拉伸/模糊；
        // 卷帘模式面板始终满宽，只更新 clip-path，无需 resize。
        let resizeRaf: number | null = null;
        const scheduleLiveResize = () => {
          if (mode !== 'split') return;
          if (resizeRaf != null) return;
          resizeRaf = window.requestAnimationFrame(() => {
            resizeRaf = null;
            resizeScenes();
          });
        };

        const move = (ev: PointerEvent) => {
          ev.preventDefault();
          updatePositionFromClientX(ev.clientX);
          scheduleLiveResize();
        };
        const up = (ev: PointerEvent) => {
          (e.target as HTMLDivElement).releasePointerCapture?.(e.pointerId);
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
          // 取消挂起帧，并在布局稳定后做一次最终 resize（精确对齐最终尺寸）
          if (resizeRaf != null) {
            window.cancelAnimationFrame(resizeRaf);
            resizeRaf = null;
          }
          window.requestAnimationFrame(resizeScenes);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
      },
      [updatePositionFromClientX, resizeScenes, mode],
    );

    // ---- 模式切换 ----
    const handleModeChange = useCallback(
      (next: LayerCompareMode) => {
        setMode(next);
        onModeChange?.(next);
      },
      [onModeChange],
    );

    // ---- 暴露 handle ----
    useImperativeHandle(
      ref,
      (): LayerCompareHandle => ({
        getScenes: () => ({
          before: beforeSceneRef.current,
          after: afterSceneRef.current,
        }),
        setMode: handleModeChange,
        setPosition: (pos: number) => {
          const clamped = Math.min(100, Math.max(0, pos));
          setPosition(clamped);
          onPositionChange?.(clamped);
        },
        syncCameras,
      }),
      [handleModeChange, syncCameras, onPositionChange],
    );

    const pos = Math.min(100, Math.max(0, position));

    return (
      <ThemeProvider defaultTheme={theme} target="container">
        <div
          ref={containerRef}
          className={`l7-compare l7-compare--${mode}${className ? ` ${className}` : ''}`}
          style={style}
          data-compare-mode={mode}
        >
          {/* before 场景 */}
          <div
            className="l7-compare__panel l7-compare__panel--before"
            style={
              mode === 'split'
                ? { width: `${pos}%` }
                : { clipPath: undefined }
            }
          >
            <EventBusProvider>
              <MapSceneRenderer
                mapSchema={beforeMapSchema}
                onSceneReady={handleBeforeReady}
                style={{ width: '100%', height: '100%' }}
              >
                {before}
              </MapSceneRenderer>
            </EventBusProvider>
            {showLabels && (
              <div className="l7-compare__label l7-compare__label--before">
                {beforeLabel}
              </div>
            )}
          </div>

          {/* after 场景 */}
          <div
            className="l7-compare__panel l7-compare__panel--after"
            style={
              mode === 'split'
                ? { width: `${100 - pos}%` }
                : { clipPath: `inset(0 0 0 ${pos}%)` }
            }
          >
            <EventBusProvider>
              <MapSceneRenderer
                mapSchema={afterMapSchema}
                onSceneReady={handleAfterReady}
                style={{ width: '100%', height: '100%' }}
              >
                {after}
              </MapSceneRenderer>
            </EventBusProvider>
            {showLabels && (
              <div className="l7-compare__label l7-compare__label--after">
                {afterLabel}
              </div>
            )}
          </div>

          {/* 分隔/卷帘条 */}
          <div
            className="l7-compare__divider"
            style={{ left: `${pos}%` }}
            onPointerDown={onDividerPointerDown}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(pos)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={mode === 'swipe' ? '卷帘位置' : '分隔位置'}
          >
            <div className="l7-compare__handle">
              <span className="material-symbols-outlined">drag_handle</span>
            </div>
          </div>

          {/* 模式切换工具栏 */}
          {showModeSwitch && (
            <div className="l7-compare__toolbar">
              <button
                type="button"
                className={`l7-compare__btn${mode === 'split' ? ' l7-compare__btn--active' : ''}`}
                onClick={() => handleModeChange('split')}
                title="双屏对比"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  side_navigation
                </span>
                <span>双屏</span>
              </button>
              <button
                type="button"
                className={`l7-compare__btn${mode === 'swipe' ? ' l7-compare__btn--active' : ''}`}
                onClick={() => handleModeChange('swipe')}
                title="卷帘对比"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  swipe
                </span>
                <span>卷帘</span>
              </button>
            </div>
          )}
        </div>
      </ThemeProvider>
    );
  },
);

export default LayerCompare;
