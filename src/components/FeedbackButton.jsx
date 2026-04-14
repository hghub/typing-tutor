/**
 * FeedbackButton — self-contained floating feedback button + modal.
 * Drop it anywhere; it manages its own state and submits to Supabase.
 * Appears fixed on the right-center of every page.
 */
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useTheme } from '../hooks/useTheme'

const TYPES = [
  { value: 'suggestion', label: '💡 Feature Suggestion' },
  { value: 'bug',        label: '🐛 Bug Report' },
  { value: 'contact',   label: '📬 Contact Us' },
]

export default function FeedbackButton() {
  const { isDark, colors } = useTheme()

  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [type, setType]       = useState('suggestion')
  const [message, setMessage] = useState('')
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  // Offset the tab button so it clears the OS scrollbar
  const [scrollbarW, setScrollbarW] = useState(0)

  useEffect(() => {
    const handler = () => { setOpen(true); setSent(false); setType('suggestion') }
    window.addEventListener('open-feedback', handler)
    return () => window.removeEventListener('open-feedback', handler)
  }, [])

  useEffect(() => {
    const measure = () => setScrollbarW(window.innerWidth - document.documentElement.clientWidth)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSending(true)
    try {
      await supabase.from('app_feedback').insert({
        name: name.trim() || 'Anonymous',
        email: email.trim() || null,
        type,
        message: message.trim(),
      })
      setSent(true)
      setTimeout(() => { setOpen(false); reset() }, 2000)
    } catch {
      // fail silently — user sees send button again
    } finally {
      setSending(false)
    }
  }

  const reset = () => { setName(''); setEmail(''); setType('suggestion'); setMessage(''); setSent(false) }

  const field = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
    borderRadius: '0.6rem',
    color: colors.text,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  }

  return (
    <>
      {/* Floating tab button */}
      <button
        onClick={() => { setOpen(true); setSent(false) }}
        title="Send feedback"
        style={{
          position: 'fixed',
          right: scrollbarW,
          top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'right center',
          zIndex: 900,
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem 1rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          borderRadius: '0.5rem 0.5rem 0 0',
          boxShadow: '-2px 0 16px rgba(6,182,212,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        💬 Feedback
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={e => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
            animation: 'fadeIn 0.18s ease-out',
          }}
        >
          <div style={{
            background: isDark ? '#0f172a' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '1.25rem',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: colors.text }}>
                  💬 Share Your Feedback
                </h2>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: colors.textSecondary }}>
                  Bug, idea, or just want to say hi?
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: colors.textSecondary, padding: '0.2rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                <p style={{ color: '#10b981', fontWeight: 700, margin: 0 }}>Thanks! We got your message.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {/* Type pills */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '2rem',
                        border: `1.5px solid ${type === t.value ? '#06b6d4' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')}`,
                        background: type === t.value ? 'rgba(6,182,212,0.12)' : 'transparent',
                        color: type === t.value ? '#06b6d4' : colors.textSecondary,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  style={field}
                />

                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email (optional — so we can reply)"
                  style={field}
                />

                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={
                    type === 'bug'        ? "What happened? Steps to reproduce..." :
                    type === 'contact'    ? "How can we help you?" :
                    "What feature would you love to see?"
                  }
                  rows={4}
                  style={{ ...field, resize: 'vertical' }}
                  autoFocus
                />

                <button
                  disabled={!message.trim() || sending}
                  onClick={handleSubmit}
                  style={{
                    padding: '0.7rem',
                    background: message.trim() && !sending
                      ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                      : (isDark ? '#1e293b' : '#e2e8f0'),
                    color: message.trim() && !sending ? '#fff' : colors.textSecondary,
                    borderRadius: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: message.trim() && !sending ? 'pointer' : 'not-allowed',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {sending ? '⏳ Sending…' : '🚀 Send Feedback'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
