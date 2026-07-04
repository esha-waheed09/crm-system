export default function StatCard({ label, value, sub, color='#00D4FF', icon:Icon, trend, accent }) {
  return (
    <div className="glass glass-hover" style={{ padding:'28px 28px 24px', height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{
          width:48, height:48, borderRadius:14,
          background:`${color}14`,
          border:`1px solid ${color}22`,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {Icon && <Icon size={22} style={{ color }} />}
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:20,
            background: trend>=0?'rgba(16,185,129,0.1)':'rgba(244,63,94,0.1)',
            color: trend>=0?'#10B981':'#F43F5E',
            border: `1px solid ${trend>=0?'rgba(16,185,129,0.2)':'rgba(244,63,94,0.2)'}`,
          }}>
            {trend>=0?'↑':'↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-num" style={{ color, marginBottom:8 }}>{value}</div>
      <div style={{ fontSize:14, fontWeight:500, color:'#F8FAFC', marginBottom:4 }}>{label}</div>
      {sub && <div style={{ fontSize:13, color:'#64748B' }}>{sub}</div>}
      {accent && (
        <div style={{ marginTop:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12, color:'#64748B' }}>
            <span>Progress</span><span style={{ color }}>{accent}%</span>
          </div>
          <div className="prog-track">
            <div className="prog-fill" style={{ width:`${accent}%`, background:`linear-gradient(90deg,${color}88,${color})` }} />
          </div>
        </div>
      )}
    </div>
  );
}
