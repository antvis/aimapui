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

export interface ControlContainerProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * L7 规范的控件容器，将子控件按 position 分组到四角
 *
 * 用法：
 * ```tsx
 * <ControlContainer>
 *   <ZoomControl position="bottomright" />
 *   <ScaleControl position="bottomleft" />
 * </ControlContainer>
 * ```
 */
export function ControlContainer({ children, className, style }: ControlContainerProps) {
  // 收集子控件并按 position 分组
  const groups = collectByPosition(children);

  return (
    <ControlContainerContext.Provider value={true}>
      <div className={`l7-control-container${className ? ` ${className}` : ''}`} style={style}>
        {Object.entries(groups).map(([position, elements]) => {
          const { vSide, hSide, direction } = getPositionDir(position as ControlPosition);
          return (
            <div key={position} className={`l7-${vSide} l7-${hSide} l7-${direction}`}>
              {elements}
            </div>
          );
        })}
      </div>
    </ControlContainerContext.Provider>
  );
}

/**
 * 从 children 中提取 position 信息，按 position 分组
 */
function collectByPosition(children: ReactNode): Record<string, ReactNode[]> {
  const result: Record<string, ReactNode[]> = {};

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const position = (child.props as any)?.position ?? getDefaultPosition(child.type);
    if (!result[position]) result[position] = [];
    result[position].push(child);
  });

  return result;
}

/**
 * 根据控件组件类型推断默认 position
 */
function getDefaultPosition(component: any): ControlPosition {
  // 无法从组件类型静态推断，统一用 topright
  return 'topright';
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