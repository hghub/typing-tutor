import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import { DecisionHero } from '../components/decision/DecisionBlocks'
import { useTheme } from '../hooks/useTheme'
import { downloadDemo } from '../lib/downloadDemo'
import { DemoShell, DemoNotice, DemoPilot } from '../components/SyntheticDemo'
import { CATALOG, ORDER_SAMPLES, parseOrder, reviewOrder, exportOrderCsv } from '../lib/orderReview'
const cash = cents => `USD ${(cents / 100).toFixed(2)}`
export default function OrderReviewDemo() {
  const { colors } = useTheme()
  const [text, setText] = useState(ORDER_SAMPLES.exceptions)
  const [choices, setChoices] = useState({})
  const [approved, setApproved] = useState(false)
  const [message, setMessage] = useState('')
  let review, error
  try { review = reviewOrder(parseOrder(text), choices) } catch (e) { error = e.message }
  function changeText(value) { setText(value); setChoices({}); setApproved(false); setMessage('') }
  function choose(id, patch) { setChoices(prev => ({ ...prev, [id]: { ...prev[id], ...(patch.sku !== undefined ? { acceptPrice: false, reason: '' } : {}), ...patch } })); setApproved(false); setMessage('') }
  function exportDraft() {
    try { downloadDemo('rafiqy-synthetic-sales-order.csv', exportOrderCsv(review, approved), 'text/csv'); setMessage('Synthetic CSV created locally. No sales order was sent to any system.') }
    catch (e) { setMessage(e.message) }
  }
  return <ToolLayout toolId="order-review-demo"><DemoShell colors={colors}>
    <DecisionHero colors={colors} accent="#0891b2" eyebrow="DOCUMENT → REVIEW → DRAFT" title="Turn an order into a checked sales-order draft" description="Resolve ambiguous products, price differences and duplicate references before a draft reaches your business system." />
    <DemoNotice>Working rules and review controls on invented purchase orders. This version reads only the shown text layout; it does not extract arbitrary documents or use AI.</DemoNotice>
    <div className="demo-actions">{Object.keys(ORDER_SAMPLES).map(k => <button key={k} onClick={() => changeText(ORDER_SAMPLES[k])}>Load {k} example</button>)}</div>
    <div className="demo-grid"><section className="demo-panel"><h2>1. Inspect the source</h2><label>Synthetic purchase-order text<textarea rows={12} maxLength={12000} value={text} onChange={e => changeText(e.target.value)} spellCheck={false} /></label><p className="demo-muted">Keep the exact header and pipe-separated columns. Whole quantities; unit prices with up to two decimal places. No tax, freight or currency conversion in this sample.</p><details><summary>View synthetic catalogue & ledger</summary>{CATALOG.map(p => <p key={p.sku}><strong>{p.sku}</strong> · {p.name} · USD {p.price.toFixed(2)} / {p.unit}</p>)}<p>Recorded reference: DEMO-1001. Duplicate checks use this fixed sample ledger only.</p></details></section>
    <section className="demo-panel"><h2>2. Resolve exceptions</h2>{error ? <p role="alert" className="demo-warning">{error}</p> : <>
      <p><strong>{review.reference}</strong> · {review.customer}</p>
      {review.problems.map(p => <p key={p} role="alert" className="demo-warning">{p}</p>)}
      {review.rows.map(r => <div className="demo-line" key={r.id}><h3>Source line {r.id}: {r.description}</h3><p className="demo-evidence">{r.evidence}</p><label>Product for line {r.id}<select value={r.product?.sku || ''} onChange={e => choose(r.id, { sku: e.target.value })}><option value="">Choose a verified product…</option>{CATALOG.map(p => <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>)}</select></label>
        <p>{r.quantity} {r.unit} × USD {r.price.toFixed(2)} = {cash(r.lineCents)}</p>
        {(r.priceMismatch || (r.product && !r.candidates.some(p => p.sku === r.product.sku))) && <label>Verification note for line {r.id}<input maxLength={200} value={choices[r.id]?.reason || ''} onChange={e => choose(r.id, { reason: e.target.value })} placeholder="Explain the checked exception (synthetic)" /></label>}
        {r.priceMismatch && <><p className="demo-warning">Catalogue: USD {r.product.price.toFixed(2)} / {r.product.unit}; source: USD {r.price.toFixed(2)}. Draft keeps the source price.</p><label className="demo-check"><input type="checkbox" checked={!!choices[r.id]?.acceptPrice} onChange={e => choose(r.id, { acceptPrice: e.target.checked })} />Accept this synthetic price exception for line {r.id}</label></>}
        {r.issues.map(issue => <p key={issue} className="demo-warning">{issue}</p>)}{!r.issues.length && <p className="demo-status">Line ready for draft review</p>}
      </div>)}
    </>}</section></div>
    <section className="demo-panel"><h2>3. Review & export locally</h2>{review && <><div className="demo-stats"><div>Computed subtotal<strong>{cash(review.subtotalCents)}</strong></div><div>Source subtotal<strong>{cash(review.declaredCents)}</strong></div><div>Review status<strong>{review.ready ? 'Ready for approval' : 'Blocked'}</strong></div></div><label className="demo-check"><input type="checkbox" disabled={!review.ready} checked={approved} onChange={e => { setApproved(e.target.checked); setMessage('') }} />I reviewed this exact synthetic draft. Export a CSV for inspection; do not send or fulfil an order.</label><button className="demo-primary" disabled={!review.ready || !approved} onClick={exportDraft}>Download approved synthetic CSV</button></>}<p role="status">{message}</p><p className="demo-muted">Changing source text or a review decision clears approval. “Ready” means only that these demo rules pass—not that a customer, price or product has been verified in the real world.</p></section>
    <DemoPilot title="Connect the review step to the systems you already use" guide="/blog/integration/purchase-order-review-before-erp-import">For distributors and wholesalers in Pakistan and internationally: scope authorized document intake, catalogue/unit mapping, duplicate detection, reviewer permissions and one ERP/accounting connector. An evaluated local model could propose structured fields; validated rules and staff approval would control the draft.</DemoPilot>
  </DemoShell></ToolLayout>
}
