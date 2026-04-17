import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'
import { usePreferences } from '../hooks/usePreferences'
import { supabase } from '../utils/supabase'

const ACCENT = '#ec4899'
const STORAGE_KEY = 'typely_diary'

const SESSION_KEY = 'typely_session_id'

function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}
const MOODS = ['😊', '😐', '😔', '😤', '🙏']
const LANGS = [
  { value: 'en-US', label: 'English' },
  { value: 'ur-PK', label: 'اردو' },
]

/* ── Helpers ────────────────────────────────────────────────────────────── */

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function autoTitle(text) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.slice(0, 5).join(' ') || 'Untitled'
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function Btn({ onClick, children, disabled, variant = 'primary', style: extra = {}, title }) {
  const base = {
    border: 'none', borderRadius: '0.5rem', cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: 600,
    transition: 'opacity 0.15s', opacity: disabled ? 0.45 : 1, ...extra,
  }
  if (variant === 'primary')
    return <button onClick={onClick} disabled={disabled} title={title} style={{ ...base, background: ACCENT, color: '#fff' }}>{children}</button>
  if (variant === 'ghost')
    return <button onClick={onClick} disabled={disabled} title={title} style={{ ...base, background: `${ACCENT}1a`, color: ACCENT, border: `1px solid ${ACCENT}44` }}>{children}</button>
  if (variant === 'danger')
    return <button onClick={onClick} disabled={disabled} title={title} style={{ ...base, background: '#ef444418', color: '#ef4444', border: '1px solid #ef444433' }}>{children}</button>
  return <button onClick={onClick} disabled={disabled} title={title} style={base}>{children}</button>
}

function Card({ children, colors, style: extra = {} }) {
  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.border}`,
      borderRadius: '1rem', padding: '1.25rem', ...extra,
    }}>
      {children}
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <h2 style={{ margin: '0 0 1rem', fontSize: '0.8rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {children}
    </h2>
  )
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export default function VoiceDiary() {
  const { colors } = useTheme()
  const { prefs } = usePreferences()
  const [syncing, setSyncing] = useState(false)

  // Speech support
  const [speechSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition))
  const [isRecording, setIsRecording] = useState(false)
  const [selectedLang, setSelectedLang] = useState('en-US')
  const [liveTranscript, setLiveTranscript] = useState('')
  const recognitionRef = useRef(null)

  // Editor state
  const [entryText, setEntryText] = useState('')
  const [entryTitle, setEntryTitle] = useState('')
  const [titleEdited, setTitleEdited] = useState(false)
  const [selectedMood, setSelectedMood] = useState('')
  const [editingId, setEditingId] = useState(null) // null = new entry

  // Entries
  const [entries, setEntries] = useState(loadEntries)
  const [search, setSearch] = useState('')

  // Detail view
  const [detailId, setDetailId] = useState(null)
  const [detailEditText, setDetailEditText] = useState('')
  const [detailEditTitle, setDetailEditTitle] = useState('')
  const [detailEditMood, setDetailEditMood] = useState('')
  const [detailEditing, setDetailEditing] = useState(false)

  // Toast
  const [toast, setToast] = useState('')

  /* ── Auto-title from text ── */
  useEffect(() => {
    if (!titleEdited) {
      setEntryTitle(autoTitle(entryText))
    }
  }, [entryText, titleEdited])

  /* ── Cloud Sync load ── */
  useEffect(() => {
    if (!prefs.cloudSync) return
    async function fetchFromSupabase() {
      const sid = getSessionId()
      setSyncing(true)
      try {
        const { data, error } = await supabase
          .from('voice_diary')
          .select('*')
          .eq('user_id', sid)
          .order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          const mapped = data.map(d => ({
            id: d.id,
            title: d.title,
            body: d.content || '',
            mood: d.mood || '',
            createdAt: d.created_at,
            updatedAt: d.recorded_at || d.created_at,
          }))
          setEntries(mapped)
          saveEntries(mapped)
        }
      } catch { /* offline */ }
      finally { setSyncing(false) }
    }
    fetchFromSupabase()
  }, [prefs.cloudSync])

  /* ── Speech recognition ── */
  const startRecording = useCallback(() => {
    if (!speechSupported) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = selectedLang
    rec.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join(' ')
      setLiveTranscript(transcript)
    }
    rec.onerror = () => { setIsRecording(false) }
    rec.onend = () => { setIsRecording(false) }
    recognitionRef.current = rec
    rec.start()
    setIsRecording(true)
    setLiveTranscript('')
  }, [speechSupported, selectedLang])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording()
    else startRecording()
  }, [isRecording, startRecording, stopRecording])

  // Append live transcript to entry text when recording stops
  useEffect(() => {
    if (!isRecording && liveTranscript.trim()) {
      setEntryText(prev => {
        const sep = prev.trim() ? ' ' : ''
        return prev + sep + liveTranscript.trim()
      })
      setLiveTranscript('')
    }
  }, [isRecording]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stop recognition when lang changes mid-session
  useEffect(() => {
    if (isRecording) stopRecording()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang])

  /* ── Toasts ── */
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  /* ── Save entry ── */
  const handleSave = useCallback(async () => {
    const text = entryText.trim()
    if (!text) return
    const now = new Date().toISOString()
    const sid = getSessionId()

    if (editingId) {
      setEntries(prev => {
        const updated = prev.map(e =>
          e.id === editingId
            ? { ...e, title: entryTitle || autoTitle(text), body: text, mood: selectedMood, updatedAt: now }
            : e
        )
        saveEntries(updated)
        return updated
      })
      showToast('Entry updated ✓')
      if (prefs.cloudSync) {
        try {
          await supabase.from('voice_diary').update({
            title: entryTitle || autoTitle(text),
            content: text,
            mood: selectedMood,
            recorded_at: now,
          }).eq('id', editingId).eq('user_id', sid)
        } catch { /* ignore */ }
      }
    } else {
      const entry = {
        id: genId(),
        title: entryTitle || autoTitle(text),
        body: text,
        mood: selectedMood,
        createdAt: now,
        updatedAt: now,
      }
      setEntries(prev => {
        const updated = [entry, ...prev]
        saveEntries(updated)
        return updated
      })
      showToast('Entry saved ✓')
      if (prefs.cloudSync) {
        try {
          await supabase.from('voice_diary').insert([{
            id: entry.id,
            user_id: sid,
            title: entry.title,
            content: entry.body,
            mood: entry.mood,
            created_at: entry.createdAt,
            recorded_at: entry.updatedAt,
          }])
        } catch { /* ignore */ }
      }
    }

    setEntryText('')
    setEntryTitle('')
    setTitleEdited(false)
    setSelectedMood('')
    setEditingId(null)
  }, [entryText, entryTitle, selectedMood, editingId, showToast, prefs.cloudSync])

  const handleCancelEdit = useCallback(() => {
    setEntryText('')
    setEntryTitle('')
    setTitleEdited(false)
    setSelectedMood('')
    setEditingId(null)
  }, [])

  /* ── Delete entry ── */
  const handleDelete = useCallback(async (id) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveEntries(updated)
      return updated
    })
    if (detailId === id) setDetailId(null)
    showToast('Entry deleted')
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        await supabase.from('voice_diary').delete().eq('id', id).eq('user_id', sid)
      } catch { /* ignore */ }
    }
  }, [detailId, showToast, prefs.cloudSync])

  /* ── Open detail ── */
  const openDetail = useCallback((entry) => {
    setDetailId(entry.id)
    setDetailEditText(entry.body)
    setDetailEditTitle(entry.title)
    setDetailEditMood(entry.mood || '')
    setDetailEditing(false)
  }, [])

  /* ── Save detail edit ── */
  const handleDetailSave = useCallback(async () => {
    const text = detailEditText.trim()
    if (!text) return
    const now = new Date().toISOString()
    setEntries(prev => {
      const updated = prev.map(e =>
        e.id === detailId
          ? { ...e, title: detailEditTitle || autoTitle(text), body: text, mood: detailEditMood, updatedAt: now }
          : e
      )
      saveEntries(updated)
      return updated
    })
    setDetailEditing(false)
    showToast('Entry updated ✓')
    if (prefs.cloudSync) {
      try {
        const sid = getSessionId()
        await supabase.from('voice_diary').update({
          title: detailEditTitle || autoTitle(text),
          content: text,
          mood: detailEditMood,
          recorded_at: now,
        }).eq('id', detailId).eq('user_id', sid)
      } catch { /* ignore */ }
    }
  }, [detailId, detailEditText, detailEditTitle, detailEditMood, showToast, prefs.cloudSync])

  /* ── Edit from list ── */
  const handleEditFromList = useCallback((entry) => {
    setEditingId(entry.id)
    setEntryText(entry.body)
    setEntryTitle(entry.title)
    setTitleEdited(true)
    setSelectedMood(entry.mood || '')
    setDetailId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* ── Export ── */
  const handleExport = useCallback(() => {
    if (!entries.length) return
    const lines = entries.map(e =>
      [
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📅 ${fmtDate(e.createdAt)}${e.mood ? '  ' + e.mood : ''}`,
        `📝 ${e.title}`,
        ``,
        e.body,
        ``,
      ].join('\n')
    ).join('\n')
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diary-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [entries])

  const handleExportBackup = useCallback(() => {
    const data = JSON.stringify({ version: 1, exported: new Date().toISOString(), items: entries })
    const blob = new Blob([data], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `typely-diary-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }, [entries])

  const handleImportBackup = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const items = parsed.items || parsed
        if (!Array.isArray(items)) { alert('Invalid backup file'); return }
        setEntries(prev => {
          const ids = new Set(prev.map(x => x.id))
          const newOnes = items.filter(x => !ids.has(x.id))
          const merged = [...prev, ...newOnes]
          saveEntries(merged)
          return merged
        })
      } catch { alert('Invalid backup file') }
    }
    reader.readAsText(file)
  }, [])

  /* ── Filtered entries ── */
  const filtered = entries.filter(e => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)
  })

  /* ── Detail entry ── */
  const detailEntry = detailId ? entries.find(e => e.id === detailId) : null

  /* ── Styles ── */
  const inputStyle = {
    background: colors.input, border: `1px solid ${colors.inputBorder}`,
    borderRadius: '0.5rem', padding: '0.5rem 0.75rem',
    color: colors.text, fontSize: '0.9rem', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  const textareaStyle = {
    ...inputStyle, resize: 'vertical', minHeight: '140px',
    fontFamily: selectedLang === 'ur-PK' ? '"Noto Nastaliq Urdu", serif' : 'inherit',
    direction: selectedLang === 'ur-PK' ? 'rtl' : 'ltr', lineHeight: 1.7,
  }

  return (
    <ToolLayout toolId="voice-diary">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: ACCENT, color: '#fff', padding: '0.6rem 1.4rem',
          borderRadius: '2rem', fontWeight: 600, fontSize: '0.85rem',
          zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: ACCENT }}>🎙️ Voice Diary</h1>
            <p style={{ margin: '0.2rem 0 0', color: colors.textSecondary, fontSize: '0.85rem' }}>
              Speak or type — your private journal lives in your browser
            </p>

          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Btn onClick={handleExport} disabled={!entries.length} variant="ghost" title="Download all entries as .txt">
              ⬇ Download All (.txt)
            </Btn>
            <button onClick={handleExportBackup} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '0.4rem', border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>⬇️ Export Backup</button>
            <label style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '0.4rem', border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer' }}>
              ⬆️ Import Backup
              <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Speech not available banner */}
        {!speechSupported && (
          <div style={{
            background: '#f59e0b18', border: '1px solid #f59e0b55', borderRadius: '0.75rem',
            padding: '0.75rem 1rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 500,
          }}>
            ⚠️ Voice input not available in this browser — type your entry below
          </div>
        )}

        {/* ── Compose Card ── */}
        <Card colors={colors}>
          <SectionHeading>{editingId ? '✏️ Edit Entry' : '✨ New Entry'}</SectionHeading>

          {/* Lang + Mic row */}
          {speechSupported && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <select
                value={selectedLang}
                onChange={e => setSelectedLang(e.target.value)}
                style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
              >
                {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>

              <button
                onClick={toggleRecording}
                title={isRecording ? 'Stop recording' : 'Start recording'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  background: isRecording ? ACCENT : `${ACCENT}1a`,
                  color: isRecording ? '#fff' : ACCENT,
                  border: `2px solid ${ACCENT}`,
                  borderRadius: '2rem', padding: '0.45rem 1rem',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{isRecording ? '⏹' : '🎙️'}</span>
                {isRecording ? 'Stop' : 'Record'}
              </button>

              {isRecording && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  color: ACCENT, fontSize: '0.8rem', fontWeight: 600,
                  animation: 'pulse 1.2s ease-in-out infinite',
                }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: ACCENT, display: 'inline-block',
                    animation: 'pulse 1s ease-in-out infinite',
                  }} />
                  Listening…
                </span>
              )}
            </div>
          )}

          {/* Live transcript preview */}
          {isRecording && liveTranscript && (
            <div style={{
              background: `${ACCENT}0d`, border: `1px dashed ${ACCENT}66`,
              borderRadius: '0.5rem', padding: '0.6rem 0.85rem',
              color: colors.text, fontSize: '0.9rem', marginBottom: '0.75rem',
              fontStyle: 'italic', lineHeight: 1.6,
              direction: selectedLang === 'ur-PK' ? 'rtl' : 'ltr',
            }}>
              <span style={{ color: ACCENT, fontWeight: 700, fontStyle: 'normal', marginRight: '0.4rem' }}>Live:</span>
              {liveTranscript}
            </div>
          )}

          {/* Entry text */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>
              Entry
            </label>
            <textarea
              value={entryText}
              onChange={e => setEntryText(e.target.value)}
              placeholder={speechSupported ? 'Speak above or type here…' : 'Type your diary entry here…'}
              style={textareaStyle}
            />
          </div>

          {/* Title */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: '0.3rem' }}>
              Title <span style={{ fontWeight: 400, opacity: 0.6 }}>(auto-generated, editable)</span>
            </label>
            <input
              value={entryTitle}
              onChange={e => { setEntryTitle(e.target.value); setTitleEdited(true) }}
              placeholder="Entry title"
              style={inputStyle}
            />
          </div>

          {/* Mood */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: '0.4rem' }}>
              Mood <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMood(prev => prev === m ? '' : m)}
                  title={m}
                  style={{
                    fontSize: '1.4rem', lineHeight: 1, padding: '0.25rem',
                    background: selectedMood === m ? `${ACCENT}22` : 'transparent',
                    border: `2px solid ${selectedMood === m ? ACCENT : 'transparent'}`,
                    borderRadius: '0.5rem', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Btn onClick={handleSave} disabled={!entryText.trim()}>
              {editingId ? '💾 Update Entry' : '💾 Save Entry'}
            </Btn>
            {editingId && (
              <Btn onClick={handleCancelEdit} variant="ghost">Cancel</Btn>
            )}
          </div>
        </Card>

        {/* ── Entries Card ── */}
        <Card colors={colors}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <SectionHeading style={{ margin: 0 }}>📖 Entries ({filtered.length})</SectionHeading>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search entries…"
              style={{ ...inputStyle, width: '220px' }}
            />
          </div>

          {filtered.length === 0 && (
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
              {search ? 'No entries match your search.' : 'No entries yet — write your first one above!'}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filtered.map(entry => (
              <div
                key={entry.id}
                onClick={() => openDetail(entry)}
                style={{
                  background: detailId === entry.id ? `${ACCENT}12` : colors.cardBg,
                  border: `1px solid ${detailId === entry.id ? ACCENT + '55' : colors.border}`,
                  borderRadius: '0.75rem', padding: '0.85rem 1rem',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', gap: '0.3rem',
                }}
                onMouseEnter={e => { if (detailId !== entry.id) e.currentTarget.style.borderColor = ACCENT + '44' }}
                onMouseLeave={e => { if (detailId !== entry.id) e.currentTarget.style.borderColor = colors.border }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: colors.text }}>
                    {entry.mood && <span style={{ marginRight: '0.35rem' }}>{entry.mood}</span>}
                    {entry.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                    {fmtDate(entry.createdAt)}
                  </span>
                </div>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {entry.body.slice(0, 100)}{entry.body.length > 100 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Detail Panel ── */}
        {detailEntry && (
          <Card colors={colors} style={{ border: `2px solid ${ACCENT}55` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                {detailEditing ? (
                  <input
                    value={detailEditTitle}
                    onChange={e => setDetailEditTitle(e.target.value)}
                    style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}
                  />
                ) : (
                  <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem', fontWeight: 700, color: colors.text }}>
                    {detailEntry.mood && <span style={{ marginRight: '0.35rem' }}>{detailEntry.mood}</span>}
                    {detailEntry.title}
                  </h3>
                )}
                <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary }}>
                  {fmtDate(detailEntry.createdAt)}
                  {detailEntry.updatedAt !== detailEntry.createdAt && ` · edited ${fmtDate(detailEntry.updatedAt)}`}
                </p>
              </div>
              <button
                onClick={() => setDetailId(null)}
                title="Close"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary, fontSize: '1.2rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {detailEditing ? (
              <>
                <textarea
                  value={detailEditText}
                  onChange={e => setDetailEditText(e.target.value)}
                  style={{ ...textareaStyle, minHeight: '180px', marginBottom: '0.75rem' }}
                />
                {/* Mood editor in detail */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: '0.4rem' }}>Mood</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {MOODS.map(m => (
                      <button
                        key={m}
                        onClick={() => setDetailEditMood(prev => prev === m ? '' : m)}
                        style={{
                          fontSize: '1.4rem', lineHeight: 1, padding: '0.25rem',
                          background: detailEditMood === m ? `${ACCENT}22` : 'transparent',
                          border: `2px solid ${detailEditMood === m ? ACCENT : 'transparent'}`,
                          borderRadius: '0.5rem', cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <Btn onClick={handleDetailSave} disabled={!detailEditText.trim()}>💾 Save</Btn>
                  <Btn onClick={() => setDetailEditing(false)} variant="ghost">Cancel</Btn>
                </div>
              </>
            ) : (
              <>
                <p style={{
                  margin: '0 0 1.25rem', whiteSpace: 'pre-wrap', lineHeight: 1.8,
                  color: colors.text, fontSize: '0.95rem',
                }}>
                  {detailEntry.body}
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <Btn onClick={() => setDetailEditing(true)} variant="ghost">✏️ Edit</Btn>
                  <Btn onClick={() => handleEditFromList(detailEntry)} variant="ghost">📋 Edit in Composer</Btn>
                  <Btn onClick={() => handleDelete(detailEntry.id)} variant="danger">🗑 Delete</Btn>
                </div>
              </>
            )}
          </Card>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

    </ToolLayout>

  )
}
