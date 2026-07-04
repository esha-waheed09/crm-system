import { useState, useEffect } from 'react';
import { getConversions } from '../api';
import Table from '../components/Table';
import DBGuard from '../components/DBGuard';

export default function Conversions({ dbStatus }) {
  const [data,setData]=useState([]); const [loading,setL]=useState(true);
  useEffect(()=>{ if(dbStatus==='connected') getConversions().then(r=>setData(r.data||[])).finally(()=>setL(false)); },[dbStatus]);

  const totalRev=data.reduce((s,c)=>s+(+c.Total_Purchase_Value||0),0);

  const columns=[
    {key:'Lead_Name',label:'Lead',render:r=><span style={{fontWeight:500,color:'#00D4FF'}}>{r.Lead_Name}</span>},
    {key:'Customer_Name',label:'Customer',render:r=><span style={{fontWeight:500,color:'#10B981'}}>{r.Customer_Name}</span>},
    {key:'Rep_Name',label:'Converted By',render:r=><span style={{color:'#8B5CF6',fontSize:13}}>{r.Rep_Name}</span>},
    {key:'Conversion_Date',label:'Date',render:r=><span style={{color:'#94A3B8',fontSize:13}}>{r.Conversion_Date}</span>},
    {key:'Notes',label:'Notes',render:r=><span style={{color:'#64748B',fontSize:13,fontStyle:'italic'}}>{r.Notes}</span>},
    {key:'Total_Purchase_Value',label:'Value',render:r=><span style={{color:'#F59E0B',fontWeight:700,fontFamily:'Space Grotesk'}}>PKR {(+r.Total_Purchase_Value).toLocaleString()}</span>},
  ];

  return (<DBGuard dbStatus={dbStatus}><div className="page-enter">
    <div style={{marginBottom:36}}>
      <div style={{fontSize:13,color:'#64748B',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:500}}>MySQL · CONVERSION_EVENT table</div>
      <h1 style={{fontFamily:'Space Grotesk',fontSize:32,fontWeight:700,letterSpacing:'-0.8px'}}>Conversions</h1>
      <p style={{fontSize:15,color:'#64748B',marginTop:6}}>{data.length} conversion events · Total PKR {totalRev.toLocaleString()}</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:32}}>
      {data.map((ce,i)=>(
        <div key={i} className="glass glass-hover" style={{padding:24}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(0,212,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#00D4FF'}}>{ce.Lead_Name?.charAt(0)}</div>
            <span style={{color:'#475569',fontSize:18}}>→</span>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#10B981'}}>{ce.Customer_Name?.charAt(0)}</div>
          </div>
          <div style={{fontSize:13,marginBottom:4}}><span style={{color:'#00D4FF'}}>{ce.Lead_Name}</span><span style={{color:'#475569'}}> → </span><span style={{color:'#10B981'}}>{ce.Customer_Name}</span></div>
          <div style={{fontSize:12,color:'#64748B',marginBottom:2}}>{ce.Conversion_Date}</div>
          <div style={{fontSize:12,color:'#8B5CF6'}}>By {ce.Rep_Name}</div>
        </div>
      ))}
    </div>
    {loading?<div style={{textAlign:'center',padding:60,color:'#475569'}}>Loading…</div>:<Table columns={columns} data={data}/>}
  </div></DBGuard>);
}
