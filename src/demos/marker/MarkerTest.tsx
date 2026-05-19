import React, { useEffect, useState } from 'react';
import { Aimap, Marker } from '../../index';

/**
 * Marker 最简单测试页面
 * 只测试最基本的 Marker 显示功能
 */
export default function MarkerTest() {
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    console.log('[MarkerTest] Component mounted');
  }, []);

  const handleSceneReady = (scene: any) => {
    console.log('[MarkerTest] Scene ready:', scene);
    setSceneReady(true);
    
    // 检查 Scene 的 getMarkerContainer 方法
    if (typeof scene.getMarkerContainer === 'function') {
      const container = scene.getMarkerContainer();
      console.log('[MarkerTest] getMarkerContainer() returned:', container);
      console.log('[MarkerTest] Container type:', container?.constructor?.name);
      console.log('[MarkerTest] Container in DOM:', document.contains(container));
    } else {
      console.error('[MarkerTest] Scene does NOT have getMarkerContainer method');
    }
    
    // 检查 mapService 的 getMarkerContainer 方法
    const mapService = scene.mapService;
    if (mapService && typeof mapService.getMarkerContainer === 'function') {
      const container2 = mapService.getMarkerContainer();
      console.log('[MarkerTest] mapService.getMarkerContainer() returned:', container2);
    } else {
      console.error('[MarkerTest] mapService does NOT have getMarkerContainer method');
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 状态提示 */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: 4,
        fontSize: 12,
        zIndex: 1000
      }}>
        Scene状态: {sceneReady ? '✅ Ready' : '⏳ Loading'}
      </div>

      <Aimap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 13,
          style: 'light',
        }}
        onSceneReady={handleSceneReady}
      >
        {/* 最简单的 Marker - 默认水滴型 */}
        <Marker
          longitude={116.397}
          latitude={39.909}
        />

        {/* 纯文本 Marker */}
        <Marker
          longitude={116.407}
          latitude={39.909}
          content="测试文本"
        />

        {/* HTML 字符串 Marker */}
        <Marker
          longitude={116.397}
          latitude={39.919}
          content="<div style='background:red;padding:4px;color:white'>HTML</div>"
        />

        {/* ReactNode Marker */}
        <Marker
          longitude={116.407}
          latitude={39.919}
          content={
            <div style={{
              background: '#004ac6',
              padding: '4px 8px',
              borderRadius: 4,
              color: 'white'
            }}>
              ReactNode
            </div>
          }
        />
      </Aimap>
    </div>
  );
}