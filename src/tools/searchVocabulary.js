/**
 * Search vocabulary for each tool.
 * Extend this file to add/update keywords without touching registry.js.
 * Each entry: { keywords, roman_urdu, synonyms }
 */
export const SEARCH_VOCABULARY = {
  'typing-tutor': {
    keywords: ['typing', 'speed', 'wpm', 'accuracy', 'keyboard', 'practice', 'test'],
    roman_urdu: ['typing speed', 'tez typing', 'keyboard practice', 'type karna', 'likhnay ki speed', 'keyboard test'],
    synonyms: ['typing trainer', 'speed test', 'wpm test', 'keyboard test', 'typing checker', 'typing speed test'],
  },
  'word-counter': {
    keywords: ['words', 'characters', 'count', 'readability', 'text analysis', 'paragraphs', 'sentences'],
    roman_urdu: ['alfaaz ginna', 'words count', 'text analysis', 'likhai analysis', 'characters count'],
    synonyms: ['character counter', 'text analyzer', 'word count tool', 'readability checker'],
  },
  'text-cleaner': {
    keywords: ['text', 'clean', 'format', 'spaces', 'capitalize', 'case', 'strip'],
    roman_urdu: ['text saaf karna', 'format karna', 'likhai format', 'space hatana', 'capital letters'],
    synonyms: ['text formatter', 'text cleaner', 'remove spaces', 'fix formatting', 'case converter'],
  },
  'doc-composer': {
    keywords: ['document', 'compose', 'template', 'letter', 'resume', 'write', 'draft'],
    roman_urdu: ['document banana', 'dastaawaiz', 'letter banana', 'khat likhna', 'resume banana'],
    synonyms: ['document editor', 'text composer', 'letter writer', 'doc template'],
  },
  'urdu-keyboard': {
    keywords: ['urdu', 'keyboard', 'phonetic', 'type', 'input', 'roman urdu'],
    roman_urdu: ['urdu keyboard', 'urdu mein type karna', 'urdu likhai', 'roman urdu', 'phonetic urdu', 'urdu typing'],
    synonyms: ['urdu input method', 'urdu typing tool', 'phonetic urdu keyboard', 'urdu IME'],
  },
  'tax-calculator': {
    keywords: ['tax', 'income', 'salary', 'FBR', 'Pakistan', 'deduction', 'calculate'],
    roman_urdu: ['tax nikalna', 'income tax', 'tax calculate karna', 'FBR', 'salary tax', 'tankhwa tax', 'mahasil'],
    synonyms: ['income tax calculator', 'tax estimator', 'FBR tax calculator', 'salary tax calculator', 'withholding tax'],
  },
  'tax-optimizer': {
    keywords: ['tax', 'savings', 'deductions', 'exemption', 'plan', 'reduce', 'optimize'],
    roman_urdu: ['tax bachana', 'tax planning', 'tax deduction', 'exemption', 'tax kam karna'],
    synonyms: ['tax saver', 'tax deduction planner', 'tax planning tool', 'tax reduction tool'],
  },
  'text-encryptor': {
    keywords: ['encrypt', 'decrypt', 'password', 'AES', 'secure', 'private', 'secret'],
    roman_urdu: ['encrypt karna', 'password se lock karna', 'gehri baat', 'message chupana', 'secret message'],
    synonyms: ['text encryption', 'encrypt message', 'secret message tool', 'AES encryption', 'message protector'],
  },
  'data-leak-detector': {
    keywords: ['breach', 'leak', 'email', 'password', 'compromised', 'hack', 'haveibeenpwned'],
    roman_urdu: ['data leak check', 'email hack check', 'password leak', 'account compromise', 'email check'],
    synonyms: ['breach checker', 'pwned check', 'email breach detector', 'data breach lookup', 'hacked email checker'],
  },
  'currency-converter': {
    keywords: ['currency', 'exchange', 'rate', 'convert', 'dollar', 'rupee', 'forex'],
    roman_urdu: ['currency convert', 'rupee dollar', 'paise tabdeel karna', 'exchange rate', 'USD PKR', 'dollar rate'],
    synonyms: ['forex converter', 'exchange rate calculator', 'USD to PKR', 'money converter', 'currency exchange'],
  },
  'packing-list': {
    keywords: ['packing', 'travel', 'checklist', 'trip', 'luggage', 'suitcase', 'items'],
    roman_urdu: ['safar ka saman', 'packing list', 'travel checklist', 'saman ki list', 'suitcase list'],
    synonyms: ['travel checklist', 'trip packing list', 'luggage list', 'vacation packing', 'travel bag list'],
  },
  'budget-splitter': {
    keywords: ['split', 'bill', 'budget', 'expense', 'share', 'group', 'divide'],
    roman_urdu: ['kharch baantna', 'bill split', 'hisaab lagana', 'share karna', 'bill divide karna'],
    synonyms: ['bill splitter', 'expense splitter', 'group expense calculator', 'cost divider', 'bill share tool'],
  },
  'drug-checker': {
    keywords: ['drug', 'medicine', 'interaction', 'medication', 'tablet', 'safe', 'check'],
    roman_urdu: ['dawai check', 'medicine interaction', 'tablet check', 'dawai milana', 'dawa compatibility'],
    synonyms: ['medicine checker', 'drug interaction checker', 'medication safety tool', 'pill interaction'],
  },
  'symptom-tracker': {
    keywords: ['symptom', 'health', 'log', 'tracker', 'illness', 'disease', 'wellness'],
    roman_urdu: ['beemari track karna', 'symptoms log', 'tabiyat ka haal', 'health log', 'mareez diary'],
    synonyms: ['health tracker', 'symptom log', 'illness diary', 'health journal', 'symptom diary'],
  },
  'measurement-tracker': {
    keywords: ['measurement', 'track', 'weight', 'dimensions', 'log', 'metrics', 'custom'],
    roman_urdu: ['paimaish track karna', 'wajan track', 'blood pressure track', 'dimensions log', 'body weight log'],
    synonyms: ['body weight tracker', 'measurement log', 'health metrics tracker', 'dimensions tracker', 'custom tracker'],
  },
  'data-transformer': {
    keywords: ['JSON', 'CSV', 'TSV', 'convert', 'transform', 'data', 'format'],
    roman_urdu: ['data convert karna', 'JSON convert', 'CSV convert', 'format change', 'data tabdeel karna'],
    synonyms: ['JSON to CSV', 'CSV to JSON', 'data converter', 'format transformer', 'data format tool'],
  },
  'markdown-scraper': {
    keywords: ['markdown', 'scrape', 'website', 'extract', 'HTML', 'content', 'web'],
    roman_urdu: ['website copy karna', 'web data lena', 'HTML to text', 'web content extract'],
    synonyms: ['web scraper', 'markdown extractor', 'website content extractor', 'HTML to markdown'],
  },
  'log-analyzer': {
    keywords: ['log', 'error', 'analyze', 'server', 'debug', 'trace', 'parse'],
    roman_urdu: ['log file check', 'error dhundna', 'server log analyze', 'debugging', 'log parse karna'],
    synonyms: ['log file analyzer', 'error log viewer', 'server log parser', 'log file reader'],
  },
  'config-converter': {
    keywords: ['config', 'YAML', 'JSON', 'TOML', 'convert', 'settings', 'format'],
    roman_urdu: ['config file convert', 'YAML to JSON', 'settings file convert', 'configuration tabdeel karna'],
    synonyms: ['YAML converter', 'TOML converter', 'config file transformer', 'YAML to JSON', 'JSON to YAML'],
  },
  'mock-data': {
    keywords: ['mock', 'fake', 'dummy', 'generate', 'test', 'data', 'sample'],
    roman_urdu: ['fake data banana', 'test data generate', 'dummy data', 'sample data banana'],
    synonyms: ['fake data generator', 'test data tool', 'dummy data maker', 'random data generator'],
  },
  'trace-correlator': {
    keywords: ['trace', 'correlation', 'distributed', 'microservice', 'log', 'request', 'ID'],
    roman_urdu: ['request trace', 'correlation ID', 'distributed trace', 'microservice log', 'request track karna'],
    synonyms: ['distributed tracing tool', 'request correlator', 'microservice tracer', 'correlation ID finder'],
  },
  'schema-mapper': {
    keywords: ['schema', 'map', 'API', 'database', 'field', 'transform', 'structure'],
    roman_urdu: ['API schema', 'database schema map', 'data structure', 'field mapping', 'schema banana'],
    synonyms: ['schema mapper', 'data mapper', 'API field mapper', 'schema transformer', 'field mapping tool'],
  },
  'student-groups': {
    keywords: ['student', 'group', 'team', 'class', 'divide', 'education', 'teacher'],
    roman_urdu: ['students groups banana', 'class divide karna', 'team banana', 'talba groups', 'class groups'],
    synonyms: ['class grouper', 'student team maker', 'group randomizer', 'team divider', 'classroom groups'],
  },
  'timeline-builder': {
    keywords: ['timeline', 'event', 'history', 'project', 'schedule', 'dates', 'chronology'],
    roman_urdu: ['timeline banana', 'events ka silsila', 'history timeline', 'project schedule', 'tarikh timeline'],
    synonyms: ['timeline creator', 'event timeline', 'project timeline', 'chronology builder', 'history timeline'],
  },
  'position-size-calc': {
    keywords: ['position', 'size', 'risk', 'trading', 'forex', 'lot', 'calculate'],
    roman_urdu: ['trading position size', 'risk management', 'lot size calculate', 'forex calculator', 'trading risk'],
    synonyms: ['position size calculator', 'risk calculator', 'lot size tool', 'forex position calculator', 'trading risk tool'],
  },
  'voice-invoice': {
    keywords: ['voice', 'invoice', 'bill', 'receipt', 'speech', 'audio', 'dictate'],
    roman_urdu: ['awaz se invoice', 'bolke invoice banana', 'voice bill', 'awaaz se hisaab'],
    synonyms: ['voice billing', 'speech to invoice', 'voice receipt', 'dictate invoice', 'audio invoice'],
  },
  'property-comp': {
    keywords: ['property', 'compare', 'real estate', 'house', 'plot', 'buy', 'price'],
    roman_urdu: ['property compare', 'ghar compare', 'zameen compare', 'real estate', 'ghar kharidna', 'property price'],
    synonyms: ['property comparator', 'real estate comparison', 'house comparison tool', 'plot comparison'],
  },
  'refrigerant-calc': {
    keywords: ['refrigerant', 'AC', 'gas', 'calculate', 'HVAC', 'cooling', 'charge'],
    roman_urdu: ['AC gas calculate', 'refrigerant amount', 'cooling gas', 'AC gas bharai', 'HVAC calculator'],
    synonyms: ['refrigerant calculator', 'AC gas calculator', 'HVAC calculator', 'cooling charge calculator'],
  },
  'freelancer-risk': {
    keywords: ['freelancer', 'risk', 'client', 'contract', 'project', 'assess', 'payment'],
    roman_urdu: ['freelancer risk', 'client check', 'kaam ka risk', 'project risk', 'client payment risk'],
    synonyms: ['client risk assessment', 'freelance project risk', 'contract risk checker', 'client vetting tool'],
  },
  'warranty-tracker': {
    keywords: ['warranty', 'guarantee', 'product', 'expiry', 'track', 'receipt', 'purchase'],
    roman_urdu: ['warranty track karna', 'guarantee yaad rakhna', 'product warranty', 'kharidari guarantee', 'warranty date'],
    synonyms: ['warranty manager', 'product warranty tracker', 'guarantee tracker', 'product expiry tracker'],
  },
  'driving-fines': {
    keywords: ['driving', 'fine', 'traffic', 'challan', 'violation', 'speeding', 'license'],
    roman_urdu: ['driving fine', 'traffic challan', 'speeding ticket', 'traffic fine', 'gaari challan', 'traffic violation'],
    synonyms: ['traffic fine tracker', 'driving challan log', 'speeding fine record', 'traffic violation log'],
  },
  'expense-analyzer': {
    keywords: ['expense', 'spending', 'budget', 'analyze', 'bill', 'money', 'finance'],
    roman_urdu: ['kharch ka hisaab', 'bill analyze', 'spending analysis', 'expenses', 'paisa track karna'],
    synonyms: ['spending analyzer', 'expense tracker', 'bill analyzer', 'budget analyzer', 'spending report'],
  },
  'doc-redaction': {
    keywords: ['redact', 'document', 'private', 'sensitive', 'PII', 'hide', 'remove'],
    roman_urdu: ['document se info chupana', 'private info hatana', 'redact karna', 'document clean karna'],
    synonyms: ['document redactor', 'PII remover', 'sensitive data cleaner', 'document anonymizer'],
  },
  'compress-pdf': {
    keywords: ['compress', 'pdf', 'reduce', 'size', 'shrink', 'optimize', 'whatsapp', 'email'],
    roman_urdu: ['pdf chota karna', 'pdf size kam karna', 'pdf compress karo', 'whatsapp ke liye pdf', 'file size ghataana', 'pdf chhota karo'],
    synonyms: ['pdf compressor', 'reduce pdf size', 'shrink pdf', 'pdf optimizer', 'pdf file compressor'],
  },
  'merge-pdf': {
    keywords: ['merge', 'pdf', 'combine', 'join', 'files', 'multiple', 'together'],
    roman_urdu: ['pdf jorna', 'files combine karna', 'pdf ek karna', 'files milana', 'pdf merge karo', 'aik file banana'],
    synonyms: ['pdf merger', 'combine pdf files', 'join pdfs', 'pdf joiner', 'pdf combiner'],
  },
  'split-pdf': {
    keywords: ['split', 'pdf', 'extract', 'pages', 'separate', 'part', 'divide'],
    roman_urdu: ['pdf todna', 'page nikalna', 'pdf alag karna', 'pages extract karna', 'pdf taqseem karna', 'pages alag karo'],
    synonyms: ['pdf splitter', 'extract pdf pages', 'pdf page extractor', 'divide pdf', 'pdf cutter'],
  },
  'pdf-convert': {
    keywords: ['convert', 'pdf', 'jpg', 'image', 'png', 'photos', 'transform'],
    roman_urdu: ['pdf se jpg banana', 'tasveer se pdf', 'jpg se pdf', 'image convert karna', 'pdf to image', 'photo se pdf'],
    synonyms: ['pdf to jpg converter', 'image to pdf', 'pdf image converter', 'jpg to pdf', 'pdf photo converter'],
  },
}
