import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getContacts, createContact, getLeads, getSalesReps } from '../api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import DBGuard from '../components/DBGuard';
import FormField, { Select, Textarea } from '../components/FormField';

const ti={'Call':'📞','Email':'📧','Meeting':'🤝'};

export default function Contacts({ onRefresh, dbStatus }) {
  const [data,setData]=useState([]); const [leads,setLeads]=useState([]); const [reps,setReps]=useState([]);
  const [loading,setL]=useState(true); const [showAdd,setShow]=useState(false); const [toast,setToast]=useState(null);
  const [form,setForm]=useState({Lead_ID:'',Rep_ID:1,Contact_Type:'Call',Notes:''});
  const notify=msg=>{setToast(msg);setTimeout(()=>setToast(null),2500);};

  const load=()=>{ if(dbStatus!=='connected')return; Promise.all([getContacts(),getLeads(),getSalesReps()]).then(([c,l,r])=>{setData(c.data||[]);setLeads(l.data||[]);setReps(r.data||[]);}).finally(()=>setL(false)); };
  useEffect(()=>load(),[dbStatus]);

  const handleAdd=async()=>{
    if(!form.Lead_ID)return notify('Select a lead');
    try{await createContact({...form,Lead_ID:+form.Lead_ID,Rep_ID:+form.Rep_ID});setShow(false);notify('✓ Contact logged in crm_db');load();onRefresh();}catch(e){notify('Error: '+e.message);}
  };

  const columns=[
    {key:'Lead_Name',label:'Lead',render:r=><div><div style={{fontWeight:500}}>{r.Lead_Name}</div><div style={{fontSize:12,color:'#64748B',marginTop:2}}>{r.Lead_Email}</div></div>},
    {key:'Contact_Type',label:'Type',render:r=><span>{ti[r.Contact_Type]} <span style={{color:'#94A3B8',fontSize:13}}>{r.Contact_Type}</span></span>},
    {key:'Rep_Name',label:'Rep',render:r=><span style={{color:'#8B5CF6',fontSize:13}}>{r.Rep_Name}</span>},
    {key:'Contact_Date',label:'Date',render:r=><span style={{color:'#94A3B8',fontSize:13}}>{r.Contact_Date}</span>},
    {key:'Notes',label:'Notes',render:r=><span style={{color:'#64748B',fontSize:13,fontStyle:'italic'}}>{r.Notes}</span>},
    {key:'Next_Follow_Up',label:'Follow-Up',render:r=>r.Next_Follow_Up?<span className="pill pill-amber">{r.Next_Follow_Up}</span>:<span style={{color:'#475569'}}>—</span>},
  ];

  return (<DBGuard dbStatus={dbStatus}><div className="page-enter">
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:36}}>
      <div><div style={{fontSize:13,color:'#64748B',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:500}}>MySQL · CONTACT table</div>
      <h1 style={{fontFamily:'Space Grotesk',fontSize:32,fontWeight:700,letterSpacing:'-0.8px'}}>Contact Log</h1>
      <p style={{fontSize:15,color:'#64748B',marginTop:6}}>{data.length} rows in crm_db</p></div>
      <button onClick={()=>setShow(true)} className="btn-primary"><Plus size={16}/> Log Contact</button>
    </div>
    {loading?<div style={{textAlign:'center',padding:60,color:'#475569'}}>Loading…</div>:<Table columns={columns} data={data}/>}
    {showAdd&&(<Modal title="Log Contact → INSERT INTO CONTACT" onClose={()=>setShow(false)}>
      <FormField label="Lead"><Select value={form.Lead_ID} onChange={e=>setForm({...form,Lead_ID:e.target.value})}><option value="">-- Select Lead --</option>{leads.map(l=><option key={l.Person_ID} value={l.Person_ID}>{l.Person_Name}</option>)}</Select></FormField>
      <FormField label="Sales Rep"><Select value={form.Rep_ID} onChange={e=>setForm({...form,Rep_ID:+e.target.value})}>{reps.map(r=><option key={r.Person_ID} value={r.Person_ID}>{r.Person_Name}</option>)}</Select></FormField>
      <FormField label="Contact Type"><Select value={form.Contact_Type} onChange={e=>setForm({...form,Contact_Type:e.target.value})}>{['Call','Email','Meeting'].map(t=><option key={t}>{t}</option>)}</Select></FormField>
      <FormField label="Notes"><Textarea placeholder="What was discussed?" value={form.Notes} onChange={e=>setForm({...form,Notes:e.target.value})}/></FormField>
      <div style={{display:'flex',gap:12,marginTop:8}}>
        <button onClick={handleAdd} className="btn-primary" style={{flex:1,justifyContent:'center'}}>INSERT INTO crm_db</button>
        <button onClick={()=>setShow(false)} className="btn-ghost" style={{flex:1,justifyContent:'center'}}>Cancel</button>
      </div>
    </Modal>)}
    {toast&&<div className="toast">{toast}</div>}
  </div></DBGuard>);
}