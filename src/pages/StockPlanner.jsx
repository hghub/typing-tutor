import { useToolLanguage } from '../hooks/useToolLanguage'
import { UrduStockView } from '../components/UrduToolViews'
import { useState } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { DecisionHero, SectionCard, FieldsGrid, Field, NumberInput, MetricGrid, MetricCard } from '../components/decision/DecisionBlocks'
import { FORECAST_SAMPLE } from '../lib/stockForecast'
import { planStock, STOCK_SAMPLES } from '../lib/stockPlanner'
import StockForecastLab, { StockAIOptions } from '../components/StockForecastLab'
import './StockPlanner.css'

const ACCENT = '#14b8a6'
const INPUTS = [
  ['onHand', 'On hand'], ['reserved', 'Already committed'], ['dailyUse', 'Expected use per day'],
  ['leadDays', 'New delivery lead time (days)'], ['safetyDays', 'Safety buffer (days)'],
  ['reviewDays', 'Days until next stock review'], ['onOrder', 'Already ordered'], ['arrivalDays', 'Existing order ETA (days)'],
  ['packSize', 'Supplier pack size'], ['minimumOrder', 'Minimum order quantity'],
  ['unitCost', 'Cost per unit'], ['shelfDays', 'Shelf life after delivery (days; 0 = not modelled)'],
]
const fmt = n => new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(n)
const sample = kind => STOCK_SAMPLES[kind].map((r, id) => ({ ...r, id }))

export default function StockPlanner() {
  const { colors } = useTheme()
  const { isUrdu } = useToolLanguage()
  const [rows, setRows] = useState(() => sample('pizza'))
  const [currency, setCurrency] = useState('PKR')
  const [forecastState, setForecastState] = useState({ history: FORECAST_SAMPLE, selectedId: 0, applied: false })
  const results = rows.map(item => {
    try { return { item, plan: planStock(item) } }
    catch (error) { return { item, error: error.message } }
  })
  const valid = results.filter(r => r.plan)
  const hasErrors = valid.length !== rows.length
  const cost = valid.reduce((sum, r) => sum + r.plan.cost, 0)
  function update(id, key, value) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r))
  }
  function downloadBrief() {
    const brief = ['Rafiqy stock planning brief — estimates for manager review',
      'Assumes steady daily usage, one open delivery per item and consistent units. Not a demand forecast or purchase order.',
      `Currency: ${currency}. Additional draft purchasing budget: ${fmt(cost)}.`,
      ...results.map(({ item, plan }) => `${item.name || 'Unnamed item'} (${item.unit || 'units'}): ${plan.status}; available ${fmt(plan.available)}; initial cover ${plan.coverDays === null ? 'unknown' : fmt(plan.coverDays) + ' days'}; already ordered ${fmt(item.onOrder)}, ETA ${fmt(item.arrivalDays)} days; draft additional quantity ${fmt(plan.quantity)}; draft cost ${fmt(plan.cost)}. ${plan.action} ${plan.warnings.join(' ')}`),
      'Implementation discovery: Which POS/accounting systems hold sales, stock, reservations and purchase orders? How fresh are the exports? Who approves ordering? Which units, branches and delivery schedules need reconciliation?',
      'Forecasting discovery: Is dated usage/sales history available by item and location? Which days were unavailable, missing or affected by returns? Which promotions and calendars were known in advance? Which forecast horizon and service target support your ordering decision?',
      'Custom options to scope: POS/ERP reconciliation; statistical/ML demand forecasts with chronological backtests and validated ranges; recipe-to-ingredient planning; batch-expiry and branch-transfer rules; budget-constrained purchase drafts; an evidence-based assistant with approved tools and human purchasing approval. These integrations and AI services are not enabled in this demo.',
    ].join('\n\n')
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'rafiqy-stock-planning-brief.txt'
    link.click()
    URL.revokeObjectURL(url)
  }
  function addItem() { setRows(prev => [...prev, { ...STOCK_SAMPLES.retail[0], name: 'New item', id: Math.max(...prev.map(r => r.id)) + 1, onHand: 0, reserved: 0, dailyUse: 0, onOrder: 0 }]) }
  if (isUrdu) return <ToolLayout toolId="stock-planner"><UrduStockView {...{ colors, rows, setRows, results, update, hasErrors, cost, currency, setCurrency, addItem, forecastState, setForecastState }} loadSample={kind => setRows(sample(kind))} /></ToolLayout>
  return (
    <ToolLayout toolId="stock-planner">
      <DecisionHero accent={ACCENT} colors={colors} eyebrow="Inventory planning • local calculations"
        title="What should you order before stock runs out?"
        description="Check shortages, existing deliveries and supplier pack sizes together. Build an editable replenishment plan for your shop, bakery or pizza kitchen." />
      <p style={{ marginBottom: '1rem', color: colors.textSecondary }}>Starts with synthetic examples. Prices and usage are illustrative inputs, not live market data. Your entries stay in this page's memory and are lost when you reload.</p>
      <div className="stock-actions" style={{ marginBottom: '1rem' }}>
        {['pizza', 'bakery', 'retail'].map(kind => <button key={kind} className="stock-button" onClick={() => setRows(sample(kind))}>Load {kind} sample (replaces inputs)</button>)}
        <label>Currency <select aria-label="Currency" value={currency} onChange={e => setCurrency(e.target.value)} style={{ background: colors.card, color: colors.text, padding: '0.5rem' }}>
          {['PKR', 'USD', 'SAR', 'AED', 'GBP', 'EUR'].map(code => <option key={code}>{code}</option>)}
        </select></label>
      </div>
      <p style={{ marginBottom: '1rem', color: colors.textSecondary }}>Changing currency only changes the label. Enter every item's cost in that currency; this tool does not convert rates.</p>
      <MetricGrid>
        <MetricCard colors={colors} accent="#f59e0b" label="Critical items" value={hasErrors ? 'Review inputs' : valid.filter(r => r.plan.status === 'Critical').length} sub="Potential shortage before a new delivery could arrive" />
        <MetricCard colors={colors} accent={ACCENT} label="Additional draft order budget" value={hasErrors ? 'Review inputs' : `${currency} ${fmt(cost)}`} sub="Excludes the cost of existing orders, taxes and delivery" />
        <MetricCard colors={colors} accent="#06b6d4" label="Late incoming deliveries" value={hasErrors ? 'Review inputs' : valid.filter(r => r.plan.lateIncoming).length} sub="Expected after the first projected stockout" />
      </MetricGrid>
      <div className="stock-items">
        {results.map(({ item, plan, error }) => <SectionCard key={item.id} colors={colors} accent={ACCENT} title={item.name || 'Unnamed item'}>
          <FieldsGrid>
            <Field label="Item name"><input className="stock-text" maxLength={100} value={item.name} onChange={e => update(item.id, 'name', e.target.value)} /></Field>
            <Field label="Stock unit" hint="Use the same unit for stock, daily use, packs and unit cost."><input className="stock-text" maxLength={30} value={item.unit} onChange={e => update(item.id, 'unit', e.target.value)} /></Field>
            {INPUTS.map(([key, label]) => <Field key={key} label={label}><NumberInput colors={colors} min={key === 'packSize' ? 0.001 : 0} max={1e9} step="any" value={Number.isNaN(item[key]) ? '' : item[key]} onChange={e => update(item.id, key, e.target.value === '' ? NaN : Number(e.target.value))} /></Field>)}
          </FieldsGrid>
          {error ? <p role="alert" style={{ color: '#f59e0b' }}>{error}</p> : <div className="stock-result" role="status" style={{ borderColor: plan.status === 'Critical' ? '#f59e0b' : ACCENT }}>
            <strong>{plan.status} · {fmt(plan.available)} {item.unit} available after commitments</strong>
            <p>Initial stock cover: {plan.coverDays === null ? 'unknown (zero expected use)' : `${fmt(plan.coverDays)} days`}. Existing incoming: {fmt(item.onOrder)} {item.unit} in {fmt(item.arrivalDays)} days.</p>
            <p><strong>Draft additional order: {fmt(plan.quantity)} {item.unit} · {currency} {fmt(plan.cost)}</strong></p>
            <p>{plan.action}</p>
            {plan.warnings.map(w => <p key={w} style={{ color: '#f59e0b' }}>{w}</p>)}
            <details><summary>Show the calculation</summary><p>Target {fmt(plan.target)} = {fmt(item.dailyUse)} per day × ({fmt(item.leadDays)} lead + {fmt(item.safetyDays)} safety + {fmt(item.reviewDays)} review days). Inventory position {fmt(plan.position)} = available {fmt(plan.available)} + confirmed incoming {fmt(item.onOrder)}. Any positive gap is rounded up to supplier packs and minimum order.</p></details>
          </div>}
          <button className="stock-button" disabled={rows.length === 1} onClick={() => setRows(prev => prev.filter(r => r.id !== item.id))}>Remove item</button>
        </SectionCard>)}
      </div>
      <div className="stock-actions">
        <button className="stock-button" disabled={rows.length >= 30} onClick={addItem}>Add item</button>
        <button className="stock-button" disabled={hasErrors} onClick={downloadBrief}>Download planning & integration brief</button>
      </div>
      <StockForecastLab colors={colors} items={rows} state={forecastState} setState={setForecastState} onApply={(id, value) => update(id, 'dailyUse', value)} />
      <SectionCard colors={colors} accent={ACCENT} title="What this estimate assumes">
        <p>The reorder plan uses a steady expected daily usage input. You can enter it yourself or copy a seven-day average from the statistical forecast lab. Copying an average does not make the reorder calculation day-by-day or shelf-life optimized. Existing orders are counted once even if they are late, so an urgent shortage can coexist with a zero additional-order recommendation.</p>
        <p>A shelf-life warning compares a new order with expected usage during its shelf life. It does not inspect current batch expiry, opening hours, supplier calendars, seasonal demand or future price changes. Review those before approving a purchase.</p>
        <p>Need this connected to your POS, warehouse or accounting system? Rafiqy's integration work starts by reconciling item identifiers, units, reservations and delivery records. Download the brief to prepare that discussion. Direct system connections and enquiry capture are not enabled in this demo.</p>
        <a href="/blog/decision-support/how-to-prioritize-stock-reorders">Read the stock planning guide →</a>
      </SectionCard>
      <StockAIOptions colors={colors} />
    </ToolLayout>
  )
}
