import { useEffect, useState } from 'react';
import { Target, Users, Megaphone, TrendingUp, PhoneCall, MessageSquare, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { getDashboardStats, getCampaignROI, getLeadFunnel } from '../api';
import StatCard from '../components/StatCard';
import DBGuard from '../components/DBGuard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:'#1A2236', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      {label && <p style={{ color:'#94A3B8', marginBottom:4 }}>{label}</p>}
      {payload.map((p,i) => <p key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function Dashboard({ dbStatus }) {
  const [stats,  setStats]  = useState(null);
  const [roi,    setRoi]    = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    if (dbStatus === 'connected') {
      Promise.all([getDashboardStats(), getCampaignROI(), getLeadFunnel()])
        .then(([s, r, f]) => { setStats(s); setRoi(r.data||[]); setFunnel(f.data||[]); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [dbStatus]);

  return (
    <DBGuard dbStatus={dbStatus}>
      <div className="page-enter">
        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:13, color:'#64748B', marginBottom:8, letterSpacing:'0.05em', textTransform:'uppercase', fontWeight:500 }}>Customer Relationship Management</div>
          <h1 style={{ fontFamily:'Space Grotesk', fontSize:36, fontWeight:700, letterSpacing:'-1px', lineHeight:1.1, marginBottom:10 }}>
            Welcome back,{' '}
            <span style={{ background:'linear-gradient(120deg,#00D4FF,#8B5CF6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Eshaal</span>
          </h1>
          <p style={{ fontSize:15, color:'#64748B' }}>Live data from <code style={{ color:'#00D4FF', background:'rgba(0,212,255,0.08)', padding:'2px 8px', borderRadius:6 }}>crm_db</code> — Spring 2026</p>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#475569', fontSize:15 }}>Loading from MySQL…</div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:24 }}>
              <StatCard label="Total Leads"     value={stats?.leads??0}          color="#00D4FF" icon={Target}        sub={`${stats?.new_leads??0} new`} trend={12}/>
              <StatCard label="Customers"       value={stats?.customers??0}      color="#10B981" icon={Users}         sub={`PKR ${((stats?.total_revenue??0)/1000).toFixed(0)}K revenue`} trend={8}/>
              <StatCard label="Campaigns"       value={stats?.campaigns??0}      color="#8B5CF6" icon={Megaphone}     sub={`PKR ${((stats?.total_budget??0)/1000).toFixed(0)}K budget`}/>
              <StatCard label="Conversion Rate" value={stats?.leads ? `${Math.round((stats.conversions/stats.leads)*100)}%`:'0%'} color="#F59E0B" icon={TrendingUp} sub="Lead to customer" accent={stats?.leads?Math.round((stats.conversions/stats.leads)*100):0}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:36 }}>
              <StatCard label="Contact Logs"  value={stats?.contacts??0}          color="#00D4FF" icon={PhoneCall}    sub="Interactions logged"/>
              <StatCard label="Avg Rating"    value={`${stats?.avg_rating??0}★`} color="#10B981" icon={MessageSquare} sub="Customer satisfaction"/>
              <StatCard label="Open Issues"   value={stats?.open_complaints??0}   color="#F43F5E" icon={AlertTriangle} sub={`${stats?.total_complaints??0} total`}/>
              <StatCard label="Conversions"   value={stats?.conversions??0}       color="#8B5CF6" icon={ArrowRightLeft} sub="Lead→Customer events"/>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>
              <div className="glass" style={{ padding:28 }}>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:600, fontSize:18, marginBottom:4 }}>Pipeline Funnel</div>
                <div style={{ fontSize:13, color:'#64748B', marginBottom:20 }}>Live from MySQL · PIPELINE_STAGE JOIN LEADS</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {funnel.map((s,i)=>{
                    const max=Math.max(...funnel.map(f=>f.Lead_Count),1);
                    const colors=['#00D4FF','#8B5CF6','#10B981','#F59E0B','#10B981','#F43F5E'];
                    return (
                      <div key={s.Stage_Name}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                          <span style={{ color:'#94A3B8', fontWeight:500 }}>{s.Stage_Name}</span>
                          <span style={{ color:colors[i], fontWeight:700 }}>{s.Lead_Count} <span style={{ color:'#475569', fontWeight:400 }}>({s.Pct_of_Total}%)</span></span>
                        </div>
                        <div className="prog-track">
                          <div className="prog-fill" style={{ width:`${Math.max((s.Lead_Count/max)*100,4)}%`, background:colors[i] }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass" style={{ padding:28 }}>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:600, fontSize:18, marginBottom:4 }}>Campaign ROI</div>
                <div style={{ fontSize:13, color:'#64748B', marginBottom:16 }}>Live · sp_CampaignROI()</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={roi}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="Campaign_Name" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" interval={0}/>
                    <YAxis tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<TT/>}/>
                    <Bar dataKey="Budget" name="Budget" fill="rgba(255,255,255,0.07)" radius={[4,4,0,0]}/>
                    <Bar dataKey="Revenue_Generated" name="Revenue" fill="#10B981" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </DBGuard>
  );
}
