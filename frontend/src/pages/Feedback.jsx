import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getFeedback, createFeedback, getCustomers } from '../api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import DBGuard from '../components/DBGuard';
import FormField, { Select, Textarea } from '../components/FormField';

export default function Feedback({ onRefresh, dbStatus }) {
  const [data,setData]=useState([]); const [custs,setCusts]=useState([]);
  const [loading,setL]=useState(true); const [showAdd,setShow]=useState(false); const [toast,setT]=useState(null);
  const [form,setForm]=useState({Customer_ID:'',Rating:5,Category:'Service',Comments:''});
  const notify=msg=>{setT(msg);setTimeout(()=>setT(null),2500);};

  const load=()=>{ if(dbStatus!=='connected')return; Promise.all([getFeedback(),getCustomers()]).then(([f,c])=>{setData(f.data||[]);setCusts(c.data||[]);}).finally(()=>setL(false)); };
  useEffect(()=>load(),[dbStatus]);

  const handleAdd=async()=>{
    if(!form.Customer_ID)return notify('Select customer');
    try{await createFeedback({...form,Customer_ID:+form.Customer_ID,Rating:+form.Rating,Feedback_Date:new Date().toISOString().split('T')[0]});setShow(false);notify('✓ Feedback saved to crm_db');load();onRefresh();}catch(e){notify('Error: '+e.message);}
  };

  const avg=data.length?(data.reduce((s,f)=>s+(+f.Rating),0)/data.length).toFixed(1):0;

  const columns=[
    {key:'Customer_Name',label:'Customer',render:r=><span style={{fontWeight:500}}>{r.Customer_Name}</span>},
    {key:'Rating',label:'Rating',render:r=><span style={{color:'#F59E0B',fontSize:16}}>{'★'.repeat(r.Rating)}{'☆'.repeat(5-r.Rating)} <span style={{color:'#64748B',fontSize:12}}>({r.Rating}/5)</span></span>},
    {key:'Category',label:'Category',render:r=><span className="pill pill-violet">{r.Category}</span>},
    {key:'Feedback_Date',label:'Date',render:r=><span style={{color:'#94A3B8',fontSize:13}}>{r.Feedback_Date}</span>},
    {key:'Comments',label:'Comment',render:r=><span style={{color:'#64748B',fontSize:13,fontStyle:'italic'}}>"{r.Comments}"</span>},
  ];

  return (<DBGuard dbStatus={dbStatus}><div className="page-enter">
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:36}}>
      <div><div style={{fontSize:13,color:'#64748B',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:500}}>MySQL · FEEDBACK table</div>
        <h1 style={{fontFamily:'Space Grotesk',fontSize:32,fontWeight:700,letterSpacing:'-0.8px'}}>Feedback</h1>
        <p style={{fontSize:15,color:'#64748B',marginTop:6}}>{data.length} reviews · Avg {avg}/5</p></div>
      <button onClick={()=>setShow(true)} className="btn-primary"><Plus size={16}/> Add Feedback</button>
    </div>
    <div className="glass" style={{padding:28,marginBottom:28,display:'flex',alignItems:'center',gap:24}}>
      <div style={{fontFamily:'Space Grotesk',fontSize:64,fontWeight:700,color:'#F59E0B',lineHeight:1}}>{avg}</div>
      <div><div style={{fontSize:24,color:'#F59E0B',marginBottom:4}}>{'★'.repeat(Math.round(avg))}</div><div style={{fontSize:14,color:'#64748B'}}>Live from crm_db.FEEDBACK · {data.length} reviews</div></div>
    </div>
    {loading?<div style={{textAlign:'center',padding:60,color:'#475569'}}>Loading…</div>:<Table columns={columns} data={data}/>}
    {showAdd&&(<Modal title="Record Feedback → INSERT INTO FEEDBACK" onClose={()=>setShow(false)}>
      <FormField label="Customer"><Select value={form.Customer_ID} onChange={e=>setForm({...form,Customer_ID:e.target.value})}><option value="">-- Select --</option>{custs.map(c=><option key={c.Person_ID} value={c.Person_ID}>{c.Person_Name}</option>)}</Select></FormField>
      <FormField label="Rating"><Select value={form.Rating} onChange={e=>setForm({...form,Rating:+e.target.value})}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>)}</Select></FormField>
      <FormField label="Category"><Select value={form.Category} onChange={e=>setForm({...form,Category:e.target.value})}>{['Service','Product','Delivery','Support'].map(c=><option key={c}>{c}</option>)}</Select></FormField>
      <FormField label="Comments"><Textarea placeholder="Customer feedback…" value={form.Comments} onChange={e=>setForm({...form,Comments:e.target.value})}/></FormField>
      <div style={{display:'flex',gap:12,marginTop:8}}>
        <button onClick={handleAdd} className="btn-primary" style={{flex:1,justifyContent:'center'}}>Save to crm_db</button>
        <button onClick={()=>setShow(false)} className="btn-ghost" style={{flex:1,justifyContent:'center'}}>Cancel</button>
      </div>
    </Modal>)}
    {toast&&<div className="toast">{toast}</div>}
  </div></DBGuard>);
}
