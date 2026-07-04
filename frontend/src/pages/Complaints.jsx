import { useState, useEffect } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { getComplaints, createComplaint, resolveComplaint, getCustomers } from '../api';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import DBGuard from '../components/DBGuard';
import FormField, { Select, Input, Textarea } from '../components/FormField';

export default function Complaints({ onRefresh, dbStatus }) {
  const [data,setData]=useState([]); const [custs,setCusts]=useState([]);
  const [loading,setL]=useState(true); const [showAdd,setShow]=useState(false); const [toast,setT]=useState(null);
  const [form,setForm]=useState({Customer_ID:'',Subject:'',Description:''});
  const notify=msg=>{setT(msg);setTimeout(()=>setT(null),2500);};

  const load=()=>{ if(dbStatus!=='connected')return; Promise.all([getComplaints(),getCustomers()]).then(([c,cu])=>{setData(c.data||[]);setCusts(cu.data||[]);}).finally(()=>setL(false)); };
  useEffect(()=>load(),[dbStatus]);

  const handleAdd=async()=>{
    if(!form.Customer_ID||!form.Subject)return notify('Customer and Subject required');
    try{await createComplaint({...form,Customer_ID:+form.Customer_ID});setShow(false);notify('✓ Complaint filed in crm_db');load();onRefresh();}catch(e){notify('Error: '+e.message);}
  };

  const handleResolve=async(id)=>{
    try{await resolveComplaint(id);notify('✓ Marked Resolved in crm_db');load();onRefresh();}catch(e){notify('Error: '+e.message);}
  };

  const columns=[
    {key:'Customer_Name',label:'Customer',render:r=><span style={{fontWeight:500}}>{r.Customer_Name}</span>},
    {key:'Subject',label:'Subject',render:r=><span style={{fontWeight:500}}>{r.Subject}</span>},
    {key:'Description',label:'Description',render:r=><span style={{color:'#64748B',fontSize:13}}>{r.Description}</span>},
    {key:'Complaint_Date',label:'Date',render:r=><span style={{color:'#94A3B8',fontSize:13}}>{r.Complaint_Date}</span>},
    {key:'Status',label:'Status',render:r=><Badge text={r.Status}/>},
  ];

  return (<DBGuard dbStatus={dbStatus}><div className="page-enter">
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:36}}>
      <div><div style={{fontSize:13,color:'#64748B',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:500}}>MySQL · COMPLAINT table</div>
        <h1 style={{fontFamily:'Space Grotesk',fontSize:32,fontWeight:700,letterSpacing:'-0.8px'}}>Complaints</h1>
        <p style={{fontSize:15,color:'#64748B',marginTop:6}}>{data.filter(c=>c.Status!=='Resolved').length} open · {data.filter(c=>c.Status==='Resolved').length} resolved</p></div>
      <button onClick={()=>setShow(true)} className="btn-primary"><Plus size={16}/> File Complaint</button>
    </div>
    {loading?<div style={{textAlign:'center',padding:60,color:'#475569'}}>Loading…</div>
      :<Table columns={columns} data={data} actions={row=>row.Status!=='Resolved'?(<button className="btn-ghost success" onClick={()=>handleResolve(row.Complaint_ID)}><CheckCircle2 size={13}/> Resolve</button>):null}/>}
    {showAdd&&(<Modal title="File Complaint → INSERT INTO COMPLAINT" onClose={()=>setShow(false)}>
      <FormField label="Customer"><Select value={form.Customer_ID} onChange={e=>setForm({...form,Customer_ID:e.target.value})}><option value="">-- Select --</option>{custs.map(c=><option key={c.Person_ID} value={c.Person_ID}>{c.Person_Name}</option>)}</Select></FormField>
      <FormField label="Subject"><Input placeholder="Issue title" value={form.Subject} onChange={e=>setForm({...form,Subject:e.target.value})}/></FormField>
      <FormField label="Description"><Textarea placeholder="Describe the issue…" value={form.Description} onChange={e=>setForm({...form,Description:e.target.value})}/></FormField>
      <div style={{display:'flex',gap:12,marginTop:8}}>
        <button onClick={handleAdd} className="btn-primary" style={{flex:1,justifyContent:'center'}}>Save to crm_db</button>
        <button onClick={()=>setShow(false)} className="btn-ghost" style={{flex:1,justifyContent:'center'}}>Cancel</button>
      </div>
    </Modal>)}
    {toast&&<div className="toast">{toast}</div>}
  </div></DBGuard>);
}
