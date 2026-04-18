import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import './index.css'
import App from './App.jsx'

// Tool pages — lazy-loaded, each is its own JS chunk
const Landing       = lazy(() => import('./pages/Landing.jsx'))
const ToolsHome    = lazy(() => import('./pages/ToolsHome.jsx'))
const WordCounter  = lazy(() => import('./pages/WordCounter.jsx'))
const TextCleaner  = lazy(() => import('./pages/TextCleaner.jsx'))
const UrduKeyboard = lazy(() => import('./pages/UrduKeyboard.jsx'))
const TextEncryptor = lazy(() => import('./pages/TextEncryptor.jsx'))
const DocComposer  = lazy(() => import('./pages/DocComposer.jsx'))
const TaxCalculator     = lazy(() => import('./pages/TaxCalculator.jsx'))
const LoanEMI           = lazy(() => import('./pages/LoanEMI.jsx'))
const Pomodoro          = lazy(() => import('./pages/Pomodoro.jsx'))
const TaxOptimizer      = lazy(() => import('./pages/TaxOptimizer.jsx'))
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
const DataLeakDetector  = lazy(() => import('./pages/DataLeakDetector.jsx'))
const DocRedaction      = lazy(() => import('./pages/DocRedaction.jsx'))
const FreelancerRisk    = lazy(() => import('./pages/FreelancerRisk.jsx'))
const ExpenseAnalyzer   = lazy(() => import('./pages/ExpenseAnalyzer.jsx'))
const WarrantyTracker   = lazy(() => import('./pages/WarrantyTracker.jsx'))
const DrivingFineTracker = lazy(() => import('./pages/DrivingFineTracker.jsx'))
const TraceCorrelator   = lazy(() => import('./pages/TraceCorrelator.jsx'))
const SchemaMapper          = lazy(() => import('./pages/SchemaMapper.jsx'))
const MeasurementTracker    = lazy(() => import('./pages/MeasurementTracker.jsx'))
const CompressPDF           = lazy(() => import('./pages/CompressPDF.jsx'))
const MergePDF              = lazy(() => import('./pages/MergePDF.jsx'))
const SplitPDF              = lazy(() => import('./pages/SplitPDF.jsx'))
const PDFConvert            = lazy(() => import('./pages/PDFConvert.jsx'))
const DocConverter       = lazy(() => import('./pages/DocConverter.jsx'))
const TextExtractor      = lazy(() => import('./pages/TextExtractor.jsx'))
const PDFSearch          = lazy(() => import('./pages/PDFSearch.jsx'))
const SalarySlip         = lazy(() => import('./pages/SalarySlip.jsx'))
const WorldTime          = lazy(() => import('./pages/WorldTime.jsx'))
const VoiceDiary         = lazy(() => import('./pages/VoiceDiary.jsx'))
const Kameti             = lazy(() => import('./pages/Kameti.jsx'))
const DailyPlanner       = lazy(() => import('./pages/DailyPlanner.jsx'))
const HabitTracker       = lazy(() => import('./pages/HabitTracker.jsx'))
const ColorPalette       = lazy(() => import('./pages/ColorPalette.jsx'))
const PkIdTaxHub        = lazy(() => import('./pages/PkIdTaxHub.jsx'))
const LoanManager        = lazy(() => import('./pages/LoanManager.jsx'))
const RegexTester        = lazy(() => import('./pages/RegexTester.jsx'))
const JsonFormatter      = lazy(() => import('./pages/JsonFormatter.jsx'))
const GoldPrice          = lazy(() => import('./pages/GoldPrice.jsx'))
const ImageSuite     = lazy(() => import('./pages/ImageSuite.jsx'))
const ResumeBuilder  = lazy(() => import('./pages/ResumeBuilder.jsx'))
const WhatsAppTools  = lazy(() => import('./pages/WhatsAppTools.jsx'))
const About              = lazy(() => import('./pages/About.jsx'))
const Help               = lazy(() => import('./pages/Help.jsx'))
const BlogHome           = lazy(() => import('./pages/BlogHome.jsx'))
const BlogPost           = lazy(() => import('./pages/BlogPost.jsx'))
const CategoryPage       = lazy(() => import('./pages/CategoryPage.jsx'))

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
    <HelmetProvider>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={fallback}>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Landing />} />

          {/* Tools hub */}
          <Route path="/tools" element={<ToolsHome />} />

          {/* Typing tutor */}
          <Route path="/typing-tutor-online-free" element={<App />} />
          <Route path="/tools/typing-tutor" element={<Navigate to="/typing-tutor-online-free" replace />} />
          <Route path="/tools/typely" element={<Navigate to="/typing-tutor-online-free" replace />} />

          {/* Individual tools */}
          <Route path="/word-counter-online-free"  element={<WordCounter />} />
          <Route path="/tools/word-counter"  element={<Navigate to="/word-counter-online-free" replace />} />
          <Route path="/tools/text-cleaner"  element={<TextCleaner />} />
          <Route path="/urdu-keyboard-online" element={<UrduKeyboard />} />
          <Route path="/tools/urdu-keyboard" element={<Navigate to="/urdu-keyboard-online" replace />} />
          <Route path="/tools/text-encryptor" element={<TextEncryptor />} />
          <Route path="/tools/doc-composer"  element={<DocComposer />} />
          <Route path="/pakistan-tax-calculator"  element={<TaxCalculator />} />
          <Route path="/tools/tax-calculator"    element={<Navigate to="/pakistan-tax-calculator" replace />} />
          <Route path="/loan-emi-calculator"           element={<LoanEMI />} />
          <Route path="/tools/loan-emi"           element={<Navigate to="/loan-emi-calculator" replace />} />
          <Route path="/pomodoro-focus-engine"           element={<Pomodoro />} />
          <Route path="/tools/pomodoro"           element={<Navigate to="/pomodoro-focus-engine" replace />} />
          <Route path="/tools/tax-optimizer"     element={<TaxOptimizer />} />
          <Route path="/currency-converter-live" element={<CurrencyConverter />} />
          <Route path="/tools/currency-converter" element={<Navigate to="/currency-converter-live" replace />} />
          <Route path="/smart-packing-list"        element={<PackingList />} />
          <Route path="/tools/packing-list"       element={<Navigate to="/smart-packing-list" replace />} />
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
          <Route path="/tools/data-leak-detector" element={<DataLeakDetector />} />
          <Route path="/tools/doc-redaction"      element={<DocRedaction />} />
          <Route path="/tools/freelancer-risk"    element={<FreelancerRisk />} />
          <Route path="/expense-pattern-analyzer"  element={<ExpenseAnalyzer />} />
          <Route path="/tools/expense-analyzer"   element={<Navigate to="/expense-pattern-analyzer" replace />} />
          <Route path="/warranty-tracker-online"   element={<WarrantyTracker />} />
          <Route path="/tools/warranty-tracker"   element={<Navigate to="/warranty-tracker-online" replace />} />
          <Route path="/tools/driving-fines"      element={<DrivingFineTracker />} />
          <Route path="/tools/trace-correlator"   element={<TraceCorrelator />} />
          <Route path="/tools/schema-mapper"         element={<SchemaMapper />} />
          <Route path="/measurement-tracker-online"   element={<MeasurementTracker />} />
          <Route path="/tools/measurement-tracker"    element={<Navigate to="/measurement-tracker-online" replace />} />
          <Route path="/compress-pdf-online-free"          element={<CompressPDF />} />
          <Route path="/tools/compress-pdf"          element={<Navigate to="/compress-pdf-online-free" replace />} />
          <Route path="/tools/merge-pdf"             element={<MergePDF />} />
          <Route path="/tools/split-pdf"             element={<SplitPDF />} />
          <Route path="/tools/pdf-convert"           element={<PDFConvert />} />
          <Route path="/tools/doc-converter"      element={<DocConverter />} />
          <Route path="/tools/text-extractor"     element={<TextExtractor />} />
          <Route path="/tools/pdf-search"          element={<PDFSearch />} />
          <Route path="/salary-slip-generator"         element={<SalarySlip />} />
          <Route path="/tools/salary-slip"         element={<Navigate to="/salary-slip-generator" replace />} />
          <Route path="/tools/world-time"          element={<WorldTime />} />
          <Route path="/tools/voice-diary"         element={<VoiceDiary />} />
          <Route path="/kameti-committee-tracker"  element={<Kameti />} />
          <Route path="/tools/kameti"              element={<Navigate to="/kameti-committee-tracker" replace />} />
          <Route path="/daily-planner-online"       element={<DailyPlanner />} />
          <Route path="/tools/daily-planner"       element={<Navigate to="/daily-planner-online" replace />} />
          <Route path="/tools/habit-tracker"       element={<HabitTracker />} />
          <Route path="/tools/color-palette"       element={<ColorPalette />} />
          <Route path="/tools/pk-id-tax-hub"       element={<PkIdTaxHub />} />
          <Route path="/tools/loan-manager"        element={<LoanManager />} />
          <Route path="/tools/regex-tester"        element={<RegexTester />} />
          <Route path="/json-formatter"      element={<JsonFormatter />} />
          <Route path="/tools/json-formatter"      element={<Navigate to="/json-formatter" replace />} />
          <Route path="/tools/gold-price"          element={<GoldPrice />} />
          <Route path="/tools/image-suite"      element={<ImageSuite />} />
          <Route path="/tools/resume-builder"   element={<ResumeBuilder />} />
          <Route path="/tools/whatsapp-tools"   element={<WhatsAppTools />} />
          <Route path="/blogs"                      element={<BlogHome />} />
          <Route path="/blogs/tools/:slug"          element={<BlogPost />} />
          <Route path="/about"                     element={<About />} />
          <Route path="/help"                      element={<Help />} />

          {/* Category pages */}
          <Route path="/category/productivity-tools" element={<CategoryPage category="productivity-tools" />} />
          <Route path="/category/finance-tools" element={<CategoryPage category="finance-tools" />} />
          <Route path="/category/pdf-tools" element={<CategoryPage category="pdf-tools" />} />
          <Route path="/category/developer-tools" element={<CategoryPage category="developer-tools" />} />
          <Route path="/category/pakistan-tools" element={<CategoryPage category="pakistan-tools" />} />
          <Route path="/category/writing-tools" element={<CategoryPage category="writing-tools" />} />
          <Route path="/category/image-tools" element={<CategoryPage category="image-tools" />} />
          <Route path="/category/security-tools" element={<CategoryPage category="security-tools" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)


