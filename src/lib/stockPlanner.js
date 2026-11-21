const FIELDS = ['onHand', 'reserved', 'dailyUse', 'leadDays', 'safetyDays', 'reviewDays', 'onOrder', 'arrivalDays', 'packSize', 'minimumOrder', 'unitCost', 'shelfDays']

// Quantities must use one consistent unit per item. This is scenario planning,
// not a learned forecast. Count confirmed orders once, even when they are late.
export function planStock(item) {
  for (const key of FIELDS) {
    const value = item[key]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1e9) {
      throw new RangeError(`Enter a valid non-negative ${key} (maximum 1 billion).`)
    }
  }
  if (item.packSize <= 0) throw new RangeError('Pack size must be greater than zero.')
  const available = Math.max(0, item.onHand - item.reserved)
  const coverDays = item.dailyUse > 0 ? available / item.dailyUse : null
  const incomingBeforeGap = item.onOrder > 0 && (coverDays === null || item.arrivalDays <= coverDays)
  const projectedCover = coverDays === null ? null : (incomingBeforeGap ? (available + item.onOrder) / item.dailyUse : coverDays)
  const horizon = item.leadDays + item.safetyDays + item.reviewDays
  const target = item.dailyUse * horizon
  const position = available + item.onOrder
  const shortage = Math.max(0, target - position)
  const quantity = shortage > 0 ? Number((Math.ceil((Math.max(shortage, item.minimumOrder) - 1e-9) / item.packSize) * item.packSize).toPrecision(12)) : 0
  const warnings = []
  if (item.reserved > item.onHand) warnings.push('Committed stock exceeds on-hand stock. Reconcile the shortfall first.')
  const lateIncoming = item.onOrder > 0 && coverDays !== null && item.arrivalDays > coverDays
  if (lateIncoming) warnings.push('Confirmed stock arrives after the first projected stockout. Expedite or transfer stock; avoid duplicating the purchase order.')
  const shelfRisk = item.shelfDays > 0 && quantity > item.dailyUse * item.shelfDays
  if (shelfRisk) warnings.push('The draft quantity exceeds expected consumption within its shelf life. Review pack size, minimum order and split deliveries.')
  if (!item.dailyUse) warnings.push('No expected usage entered. No new order is suggested; review whether this is slow stock or missing demand data.')
  const critical = item.dailyUse > 0 && projectedCover <= item.leadDays
  const status = !item.dailyUse ? 'Check usage' : critical ? 'Critical' : quantity > 0 ? 'Order soon' : 'Covered'
  const action = critical
    ? 'Check demand and delivery dates now; consider an approved expedited delivery or branch transfer.'
    : shelfRisk ? 'Review perishability before approving an order.'
      : quantity > 0 ? 'Review the draft quantity and confirm supplier terms before ordering.'
        : 'Keep the confirmed delivery under review; no additional order suggested for this scenario.'
  return { available, coverDays, projectedCover, horizon, target, position, quantity, cost: quantity * item.unitCost, status, action, warnings, lateIncoming, shelfRisk }
}

export const STOCK_SAMPLES = {
  pizza: [{ name: 'Mozzarella', unit: 'kg', onHand: 6, reserved: 0, dailyUse: 9, leadDays: 1, safetyDays: 0.5, reviewDays: 1, onOrder: 10, arrivalDays: 2, packSize: 1, minimumOrder: 5, unitCost: 2200, shelfDays: 5 },
    { name: 'Pizza boxes', unit: 'boxes', onHand: 250, reserved: 20, dailyUse: 45, leadDays: 3, safetyDays: 1, reviewDays: 2, onOrder: 0, arrivalDays: 0, packSize: 50, minimumOrder: 100, unitCost: 65, shelfDays: 0 }],
  bakery: [{ name: 'Cream', unit: 'litres', onHand: 14, reserved: 2, dailyUse: 5, leadDays: 2, safetyDays: 1, reviewDays: 2, onOrder: 0, arrivalDays: 0, packSize: 12, minimumOrder: 12, unitCost: 900, shelfDays: 2 },
    { name: 'Flour', unit: 'kg', onHand: 100, reserved: 10, dailyUse: 25, leadDays: 2, safetyDays: 1, reviewDays: 2, onOrder: 50, arrivalDays: 1, packSize: 25, minimumOrder: 25, unitCost: 140, shelfDays: 30 }],
  retail: [{ name: 'Fast-selling item', unit: 'units', onHand: 120, reserved: 20, dailyUse: 20, leadDays: 7, safetyDays: 2, reviewDays: 3, onOrder: 200, arrivalDays: 8, packSize: 12, minimumOrder: 24, unitCost: 180, shelfDays: 0 },
    { name: 'Slow-selling item', unit: 'units', onHand: 240, reserved: 0, dailyUse: 1, leadDays: 5, safetyDays: 2, reviewDays: 7, onOrder: 0, arrivalDays: 0, packSize: 12, minimumOrder: 12, unitCost: 300, shelfDays: 0 }],
}
