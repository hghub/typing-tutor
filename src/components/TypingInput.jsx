export default function TypingInput({ typed, finished, inputRef, handleChange, handleKeyDown, onKeyPress, colors, currentLangDir, phoneticMode, latinValue }) {
  const displayValue = phoneticMode ? (latinValue ?? '') : typed
  const displayDir = phoneticMode ? 'ltr' : currentLangDir
  return (
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
      style={{
        width: '100%',
        padding: '1rem 1.5rem',
        background: colors.input,
        border: `2px solid ${colors.inputBorder}`,
        borderRadius: '0.75rem',
        color: colors.text,
        fontSize: '1rem',
        fontFamily: 'monospace',
        marginBottom: '2rem',
        outline: 'none',
        opacity: finished ? 0.6 : 1,
        cursor: finished ? 'not-allowed' : 'auto',
        transition: 'all 0.2s',
        direction: displayDir,
        textAlign: displayDir === 'rtl' ? 'right' : 'left',
        boxSizing: 'border-box',
      }}
      onFocus={(e) => { if (!finished) e.target.style.borderColor = '#06b6d4' }}
      onBlur={(e) => { if (!finished) e.target.style.borderColor = colors.inputBorder }}
    />
  )
}
