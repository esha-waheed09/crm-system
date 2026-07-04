export default function Table({ columns, data, actions }) {
  return (
    <div className="glass" style={{ overflow:'hidden' }}>
      <div style={{ overflowX:'auto' }}>
        <table className="crm-table">
          <thead>
            <tr>
              {columns.map(c => <th key={c.key}>{c.label}</th>)}
              {actions && <th style={{ textAlign:'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length+(actions?1:0)} style={{ textAlign:'center', padding:'48px 20px', color:'#475569' }}>
                No records found
              </td></tr>
            ) : data.map((row,i) => (
              <tr key={i}>
                {columns.map(c => (
                  <td key={c.key} style={{ color: c.muted?'#64748B':'inherit' }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                {actions && <td style={{ textAlign:'right' }}><div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>{actions(row)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
