import { useState } from 'react';
import {
  LayerCompare,
  PMTilesLayer,
  type LayerCompareMode,
} from '@antv/aimapui';

/**
 * LayerCompare Demo — PMTiles 时相卷帘对比
 *
 * 使用 `LayerCompare` 叠放两个 PMTiles 栅格影像归档进行时相对比：
 * - before（卷帘下层）：2025-08-17（孙家小庄 8/17 影像）
 * - after （卷帘上层）：2025-09-04（9/4 影像）
 *
 * 拖动卷帘条即可揭示/遮罩上层影像，逐一对比两个时相的变化；
 * 右上角工具栏可在「双屏 / 卷帘」之间切换。两侧相机自动同步，保证像素级对齐。
 *
 * PMTiles 渲染链路在 L7 WebGL 层，**与底图引擎无关**；使用高德卫星底图时
 * **无需配置 token**（组件内置默认 token 可用）。
 */
const URL_BEFORE =
  'https://pmtiles-data.oss-cn-beijing.aliyuncs.com/sun_jia_xiao_zhuang_8_1_7_r_e_s_u_l_t.pmtiles';
const URL_AFTER =
  'https://pmtiles-data.oss-cn-beijing.aliyuncs.com/tai_an_fei_cheng_9_4_tai_an_fei_cheng_sun_jia_xiao_zhuang_9_4.pmtiles';

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

export default function LayerCompareDemo() {
  const [mode, setMode] = useState<LayerCompareMode>('swipe');
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <LayerCompare
        mode={mode}
        onModeChange={setMode}
        map={{ basemap: 'gaode', style: 'satellite' }}
        beforeLabel="2025-08-17"
        afterLabel="2025-09-04"
        defaultPosition={50}
        before={
          /* before：2025-08-17，负责 fitBounds 定位；after 通过相机同步自动对齐 */
          <PMTilesLayer
            url={URL_BEFORE}
            fitBounds
            fitBoundsPadding={40}
            onError={(e) => setError(`2025-08-17: ${e.message}`)}
          />
        }
        after={
          /* after：2025-09-04，不单独 fitBounds，跟随 before 视角 */
          <PMTilesLayer
            url={URL_AFTER}
            onError={(e) => setError(`2025-09-04: ${e.message}`)}
          />
        }
      />

      {error && <div style={ERR_STYLE}>❌ {error}</div>}
    </div>
  );
}
