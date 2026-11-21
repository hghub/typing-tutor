import { SectionCard, Field, SelectInput, MetricGrid, MetricCard } from './decision/DecisionBlocks'
import { evaluateStockForecast, parseStockHistory, FORECAST_SAMPLE } from '../lib/stockForecast'

const ACCENT = '#14b8a6'
const fmt = n => new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(n)

export default function StockForecastLab({ colors, items, onApply, state, setState }) {
  const { history, selectedId, applied } = state
  const setHistory = value => setState(prev => ({ ...prev, history: value }))
  const setSelectedId = value => setState(prev => ({ ...prev, selectedId: value }))
  const setApplied = value => setState(prev => ({ ...prev, applied: value }))
  const item = items.find(r => r.id === selectedId) || items[0]
  let result, error
  try { result = evaluateStockForecast(parseStockHistory(history)) }
  catch (e) { error = e.message }
  return (
    <SectionCard colors={colors} accent={ACCENT} title="Forecast lab: test next week's expected usage" subtitle="Working statistical baselines · starts with 56 synthetic daily quantities · no AI service or upload">
      <p>For one item at one location, enter 42–366 consecutive daily sales or usage quantities, oldest first. Use one consistent unit. The minimum enables this small comparison; it does not establish that the history is sufficient for your business.</p>
      <Field label="Daily quantities, separated by commas or new lines" hint="Include zero only for a known zero-usage day. Resolve missing days, returns and stockout periods first. Sales during a stockout may understate true demand.">
        <textarea className="stock-text" rows={5} maxLength={8192} spellCheck={false} value={history} onChange={e => { setHistory(e.target.value); setApplied(false) }} />
      </Field>
      <div className="stock-actions"><button className="stock-button" onClick={() => { setHistory(FORECAST_SAMPLE); setApplied(false) }}>Replace with synthetic weekly sample</button></div>
      {error ? <p role="alert" style={{ color: '#f59e0b' }}>{error}</p> : <>
        <MetricGrid>
          <MetricCard colors={colors} accent={ACCENT} label="Next 7 days" value={fmt(result.total)} sub="Total forecast quantity, in the history's units" />
          <MetricCard colors={colors} accent="#06b6d4" label="Daily planning average" value={fmt(result.dailyAverage)} sub="Can be copied to an item's expected daily usage after review" />
          <MetricCard colors={colors} accent="#f59e0b" label="Historical average error" value={fmt(result.selected.mae)} sub="Quantity per forecast day in the small rolling backtest; not a future error guarantee" />
        </MetricGrid>
        <p><strong>Lowest backtest error here: {result.selected.label}.</strong> We compare a repeated seven-day pattern, a recent average and simple exponential smoothing. Eight rolling test windows each forecast seven days using only earlier observations. A simple winner on this short history is not proof it will remain best.</p>
        <div className="stock-table" role="region" aria-label="Forecast method comparison" tabIndex={0}><table><thead><tr><th scope="col">Method</th><th scope="col">Mean absolute error</th><th scope="col">Bias (forecast − actual)</th></tr></thead><tbody>{result.scores.map(score => <tr key={score.method}><td>{score.label}</td><td>{fmt(score.mae)}</td><td>{fmt(score.bias)}</td></tr>)}</tbody></table></div>
        <ol className="stock-forecast-days">{result.forecast.map((quantity, i) => <li key={i}>Day {i + 1}: <strong>{fmt(quantity)}</strong></li>)}</ol>
        <Field label="Item to receive the planning average" hint="Confirm that the history belongs to this item, location and stock unit. The synthetic sample is illustrative, not a prediction for your business.">
          <SelectInput className="stock-text" colors={colors} value={item.id} onChange={e => { setSelectedId(Number(e.target.value)); setApplied(false) }}>{items.map(row => <option key={row.id} value={row.id}>{row.name || 'Unnamed item'} ({row.unit || 'units'})</option>)}</SelectInput>
        </Field>
        <button className="stock-button" onClick={() => { onApply(item.id, result.dailyAverage); setApplied(true) }}>Use {fmt(result.dailyAverage)} {item.unit || 'units'}/day for {item.name || 'this item'}</button>
        {applied && <p role="status">Copied the average into the selected item's expected usage. The reorder plan above now uses that steady average; check the individual forecast days for peaks.</p>}
      </>}
      <p>This lab does not adjust for promotions, holidays, changing opening hours, stockout-censored demand or shelf-life batches. It produces no calibrated probability interval. Forecasting sales and deciding safe purchasing quantities are separate steps.</p>
    </SectionCard>
  )
}

export function StockAIOptions({ colors }) {
  return (
    <SectionCard colors={colors} accent={ACCENT} title="What we can build around your existing systems" subtitle="Custom implementation options · require discovery, data access and validation · not enabled in this demo">
      <p>Connect authorized POS, warehouse, e-commerce and accounting data to a forecast-and-review workflow. Start with one branch or product group and compare recommendations with actual results before expanding.</p>
      <div className="stock-capabilities">
        <article><h3>Forecast demand by item and branch</h3><p>Estimate daily or weekly quantities, including recurring patterns. Compare statistical models such as ETS and SARIMA with simple baselines. For items with many zero-sales days, evaluate Croston-SBA or TSB rather than assuming smooth daily sales.</p></article>
        <article><h3>Explain promotions and local events</h3><p>Evaluate LightGBM or XGBoost using lagged sales, rolling averages, prices and known promotion, calendar or weather inputs. Only use information available when making the forecast; a future promotion plan or weather forecast is not the same as an observed outcome.</p></article>
        <article><h3>Plan for uncertainty and constraints</h3><p>Validate forecast ranges and service targets, then calculate replenishment under lead-time variability, pack sizes, budget, storage and expiry constraints. Use inventory rules or constrained optimization to prepare transfer and purchase drafts for manager approval.</p></article>
        <article><h3>Add an assistant that uses the evidence</h3><p>An LLM can answer “why is this item critical?”, retrieve approved supplier terms, extract a proposed ETA from an email and draft a supplier message. Validated forecast and inventory tools provide the numbers; the assistant explains them and asks for approval before actions.</p></article>
        <article><h3>Evaluate advanced models when justified</h3><p>For richer, larger histories, benchmark global ML, neural forecasting or time-series foundation models such as Chronos. These are candidates, not automatic upgrades. A general chat model or an Ollama installation alone does not establish forecasting accuracy.</p></article>
        <article><h3>Keep integration and access controlled</h3><p>Design branch-level permissions, authorized connectors, refresh checks and an audit trail. A local-model deployment through Ollama can support an assistant on suitable private infrastructure; compute, security and support still have costs. Source systems and purchasing approvals remain authoritative.</p></article>
      </div>
      <details><summary>Data and pilot measures</summary><p>Start with dated item/location quantities and availability, returns, unit conversions, stock movements, open orders and supplier lead times. Add batch expiry, recipes, prices, promotions and calendar data as the chosen scope needs them. Do not submit customer names, credentials or patient data to this demo.</p><p>Agree a forecast horizon tied to replenishment decisions. Test chronologically against a seasonal baseline and inspect absolute error, bias and errors on critical items. Separately measure stockouts, waste, inventory held and ordering effort during an approved pilot. No savings or accuracy percentage is guaranteed.</p></details>
      <p>For an integration discussion, the downloadable brief records your current plan and these discovery questions. A direct enquiry form is not enabled yet.</p>
      <p className="stock-sources">Methods: <a href="https://otexts.com/fpp3/toolbox.html" target="_blank" rel="noopener noreferrer">Forecasting: Principles and Practice</a> · <a href="https://github.com/Nixtla/statsforecast" target="_blank" rel="noopener noreferrer">StatsForecast</a> · <a href="https://nixtlaverse.nixtla.io/mlforecast/docs/getting-started/quick_start_local.html" target="_blank" rel="noopener noreferrer">MLForecast</a> · <a href="https://github.com/amazon-science/chronos-forecasting" target="_blank" rel="noopener noreferrer">Chronos</a> · <a href="https://docs.ollama.com/capabilities/tool-calling" target="_blank" rel="noopener noreferrer">Ollama tool calling</a></p>
    </SectionCard>
  )
}
