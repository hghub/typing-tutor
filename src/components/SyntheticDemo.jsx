import { Link } from 'react-router-dom'
import './SyntheticDemo.css'
export function DemoShell({ colors, children }) {
  return <div className="synthetic-demo" style={{ '--demo-bg': colors.card, '--demo-text': colors.text, '--demo-muted': colors.textSecondary, '--demo-border': colors.border }}>{children}</div>
}
export function DemoNotice({ children }) {
  return <div className="demo-notice"><strong>SYNTHETIC WORKFLOW DEMO</strong><p>{children}</p><p>No Ollama/model, upload, storage or live connector is enabled. Entries stay in page memory and reset on reload. Use invented examples only.</p></div>
}
export function DemoPilot({ title, children, guide }) {
  return <section className="demo-pilot"><span className="demo-kicker">CUSTOM IMPLEMENTATION</span><h2>{title}</h2><p>{children}</p><p>Start with one workflow, agreed test cases and a measurable baseline. Local-model hosting, access controls, integrations and ongoing support require separate implementation and evaluation.</p><div className="demo-actions"><Link to={guide}>Read the implementation guide →</Link><Link to="/about">About Rafiqy & Haider →</Link></div><p className="demo-muted">No enquiry is submitted by this demo. Do not paste client documents, credentials or production logs into feedback.</p></section>
}
