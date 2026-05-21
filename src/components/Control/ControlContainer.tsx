import React, { createContext, useContext, type ReactNode } from 'react';
import type { ControlPosition } from '../../hooks/useMapControl';

/**
 * ControlContainer 上下文
 * 让子控件知道自己处于一个 L7 控件容器中，不需要自行处理绝对定位
 */
const ControlContainerContext = createContext<boolean>(false);

export function useControlContainer() {
  return useContext(ControlContainerContext);
}

/**
 * 已知的控件组件注册表，用于识别控件类型的 children
 *
 * 每个控件组件在定义时通过 ControlRegistry.mark() 注册自身，
 * ControlContainer 在分组时通过 ControlRegistry.check() 判断是否为控件。
 */
const CONTROL_REGISTRY = new Set<unknown>();

/**
 * 控件注册器 — 每个控件组件调用 mark() 标记自身
 */
export const ControlRegistry = {
  /** 注册控件组件 */
  mark(Comp: any): void {
    if (Comp && typeof Comp === 'object' && '$$typeof' in Comp) {
      // ForwardRef / Memo 组件
      CONTROL_REGISTRY.add(Comp);
    }
    if (Comp && typeof Comp === 'function') {
      CONTROL_REGISTRY.add(Comp);
    }
  },
  /** 检测 child 是否为注册过的控件组件 */
  check(child: React.ReactElement): boolean {
    // 1. 通过 props.position 判断（通用）
    if ('position' in (child.props as any)) return true;
    // 2. 通过组件类型注册表判断
    const type = child.type;
    if (CONTROL_REGISTRY.has(type)) return true;
    // 3. 通过组件 displayName 后缀判断
    const displayName = (type as any)?.displayName;
    if (typeof displayName === 'string' && displayName.endsWith('Control')) return true;
    return false;
  },
};

export interface ControlContainerProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * L7 规范的控件容器，将子控件按 position 分组到四角自动排列
 *
 * 核心机制：
 * 1. 遍历 children，识别控件组件（有 position prop 或已注册的控件类型）
 * 2. 按 position 分组，每组放在一个 flex 容器中（.l7-control-anchor）
 * 3. 非控件 children（如 Marker、Layer）原样渲染
 * 4. 设置 ControlContainerContext，让子控件知道自己处于容器中，
 *    从而跳过自身的 .l7-control-anchor 包裹
 *
 * 用法：
 * ```tsx
 * <ControlContainer>
 *   <ZoomControl position="bottomright" />
 *   <GeoLocateControl position="bottomright" />
 *   <ScaleControl position="bottomleft" />
 *   <MapThemeControl position="topright" />
 * </ControlContainer>
 * ```
 */
export function ControlContainer({ children, className, style }: ControlContainerProps) {
  // 收集子控件并按 position 分组
  const { controlGroups, otherChildren } = collectAndGroup(children);

  return (
    <ControlContainerContext.Provider value={true}>
      <div className={`l7-control-container${className ? ` ${className}` : ''}`} style={style}>
        {Object.entries(controlGroups).map(([position, elements]) => {
          const { vSide, hSide, direction } = getPositionDir(position as ControlPosition);
          return (
            <div key={position} className={`l7-control-anchor l7-${vSide} l7-${hSide} l7-${direction}`}>
              {elements}
            </div>
          );
        })}
        {/* 非控件 children 原样渲染 */}
        {otherChildren}
      </div>
    </ControlContainerContext.Provider>
  );
}

/**
 * 从 children 中分离控件和非控件，控件按 position 分组
 */
function collectAndGroup(children: ReactNode): {
  controlGroups: Record<string, ReactNode[]>;
  otherChildren: ReactNode[];
} {
  const controlGroups: Record<string, ReactNode[]> = {};
  const otherChildren: ReactNode[] = [];

  React.Children.forEach(children, (child, index) => {
    if (!React.isValidElement(child)) {
      otherChildren.push(child);
      return;
    }

    if (ControlRegistry.check(child)) {
      const position = (child.props as any)?.position ?? 'topright';
      if (!controlGroups[position]) controlGroups[position] = [];
      controlGroups[position].push(child);
    } else {
      // 非控件子组件（如 Marker、图层等）用 key 保持稳定
      otherChildren.push(
        React.isValidElement(child)
          ? React.cloneElement(child, { key: (child as any).key ?? `non-ctrl-${index}` })
          : child
      );
    }
  });

  return { controlGroups, otherChildren };
}

/**
 * 根据 L7 的 position 规范返回方向信息
 */
function getPositionDir(position: ControlPosition): {
  vSide: string;
  hSide: string;
  direction: string;
} {
  switch (position) {
    case 'topleft':      return { vSide: 'top', hSide: 'left', direction: 'column' };
    case 'topright':     return { vSide: 'top', hSide: 'right', direction: 'column' };
    case 'bottomleft':   return { vSide: 'bottom', hSide: 'left', direction: 'column' };
    case 'bottomright':  return { vSide: 'bottom', hSide: 'right', direction: 'column' };
    case 'topcenter':    return { vSide: 'top', hSide: 'left', direction: 'row' };
    case 'bottomcenter': return { vSide: 'bottom', hSide: 'left', direction: 'row' };
    case 'lefttop':      return { vSide: 'top', hSide: 'left', direction: 'row' };
    case 'leftbottom':   return { vSide: 'bottom', hSide: 'left', direction: 'row' };
    case 'righttop':     return { vSide: 'top', hSide: 'right', direction: 'row' };
    case 'rightbottom':  return { vSide: 'bottom', hSide: 'right', direction: 'row' };
    default:             return { vSide: 'top', hSide: 'right', direction: 'column' };
  }
}

export default ControlContainer;