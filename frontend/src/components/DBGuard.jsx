// Shows a "MySQL disconnected" overlay when DB is down
export default function DBGuard({ dbStatus, children }) {
  if (dbStatus === 'disconnected') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:20 }}>
        <div style={{ fontSize:64 }}>🔌</div>
        <div style={{ fontFamily:'Space Grotesk', fontSize:24, fontWeight:700, color:'#F43F5E' }}>MySQL is Offline</div>
        <div style={{ fontSize:15, color:'#64748B', textAlign:'center', maxWidth:400, lineHeight:1.7 }}>
          Cannot load data — the database is not connected.<br/>
          Open <strong style={{ color:'#F8FAFC' }}>XAMPP Control Panel</strong> and start <strong style={{ color:'#10B981' }}>MySQL</strong>.<br/>
          The page will reload automatically.
        </div>
        <div style={{ padding:'12px 24px', borderRadius:12, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.2)', fontSize:13, color:'#F43F5E', fontFamily:'monospace' }}>
          http://localhost:8000/api/health → 503
        </div>
      </div>
    );
  }
  return children;
}
