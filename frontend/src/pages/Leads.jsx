import { useState, useEffect } from 'react';
import { Plus, UserPlus, Trash2 } from 'lucide-react';
import { getLeads, createLead, deleteLead, convertLead, getCampaigns, getSalesReps, getPipelineStages } from '../api';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import DBGuard from '../components/DBGuard';
import FormField, { Input, Select } from '../components/FormField';

const avatarColors = ['#00D4FF','#8B5CF6','#10B981','#F59E0B','#F43F5E','#EC4899'];

export default function Leads({ onRefresh, dbStatus }) {
  const [leads,     setLeads]     = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [reps,      setReps]      = useState([]);
  const [stages,    setStages]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [toast,     setToast]     = useState(null);
  const [form, setForm] = useState({ Person_Name:'',Email:'',Phone:'',Address:'',Campaign_ID:1,Rep_ID:1,Stage_ID:1,Lead_Source:'',Status:'New' });

  const notify = msg => { setToast(msg); setTimeout(()=>setToast(null),2500); };

  const load = async () => {
    setLoading(true);
    try {
      const [l,c,r,s] = await Promise.all([getLeads(), getCampaigns(), getSalesReps(), getPipelineStages()]);
      setLeads(l.data||[]); setCampaigns(c.data||[]); setReps(r.data||[]); setStages(s.data||[]);
    } catch(e) { notify('Error: '+e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if(dbStatus==='connected') load(); }, [dbStatus]);

  const handleAdd = async () => {
    if (!form.Person_Name||!form.Email) return notify('Name and Email required');
    try {
      await createLead(form); setShowAdd(false);
      setForm({Person_Name:'',Email:'',Phone:'',Address:'',Campaign_ID:1,Rep_ID:1,Stage_ID:1,Lead_Source:'',Status:'New'});
      notify('✓ Lead added to crm_db'); load(); onRefresh();
    } catch(e) { notify('Error: '+e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead from crm_db?')) return;
    try { await deleteLead(id); notify('✓ Deleted'); load(); onRefresh(); }
    catch(e) { notify('Error: '+e.message); }
  };

  const handleConvert = async (id) => {
    try { await convertLead(id); notify('✓ Lead converted to Customer!'); load(); onRefresh(); }
    catch(e) { notify('Error: '+e.message); }
  };

  const columns = [
    { key:'person', label:'Lead', render:r=>(
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div className="avatar" style={{ background:`${avatarColors[r.Person_ID%6]}18`, color:avatarColors[r.Person_ID%6] }}>{r.Person_Name?.charAt(0)}</div>
        <div>
          <div style={{ fontWeight:500 }}>{r.Person_Name}</div>
          <div style={{ fontSize:12, color:'#00D4FF', marginTop:2 }}>{r.Email}</div>
        </div>
      </div>
    )},
    { key:'Lead_Source', label:'Source', render:r=><span style={{color:'#94A3B8'}}>{r.Lead_Source}</span> },
    { key:'Stage_Name',  label:'Stage',  render:r=><Badge text={r.Stage_Name}/> },
    { key:'Status',      label:'Status', render:r=><Badge text={r.Status}/> },
    { key:'Rep_Name',    label:'Sales Rep', render:r=><span style={{color:'#8B5CF6',fontSize:13}}>{r.Rep_Name}</span> },
    { key:'Campaign_Name',label:'Campaign', render:r=><span style={{color:'#94A3B8',fontSize:13}}>{r.Campaign_Name}</span> },
    { key:'Date_Captured',label:'Captured', render:r=><span style={{color:'#64748B',fontSize:13}}>{r.Date_Captured}</span> },
  ];

  return (
    <DBGuard dbStatus={dbStatus}>
      <div className="page-enter">
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:36 }}>
          <div>
            <div style={{ fontSize:13, color:'#64748B', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>MySQL · LEADS table</div>
            <h1 style={{ fontFamily:'Space Grotesk', fontSize:32, fontWeight:700, letterSpacing:'-0.8px' }}>Leads</h1>
            <p style={{ fontSize:15, color:'#64748B', marginTop:6 }}>{leads.length} rows in crm_db.LEADS</p>
          </div>
          <button onClick={()=>setShowAdd(true)} className="btn-primary"><Plus size={16}/> Add Lead</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
          {[
            {label:'Total',      value:leads.length,                                    color:'#00D4FF'},
            {label:'In Progress',value:leads.filter(l=>l.Status==='In-Progress').length,color:'#F59E0B'},
            {label:'New',        value:leads.filter(l=>l.Status==='New').length,        color:'#8B5CF6'},
            {label:'Converted',  value:leads.filter(l=>l.Status==='Converted').length,  color:'#10B981'},
          ].map(s=>(
            <div key={s.label} className="glass" style={{ padding:'20px 24px' }}>
              <div style={{ fontSize:28, fontWeight:700, fontFamily:'Space Grotesk', color:s.color, letterSpacing:'-0.5px' }}>{s.value}</div>
              <div style={{ fontSize:13, color:'#64748B', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? <div style={{ textAlign:'center', padding:60, color:'#475569' }}>Loading from MySQL…</div>
          : <Table columns={columns} data={leads} actions={row=>(
              <>
                <button className="btn-ghost success" onClick={()=>handleConvert(row.Person_ID)}><UserPlus size={13}/> Convert</button>
                <button className="btn-ghost danger"  onClick={()=>handleDelete(row.Person_ID)}><Trash2 size={13}/></button>
              </>
            )}/>
        }

        {showAdd && (
          <Modal title="Add Lead → INSERT INTO PERSON + LEADS" onClose={()=>setShowAdd(false)}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              <FormField label="Full Name"><Input placeholder="Ali Hassan" value={form.Person_Name} onChange={e=>setForm({...form,Person_Name:e.target.value})}/></FormField>
              <FormField label="Email"><Input type="email" placeholder="ali@email.com" value={form.Email} onChange={e=>setForm({...form,Email:e.target.value})}/></FormField>
              <FormField label="Phone"><Input placeholder="0300-0000000" value={form.Phone} onChange={e=>setForm({...form,Phone:e.target.value})}/></FormField>
              <FormField label="Address"><Input placeholder="City, Pakistan" value={form.Address} onChange={e=>setForm({...form,Address:e.target.value})}/></FormField>
              <FormField label="Campaign">
                <Select value={form.Campaign_ID} onChange={e=>setForm({...form,Campaign_ID:+e.target.value})}>
                  {campaigns.map(c=><option key={c.Campaign_ID} value={c.Campaign_ID}>{c.Campaign_Name}</option>)}
                </Select>
              </FormField>
              <FormField label="Sales Rep">
                <Select value={form.Rep_ID} onChange={e=>setForm({...form,Rep_ID:+e.target.value})}>
                  {reps.map(r=><option key={r.Person_ID} value={r.Person_ID}>{r.Person_Name}</option>)}
                </Select>
              </FormField>
              <FormField label="Stage">
                <Select value={form.Stage_ID} onChange={e=>setForm({...form,Stage_ID:+e.target.value})}>
                  {stages.map(s=><option key={s.Stage_ID} value={s.Stage_ID}>{s.Stage_Name}</option>)}
                </Select>
              </FormField>
              <FormField label="Lead Source"><Input placeholder="Email / Referral" value={form.Lead_Source} onChange={e=>setForm({...form,Lead_Source:e.target.value})}/></FormField>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <button onClick={handleAdd} className="btn-primary" style={{flex:1,justifyContent:'center'}}>INSERT INTO crm_db</button>
              <button onClick={()=>setShowAdd(false)} className="btn-ghost" style={{flex:1,justifyContent:'center'}}>Cancel</button>
            </div>
          </Modal>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </DBGuard>
  );
}
