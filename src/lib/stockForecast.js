// Small, inspectable statistical baselines. No LLM, remote model or training service.
export const FORECAST_METHODS = {
  weekly: 'Repeat last week',
  mean: 'Recent 14-day average',
  smoothing: 'Smoothed recent level (α = 0.3)',
}
export const FORECAST_SAMPLE = Array.from({ length: 56 }, (_, i) => [5, 6, 7, 8, 14, 15, 9][i % 7]).join(', ')

function checkSeries(series, minimum) {
  if (!Array.isArray(series) || series.length < minimum || series.length > 366 || series.some(v => typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 1e6)) {
    throw new RangeError(`Use ${minimum}–366 consecutive daily quantities between 0 and 1 million.`)
  }
}

export function parseStockHistory(text) {
  if (typeof text !== 'string' || text.length > 8192) throw new RangeError('Enter no more than 366 daily quantities.')
  const tokens = text.trim().split(/[,\n]/).map(t => t.trim())
  if (tokens.some(t => !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(t))) {
    throw new RangeError('Enter numbers separated by commas or new lines. Missing days must be resolved, not silently replaced with zero.')
  }
  const series = tokens.map(Number)
  checkSeries(series, 42)
  return series
}

export function forecastStockHistory(series, method, horizon = 7) {
  checkSeries(series, 14)
  if (!Object.hasOwn(FORECAST_METHODS, method) || !Number.isInteger(horizon) || horizon < 1 || horizon > 28) {
    throw new RangeError('Choose a supported method and a 1–28 day horizon.')
  }
  if (method === 'weekly') return Array.from({ length: horizon }, (_, h) => series[series.length - 7 + h % 7])
  if (method === 'mean') {
    const mean = series.slice(-14).reduce((sum, v) => sum + v, 0) / 14
    return Array(horizon).fill(mean)
  }
  const level = series.slice(1).reduce((previous, value) => .3 * value + .7 * previous, series[0])
  return Array(horizon).fill(level)
}

export function evaluateStockForecast(series) {
  checkSeries(series, 42)
  // Eight rolling origins; each predicts the next seven days from PAST data only.
  // Overlapping windows provide a small diagnostic, not independent trials or certainty.
  const scores = Object.entries(FORECAST_METHODS).map(([method, label]) => {
    let error = 0, bias = 0, points = 0
    for (let origin = series.length - 14; origin <= series.length - 7; origin++) {
      const predictions = forecastStockHistory(series.slice(0, origin), method)
      predictions.forEach((prediction, h) => {
        const delta = prediction - series[origin + h]
        error += Math.abs(delta)
        bias += delta
        points++
      })
    }
    return { method, label, mae: error / points, bias: bias / points, points }
  }).sort((a, b) => a.mae - b.mae)
  const selected = scores[0]
  const forecast = forecastStockHistory(series, selected.method)
  const total = forecast.reduce((sum, v) => sum + v, 0)
  return { selected, scores, forecast, total, dailyAverage: total / 7, days: series.length }
}
