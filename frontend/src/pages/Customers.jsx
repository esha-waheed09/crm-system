import { useState, useEffect } from 'react';
import { getCustomers } from '../api';
import Table from '../components/Table';
import DBGuard from '../components/DBGuard';

const ac = ['#10B981','#00D4FF','#8B5CF6'];

export default function Customers({ dbStatus }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dbStatus==='connected') getCustomers().then(r=>setData(r.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, [dbStatus]);

  const totalRev = data.reduce((s,c)=>s+(+c.Total_Purchase_Value||0),0);

  const columns = [
    { key:'name', label:'Customer', render:r=>(
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div className="avatar" style={{ background:`${ac[(r.Person_ID-7)%3]||ac[0]}18`, color:ac[(r.Person_ID-7)%3]||ac[0], width:44, height:44, borderRadius:14 }}>{r.Person_Name?.charAt(0)}</div>
        <div>
          <div style={{ fontWeight:600, fontSize:14 }}>{r.Person_Name}</div>
          <div style={{ fontSize:12, color:'#00D4FF', marginTop:2 }}>{r.Email}</div>
          <div style={{ fontSize:11, color:'#64748B', marginTop:1 }}>{r.Address}</div>
        </div>
      </div>
    )},
    { key:'Conversion_Date',      label:'Converted',      render:r=><span style={{color:'#94A3B8'}}>{r.Conversion_Date}</span> },
    { key:'Total_Purchase_Value', label:'Purchase Value', render:r=><span style={{color:'#10B981',fontWeight:700,fontFamily:'Space Grotesk',fontSize:16}}>PKR {(+r.Total_Purchase_Value).toLocaleString()}</span> },
    { key:'Avg_Rating',           label:'Avg Rating',     render:r=>r.Avg_Rating?<span style={{color:'#F59E0B'}}>{'★'.repeat(Math.round(r.Avg_Rating))} ({r.Avg_Rating})</span>:<span style={{color:'#475569'}}>—</span> },
    { key:'Total_Feedback',       label:'Reviews',        render:r=><span style={{color:'#64748B'}}>{r.Total_Feedback}</span> },
  ];

  return (
    <DBGuard dbStatus={dbStatus}>
      <div className="page-enter">
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:13, color:'#64748B', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>MySQL · CUSTOMER table</div>
          <h1 style={{ fontFamily:'Space Grotesk', fontSize:32, fontWeight:700, letterSpacing:'-0.8px' }}>Customers</h1>
          <p style={{ fontSize:15, color:'#64748B', marginTop:6 }}>{data.length} rows · Total PKR {totalRev.toLocaleString()}</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:32 }}>
          {data.map((c,i)=>(
            <div key={c.Person_ID} className="glass glass-hover" style={{ padding:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg,${ac[i%3]}33,${ac[i%3]}11)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:ac[i%3], fontFamily:'Space Grotesk' }}>{c.Person_Name?.charAt(0)}</div>
                <div><div style={{ fontWeight:600, fontSize:16 }}>{c.Person_Name}</div><div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{c.Address}</div></div>
              </div>
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:16, display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span style={{ color:'#64748B' }}>Revenue</span><span style={{ color:'#10B981', fontWeight:700, fontFamily:'Space Grotesk' }}>PKR {(+c.Total_Purchase_Value).toLocaleString()}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span style={{ color:'#64748B' }}>Converted</span><span style={{ color:'#94A3B8' }}>{c.Conversion_Date}</span></div>
                {c.Avg_Rating && <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span style={{ color:'#64748B' }}>Rating</span><span style={{ color:'#F59E0B' }}>{'★'.repeat(Math.round(c.Avg_Rating))} ({c.Avg_Rating})</span></div>}
              </div>
            </div>
          ))}
        </div>
        {loading ? <div style={{ textAlign:'center', padding:40, color:'#475569' }}>Loading…</div> : <Table columns={columns} data={data}/>}
      </div>
    </DBGuard>
  );
}
