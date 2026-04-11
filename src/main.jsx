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
        </Routes>
      </Suspense>
    </HashRouter>
  </StrictMode>,
)
