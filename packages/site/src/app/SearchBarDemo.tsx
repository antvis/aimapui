import React, { useState } from 'react';
import { AiMap, SearchBar } from '@antv/aimapui';

/**
 * 浮动搜索框 — SearchBar
 *
 * 移动端毛玻璃风格的搜索栏，固定在地图顶部，输入实时回调，并提供清除与筛选按钮。
 */
export default function SearchBarDemo() {
  const [keyword, setKeyword] = useState('');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [120.155, 30.255],
          zoom: 12,
          style: 'light',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <SearchBar
          placeholder="搜索西湖周边景点、餐饮…"
          onSearch={setKeyword}
          onFilter={() => alert('打开筛选面板')}
        />
        {keyword && (
          <div
            style={{
              marginTop: 8,
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 10,
              fontSize: 12,
              color: '#666',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            正在搜索：<b style={{ color: '#171717' }}>{keyword}</b>
          </div>
        )}
      </div>
    </div>
  );
}
