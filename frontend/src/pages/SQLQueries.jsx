import { useState } from 'react';
import { Play } from 'lucide-react';
import { getLeads, getCustomers, getContacts, getRepPerformance, getAvgFeedback, getUnresolved, getCampaignROI, getConversionJourney } from '../api';
import DBGuard from '../components/DBGuard';

const queries = [
  { id:1, title:'Leads with Sales Rep & Stage', tag:'JOIN × 4', sql:`SELECT P.Person_Name AS Lead_Name,\n       PS.Stage_Name   AS Pipeline_Stage,\n       REP.Person_Name AS Rep_Name\nFROM   LEADS L\nJOIN   PERSON         P   ON L.Person_ID   = P.Person_ID\nJOIN   PIPELINE_STAGE PS  ON L.Stage_ID    = PS.Stage_ID\nJOIN   CAMPAIGN       C   ON L.Campaign_ID = C.Campaign_ID\nLEFT JOIN SALES_REP   SR  ON L.Rep_ID      = SR.Person_ID\nLEFT JOIN PERSON      REP ON SR.Person_ID  = REP.Person_ID;`,
    run: async () => { const r=await getLeads(); return (r.data||[]).map(l=>({Lead_Name:l.Person_Name,Stage:l.Stage_Name,Rep:l.Rep_Name,Status:l.Status,Campaign:l.Campaign_Name})); } },
  { id:2, title:'Leads Count per Campaign', tag:'GROUP BY + COUNT', sql:`SELECT C.Campaign_Name,\n       COUNT(L.Person_ID) AS Total_Leads\nFROM   CAMPAIGN C\nLEFT JOIN LEADS L ON C.Campaign_ID = L.Campaign_ID\nGROUP  BY C.Campaign_Name\nORDER  BY Total_Leads DESC;`,
    run: async () => { const r=await getCampaignROI(); return (r.data||[]).map(c=>({Campaign_Name:c.Campaign_Name,Total_Leads:c.Total_Leads})); } },
  { id:3, title:'Customers by Purchase Value', tag:'JOIN + ORDER BY', sql:`SELECT P.Person_Name, C.Conversion_Date,\n       C.Total_Purchase_Value\nFROM   CUSTOMER C\nJOIN   PERSON P ON C.Person_ID = P.Person_ID\nORDER  BY C.Total_Purchase_Value DESC;`,
    run: async () => { const r=await getCustomers(); return (r.data||[]).map(c=>({Person_Name:c.Person_Name,Conversion_Date:c.Conversion_Date,Total_Purchase_Value:`PKR ${(+c.Total_Purchase_Value).toLocaleString()}`})); } },
  { id:4, title:'Unresolved Complaints', tag:'WHERE filter', sql:`SELECT P.Person_Name, CO.Subject,\n       CO.Complaint_Date, CO.Status\nFROM   COMPLAINT CO\nJOIN   CUSTOMER C ON CO.Customer_ID = C.Person_ID\nJOIN   PERSON   P ON C.Person_ID    = P.Person_ID\nWHERE  CO.Status != 'Resolved';`,
    run: async () => { const r=await getUnresolved(); return r.data||[]; } },
  { id:5, title:'Avg Feedback per Customer', tag:'AVG + GROUP BY', sql:`SELECT P.Person_Name,\n       AVG(F.Rating)        AS Avg_Rating,\n       COUNT(F.Feedback_ID) AS Total_Feedback\nFROM   FEEDBACK F\nJOIN   CUSTOMER C ON F.Customer_ID = C.Person_ID\nJOIN   PERSON   P ON C.Person_ID   = P.Person_ID\nGROUP  BY P.Person_Name;`,
    run: async () => { const r=await getAvgFeedback(); return r.data||[]; } },
  { id:6, title:'Sales Rep Performance', tag:'COUNT DISTINCT', sql:`SELECT P.Person_Name AS Rep_Name,\n       COUNT(DISTINCT L.Person_ID)  AS Leads_Assigned,\n       COUNT(DISTINCT CE.Lead_ID)   AS Conversions\nFROM   SALES_REP SR\nJOIN   PERSON P      ON SR.Person_ID = P.Person_ID\nLEFT JOIN LEADS L    ON L.Rep_ID     = SR.Person_ID\nLEFT JOIN CONVERSION_EVENT CE ON CE.Rep_ID = SR.Person_ID\nGROUP  BY P.Person_Name;`,
    run: async () => { const r=await getRepPerformance(); return r.data||[]; } },
  { id:7, title:'Contacts with Follow-Up Dates', tag:'JOIN + ORDER BY date', sql:`SELECT P.Person_Name AS Lead_Name,\n       C.Contact_Type, C.Contact_Date,\n       C.Next_Follow_Up\nFROM   CONTACT C\nJOIN   LEADS   L ON C.Lead_ID   = L.Person_ID\nJOIN   PERSON  P ON L.Person_ID = P.Person_ID\nORDER  BY C.Contact_Date;`,
    run: async () => { const r=await getContacts(); return (r.data||[]).map(c=>({Lead_Name:c.Lead_Name,Type:c.Contact_Type,Date:c.Contact_Date,Follow_Up:c.Next_Follow_Up||'—'})); } },
  { id:8, title:'Lead → Customer Journey', tag:'CONVERSION_EVENT multi-join', sql:`SELECT PL.Person_Name AS Lead_Name,\n       PC.Person_Name AS Customer_Name,\n       CE.Conversion_Date,\n       PR.Person_Name AS Rep_Name\nFROM   CONVERSION_EVENT CE\nJOIN   PERSON PL ON CE.Lead_ID     = PL.Person_ID\nJOIN   PERSON PC ON CE.Customer_ID = PC.Person_ID\nJOIN   PERSON PR ON CE.Rep_ID      = PR.Person_ID;`,
    run: async () => { const r=await getConversionJourney(); return r.data||[]; } },
];

export default function SQLQueries({ dbStatus }) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const run = async (q) => {
    setLoading(p=>({...p,[q.id]:true}));
    try { const r=await q.run(); setResults(p=>({...p,[q.id]:r})); }
    catch(e) { setResults(p=>({...p,[q.id]:`Error: ${e.message}`})); }
    finally { setLoading(p=>({...p,[q.id]:false})); }
  };

  return (
    <DBGuard dbStatus={dbStatus}>
      <div className="page-enter">
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:13, color:'#64748B', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>Live MySQL · crm_db</div>
          <h1 style={{ fontFamily:'Space Grotesk', fontSize:32, fontWeight:700, letterSpacing:'-0.8px' }}>SQL Queries</h1>
          <p style={{ fontSize:15, color:'#64748B', marginTop:6 }}>8 queries — hit <strong style={{color:'#F8FAFC'}}>Run</strong> to execute against your real MySQL database</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {queries.map(q=>(
            <div key={q.id} className="glass" style={{ overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(0,212,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#00D4FF', fontFamily:'Space Grotesk', flexShrink:0 }}>Q{q.id}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15 }}>{q.title}</div>
                    <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{q.tag}</div>
                  </div>
                </div>
                <button onClick={()=>run(q)} disabled={loading[q.id]}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:10, background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)', color:'#00D4FF', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter', flexShrink:0, opacity:loading[q.id]?0.6:1 }}>
                  <Play size={13}/> {loading[q.id] ? 'Running…' : 'Run on MySQL'}
                </button>
              </div>
              <pre style={{ padding:'20px 24px', fontSize:13, background:'#07090F', lineHeight:1.8, overflowX:'auto', fontFamily:'monospace', color:'#8B9CB8' }}>
                {q.sql.split('\n').map((line,i)=>(
                  <div key={i}>{line.split(/\b/).map((word,j)=>{
                    const kw=['SELECT','FROM','JOIN','LEFT','WHERE','GROUP','ORDER','BY','ON','AS','DESC','DISTINCT','COUNT','AVG','AND','OR','NOT','NULL'];
                    if(kw.includes(word.toUpperCase())) return <span key={j} style={{color:'#60A5FA'}}>{word}</span>;
                    if(word.startsWith("'")) return <span key={j} style={{color:'#34D399'}}>{word}</span>;
                    return word;
                  })}</div>
                ))}
              </pre>
              {results[q.id] && (
                typeof results[q.id]==='string' ? (
                  <div style={{ padding:'16px 24px', color:'#F43F5E', fontSize:13 }}>{results[q.id]}</div>
                ) : (
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', overflowX:'auto' }}>
                    <table className="crm-table">
                      <thead><tr>{Object.keys(results[q.id][0]||{}).map(k=><th key={k} style={{color:'#00D4FF'}}>{k}</th>)}</tr></thead>
                      <tbody>{results[q.id].map((row,i)=><tr key={i}>{Object.values(row).map((v,j)=><td key={j} style={{whiteSpace:'nowrap'}}>{String(v??'—')}</td>)}</tr>)}</tbody>
                    </table>
                    <div style={{ padding:'10px 24px', fontSize:12, color:'#475569', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                      {results[q.id].length} rows from crm_db
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </DBGuard>
  );
}
