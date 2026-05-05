export function getToolUseCases(tool) {
  const map = {
    'solar-planner': [
      'deciding whether solar is worth it for your current electricity bill',
      'comparing full net billing against a smaller self-consumption setup',
      'shortlisting installer quotes with your own cost and payback baseline',
    ],
    'rent-vs-buy-pakistan': [
      'deciding whether to keep renting, buy now, or wait before buying',
      'stress-testing a home purchase against markup, transfer costs, and appreciation',
      'checking if renting and investing the difference leaves you stronger',
    ],
    'car-powertrain-decision': [
      'choosing between petrol, hybrid, and EV for Pakistan conditions',
      'checking whether charging reality makes EV practical for your routine',
      'comparing five-year ownership cost before committing to a car upgrade',
    ],
    'salary-offer-evaluator': [
      'checking whether a new offer is actually better after tax and commute',
      'comparing remote flexibility, relocation pressure, and benefits',
      'preparing for salary negotiations with a clearer value breakdown',
    ],
    'freelance-tax-planner': [
      'deciding how much tax to reserve before paying yourself',
      'checking whether your current runway is strong enough for slow months',
      'setting safer owner pay when freelance income is uneven',
    ],
    'tax-calculator': [
      'estimating salary tax before payroll deductions hit',
      'checking take-home impact before changing jobs or compensation',
      'planning around VPS, charity, and other tax-saving allowances',
    ],
    'urdu-keyboard': [
      'typing Urdu online without changing your device keyboard',
      'writing posts, messages, and documents in Urdu from any browser',
      'converting Roman Urdu into readable Urdu quickly',
    ],
    'typing-tutor': [
      'improving typing speed and accuracy with guided practice',
      'preparing for typing tests, office work, or multilingual input',
      'drilling weak keys instead of repeating random passages',
    ],
  }

  if (map[tool.id]) return map[tool.id]

  if (tool.category === 'pdf') {
    return [
      'handling a PDF task without uploading files anywhere',
      'preparing documents for email, forms, or office sharing',
      'cleaning up or extracting content from PDFs quickly',
    ]
  }
  if (tool.category === 'security') {
    return [
      'protecting sensitive text, files, or personal data locally',
      'checking privacy risks before sharing something publicly',
      'doing security-sensitive work without sending data to a server',
    ]
  }
  if (tool.category === 'developer') {
    return [
      'debugging data, configs, patterns, or logs faster',
      'running quick dev-side checks without opening heavy local tools',
      'transforming technical text into a cleaner working format',
    ]
  }
  if (tool.category === 'writing') {
    return [
      'cleaning, counting, or structuring text before publishing',
      'preparing documents, articles, or client-facing copy faster',
      'editing written content without installing a full desktop app',
    ]
  }
  if (tool.category === 'productivity') {
    return [
      'organizing everyday work with less friction',
      'tracking focus, time, notes, or small personal systems',
      'getting repeat tasks done quickly in one browser tab',
    ]
  }
  if (tool.category === 'finance') {
    return [
      'checking the numbers before making a money decision',
      'estimating payments, budgets, or financial tradeoffs quickly',
      'planning cashflow privately without sending financial data away',
    ]
  }
  if (tool.category === 'pakistan') {
    return [
      'handling a Pakistan-specific calculation or workflow online',
      'checking local rates, planning assumptions, or official-style numbers',
      'making a practical Pakistan-focused decision with less guesswork',
    ]
  }
  if (tool.category === 'health') {
    return [
      'tracking symptoms, measurements, or medicine details for yourself',
      'keeping a private health-related record in the browser',
      'organizing health information before talking to a professional',
    ]
  }
  if (tool.category === 'business') {
    return [
      'managing field-work, property, warranty, or client-side operations',
      'turning rough numbers into a clearer business decision',
      'keeping practical business records organized without extra software',
    ]
  }
  if (tool.category === 'language') {
    return [
      'typing or working in another language more comfortably',
      'bridging input limitations on shared or borrowed devices',
      'switching between scripts without changing system settings',
    ]
  }
  if (tool.category === 'typing') {
    return [
      'building typing speed through repeat practice',
      'preparing for school, office, or test-style typing work',
      'measuring progress over time instead of guessing improvement',
    ]
  }
  if (tool.category === 'travel') {
    return [
      'planning a trip, move, or shared travel expense',
      'avoiding last-minute omissions before leaving',
      'keeping small travel logistics organized in one place',
    ]
  }
  if (tool.category === 'education') {
    return [
      'organizing a classroom, group, or teaching workflow',
      'reducing manual coordination in a school context',
      'keeping recurring education admin work simpler',
    ]
  }
  if (tool.category === 'legal') {
    return [
      'building a clearer record of dates, events, or sequence',
      'turning scattered notes into a structured timeline',
      'preparing an evidence-style overview before deeper review',
    ]
  }

  return [
    'solving a practical everyday task in the browser',
    'getting a faster answer before opening heavier software',
    'working privately without unnecessary sign-up or upload steps',
  ]
}

export function getToolScenarioLine(tool) {
  const [first, second] = getToolUseCases(tool)
  return `Best for ${first}; also useful for ${second}.`
}

