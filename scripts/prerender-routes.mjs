import { BLOG_INDEX } from '../src/data/blogIndex.js'
import { BLOG_SECTIONS, getBlogPostPath } from '../src/data/blogRoutes.js'
import { CATEGORY_DATA } from '../src/data/categoryPages.js'
import { TOOLS } from '../src/tools/registry.js'

export const PILOT_PRERENDER_ROUTES = [
  '/',
  '/tools',
  '/blog',
  '/tools/solar-planner',
  '/tools/tax-calculator',
]

const CORE_CONTENT_ROUTES = [
  '/',
  '/tools',
  '/blog',
  '/about',
  '/help',
  '/privacy',
]

const BLOG_SECTION_ROUTES = Object.values(BLOG_SECTIONS).map(section => `/blog/${section.path}`)
const CATEGORY_ROUTES = Object.keys(CATEGORY_DATA).map(slug => `/category/${slug}`)
const BLOG_POST_ROUTES = BLOG_INDEX.map(post => getBlogPostPath(post))

const STRATEGIC_TOOL_IDS = [
  'typing-tutor',
  'solar-planner',
  'tax-calculator',
  'investment-allocation-planner',
  'rent-vs-buy-pakistan',
  'car-powertrain-decision',
  'salary-offer-evaluator',
  'freelance-tax-planner',
  'loan-emi',
  'urdu-keyboard',
  'salary-slip',
  'gold-price',
  'pk-id-tax-hub',
  'tax-optimizer',
  'whatsapp-tools',
  'voice-invoice',
]

export const DECISION_SYSTEM_PRERENDER_ROUTES = [
  '/tools/solar-planner',
  '/tools/tax-calculator',
  '/tools/investment-allocation-planner-pakistan',
  '/tools/rent-vs-buy-calculator-pakistan',
  '/tools/petrol-vs-hybrid-vs-ev',
  '/tools/salary-offer-calculator-pakistan',
  '/tools/freelance-tax-planner-pakistan',
  '/tools/loan-emi',
]

const STRATEGIC_TOOL_ROUTES = STRATEGIC_TOOL_IDS
  .map(id => TOOLS.find(tool => tool.id === id)?.path)
  .filter(Boolean)

export const PRERENDER_ROUTES = [...new Set([
  ...CORE_CONTENT_ROUTES,
  ...BLOG_SECTION_ROUTES,
  ...CATEGORY_ROUTES,
  ...BLOG_POST_ROUTES,
  ...STRATEGIC_TOOL_ROUTES,
])]
