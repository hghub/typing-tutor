import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Tool pages — lazy-loaded, each is its own JS chunk
const ToolsHome    = lazy(() => import('./pages/ToolsHome.jsx'))
const WordCounter  = lazy(() => import('./pages/WordCounter.jsx'))
const TextCleaner  = lazy(() => import('./pages/TextCleaner.jsx'))
const UrduKeyboard = lazy(() => import('./pages/UrduKeyboard.jsx'))
const TextEncryptor = lazy(() => import('./pages/TextEncryptor.jsx'))
const DocComposer  = lazy(() => import('./pages/DocComposer.jsx'))
const TaxCalculator     = lazy(() => import('./pages/TaxCalculator.jsx'))
const CurrencyConverter = lazy(() => import('./pages/CurrencyConverter.jsx'))
const PackingList       = lazy(() => import('./pages/PackingList.jsx'))
const BudgetSplitter    = lazy(() => import('./pages/BudgetSplitter.jsx'))
const DrugChecker       = lazy(() => import('./pages/DrugChecker.jsx'))
const SymptomTracker    = lazy(() => import('./pages/SymptomTracker.jsx'))
const DataTransformer   = lazy(() => import('./pages/DataTransformer.jsx'))
const MarkdownScraper   = lazy(() => import('./pages/MarkdownScraper.jsx'))
const LogAnalyzer       = lazy(() => import('./pages/LogAnalyzer.jsx'))
const ConfigConverter   = lazy(() => import('./pages/ConfigConverter.jsx'))
const MockDataGenerator = lazy(() => import('./pages/MockDataGenerator.jsx'))
const TimelineBuilder   = lazy(() => import('./pages/TimelineBuilder.jsx'))
const PositionSizeCalc  = lazy(() => import('./pages/PositionSizeCalc.jsx'))
const VoiceInvoice      = lazy(() => import('./pages/VoiceInvoice.jsx'))
const PropertyComp      = lazy(() => import('./pages/PropertyComp.jsx'))
const StudentGroups     = lazy(() => import('./pages/StudentGroups.jsx'))
const RefrigerantCalc   = lazy(() => import('./pages/RefrigerantCalc.jsx'))
const About             = lazy(() => import('./pages/About.jsx'))

const fallback = (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    color: '#94a3b8',
    fontSize: '0.9rem',
    gap: '0.5rem',
  }}>
    ⚡ Loading…
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Suspense fallback={fallback}>
        <Routes>
          {/* Main typing tutor */}
          <Route path="/" element={<App />} />

          {/* Tools hub */}
          <Route path="/tools" element={<ToolsHome />} />

          {/* Individual tools */}
          <Route path="/tools/word-counter"  element={<WordCounter />} />
          <Route path="/tools/text-cleaner"  element={<TextCleaner />} />
          <Route path="/tools/urdu-keyboard" element={<UrduKeyboard />} />
          <Route path="/tools/text-encryptor" element={<TextEncryptor />} />
          <Route path="/tools/doc-composer"  element={<DocComposer />} />
          <Route path="/tools/tax-calculator"    element={<TaxCalculator />} />
          <Route path="/tools/currency-converter" element={<CurrencyConverter />} />
          <Route path="/tools/packing-list"       element={<PackingList />} />
          <Route path="/tools/budget-splitter"    element={<BudgetSplitter />} />
          <Route path="/tools/drug-checker"       element={<DrugChecker />} />
          <Route path="/tools/symptom-tracker"    element={<SymptomTracker />} />
          <Route path="/tools/data-transformer"   element={<DataTransformer />} />
          <Route path="/tools/markdown-scraper"   element={<MarkdownScraper />} />
          <Route path="/tools/log-analyzer"       element={<LogAnalyzer />} />
          <Route path="/tools/config-converter"   element={<ConfigConverter />} />
          <Route path="/tools/mock-data"          element={<MockDataGenerator />} />
          <Route path="/tools/timeline-builder"   element={<TimelineBuilder />} />
          <Route path="/tools/position-size-calc" element={<PositionSizeCalc />} />
          <Route path="/tools/voice-invoice"      element={<VoiceInvoice />} />
          <Route path="/tools/property-comp"      element={<PropertyComp />} />
          <Route path="/tools/student-groups"     element={<StudentGroups />} />
          <Route path="/tools/refrigerant-calc"   element={<RefrigerantCalc />} />
          <Route path="/about"                     element={<About />} />
        </Routes>
      </Suspense>
    </HashRouter>
  </StrictMode>,
)
