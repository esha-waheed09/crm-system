import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Campaigns from './pages/Campaigns';
import Pipeline from './pages/Pipeline';
import Contacts from './pages/Contacts';
import Feedback from './pages/Feedback';
import Complaints from './pages/Complaints';
import Resolutions from './pages/Resolutions';
import Conversions from './pages/Conversions';
import SQLQueries from './pages/SQLQueries';
import StoredProcedures from './pages/StoredProcedures';
import { useDBStatus } from './hooks/useDB';

const pages = { dashboard:Dashboard, leads:Leads, customers:Customers, campaigns:Campaigns, pipeline:Pipeline, contacts:Contacts, feedback:Feedback, complaints:Complaints, resolutions:Resolutions, conversions:Conversions, sql:SQLQueries, procedures:StoredProcedures };

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);
  const Page = pages[page] || Dashboard;
  const { status, info } = useDBStatus();

  const dbColor = { connected:'#10B981', disconnected:'#F43F5E', checking:'#F59E0B' }[status];
  const dbLabel = { connected:'MySQL Connected', disconnected:'MySQL Disconnected', checking:'Connecting…' }[status];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#07090F' }}>
      <Sidebar active={page} onNav={setPage} dbStatus={status} dbInfo={info}/>
      <main style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', overflow:'hidden' }}>

        {/* Top bar */}
        <div style={{ height:64, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', flexShrink:0, background:'rgba(7,9,15,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:13, color:'#475569' }}>CSE-403L DBMS Lab · Group 14</span>
            <span style={{ width:4, height:4, borderRadius:'50%', background:'#334155', display:'inline-block' }}/>
            <span style={{ fontSize:13, color:'#64748B', textTransform:'capitalize' }}>{page}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {/* Live DB status pill */}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:20, background:`${dbColor}10`, border:`1px solid ${dbColor}25`, transition:'all 0.4s' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:dbColor, display:'inline-block', boxShadow:`0 0 8px ${dbColor}`, animation: status==='connected'?'pulse 2s infinite':'none' }}/>
              <span style={{ fontSize:12, fontWeight:600, color:dbColor }}>{dbLabel}</span>
              {info && <span style={{ fontSize:11, color:`${dbColor}99` }}>· {info.database} · {info.tables} tables</span>}
            </div>
            <span style={{ fontSize:13, color:'#475569' }}>Spring 2026</span>
          </div>
        </div>

        {/* DB Disconnected banner */}
        {status === 'disconnected' && (
          <div style={{ background:'rgba(244,63,94,0.1)', borderBottom:'1px solid rgba(244,63,94,0.2)', padding:'12px 40px', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <div>
              <span style={{ fontSize:13, fontWeight:600, color:'#F43F5E' }}>MySQL is not running. </span>
              <span style={{ fontSize:13, color:'#94A3B8' }}>Start XAMPP → MySQL, then this banner will disappear automatically.</span>
            </div>
          </div>
        )}

        {/* Page */}
        <div style={{ flex:1, overflowY:'auto' }}>
          <div style={{ padding:'48px 48px 64px', maxWidth:1400 }} key={`${page}-${tick}`}>
            <Page onRefresh={refresh} dbStatus={status}/>
          </div>
        </div>
      </main>
    </div>
  );
}
