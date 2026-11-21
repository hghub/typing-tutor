// Cash budgeting only: no income classification, statutory rates or liability inference.
export function planFreelanceReserves(inputs) {
  const amounts = ['averageMonthlyRevenue', 'monthlyBusinessCosts', 'monthlyHomeCosts', 'annualTaxBudget', 'currentEmergencyFund']
  for (const key of amounts) {
    if (typeof inputs[key] !== 'number' || !Number.isFinite(inputs[key]) || inputs[key] < 0 || inputs[key] > 1e9) throw new RangeError('Enter valid non-negative amounts up to PKR 1 billion in every amount field, including the tax budget.')
  }
  for (const [key, min, max] of [['reservePct', 0, 100], ['emergencyMonths', 0, 24], ['buildMonths', 1, 120]]) {
    if (!Number.isFinite(inputs[key]) || inputs[key] < min || inputs[key] > max) throw new RangeError('Check the reserve percentage and planning periods.')
  }
  const taxReserveMonthly = inputs.annualTaxBudget / 12
  const opsReserveMonthly = inputs.averageMonthlyRevenue * inputs.reservePct / 100
  const emergencyTarget = inputs.monthlyHomeCosts * inputs.emergencyMonths
  const emergencyContribution = Math.max(0, emergencyTarget - inputs.currentEmergencyFund) / inputs.buildMonths
  const allocations = inputs.monthlyBusinessCosts + taxReserveMonthly + opsReserveMonthly + emergencyContribution
  const available = inputs.averageMonthlyRevenue - allocations
  const stressAvailable = inputs.averageMonthlyRevenue * .8 - allocations
  const ownerPay = Math.max(0, available)
  return { taxReserveMonthly, opsReserveMonthly, emergencyTarget, emergencyContribution,
    ownerPay, deficit: Math.max(0, -available), householdGap: Math.max(0, inputs.monthlyHomeCosts - ownerPay),
    runwayMonths: inputs.monthlyHomeCosts > 0 ? inputs.currentEmergencyFund / inputs.monthlyHomeCosts : null,
    stressOwnerPay: Math.max(0, stressAvailable), stressDeficit: Math.max(0, -stressAvailable) }
}
