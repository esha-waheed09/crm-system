export default function FormField({ label, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#94A3B8', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
export function Input(props) {
  return <input {...props} className="crm-input" />;
}
export function Select({ children, ...props }) {
  return <select {...props} className="crm-input">{children}</select>;
}
export function Textarea(props) {
  return <textarea {...props} rows={3} className="crm-input" style={{ resize:'vertical' }} />;
}
