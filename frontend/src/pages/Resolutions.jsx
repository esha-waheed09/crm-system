import { useState, useEffect } from 'react';
import { getResolutions } from '../api';
import Table from '../components/Table';
import Badge from '../components/Badge';
import DBGuard from '../components/DBGuard';

export default function Resolutions({ dbStatus }) {
  const [data,setData]=useState([]); const [loading,setL]=useState(true);
  useEffect(()=>{ if(dbStatus==='connected') getResolutions().then(r=>setData(r.data||[])).finally(()=>setL(false)); },[dbStatus]);

  const columns=[
    {key:'Complaint_Subject',label:'Complaint',render:r=><span style={{fontWeight:500}}>{r.Complaint_Subject}</span>},
    {key:'Customer_Name',label:'Customer',render:r=><span style={{color:'#94A3B8',fontSize:13}}>{r.Customer_Name}</span>},
    {key:'Rep_Name',label:'Resolved By',render:r=><span style={{color:'#00D4FF',fontSize:13}}>{r.Rep_Name}</span>},
    {key:'Resolution_Date',label:'Date',render:r=><span style={{color:'#94A3B8',fontSize:13}}>{r.Resolution_Date}</span>},
    {key:'Action_Taken',label:'Action',render:r=><span style={{color:'#64748B',fontSize:13}}>{r.Action_Taken}</span>},
    {key:'Outcome',label:'Outcome',render:r=><Badge text={r.Outcome}/>},
  ];

  return (<DBGuard dbStatus={dbStatus}><div className="page-enter">
    <div style={{marginBottom:36}}>
      <div style={{fontSize:13,color:'#64748B',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:500}}>MySQL · RESOLUTION table</div>
      <h1 style={{fontFamily:'Space Grotesk',fontSize:32,fontWeight:700,letterSpacing:'-0.8px'}}>Resolutions</h1>
      <p style={{fontSize:15,color:'#64748B',marginTop:6}}>{data.length} resolutions in crm_db</p>
    </div>
    {loading?<div style={{textAlign:'center',padding:60,color:'#475569'}}>Loading…</div>:<Table columns={columns} data={data}/>}
  </div></DBGuard>);
}
