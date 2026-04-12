const FEEDBACK_TYPES = [
  { value: 'suggestion', label: '💡 Feature Suggestion' },
  { value: 'bug', label: '🐛 Bug Report' },
  { value: 'other', label: '💬 Other' },
]

export default function FeedbackModal({
  showFeedback, setShowFeedback,
  feedbackName, setFeedbackName,
  feedbackEmail, setFeedbackEmail,
  feedbackType, setFeedbackType,
  feedbackMessage, setFeedbackMessage,
  resetFeedback,
  onSubmit,
  isDark, colors,
}) {
  if (!showFeedback) return null

  const handleSubmit = () => {
    if (onSubmit) onSubmit({ name: feedbackName.trim() || 'Anonymous', email: feedbackEmail.trim() || null, type: feedbackType, message: feedbackMessage.trim() })
    setShowFeedback(false)
    resetFeedback()
  }

  const fieldStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: colors.input,
    border: `1.5px solid ${colors.inputBorder}`,
    borderRadius: '0.625rem',
    color: colors.text,
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: '0.4rem',
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && setShowFeedback(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      <div style={{
        background: isDark ? 'rgba(15, 23, 42, 0.97)' : 'rgba(248, 250, 252, 0.97)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '1.25rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        direction: 'ltr',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: colors.text }}>
            💡 Share Your Feedback
          </h2>
          <button
            onClick={() => setShowFeedback(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: colors.textSecondary, lineHeight: 1, padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Your Name (optional)</label>
            <input
              type="text"
              value={feedbackName}
              onChange={(e) => setFeedbackName(e.target.value)}
              placeholder="Anonymous"
              style={fieldStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email (optional — so we can reply)</label>
            <input
              type="email"
              value={feedbackEmail}
              onChange={(e) => setFeedbackEmail(e.target.value)}
              placeholder="you@example.com"
              style={fieldStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Type</label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              style={{ ...fieldStyle, cursor: 'pointer' }}
            >
              {FEEDBACK_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Message <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Describe your idea or issue..."
              rows={4}
              style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <button
            disabled={!feedbackMessage.trim()}
            onClick={handleSubmit}
            style={{
              padding: '0.75rem',
              background: feedbackMessage.trim() ? 'linear-gradient(to right, #f59e0b, #f97316)' : (isDark ? '#334155' : '#e2e8f0'),
              color: feedbackMessage.trim() ? 'white' : colors.textSecondary,
              borderRadius: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: feedbackMessage.trim() ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            Send Feedback
          </button>


        </div>
      </div>
    </div>
  )
}
