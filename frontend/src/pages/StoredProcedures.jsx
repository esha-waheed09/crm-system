import { useState } from 'react';
import { Play, Zap } from 'lucide-react';
import { getCampaignROI, getLeadFunnel, getRepPerformance } from '../api';
import DBGuard from '../components/DBGuard';

const procedures = [
  { id:'roi', title:'sp_CampaignROI()', color:'#00D4FF',
    description:'Budget vs revenue, leads, conversions, ROI% per campaign',
    sql:`DELIMITER //\nCREATE PROCEDURE sp_CampaignROI()\nBEGIN\n  SELECT\n    c.Campaign_Name, c.Campaign_Type, c.Budget,\n    COUNT(DISTINCT l.Person_ID)                    AS Total_Leads,\n    COUNT(DISTINCT ce.Lead_ID)                     AS Conversions,\n    COALESCE(SUM(cu.Total_Purchase_Value), 0)       AS Revenue_Generated,\n    ROUND(\n      (COALESCE(SUM(cu.Total_Purchase_Value),0) - c.Budget)\n      / c.Budget * 100, 1\n    )                                              AS ROI_Percent\n  FROM CAMPAIGN c\n  LEFT JOIN LEADS            l  ON l.Campaign_ID  = c.Campaign_ID\n  LEFT JOIN CONVERSION_EVENT ce ON ce.Lead_ID     = l.Person_ID\n  LEFT JOIN CUSTOMER         cu ON cu.Person_ID   = ce.Customer_ID\n  GROUP BY c.Campaign_ID, c.Campaign_Name, c.Campaign_Type, c.Budget\n  ORDER BY ROI_Percent DESC;\nEND //\nDELIMITER ;`,
    run: async () => { const r = await getCampaignROI(); return r.data||[]; }
  },
  { id:'funnel', title:'sp_LeadFunnel()', color:'#8B5CF6',
    description:'Lead count and percentage at each pipeline stage',
    sql:`DELIMITER //\nCREATE PROCEDURE sp_LeadFunnel()\nBEGIN\n  SELECT\n    ps.Stage_Name,\n    ps.Stage_Order,\n    COUNT(l.Person_ID)  AS Lead_Count,\n    ROUND(\n      COUNT(l.Person_ID) * 100.0\n      / NULLIF((SELECT COUNT(*) FROM LEADS), 0), 1\n    )                   AS Pct_of_Total\n  FROM PIPELINE_STAGE ps\n  LEFT JOIN LEADS l ON l.Stage_ID = ps.Stage_ID\n  GROUP BY ps.Stage_ID, ps.Stage_Name, ps.Stage_Order\n  ORDER BY ps.Stage_Order;\nEND //\nDELIMITER ;`,
    run: async () => { const r = await getLeadFunnel(); return r.data||[]; }
  },
  { id:'rep', title:'sp_RepReport(rep_id)', color:'#10B981',
    description:'Detailed performance report for a single sales rep',
    sql:`DELIMITER //\nCREATE PROCEDURE sp_RepReport(IN p_rep_id INT)\nBEGIN\n  SELECT\n    P.Person_Name         AS Rep_Name,\n    SR.Employee_ID,\n    SR.Commission_Rate,\n    COUNT(DISTINCT L.Person_ID)    AS Leads_Assigned,\n    COUNT(DISTINCT CE.Lead_ID)     AS Conversions,\n    COALESCE(SUM(C.Total_Purchase_Value), 0) AS Revenue_Closed,\n    ROUND(\n      COUNT(DISTINCT CE.Lead_ID) * 100.0\n      / NULLIF(COUNT(DISTINCT L.Person_ID), 0), 1\n    )                              AS Conversion_Rate\n  FROM SALES_REP SR\n  JOIN PERSON P       ON SR.Person_ID = P.Person_ID\n  LEFT JOIN LEADS L   ON L.Rep_ID     = SR.Person_ID\n  LEFT JOIN CONVERSION_EVENT CE ON CE.Rep_ID = SR.Person_ID\n  LEFT JOIN CUSTOMER C ON C.Person_ID = CE.Customer_ID\n  WHERE SR.Person_ID = p_rep_id\n  GROUP BY P.Person_Name, SR.Employee_ID, SR.Commission_Rate;\nEND //\nDELIMITER ;`,
    run: async () => { const r = await getRepPerformance(); return r.data||[]; }
  },
];

const alters = [
  { title:'ALTER TABLE — Add column', color:'#F59E0B',
    sql:`ALTER TABLE CUSTOMER\n  ADD COLUMN Customer_Segment VARCHAR(50) DEFAULT 'Standard';\n\n-- Verify:\nDESCRIBE CUSTOMER;` },
  { title:'ALTER TABLE — Modify Status ENUM', color:'#F59E0B',
    sql:`ALTER TABLE LEADS\n  MODIFY COLUMN Status\n    ENUM('New','In-Progress','Converted','Lost')\n    NOT NULL DEFAULT 'New';` },
  { title:'ALTER TABLE — Add Index', color:'#F59E0B',
    sql:`-- Speed up date range queries on contacts\nALTER TABLE CONTACT\n  ADD INDEX idx_contact_date (Contact_Date);\n\n-- Speed up lead lookups by date\nALTER TABLE LEADS\n  ADD INDEX idx_lead_captured (Date_Captured);` },
  { title:'FUNCTION — fn_LeadAge()', color:'#EC4899',
    sql:`DELIMITER //\nCREATE FUNCTION fn_LeadAge(captured_date DATE)\nRETURNS INT\nDETERMINISTIC\nBEGIN\n  RETURN DATEDIFF(CURDATE(), captured_date);\nEND //\nDELIMITER ;\n\n-- Usage:\nSELECT Person_ID,\n       fn_LeadAge(Date_Captured) AS Days_Old\nFROM   LEADS\nORDER  BY Days_Old DESC;` },
];

export default function StoredProcedures({ dbStatus }) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const execute = async (p) => {
    setLoading(prev => ({ ...prev, [p.id]: true }));
    try {
      const data = await p.run();
      setResults(prev => ({ ...prev, [p.id]: data }));
    } catch(e) {
      setResults(prev => ({ ...prev, [p.id]: `Error: ${e.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, [p.id]: false }));
    }
  };

  return (
    <DBGuard dbStatus={dbStatus}>
      <div className="page-enter">
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:13, color:'#64748B', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>Live MySQL · crm_db</div>
          <h1 style={{ fontFamily:'Space Grotesk', fontSize:32, fontWeight:700, letterSpacing:'-0.8px' }}>Stored Procedures</h1>
          <p style={{ fontSize:15, color:'#64748B', marginTop:6 }}>Execute real MySQL stored procedures — results come directly from <code style={{ color:'#8B5CF6', background:'rgba(139,92,246,0.08)', padding:'2px 8px', borderRadius:6 }}>crm_db</code></p>
        </div>

        {/* Procedures */}
        <div style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:48 }}>
          {procedures.map(p => (
            <div key={p.id} className="glass" style={{ overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 28px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${p.color}14`, border:`1px solid ${p.color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Zap size={20} style={{ color:p.color }}/>
                  </div>
                  <div>
                    <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:16, color:p.color }}>{p.title}</div>
                    <div style={{ fontSize:13, color:'#64748B', marginTop:3 }}>{p.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => execute(p)}
                  disabled={loading[p.id]}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', borderRadius:11, background:`${p.color}12`, border:`1px solid ${p.color}30`, color:p.color, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter', flexShrink:0, opacity:loading[p.id]?0.6:1 }}>
                  <Play size={13}/> {loading[p.id] ? 'Executing…' : 'Execute on MySQL'}
                </button>
              </div>

              <pre style={{ padding:'22px 28px', fontSize:12, background:'#07090F', lineHeight:1.9, overflowX:'auto', fontFamily:'monospace', color:'#8B9CB8', borderBottom: results[p.id] ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                {p.sql.split('\n').map((line,i) => (
                  <div key={i}>{line.split(/\b/).map((word,j) => {
                    const kw = ['CREATE','PROCEDURE','FUNCTION','BEGIN','END','SELECT','FROM','JOIN','LEFT','WHERE','GROUP','ORDER','BY','ON','AS','DESC','DISTINCT','COUNT','AVG','SUM','ROUND','COALESCE','NULLIF','DELIMITER','RETURNS','DETERMINISTIC','INT','RETURN'];
                    if (kw.includes(word.toUpperCase())) return <span key={j} style={{ color:'#60A5FA' }}>{word}</span>;
                    if (word.startsWith("'")) return <span key={j} style={{ color:'#34D399' }}>{word}</span>;
                    if (word.startsWith('--')) return <span key={j} style={{ color:'#475569', fontStyle:'italic' }}>{word}</span>;
                    return word;
                  })}</div>
                ))}
              </pre>

              {results[p.id] && (
                typeof results[p.id] === 'string' ? (
                  <div style={{ padding:'16px 28px', color:'#F43F5E', fontSize:13 }}>{results[p.id]}</div>
                ) : (
                  <div style={{ overflowX:'auto' }}>
                    <table className="crm-table">
                      <thead>
                        <tr>{Object.keys(results[p.id][0]||{}).map(k => <th key={k} style={{ color:p.color }}>{k}</th>)}</tr>
                      </thead>
                      <tbody>
                        {results[p.id].map((row,i) => (
                          <tr key={i}>{Object.values(row).map((v,j) => <td key={j} style={{ whiteSpace:'nowrap' }}>{String(v??'—')}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding:'10px 28px', fontSize:12, color:'#475569', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                      {results[p.id].length} rows returned from crm_db
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        {/* ALTER TABLE & Functions */}
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:'Space Grotesk', fontWeight:600, fontSize:22, marginBottom:6 }}>ALTER TABLE & Functions</h2>
          <p style={{ fontSize:14, color:'#64748B' }}>Run these in phpMyAdmin or MySQL Workbench to modify the crm_db schema</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {alters.map((a,i) => (
            <div key={i} className="glass" style={{ overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:a.color }}/>
                <span style={{ fontSize:13, fontWeight:600, color:a.color }}>{a.title}</span>
              </div>
              <pre style={{ padding:'18px 20px', fontSize:12, background:'#07090F', lineHeight:1.8, overflowX:'auto', fontFamily:'monospace', color:'#8B9CB8' }}>
                {a.sql.split('\n').map((line,i) => (
                  <div key={i}>{line.split(/\b/).map((word,j) => {
                    const kw=['ALTER','TABLE','ADD','MODIFY','COLUMN','INDEX','CREATE','FUNCTION','BEGIN','END','RETURN','RETURNS','DETERMINISTIC','SELECT','FROM','ORDER','BY','DESC','INT','NOT','NULL','DEFAULT'];
                    if (kw.includes(word.toUpperCase())) return <span key={j} style={{ color:'#60A5FA' }}>{word}</span>;
                    if (word.startsWith("'")) return <span key={j} style={{ color:'#34D399' }}>{word}</span>;
                    if (line.trim().startsWith('--')) return <span key={j} style={{ color:'#475569' }}>{word}</span>;
                    return word;
                  })}</div>
                ))}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </DBGuard>
  );
}
