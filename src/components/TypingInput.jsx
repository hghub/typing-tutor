const HINT_STYLE = `
@keyframes typely-pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); border-color: rgba(6,182,212,0.45); }
  50% { box-shadow: 0 0 0 6px rgba(6,182,212,0.12); border-color: rgba(6,182,212,0.9); }
}
.typely-hint-input {
  animation: typely-pulse-border 1.8s ease-in-out infinite;
}
`

export default function TypingInput({ typed, finished, inputRef, handleChange, handleKeyDown, onKeyPress, colors, currentLangDir, phoneticMode, latinValue }) {
  const displayValue = phoneticMode ? (latinValue ?? '') : typed
  const displayDir = phoneticMode ? 'ltr' : currentLangDir
  const showHint = !finished && typed.length === 0

  return (
    <div style={{ position: 'relative', marginBottom: '2rem' }}>
      <style>{HINT_STYLE}</style>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyPress={onKeyPress}
        onPaste={(e) => e.preventDefault()}
        placeholder={finished ? "Press 'Try Again' to continue" : (phoneticMode ? 'Type phonetically in English (e.g. "pakistan")...' : 'Click here and start typing...')}
        disabled={finished}
        autoFocus
        className={showHint ? 'typely-hint-input' : ''}
        style={{
          width: '100%',
          padding: '1rem 1.5rem',
          background: colors.input,
          border: `2px solid ${colors.inputBorder}`,
          borderRadius: '0.75rem',
          color: colors.text,
          fontSize: '1rem',
          fontFamily: 'monospace',
          outline: 'none',
          opacity: finished ? 0.6 : 1,
          cursor: finished ? 'not-allowed' : 'auto',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          direction: displayDir,
          textAlign: displayDir === 'rtl' ? 'right' : 'left',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => { if (!finished) { e.target.style.borderColor = '#06b6d4'; e.target.classList.remove('typely-hint-input') } }}
        onBlur={(e) => { if (!finished && typed.length === 0) e.target.classList.add('typely-hint-input'); if (!finished) e.target.style.borderColor = colors.inputBorder }}
      />
      {showHint && (
        <div style={{
          textAlign: 'center',
          marginTop: '0.4rem',
          fontSize: '0.75rem',
          color: 'rgba(6,182,212,0.7)',
          letterSpacing: '0.05em',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          ↑ click here and start typing
        </div>
      )}
    </div>
  )
}
