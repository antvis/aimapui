/* ================================================================
   台风眼旋转动画符号
   ================================================================ */

export default function TyphoonEye({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56 }}>
      <div className="typhoon-spin" style={{
        position: 'absolute', width: 56, height: 56, borderRadius: '50%',
        border: `3px solid ${color}`, borderTopColor: 'transparent', borderRightColor: 'transparent',
        opacity: 0.95,
      }} />
      <div className="typhoon-spin-rev" style={{
        position: 'absolute', width: 38, height: 38, borderRadius: '50%',
        border: `2px solid ${color}`, borderBottomColor: 'transparent', borderLeftColor: 'transparent',
        opacity: 0.7,
      }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }} />
      <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.9)', background: 'rgba(0,0,0,0.55)', padding: '1px 6px', borderRadius: 6 }}>{label}</div>
      <style>{`
        @keyframes typhoon-rot { to { transform: rotate(360deg); } }
        .typhoon-spin { animation: typhoon-rot 6s linear infinite; }
        .typhoon-spin-rev { animation: typhoon-rot 4s linear infinite reverse; }
      `}</style>
    </div>
  );
}