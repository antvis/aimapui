/* ================================================================
   小信息行列组件
   ================================================================ */

export default function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.6)' }}>{label}</div>
      <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{value}</div>
    </div>
  );
}