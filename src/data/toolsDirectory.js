import { TOOLS } from '../tools/registry.js'
import { CATEGORY_DATA } from './categoryPages.js'

export const DIRECTORY_META = {
  title: 'Online Tools for Documents, Writing, Business & Decisions | Rafiqy',
  heading: 'All Your Daily Tools in One Place',
  description: `Browse ${TOOLS.length} tools for documents, Urdu writing, business workflow demos, development and decisions. Check each tool for its data handling, online requirements and limitations.`,
  notice: 'Data handling varies by tool. File selection does not by itself mean a server upload. Some tools use browser storage, online services or optional cloud sync. Read the tool details before entering private information; offline availability is not guaranteed.',
}

const descriptions = {
  'typing-tools': 'Typing practice, speed and accuracy',
  'language-tools': 'Urdu input and language helpers',
  'writing-tools': 'Word count, text cleanup and documents',
  'productivity-tools': 'Focus, planning, habits and daily workflows',
  'finance-tools': 'Money planning, tax estimates and comparisons',
  'pakistan-tools': 'Pakistan-specific money and everyday references',
  'pdf-tools': 'Compress, merge, split and convert documents',
  'image-tools': 'Images, OCR and document visuals',
  'security-tools': 'Review sensitive text, encryption and redaction',
  'developer-tools': 'JSON, configuration, logs and integration demos',
  'business-tools': 'Stock planning, order review and business workflows',
  'travel-tools': 'Packing, currencies, time zones and group expenses',
  'health-tools': 'Tracking and reference tools with important limitations',
  'education-tools': 'Learning and classroom helpers',
  'legal-tools': 'Timeline and document preparation helpers',
}

export const DIRECTORY_CATEGORIES = Object.entries(CATEGORY_DATA).map(([slug, data]) => ({
  path: `/category/${slug}`,
  label: data.title.replace(/^Free /, '').replace(/ Online$/, ''),
  desc: descriptions[slug] || '',
}))
