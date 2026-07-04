import { useState, useEffect } from 'react';
import { getLeads, getPipelineStages } from '../api';
import Badge from '../components/Badge';
import DBGuard from '../components/DBGuard';

const sc=['#00D4FF','#8B5CF6','#10B981','#F59E0B','#10B981','#F43F5E'];

export default function Pipeline({ dbStatus }) {
  const [leads,  setLeads]  = useState([]);
  const [stages, setStages] = useState([]);
  const [loading,setLoading]= useState(true);

  useEffect(()=>{
    if(dbStatus==='connected')
      Promise.all([getLeads(),getPipelineStages()])
        .then(([l,s])=>{ setLeads(l.data||[]); setStages(s.data||[]); })
        .finally(()=>setLoading(false));
  },[dbStatus]);

  const total = leads.length || 1;

  return (
    <DBGuard dbStatus={dbStatus}>
      <div className="page-enter">
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:13, color:'#64748B', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>Visual Board · MySQL</div>
          <h1 style={{ fontFamily:'Space Grotesk', fontSize:32, fontWeight:700, letterSpacing:'-0.8px' }}>Pipeline</h1>
        </div>

        {!loading && (
          <>
            <div className="glass" style={{ padding:28, marginBottom:32 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>FUNNEL — sp_LeadFunnel() live data</div>
              <div style={{ display:'flex', height:64, borderRadius:12, overflow:'hidden' }}>
                {stages.filter(s=>s.Lead_Count>0).map((s,i)=>{
                  const pct=(s.Lead_Count/total)*100;
                  return <div key={s.Stage_Name} style={{ width:`${pct}%`, background:`${sc[i]}20`, borderRight:`1px solid ${sc[i]}30`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minWidth:50 }}>
                    <div style={{ fontWeight:700, fontSize:18, color:sc[i], fontFamily:'Space Grotesk' }}>{s.Lead_Count}</div>
                    <div style={{ fontSize:9, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.04em' }}>{s.Stage_Name}</div>
                  </div>;
                })}
              </div>
            </div>

            <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:16 }}>
              {stages.map((stage,si)=>{
                const sl=leads.filter(l=>l.Stage_ID===stage.Stage_ID||l.Stage_Name===stage.Stage_Name);
                return (
                  <div key={stage.Stage_ID} style={{ width:220, flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:sc[si] }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em' }}>{stage.Stage_Name}</span>
                      </div>
                      <span style={{ fontSize:12, padding:'2px 8px', borderRadius:6, background:`${sc[si]}18`, color:sc[si], fontWeight:600 }}>{sl.length}</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {sl.map(lead=>(
                        <div key={lead.Person_ID} className="glass glass-hover" style={{ padding:16 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:`${sc[si]}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:sc[si] }}>{lead.Person_Name?.charAt(0)}</div>
                            <div><div style={{ fontSize:13, fontWeight:600 }}>{lead.Person_Name}</div><div style={{ fontSize:11, color:'#64748B', marginTop:1 }}>{lead.Lead_Source}</div></div>
                          </div>
                          <Badge text={lead.Status}/>
                          <div style={{ fontSize:11, color:'#64748B', marginTop:8 }}>Rep: {lead.Rep_Name}</div>
                        </div>
                      ))}
                      {sl.length===0&&<div style={{ padding:'24px 12px', textAlign:'center', border:'1px dashed rgba(255,255,255,0.07)', borderRadius:16 }}><div style={{ fontSize:12, color:'#475569' }}>Empty</div></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {loading && <div style={{ textAlign:'center', padding:60, color:'#475569' }}>Loading from MySQL…</div>}
      </div>
    </DBGuard>
  );
}
