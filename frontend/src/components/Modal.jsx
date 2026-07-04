import { X } from 'lucide-react';

export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontFamily:'Space Grotesk', fontWeight:600, fontSize:18 }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding:'6px', borderRadius:8 }}>
            <X size={16}/>
          </button>
        </div>
        <div style={{ padding:'24px 28px 28px' }}>{children}</div>
      </div>
    </div>
  );
}
