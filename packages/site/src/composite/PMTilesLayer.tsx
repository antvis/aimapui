import { useState } from 'react';
import { AiMap, ZoomControl, PMTilesLayer } from '@antv/aimapui';

/**
 * PMTiles 栅格影像 Demo
 *
 * 单图层展示一份 PMTiles 栅格影像归档（图牧特油气美岱召召根家营村 9/10 影像）。
 * 组件内部按 (z,x,y) 调 `PMTiles.getZxy` 经 HTTP Range 请求按需读取瓦片字节，
 * 交由 L7 `RasterLayer` 解码贴片。整条渲染链路在 L7 WebGL 层，**与底图引擎无关**，
 * 使用高德卫星底图时**无需配置 token**（组件内置默认 token 可用）。
 *
 * `fitBounds` 在归档文件头读取完成后自动定位到影像覆盖范围。
 */
const PMTILES_URL =
  'https://pmtiles-data.oss-cn-beijing.aliyuncs.com/tu_mo_te_you_qi_mei_dai_zhao_zhen_mei_dai_zhao_zhen_ge_jia_ying_cun_9_1_0.pmtiles';

const TITLE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  padding: '6px 14px',
  borderRadius: 8,
  background: 'rgba(15,23,42,0.82)',
  color: '#e2e8f0',
  backdropFilter: 'blur(8px)',
  fontSize: 12,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
};

const ERR_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  padding: '6px 12px',
  borderRadius: 8,
  background: 'rgba(127,29,29,0.9)',
  color: '#fca5a5',
  fontSize: 12,
};

const LOADING_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 20,
  padding: '6px 12px',
  borderRadius: 8,
  background: 'rgba(15,23,42,0.82)',
  color: '#cbd5e1',
  backdropFilter: 'blur(8px)',
  fontSize: 12,
  pointerEvents: 'none',
};

export default function PMTilesLayerDemo() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap map={{ basemap: 'gaode', style: 'satellite' }}>
        <PMTilesLayer
          url={PMTILES_URL}
          fitBounds
          fitBoundsPadding={40}
          opacity={1}
          onReady={() => setLoading(false)}
          onError={(e) => {
            setError(e.message);
            setLoading(false);
          }}
        />
        <ZoomControl position="bottomright" />
      </AiMap>

      <div style={TITLE_STYLE}>PMTiles 栅格影像 · 图牧特油气 9/10</div>

      {loading && !error && <div style={LOADING_STYLE}>正在加载 PMTiles 影像…</div>}

      {error && <div style={ERR_STYLE}>❌ {error}</div>}
    </div>
  );
}
