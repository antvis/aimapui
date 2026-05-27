import React from 'react';
import { AiMap, MapThemeControl } from '../../index';
/**
 * 主题切换控件 — MapThemeControl
 *
 * 遵循 L7 SelectControl 规范：
 * - 点击按钮弹出下拉选项
 * - 自动获取当前底图支持的样式列表
 * - 支持 options 属性自定义主题列表
 */
export default function Demo06MapTheme() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <MapThemeControl />
      </AiMap>
</div>
  );
}