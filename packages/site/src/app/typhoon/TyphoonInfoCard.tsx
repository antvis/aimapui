/* ================================================================
   台风信息卡片 + 列表选择器
   ================================================================ */

import type { TyphoonInfo, TyphoonListItem, TyphoonPoint } from './types';
import { GRADE_COLOR, STRENGTH_TO_KEY, C } from './constants';
import { pointGrade } from './transform';
import InfoItem from './Info';

interface TyphoonInfoCardProps {
  info: TyphoonInfo | null;
  currentPoint: TyphoonPoint | undefined;
  list: TyphoonListItem[];
  activeIds: string[];
  tfid: string;
  points: TyphoonPoint[];
  loading: boolean;
  listExpanded: boolean;
  pointsDetailExpanded: boolean;
  isMobile: boolean;
  onToggleListExpanded: () => void;
  onTogglePointsDetail: () => void;
  onSelectTfid: (tfid: string) => void;
}

export default function TyphoonInfoCard({
  info, currentPoint, list, activeIds, tfid, points,
  loading, listExpanded, pointsDetailExpanded, isMobile,
  onToggleListExpanded, onTogglePointsDetail, onSelectTfid,
}: TyphoonInfoCardProps) {
  const eyeColor = currentPoint ? GRADE_COLOR[pointGrade(currentPoint)] : C.accent;

  return (
    <div style={{ position: isMobile ? 'absolute' : 'relative', top: isMobile ? 92 : undefined, right: isMobile ? 8 : undefined, zIndex: isMobile ? 1000 : undefined, display: 'flex', flexDirection: 'column', gap: 8, width: isMobile ? 'calc(100% - 16px)' : 240, maxHeight: isMobile ? 'calc(50vh - 60px)' : 'calc(100vh - 120px)' }}>
      {/* 台风信息卡 */}
      {currentPoint && !isMobile && (
        <div style={{
          padding: '12px 14px', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: eyeColor }}>cyclone</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>{info?.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{info?.enname} · {info?.tfid}</div>
            </div>
            {info?.isactive === '1' && (
              <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: 6 }}>活跃</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: eyeColor, background: `${eyeColor}22`, padding: '3px 8px', borderRadius: 6 }}>{currentPoint.strong}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{currentPoint.power}级 · {currentPoint.speed}m/s</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: 11 }}>
            <InfoItem label="经度" value={`${Number(currentPoint.lng).toFixed(1)}°`} />
            <InfoItem label="纬度" value={`${Number(currentPoint.lat).toFixed(1)}°`} />
            <InfoItem label="中心气压" value={`${currentPoint.pressure}hPa`} />
            <InfoItem label="移速" value={currentPoint.movespeed ? `${currentPoint.movespeed}km/h` : '—'} />
            <InfoItem label="移向" value={currentPoint.movedirection || '—'} />
            <InfoItem label="时间" value={currentPoint.time?.slice(5) || '—'} />
          </div>
        </div>
      )}

      {/* 台风列表选择器 */}
      {isMobile && !listExpanded ? (
        <div onClick={onToggleListExpanded} style={{
          width: 36, height: 36, borderRadius: '50%', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: 'background 120ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = C.panel; }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.accent }}>list</span>
        </div>
      ) : (
        <div style={{
          padding: '8px 10px', background: C.panel, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.border}`, borderRadius: 12, overflowY: 'auto', minHeight: 0,
        }}>
          <div
            onClick={onToggleListExpanded}
            style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: (!listExpanded || (isMobile && !listExpanded)) ? 0 : 6, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{listExpanded ? 'expand_less' : 'expand_more'}</span>
            台风列表（{list.length}）
          </div>
          {(listExpanded || !isMobile) && (
            <>
              {loading && <div style={{ fontSize: 11, color: C.muted, padding: '4px 0' }}>加载中…</div>}
              {[...list].reverse().slice(0, listExpanded ? list.length : 3).map(t => {
                const sel = t.tfid === tfid;
                const actv = activeIds.includes(t.tfid) || t.isactive === '1';
                return (
                  <div key={t.tfid}>
                    <div onClick={() => {
                      onSelectTfid(t.tfid);
                      if (sel) onTogglePointsDetail();
                    }} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', margin: '2px 0', borderRadius: 6,
                      cursor: 'pointer', fontSize: 11,
                      background: sel ? 'rgba(34,211,238,0.12)' : 'transparent',
                      color: sel ? '#e0f2fe' : 'rgba(203,213,225,0.75)', fontWeight: sel ? 600 : 400,
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = 'transparent'; } }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: actv ? '#22c55e' : 'rgba(148,163,184,0.4)', boxShadow: actv ? '0 0 6px #22c55e' : 'none', flexShrink: 0 }} />
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                      <span style={{ fontSize: 9, color: C.muted, flexShrink: 0 }}>{t.tfid.slice(-3)}</span>
                      {sel && <span className="material-symbols-outlined" style={{ fontSize: 12, color: C.muted }}>{pointsDetailExpanded ? 'expand_less' : 'expand_more'}</span>}
                    </div>
                    {/* 点位详情展开面板 */}
                    {sel && pointsDetailExpanded && info?.points && (
                      <div style={{ margin: '4px 0 8px', padding: '6px', background: 'rgba(15,23,42,0.6)', borderRadius: 8, border: `1px solid ${C.border}`, maxHeight: 200, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                          <thead>
                            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                              <th style={{ padding: '4px 6px', textAlign: 'left', color: C.muted, fontWeight: 500 }}>时间</th>
                              <th style={{ padding: '4px 6px', textAlign: 'left', color: C.muted, fontWeight: 500 }}>强度</th>
                              <th style={{ padding: '4px 6px', textAlign: 'right', color: C.muted, fontWeight: 500 }}>风速</th>
                              <th style={{ padding: '4px 6px', textAlign: 'right', color: C.muted, fontWeight: 500 }}>气压</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...points].reverse().map((p, idx) => (
                              <tr key={idx} style={{ borderBottom: `1px solid rgba(148,163,184,0.1)` }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                <td style={{ padding: '3px 6px', color: 'rgba(203,213,225,0.9)' }}>{p.time?.slice(5, 16)}</td>
                                <td style={{ padding: '3px 6px', color: GRADE_COLOR[STRENGTH_TO_KEY[p.strong] || 'TD'] || C.muted }}>{p.strong}</td>
                                <td style={{ padding: '3px 6px', textAlign: 'right', color: 'rgba(203,213,225,0.9)' }}>{p.speed} m/s</td>
                                <td style={{ padding: '3px 6px', textAlign: 'right', color: 'rgba(203,213,225,0.9)' }}>{p.pressure} hPa</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
              {!listExpanded && list.length > 3 && (
                <div onClick={onToggleListExpanded} style={{ fontSize: 10, color: C.accent, textAlign: 'center', padding: '4px 0', cursor: 'pointer' }}>
                  展开全部（{list.length}）
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}