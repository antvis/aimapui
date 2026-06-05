import React from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * Logo 控件 — 在地图角落展示品牌/项目 Logo
 *
 * 支持传入单张或多张 Logo 图片，水平排列：
 * - logos: Logo 配置数组，每项包含 src（图片地址）和可选的 alt、href、width
 * - position: 控件位置，默认 bottomleft
 * - 玻璃态风格，与 ZoomControl / ScaleControl 等视觉一致
 */
export interface LogoItem {
  /** 图片地址 */
  src: string;
  /** 图片 alt 文本 */
  alt?: string;
  /** 点击跳转链接 */
  href?: string;
  /** 图片宽度（px），默认 24 */
  width?: number;
}

export interface LogoControlProps {
  /** Logo 列表，支持多张 */
  logos: LogoItem[];
  /** 控件位置，默认 bottomleft */
  position?: ControlPosition;
  /** 额外 className */
  className?: string;
  /** 额外 style */
  style?: React.CSSProperties;
}

export function LogoControl({
  logos,
  position = 'bottomleft',
  className,
  style,
}: LogoControlProps) {
  const { positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();

  const controlContent = (
    <div
      className={`l7-control l7-control-logo${className ? ` ${className}` : ''}`}
      style={style}
    >
      {logos.map((logo, i) => {
        const img = (
          <img
            key={i}
            src={logo.src}
            alt={logo.alt ?? 'logo'}
            width={logo.width ?? 24}
            height={logo.width ?? 24}
            style={{ objectFit: 'contain', display: 'block' }}
          />
        );
        if (logo.href) {
          return (
            <a
              key={i}
              href={logo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="l7-control-logo-link"
            >
              {img}
            </a>
          );
        }
        return <div key={i} className="l7-control-logo-link">{img}</div>;
      })}
    </div>
  );

  if (isInContainer) return controlContent;

  return (
    <div className={`l7-control-anchor ${positionClassName}`}>
      {controlContent}
    </div>
  );
}

// 注册为控件类型，供 ControlContainer 识别
ControlRegistry.mark(LogoControl);

export default LogoControl;
