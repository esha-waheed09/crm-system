const map = {
  'LEAD':'pill-cyan','CUSTOMER':'pill-green','SALES_REP':'pill-violet',
  'Resolved':'pill-green','In-Progress':'pill-amber','New':'pill-cyan',
  'Escalated':'pill-rose','Accepted':'pill-green','Converted':'pill-green',
  'Prospect':'pill-cyan','Qualified':'pill-cyan','Proposal':'pill-violet',
  'Negotiation':'pill-amber','Closed Won':'pill-green','Closed Lost':'pill-rose',
};
export default function Badge({ text }) {
  return <span className={`pill ${map[text]||'pill-cyan'}`}>{text}</span>;
}
