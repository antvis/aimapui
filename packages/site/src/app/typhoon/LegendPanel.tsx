/* ================================================================
   图例面板
   含风圈开关、登陆点、预报台、台风等级、风圈等级、警戒线、
   降雨等级、雷达反射率
   ================================================================ */

import { LegendCategories } from '@antv/aimapui';
import type { LandPoint } from './types';
import {
  C, GRADE_LABELS, GRADE_COLORS, WIND_LEVEL_KEY, WIND_LEVEL_COLOR,
  AGENCIES, AGENCY_COLOR, WARNING_LINE_COLORS,
} from './constants';

interface LegendPanelProps {
  showWindCircles: boolean;
  legendExpanded: boolean;
  landMarks: LandPoint[];
  isMobile: boolean;
  onToggleLegend: () => void;
  onToggleWindCircles: () => void;
}

export default function LegendPanel({
  showWindCircles, legendExpanded, landMarks, isMobile,
  onToggleLegend, onToggleWindCircles,
}: LegendPanelProps) {
  return (
    <div style={{
      padding: isMobile ? '8px 10px' : '10px 12px', background: C.panel, backdropFilter: 'blur(12px)',
      border: `1px solid ${C.border}`, borderRadius: isMobile ? '10px 0 0 10px' : 10,
      maxHeight: isMobile ? 'none' : (legendExpanded ? 320 : 40),
      maxWidth: isMobile ? 220 : 'none',
      overflowY: 'auto', transition: isMobile ? 'transform 0.3s ease' : 'max-height 0.3s',
      transform: isMobile ? (legendExpanded ? 'translateX(0)' : 'translateX(calc(100% - 36px))') : 'none',
    }}>
      <div onClick={onToggleLegend} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', paddingBottom: legendExpanded ? 8 : 0, minWidth: isMobile ? 36 : 'auto' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap' }}>{isMobile && !legendExpanded ? '' : '图例'}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: C.muted, transition: 'transform 0.3s', transform: legendExpanded ? (isMobile ? 'rotate(0deg)' : 'rotate(180deg)') : (isMobile ? 'rotate(180deg)' : 'rotate(0deg)') }}>{isMobile ? 'chevron_left' : 'expand_more'}</span>
      </div>
      {legendExpanded && (
        <>
          {/* 风圈开关 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>风圈</span>
            <input type="checkbox" checked={showWindCircles} onChange={onToggleWindCircles} style={{ accentColor: C.accent, cursor: 'pointer' }} />
          </div>
          {/* 登陆点 */}
          {landMarks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <img src="https://mdn.alipayobjects.com/huamei_b5qxsh/afts/img/A*ADaqSZdQm0wAAAAAPSAAAAgAerZ5AQ/original" alt="" style={{ width: 12, height: 15 }} />
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>登陆点</span>
            </div>
          )}
          {/* 预报台 */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>预报台</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {AGENCIES.map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 12, height: 0, borderTop: `2px dashed ${AGENCY_COLOR[a]}`, opacity: 0.8 }} />
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
          {/* 台风等级 */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
            <LegendCategories type="categories" title="台风等级" labels={GRADE_LABELS} colors={GRADE_COLORS} swatchShape="circle" className="[&_span.text-on-surface]:!text-[#e2e8f0]" />
          </div>
          {/* 风圈等级 */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>风圈等级</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {WIND_LEVEL_KEY.map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: `${WIND_LEVEL_COLOR[k]}33`, border: `1.5px solid ${WIND_LEVEL_COLOR[k]}` }} />
                  <span style={{ fontSize: 11, color: '#cbd5e1' }}>{k} 级风圈</span>
                </div>
              ))}
            </div>
          </div>
          {/* 警戒线 */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>警戒线</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 0, borderTop: `2px dashed ${WARNING_LINE_COLORS['24h']}` }} />
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>24小时警戒线</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 0, borderTop: `2px dashed ${WARNING_LINE_COLORS['48h']}` }} />
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>48小时警戒线</span>
              </div>
            </div>
          </div>
          {/* 降雨等级 */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4, marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>降雨等级</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
              {[
                { label: '0-10', color: '#a5d6a7' }, { label: '10-25', color: '#66bb6a' },
                { label: '25-50', color: '#42a5f5' }, { label: '50-100', color: '#1e88e5' },
                { label: '100-250', color: '#e040fb' }, { label: '>250', color: '#c62828' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, background: r.color }} />
                  <span style={{ fontSize: 10, color: '#cbd5e1' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* 雷达反射率 */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>雷达反射率 dBZ</div>
            <div style={{ display: 'flex', gap: 1 }}>
              {['#00bcd4', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#f44336', '#e91e63', '#9c27b0', '#673ab7'].map((c, i) => (
                <div key={i} style={{ flex: 1, height: 8, background: c }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 9, color: C.muted }}>10</span>
              <span style={{ fontSize: 9, color: C.muted }}>70</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}