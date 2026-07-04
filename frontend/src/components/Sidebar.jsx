import { useState } from 'react';
import { LayoutDashboard, Target, Users, Megaphone, GitBranch, PhoneCall, MessageSquare, AlertTriangle, CheckCircle2, ArrowRightLeft, Database, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const nav = [
  { id:'dashboard',   label:'Dashboard',         icon:LayoutDashboard, group:'OVERVIEW' },
  { id:'leads',       label:'Leads',             icon:Target,          group:'CRM' },
  { id:'customers',   label:'Customers',         icon:Users,           group:'CRM' },
  { id:'campaigns',   label:'Campaigns',         icon:Megaphone,       group:'CRM' },
  { id:'pipeline',    label:'Pipeline',          icon:GitBranch,       group:'CRM' },
  { id:'contacts',    label:'Contacts',          icon:PhoneCall,       group:'ACTIVITY' },
  { id:'feedback',    label:'Feedback',          icon:MessageSquare,   group:'ACTIVITY' },
  { id:'complaints',  label:'Complaints',        icon:AlertTriangle,   group:'ACTIVITY' },
  { id:'resolutions', label:'Resolutions',       icon:CheckCircle2,    group:'ACTIVITY' },
  { id:'conversions', label:'Conversions',       icon:ArrowRightLeft,  group:'ACTIVITY' },
  { id:'sql',         label:'SQL Queries',       icon:Database,        group:'REPORTS' },
  { id:'procedures',  label:'Stored Procedures', icon:Zap,             group:'REPORTS' },
];

export default function Sidebar({ active, onNav, dbStatus, dbInfo }) {
  const [collapsed, setCollapsed] = useState(false);
  const groups = [...new Set(nav.map(n=>n.group))];
  const dbColor = { connected:'#10B981', disconnected:'#F43F5E', checking:'#F59E0B' }[dbStatus] || '#F59E0B';
  const dbLabel = { connected:'MySQL Connected', disconnected:'MySQL Disconnected', checking:'Connecting…' }[dbStatus] || 'Checking…';

  return (
    <aside style={{ width:collapsed?72:260, minHeight:'100vh', flexShrink:0, background:'#0D1117', borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', transition:'width 0.25s cubic-bezier(0.16,1,0.3,1)', position:'relative' }}>
      <div style={{ padding:'28px 20px 24px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, background:'linear-gradient(135deg,#00D4FF,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:700, color:'#fff', fontFamily:'Space Grotesk', boxShadow:'0 0 20px rgba(0,212,255,0.25)' }}>C</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:18, letterSpacing:'-0.5px', color:'#F8FAFC' }}>
              CRM<span style={{ background:'linear-gradient(120deg,#00D4FF,#8B5CF6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>db</span>
            </div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:1 }}>UET Peshawar · 2026</div>
          </div>
        )}
      </div>

      <nav style={{ flex:1, padding:'0 12px', overflowY:'auto' }}>
        {groups.map(g=>(
          <div key={g} style={{ marginBottom:8 }}>
            {!collapsed && <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', color:'#475569', padding:'12px 4px 6px', textTransform:'uppercase' }}>{g}</div>}
            {nav.filter(n=>n.group===g).map(item=>{
              const Icon=item.icon; const isActive=active===item.id;
              return (
                <button key={item.id} onClick={()=>onNav(item.id)} className={`nav-btn ${isActive?'active':''}`} title={collapsed?item.label:''} style={{ justifyContent:collapsed?'center':'flex-start' }}>
                  <span className="nav-icon"><Icon size={15}/></span>
                  {!collapsed && item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div style={{ padding:'16px 20px 24px' }}>
          <div style={{ background:`${dbColor}10`, border:`1px solid ${dbColor}25`, borderRadius:14, padding:'14px 16px', transition:'all 0.4s' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:dbColor, display:'inline-block', boxShadow:`0 0 8px ${dbColor}`, animation:dbStatus==='connected'?'pulse 2s infinite':'none' }}/>
              <span style={{ fontSize:12, fontWeight:600, color:dbColor }}>{dbLabel}</span>
            </div>
            {dbInfo
              ? <div style={{ fontSize:11, color:'#64748B' }}>{dbInfo.database} · {dbInfo.tables} tables</div>
              : <div style={{ fontSize:11, color:'#475569' }}>Start XAMPP → MySQL</div>
            }
          </div>
        </div>
      )}

      <button onClick={()=>setCollapsed(!collapsed)} style={{ position:'absolute', top:34, right:-14, width:28, height:28, borderRadius:'50%', background:'#0D1117', border:'1px solid rgba(255,255,255,0.1)', color:'#64748B', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
        {collapsed?<ChevronRight size={13}/>:<ChevronLeft size={13}/>}
      </button>
    </aside>
  );
}
