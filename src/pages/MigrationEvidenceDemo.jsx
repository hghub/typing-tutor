import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import { DecisionHero } from '../components/decision/DecisionBlocks'
import { useTheme } from '../hooks/useTheme'
import { downloadDemo } from '../lib/downloadDemo'
import { DemoShell, DemoNotice, DemoPilot } from '../components/SyntheticDemo'
import { MIGRATION_SAMPLES, parseFixtures, runMigrationEvidence, migrationSnippets } from '../lib/migrationEvidence'
export default function MigrationEvidenceDemo() {
  const { colors } = useTheme()
  const [sample, setSample] = useState('customer')
  const [fixtures, setFixtures] = useState(JSON.stringify(MIGRATION_SAMPLES.customer.fixtures, null, 2))
  const [nullSafe, setNullSafe] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const spec = MIGRATION_SAMPLES[sample]
  const snippets = migrationSnippets(spec, nullSafe)
  function invalidate() { setReport(null); setError('') }
  function load(value) { setSample(value); setFixtures(JSON.stringify(MIGRATION_SAMPLES[value].fixtures, null, 2)); setNullSafe(false); invalidate() }
  function run() { try { setReport(runMigrationEvidence(spec, parseFixtures(fixtures), nullSafe)); setError('') } catch (e) { setReport(null); setError(e.message) } }
  function download() { downloadDemo('rafiqy-synthetic-migration-evidence.json', JSON.stringify({ sample: spec.name, targetMode: nullSafe ? 'null-aware browser mapping' : 'deliberately incomplete browser mapping', ...report, snippets }, null, 2), 'application/json') }
  return <ToolLayout toolId="migration-evidence-demo"><DemoShell colors={colors}>
    <DecisionHero colors={colors} accent="#0891b2" eyebrow="MAP → COMPARE → VERIFY" title="A conversion is only useful if behaviour survives" description="See a null-handling regression, apply a bounded correction and compare synthetic contract outputs. Keep unsupported operational behaviour visible." />
    <DemoNotice>The checks really execute two small JavaScript mapping interpreters on editable fixtures. DataWeave and Ballerina snippets illustrate the mapping; no source repository is converted, neither runtime is executed, and generated code is not compiled.</DemoNotice>
    <div className="demo-actions">{Object.entries(MIGRATION_SAMPLES).map(([key, value]) => <button key={key} onClick={() => load(key)}>Load {value.name}</button>)}</div>
    <div className="demo-grid"><section className="demo-panel"><h2>1. Inspect the contract</h2><p>Source rule: missing or null fields use the specified default; empty strings, zero and false remain unchanged.</p><h3>Illustrative source: DataWeave</h3><pre>{snippets.source}</pre><h3>Candidate target: Ballerina template</h3><pre>{snippets.target}</pre><p className="demo-muted">Two pre-defined flat-field mappings only. The intentionally incomplete target interpreter handles missing fields but misses explicit nulls. This is an educational failure, not a vendor-tool benchmark.</p><label className="demo-check"><input type="checkbox" checked={nullSafe} onChange={e => { setNullSafe(e.target.checked); invalidate() }} />Apply null-aware default handling in the target interpreter</label></section>
    <section className="demo-panel"><h2>2. Run synthetic contract checks</h2><label>Synthetic fixture JSON<textarea rows={17} maxLength={12000} spellCheck={false} value={fixtures} onChange={e => { setFixtures(e.target.value); invalidate() }} /></label><p className="demo-muted">Use 1–20 named fixtures with flat input objects. No code is evaluated. Changing inputs or correction clears the old report.</p><button className="demo-primary" onClick={run}>Run contract comparison</button>{error && <p role="alert" className="demo-warning">{error}</p>}</section></div>
    <section className="demo-panel"><h2>3. Review the evidence</h2>{!report ? <p role="status">Run the comparison to create a report for the current inputs.</p> : <><p role="status" className="demo-status">{report.verdict}</p><div className="demo-stats"><div>Browser fixture checks<strong>{report.passed} / {report.total}</strong></div><div>Compiler<strong>Not run</strong></div><div>Runtime validation<strong>Not run</strong></div></div>{report.blockers.length > 0 && <div className="demo-warning"><strong>Manual migration gaps</strong><ul>{report.blockers.map(b => <li key={b}>{b}</li>)}</ul></div>}{report.checks.map(c => <details className="demo-line" key={c.id} open={!c.pass}><summary>{c.pass ? 'PASS' : 'FAIL'} · {c.name}</summary><div className="demo-grid"><div><h3>Expected contract output</h3><pre>{JSON.stringify(c.expected, null, 2)}</pre></div><div><h3>Target interpreter output</h3><pre>{JSON.stringify(c.actual, null, 2)}</pre></div></div>{c.differences.map(d => <p className="demo-warning" key={d.field}>{d.field}: expected {JSON.stringify(d.expected)}, got {JSON.stringify(d.actual)}</p>)}</details>)}<div className="demo-actions"><button onClick={download}>Download evidence report</button></div><p className="demo-muted">Passing fixtures cover only these inputs and the declared interpreter. They do not prove equivalence, compile success, connector support, security, performance or production readiness.</p></>}</section>
    <DemoPilot title="Scope a migration pilot with evidence you can inspect" guide="/blog/integration/integration-migration-needs-behaviour-tests">For integration teams and consultancies: agree one source/target version pair, catalogue flows and unsupported features, reuse appropriate vendor tooling, then evaluate local-model suggestions alongside compiler and isolated regression results. Retry, error, transaction and secret handling need their own tests and engineering review.</DemoPilot>
  </DemoShell></ToolLayout>
}
