export const IMPORTANT_PAKISTAN_TOOL_IDS = [
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
]

export const USEFUL_HIDDEN_TOOL_IDS = [
  'data-leak-detector',
  'text-extractor',
  'budget-splitter',
  'voice-invoice',
  'doc-redaction',
  'password-generator',
]

export const ACCESSIBILITY_NOTES = {
  'solar-planner': {
    simple: 'Best when you want to know whether solar lagwana faida deta hai for your current bill and usage pattern.',
    romanUrdu: ['solar lagwana faida hai', 'bill ke hisaab se solar', 'solar kitne kw ka hona chahiye', 'net billing faida'],
    commonNeed: 'Many users are really asking: meri current bijli bill ke liye kaunsa solar size sahi rahega?',
  },
  'tax-calculator': {
    simple: 'Best when you want to quickly see salary tax kitna banega and how much take-home actually remains.',
    romanUrdu: ['tax kitna banega', 'salary tax calculate', 'fbr tax nikalna', 'tankhwa tax'],
    commonNeed: 'Many users are really asking: meri salary se kitna tax katega aur ghar kitna ayega?',
  },
  'investment-allocation-planner': {
    simple: 'Best when you are thinking 20 lakh, 1 crore ya zyada paisa kahan lagana chahiye without making one big risky bet.',
    romanUrdu: ['20 lakh kahan invest karun', '1 crore kahan lagayen', 'paisa kis cheez mein lagana chahiye', 'investment split'],
    commonNeed: 'Many users are really asking: sara paisa aik jagah lagana sahi hai ya different cheezon mein baantna chahiye?',
  },
  'rent-vs-buy-pakistan': {
    simple: 'Best when you want a plain answer to ghar rent pe rehna behtar hai, buy karna behtar hai, ya thora wait karna chahiye.',
    romanUrdu: ['ghar rent pe rahun ya buy karun', 'ghar lena ya rent', 'home loan lena chahiye ya nahi', 'rent vs buy pakistan'],
    commonNeed: 'Many users are really asking: apni current earning aur market ke hisaab se ghar lena samajhdari hai ya jaldi hai?',
  },
  'car-powertrain-decision': {
    simple: 'Best when you are confused whether petrol, hybrid, ya EV long run mein zyada sahi aur sasti padegi.',
    romanUrdu: ['petrol ya hybrid', 'ev leni chahiye ya nahi', 'gaari ka kharcha compare', 'hybrid faida'],
    commonNeed: 'Many users are really asking: meri daily driving ke liye konsi gaari type zyada faida mand hai?',
  },
  'salary-offer-evaluator': {
    simple: 'Best when a job offer looks better on paper but you want to know asal mein offer kitni achi hai after tax, commute, aur city cost.',
    romanUrdu: ['job offer acha hai ya nahi', 'salary offer compare', 'nayi job leni chahiye', 'offer evaluate'],
    commonNeed: 'Many users are really asking: zyada salary dikh rahi hai, lekin real faida bhi ho raha hai ya nahi?',
  },
  'freelance-tax-planner': {
    simple: 'Best when freelance income aa raha ho but clear na ho kitna tax, reserve, aur khud ko salary deni chahiye.',
    romanUrdu: ['freelance income ka tax', 'kitna reserve rakhu', 'freelancer owner pay', 'freelance paisa ka plan'],
    commonNeed: 'Many users are really asking: jo paisa aa raha hai us mein se asal mein kharch kitna kar sakta hoon?',
  },
  'loan-emi': {
    simple: 'Best when you need to know loan lena chahiye ya nahi, kitna loan safe hai, aur kitni muddat tak lena behtar rahega.',
    romanUrdu: ['loan kitna lena chahiye', 'emi kitni banegi', 'loan afford kar sakta hun', 'qarz jaldi band karna'],
    commonNeed: 'Many users are really asking: bank se extra paisa waste kiye baghair kitna aur kitni der ke liye loan loon?',
  },
  'urdu-keyboard': {
    simple: 'Best when you want Urdu mein type karna on any phone or laptop without installing a new keyboard.',
    romanUrdu: ['urdu mein type karna', 'urdu keyboard online', 'roman urdu se urdu', 'urdu likhna online'],
    commonNeed: 'Many users are really asking: device settings badlay baghair Urdu kaise likhun?',
  },
  'salary-slip': {
    simple: 'Best for small offices, schools, clinics, and shops that need salary slip banana without full payroll software.',
    romanUrdu: ['salary slip banana', 'pay slip generate', 'tankhwa slip', 'salary slip pakistan'],
    commonNeed: 'Many users are really asking: employee ko professional payslip kaise dein bina complicated software ke?',
  },
  'gold-price': {
    simple: 'Best when you need today ka gold rate aur jaldi se apne amount ya tola ka hisaab.',
    romanUrdu: ['aaj ka gold rate', 'sona rate', 'tola gold price', 'gold ka hisaab'],
    commonNeed: 'Many users are really asking: itne tolay ya grams ka aaj ke rate pe kitna banta hai?',
  },
  'data-leak-detector': {
    simple: 'Useful when you are about to share a CV, screenshot, config file, ya document and want to make sure kuch sensitive cheez by mistake na ja rahi ho.',
    romanUrdu: ['document mein private cheez check', 'email leak check', 'cv se sensitive data hatana'],
    commonNeed: 'Many users do not search for this directly, but it is very useful before sending files publicly.',
  },
  'text-extractor': {
    simple: 'Useful when you have a scanned image, Urdu notice, challan, ya photo and need us mein se likha hua text nikalna.',
    romanUrdu: ['image se text nikalna', 'urdu scan se text', 'photo se likhai copy'],
    commonNeed: 'Many users do not know OCR tools exist, but they save huge manual effort on forms and notices.',
  },
  'budget-splitter': {
    simple: 'Useful when family, doston, ya travel group ka kharcha barabar ya different ratio mein baantna ho.',
    romanUrdu: ['kharcha baantna', 'bill split', 'family expense share', 'trip ka hisaab'],
    commonNeed: 'Many users do this manually in WhatsApp chats when a simple tool would be cleaner.',
  },
  'voice-invoice': {
    simple: 'Useful when you want invoice jaldi banana by speaking items instead of typing everything from scratch.',
    romanUrdu: ['awaaz se invoice banana', 'invoice jaldi banana', 'bol kar bill banana'],
    commonNeed: 'Useful for service businesses that do not realize a light browser invoice tool can replace messy notes.',
  },
  'doc-redaction': {
    simple: 'Useful when you need CNIC, phone number, ya private details ko document se black out karke safe copy share karni ho.',
    romanUrdu: ['cnic chupana', 'document se private info hatana', 'redact document'],
    commonNeed: 'Very useful for legal, HR, school, and application workflows where full documents should not be shared openly.',
  },
  'password-generator': {
    simple: 'Useful when you need strong password banana instead of repeating easy passwords everywhere.',
    romanUrdu: ['strong password banana', 'secure password generate', 'password bana do'],
    commonNeed: 'A simple security tool many users need but rarely search for until something goes wrong.',
  },
}

export function getAccessibilityNote(toolId) {
  return ACCESSIBILITY_NOTES[toolId] || null
}

export function getRomanUrduTerms(toolId) {
  return ACCESSIBILITY_NOTES[toolId]?.romanUrdu || []
}
