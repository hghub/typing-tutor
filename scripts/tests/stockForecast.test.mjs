import test from 'node:test'
import assert from 'node:assert/strict'
import { parseStockHistory, forecastStockHistory, evaluateStockForecast, FORECAST_SAMPLE } from '../../src/lib/stockForecast.js'

test('weekly method aligns to the next day and repeats through longer horizons', () => {
  const series = Array.from({ length: 45 }, (_, i) => i % 7 + 1)
  assert.deepEqual(forecastStockHistory(series, 'weekly', 10), [4, 5, 6, 7, 1, 2, 3, 4, 5, 6])
})
test('constant histories stay constant with zero backtest error', () => {
  const r = evaluateStockForecast(Array(42).fill(10))
  assert.equal(r.total, 70)
  assert.equal(r.dailyAverage, 10)
  assert.ok(r.scores.every(s => s.mae === 0 && s.bias === 0 && s.points === 56))
})
test('zero demand is not turned into a speculative positive forecast', () => {
  const r = evaluateStockForecast(Array(42).fill(0))
  assert.deepEqual(r.forecast, Array(7).fill(0))
  assert.equal(r.total, 0)
})
test('smoothing updates a recent level using the documented fixed weight', () => {
  assert.deepEqual(forecastStockHistory([...Array(13).fill(0), 10], 'smoothing'), Array(7).fill(3))
})
test('rolling seven-day tests produce independently known errors on a rising series', () => {
  const r = evaluateStockForecast(Array.from({ length: 56 }, (_, i) => i + 1))
  const weekly = r.scores.find(s => s.method === 'weekly')
  const mean = r.scores.find(s => s.method === 'mean')
  assert.equal(weekly.mae, 7)
  assert.equal(weekly.bias, -7)
  assert.equal(mean.mae, 10.5)
  assert.equal(mean.bias, -10.5)
  assert.equal(r.selected.method, 'smoothing')
})
test('synthetic weekly history selects the seasonal baseline on held-out data', () => {
  const r = evaluateStockForecast(parseStockHistory(FORECAST_SAMPLE))
  assert.equal(r.selected.method, 'weekly')
  assert.equal(r.selected.mae, 0)
  assert.deepEqual(r.forecast, [5, 6, 7, 8, 14, 15, 9])
  assert.equal(r.total, 64)
})
test('history parser accepts decimal daily quantities and rejects gaps or unsafe values', () => {
  assert.equal(parseStockHistory(Array(42).fill('1.5').join('\n')).length, 42)
  for (const invalid of ['1,,2', '1,\n2', 'NaN', 'Infinity', '-1', '1e3', '', Array(41).fill(1).join(','), Array(367).fill(1).join(','), Array(42).fill(1000001).join(',')]) {
    assert.throws(() => parseStockHistory(invalid), RangeError)
  }
})
test('invalid series, horizons and methods fail explicitly', () => {
  for (const series of [[], Array(42).fill(NaN), Array(42).fill(-1), Array(42).fill('1')]) assert.throws(() => evaluateStockForecast(series), RangeError)
  assert.throws(() => forecastStockHistory(Array(42).fill(1), 'unknown'), RangeError)
  assert.throws(() => forecastStockHistory(Array(42).fill(1), 'weekly', 0), RangeError)
})
