/**
 * Pakistan Income Tax Data — Finance Act 2025 (FY 2025-26)
 * Source: Finance Bill 2025 / FBR
 * For salaried individuals only.
 */

// FY 2025-26 salaried tax slabs
export const SLABS_2526 = [
  { min: 0,         max: 600_000,    fixed: 0,         rate: 0,    label: 'Up to 6 Lakh' },
  { min: 600_001,   max: 1_200_000,  fixed: 0,         rate: 0.05, label: '6L – 12L' },
  { min: 1_200_001, max: 2_200_000,  fixed: 30_000,    rate: 0.15, label: '12L – 22L' },
  { min: 2_200_001, max: 3_200_000,  fixed: 180_000,   rate: 0.25, label: '22L – 32L' },
  { min: 3_200_001, max: 4_100_000,  fixed: 430_000,   rate: 0.30, label: '32L – 41L' },
  { min: 4_100_001, max: Infinity,   fixed: 700_000,   rate: 0.35, label: 'Above 41L' },
]

// FY 2024-25 slabs for year-over-year comparison
export const SLABS_2425 = [
  { min: 0,         max: 600_000,    fixed: 0,         rate: 0 },
  { min: 600_001,   max: 1_200_000,  fixed: 0,         rate: 0.05 },
  { min: 1_200_001, max: 2_400_000,  fixed: 30_000,    rate: 0.15 },
  { min: 2_400_001, max: 3_600_000,  fixed: 210_000,   rate: 0.25 },
  { min: 3_600_001, max: 6_000_000,  fixed: 510_000,   rate: 0.30 },
  { min: 6_000_001, max: Infinity,   fixed: 1_230_000, rate: 0.35 },
]

/** Surcharge: 9% on tax if income > 10M */
export const SURCHARGE_THRESHOLD = 10_000_000
export const SURCHARGE_RATE = 0.09

/** VPS / Pension shield: credit on up to 20% of taxable income */
export const VPS_MAX_RATE = 0.20

/** Charity shield: credit on up to 30% of taxable income */
export const CHARITY_MAX_RATE = 0.30

/** Senior citizen rebate: 50% of tax for age >= 60 */
export const SENIOR_AGE = 60
export const SENIOR_REBATE = 0.50

/** Teacher/researcher tax credit: 25% of tax (Finance Act 2025 — under review) */
export const TEACHER_CREDIT = 0.25

/** Petrol price PKR/litre (update periodically) */
export const PETROL_PRICE_PER_LITRE = 278

/** Calculate raw tax for a given income using a slabs array */
export function calcTax(income, slabs) {
  if (income <= 0) return 0
  const slab = slabs.find((s) => income >= s.min && income <= s.max)
  if (!slab) return 0
  return slab.fixed + (income - slab.min + 1) * slab.rate
}

/** Full tax calculation with surcharge, rebates, shields */
export function calcFullTax({ annualIncome, age = 0, isTeacher = false, slabs = SLABS_2526 }) {
  let tax = calcTax(annualIncome, slabs)
  const effectiveRate = annualIncome > 0 ? tax / annualIncome : 0

  // Surcharge
  let surcharge = 0
  if (annualIncome > SURCHARGE_THRESHOLD) {
    surcharge = tax * SURCHARGE_RATE
  }
  tax += surcharge

  // Senior citizen rebate
  let seniorRebate = 0
  if (age >= SENIOR_AGE) {
    seniorRebate = tax * SENIOR_REBATE
    tax -= seniorRebate
  }

  // Teacher/researcher credit
  let teacherCredit = 0
  if (isTeacher) {
    teacherCredit = tax * TEACHER_CREDIT
    tax -= teacherCredit
  }

  return { tax: Math.max(0, tax), effectiveRate, surcharge, seniorRebate, teacherCredit }
}

/** VPS shield: how much tax saved by investing amount */
export function calcVPSShield(annualIncome, annualTax, investAmount) {
  const maxInvestment = annualIncome * VPS_MAX_RATE
  const capped = Math.min(investAmount, maxInvestment)
  const effectiveRate = annualIncome > 0 ? annualTax / annualIncome : 0
  return { saving: capped * effectiveRate, maxInvestment, capped }
}

/** Charity shield: credit on donation */
export function calcCharityShield(annualIncome, annualTax, donationAmount) {
  const maxDonation = annualIncome * CHARITY_MAX_RATE
  const capped = Math.min(donationAmount, maxDonation)
  const effectiveRate = annualIncome > 0 ? annualTax / annualIncome : 0
  const credit = capped * effectiveRate
  return { credit, netCost: capped - credit, maxDonation, capped }
}

/** Find which slab the income is in and proximity to next slab */
export function slabProximity(income, slabs = SLABS_2526) {
  const idx = slabs.findIndex((s) => income >= s.min && income <= s.max)
  if (idx === -1 || idx === slabs.length - 1) return null
  const nextSlab = slabs[idx + 1]
  const gap = nextSlab.min - income
  const taxJump = (nextSlab.rate - slabs[idx].rate) * 100
  return { gap, nextSlabRate: nextSlab.rate, taxJumpPct: taxJump }
}
