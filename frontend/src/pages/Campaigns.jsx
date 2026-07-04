import { useState, useEffect } from 'react';
import { getCampaigns, getCampaignROI } from '../api';
import Table from '../components/Table';
import DBGuard from '../components/DBGuard';

const tc={'Email':'#00D4FF','Social Media':'#8B5CF6','Referral':'#10B981','Paid Ads':'#F59E0B'};

export default function Campaigns({ dbStatus }) {
  const [camps,setC]=useState([]); const [roi,setR]=useState([]); const [loading,setL]=useState(true);
  useEffect(()=>{ if(dbStatus==='connected') Promise.all([getCampaigns(),getCampaignROI()]).then(([c,r])=>{setC(c.data||[]);setR(r.data||[]);}).finally(()=>setL(false)); },[dbStatus]);

  const columns=[
    {key:'name',label:'Campaign',render:r=><div style={{display:'flex',alignItems:'center',gap:14}}><div style={{width:4,height:40,borderRadius:2,background:tc[r.Campaign_Type]||'#00D4FF',flexShrink:0}}/><div><div style={{fontWeight:600,fontSize:14}}>{r.Campaign_Name}</div><div style={{fontSize:12,color:'#64748B',marginTop:2}}>{r.Campaign_Type}</div></div></div>},
    {key:'Budget',label:'Budget',render:r=><span style={{color:'#F59E0B',fontWeight:700,fontFamily:'Space Grotesk'}}>PKR {(+r.Budget).toLocaleString()}</span>},
    {key:'dates',label:'Duration',render:r=><span style={{color:'#94A3B8',fontSize:13}}>{r.Start_Date} → {r.End_Date}</span>},
    {key:'Total_Leads',label:'Leads',render:r=><span style={{color:'#00D4FF',fontWeight:700,fontFamily:'Space Grotesk',fontSize:18}}>{r.Total_Leads}</span>},
  ];

  return (<DBGuard dbStatus={dbStatus}><div className="page-enter">
    <div style={{marginBottom:36}}>
      <div style={{fontSize:13,color:'#64748B',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:500}}>MySQL · CAMPAIGN table</div>
      <h1 style={{fontFamily:'Space Grotesk',fontSize:32,fontWeight:700,letterSpacing:'-0.8px'}}>Campaigns</h1>
      <p style={{fontSize:15,color:'#64748B',marginTop:6}}>{camps.length} campaigns</p>
    </div>
    {loading?<div style={{textAlign:'center',padding:60,color:'#475569'}}>Loading…</div>:<>
      <Table columns={columns} data={camps}/>
      <div style={{marginTop:32}}>
        <h2 style={{fontFamily:'Space Grotesk',fontWeight:600,fontSize:20,marginBottom:6}}>ROI Analysis</h2>
        <p style={{fontSize:14,color:'#64748B',marginBottom:20}}>Stored Procedure: <code style={{color:'#8B5CF6',background:'rgba(139,92,246,0.1)',padding:'2px 8px',borderRadius:6}}>CALL sp_CampaignROI()</code></p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20}}>
          {roi.map(r=>(
            <div key={r.Campaign_Name} className="glass glass-hover" style={{padding:'24px 28px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
                <div><div style={{fontWeight:600,fontSize:16,marginBottom:4}}>{r.Campaign_Name}</div><div style={{fontSize:13,color:'#64748B'}}>{r.Campaign_Type}</div></div>
                <span style={{padding:'6px 12px',borderRadius:20,fontSize:13,fontWeight:700,background:r.ROI_Percent>=0?'rgba(16,185,129,0.1)':'rgba(244,63,94,0.1)',color:r.ROI_Percent>=0?'#10B981':'#F43F5E',border:`1px solid ${r.ROI_Percent>=0?'rgba(16,185,129,0.2)':'rgba(244,63,94,0.2)'}`}}>ROI {r.ROI_Percent}%</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                {[{l:'Budget',v:`PKR ${((+r.Budget)/1000).toFixed(0)}K`,c:'#F59E0B'},{l:'Leads',v:r.Total_Leads,c:'#00D4FF'},{l:'Revenue',v:`PKR ${((+r.Revenue_Generated)/1000).toFixed(0)}K`,c:'#10B981'}].map(s=>(
                  <div key={s.l} style={{background:'rgba(255,255,255,0.03)',borderRadius:12,padding:14}}><div style={{fontSize:11,color:'#64748B',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.l}</div><div style={{fontSize:18,fontWeight:700,color:s.c,fontFamily:'Space Grotesk'}}>{s.v}</div></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>}
  </div></DBGuard>);
}