import { PASSAGE_CONTEXT } from '../constants/passageContext'

const PACK_CONFIG = {
  islamic: {
    emoji: '🕌',
    label: 'Islamic Knowledge',
    accent: '#b8860b',
    accentLight: 'rgba(184,134,11,0.12)',
    accentBorder: 'rgba(184,134,11,0.35)',
    headerBg: 'linear-gradient(135deg, rgba(75,0,130,0.15), rgba(184,134,11,0.12))',
    badge: { bg: 'rgba(184,134,11,0.18)', color: '#b8860b' },
  },
  coding: {
    emoji: '💻',
    label: 'Programming Concept',
    accent: '#06b6d4',
    accentLight: 'rgba(6,182,212,0.10)',
    accentBorder: 'rgba(6,182,212,0.30)',
    headerBg: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.10))',
    badge: { bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
  },
  poetry: {
    emoji: '📜',
    label: 'Poetry & Literature',
    accent: '#f59e0b',
    accentLight: 'rgba(245,158,11,0.10)',
    accentBorder: 'rgba(245,158,11,0.30)',
    headerBg: 'linear-gradient(135deg, rgba(244,63,94,0.10), rgba(245,158,11,0.10))',
    badge: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  },
  emails: {
    emoji: '✉️',
    label: 'Professional Writing',
    accent: '#10b981',
    accentLight: 'rgba(16,185,129,0.10)',
    accentBorder: 'rgba(16,185,129,0.30)',
    headerBg: 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(5,150,105,0.08))',
    badge: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  },
  freelance: {
    emoji: '🚀',
    label: 'Freelance Communication',
    accent: '#8b5cf6',
    accentLight: 'rgba(139,92,246,0.10)',
    accentBorder: 'rgba(139,92,246,0.30)',
    headerBg: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.10))',
    badge: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  },
  study: {
    emoji: '📚',
    label: 'Academic Knowledge',
    accent: '#3b82f6',
    accentLight: 'rgba(59,130,246,0.10)',
    accentBorder: 'rgba(59,130,246,0.30)',
    headerBg: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.10))',
    badge: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  },
}

export default function LearningPanel({ language, difficulty, passageIndex, isDark, colors }) {
  const meta = PASSAGE_CONTEXT[language]?.[difficulty]?.[passageIndex]
  if (!meta) return null

  const cfg = PACK_CONFIG[difficulty] || PACK_CONFIG.study
  const textColor = isDark ? '#e2e8f0' : '#1e293b'
  const subtleColor = isDark ? '#94a3b8' : '#64748b'
  const cardBg = isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)'
  const dividerColor = isDark ? 'rgba(71,85,105,0.4)' : 'rgba(203,213,225,0.6)'

  const panel = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    borderRadius: '1.5rem',
    border: `1px solid ${cfg.accentBorder}`,
    boxShadow: `0 20px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px ${cfg.accentBorder}`,
    padding: '2rem',
    marginBottom: '2rem',
    animation: 'fadeIn 0.5s ease',
    overflow: 'hidden',
  }

  const header = {
    background: cfg.headerBg,
    borderRadius: '1rem',
    padding: '1.25rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderLeft: `4px solid ${cfg.accent}`,
  }

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: cfg.badge.bg,
    color: cfg.badge.color,
    border: `1px solid ${cfg.accentBorder}`,
    borderRadius: '999px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  }

  const tipBox = {
    background: cfg.accentLight,
    border: `1px solid ${cfg.accentBorder}`,
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    marginTop: '1.25rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  }

  const sectionLabel = {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: subtleColor,
    marginBottom: '0.3rem',
  }

  const divider = {
    height: '1px',
    background: dividerColor,
    margin: '1.25rem 0',
  }

  const renderIslamicPanel = () => (
    <>
      <div style={header}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{cfg.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={badgeStyle}>{cfg.emoji} {cfg.label}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: textColor, lineHeight: 1.3 }}>
            {meta.title}
          </div>
          {meta.source && (
            <div style={{ fontSize: '0.78rem', color: cfg.accent, marginTop: '0.25rem', fontStyle: 'italic' }}>
              📖 {meta.source}
            </div>
          )}
        </div>
      </div>

      {meta.arabicText && (
        <>
          <div style={sectionLabel}>النص العربي</div>
          <div style={{
            fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', serif",
            fontSize: '1.4rem',
            color: cfg.accent,
            textAlign: 'right',
            direction: 'rtl',
            lineHeight: 2,
            padding: '0.5rem 0',
          }}>
            {meta.arabicText}
          </div>
          <div style={divider} />
        </>
      )}

      {meta.englishMeaning && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={sectionLabel}>English Meaning</div>
          <div style={{ fontSize: '0.95rem', color: textColor, lineHeight: 1.7 }}>{meta.englishMeaning}</div>
        </div>
      )}

      {meta.urduMeaning && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={sectionLabel}>اردو ترجمہ</div>
          <div style={{
            fontSize: '1rem',
            color: textColor,
            lineHeight: 1.9,
            direction: 'rtl',
            textAlign: 'right',
            fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
          }}>
            {meta.urduMeaning}
          </div>
        </div>
      )}

      {meta.context && (
        <>
          <div style={divider} />
          <div style={sectionLabel}>Context</div>
          <div style={{ fontSize: '0.9rem', color: subtleColor, lineHeight: 1.7 }}>{meta.context}</div>
        </>
      )}

      {meta.tip && (
        <div style={tipBox}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.accent, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Tip</div>
            <div style={{ fontSize: '0.88rem', color: textColor, lineHeight: 1.6 }}>{meta.tip}</div>
          </div>
        </div>
      )}
    </>
  )

  const renderCodingPanel = () => (
    <>
      <div style={header}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{cfg.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={badgeStyle}>{cfg.emoji} {cfg.label}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: textColor, lineHeight: 1.3 }}>{meta.title}</div>
          {meta.concept && (
            <div style={{ fontSize: '0.78rem', color: cfg.accent, marginTop: '0.25rem' }}>⚡ {meta.concept}</div>
          )}
        </div>
      </div>

      <div style={sectionLabel}>Explanation</div>
      <div style={{ fontSize: '0.92rem', color: textColor, lineHeight: 1.75, marginBottom: '0.5rem' }}>{meta.context}</div>

      {meta.tip && (
        <div style={tipBox}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>✅</span>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.accent, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Best Practice</div>
            <div style={{ fontSize: '0.88rem', color: textColor, lineHeight: 1.6 }}>{meta.tip}</div>
          </div>
        </div>
      )}
    </>
  )

  const renderPoetryPanel = () => (
    <>
      <div style={header}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{cfg.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={badgeStyle}>{cfg.emoji} {cfg.label}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: textColor, lineHeight: 1.3 }}>{meta.title}</div>
          {meta.poet && (
            <div style={{ fontSize: '0.78rem', color: subtleColor, marginTop: '0.2rem' }}>
              🖊️ {meta.poet}{meta.era ? ` · ${meta.era}` : ''}
            </div>
          )}
        </div>
      </div>

      {meta.context && (
        <>
          <div style={sectionLabel}>About this Poem</div>
          <div style={{ fontSize: '0.92rem', color: textColor, lineHeight: 1.75 }}>{meta.context}</div>
        </>
      )}

      {meta.meaning && (
        <>
          <div style={divider} />
          <div style={sectionLabel}>Meaning</div>
          <div style={{ fontSize: '0.92rem', color: textColor, lineHeight: 1.75 }}>{meta.meaning}</div>
        </>
      )}

      {meta.englishMeaning && (
        <>
          <div style={divider} />
          <div style={sectionLabel}>English Translation</div>
          <div style={{ fontSize: '0.92rem', color: textColor, lineHeight: 1.75, fontStyle: 'italic' }}>{meta.englishMeaning}</div>
        </>
      )}
    </>
  )

  const renderEmailFreelancePanel = () => (
    <>
      <div style={header}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{cfg.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={badgeStyle}>{cfg.emoji} {cfg.label}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: textColor, lineHeight: 1.3 }}>{meta.title}</div>
        </div>
      </div>

      <div style={sectionLabel}>When to Use</div>
      <div style={{ fontSize: '0.92rem', color: textColor, lineHeight: 1.75, marginBottom: '0.25rem' }}>{meta.context}</div>

      {meta.tip && (
        <div style={tipBox}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>✍️</span>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.accent, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Writing Tip</div>
            <div style={{ fontSize: '0.88rem', color: textColor, lineHeight: 1.6 }}>{meta.tip}</div>
          </div>
        </div>
      )}
    </>
  )

  const renderStudyPanel = () => (
    <>
      <div style={header}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{cfg.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={badgeStyle}>{cfg.emoji} {cfg.label}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: textColor, lineHeight: 1.3 }}>{meta.title}</div>
          {meta.concept && (
            <div style={{ fontSize: '0.78rem', color: cfg.accent, marginTop: '0.25rem' }}>🔬 {meta.concept}</div>
          )}
        </div>
      </div>

      <div style={sectionLabel}>Deep Dive</div>
      <div style={{ fontSize: '0.92rem', color: textColor, lineHeight: 1.75 }}>{meta.context}</div>
    </>
  )

  const renderUrduIslamicPanel = () => (
    <>
      <div style={header}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>🕌</span>
        <div style={{ flex: 1 }}>
          <div style={badgeStyle}>🕌 Islamic Wisdom</div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: textColor,
            direction: 'rtl',
            lineHeight: 1.5,
            fontFamily: "'Noto Nastaliq Urdu', serif",
          }}>
            {meta.title}
          </div>
          {meta.source && (
            <div style={{ fontSize: '0.78rem', color: '#b8860b', marginTop: '0.25rem', fontStyle: 'italic' }}>
              📖 {meta.source}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={sectionLabel}>اردو مطلب</div>
        <div style={{
          fontSize: '1rem',
          color: textColor,
          lineHeight: 2,
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
        }}>
          {meta.urduMeaning}
        </div>
      </div>

      <div style={divider} />
      <div style={sectionLabel}>English Meaning</div>
      <div style={{ fontSize: '0.92rem', color: textColor, lineHeight: 1.75 }}>{meta.englishMeaning}</div>
    </>
  )

  const renderContent = () => {
    if (language === 'urdu' && difficulty === 'islamic') return renderUrduIslamicPanel()
    if (language === 'arabic' && difficulty === 'islamic') return renderIslamicPanel()
    if (difficulty === 'islamic') return renderIslamicPanel()
    if (difficulty === 'coding') return renderCodingPanel()
    if (difficulty === 'poetry') return renderPoetryPanel()
    if (difficulty === 'emails') return renderEmailFreelancePanel()
    if (difficulty === 'freelance') return renderEmailFreelancePanel()
    if (difficulty === 'study') return renderStudyPanel()
    return renderStudyPanel()
  }

  return (
    <div style={panel}>
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: cfg.accent,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ display: 'inline-block', width: '1.5rem', height: '2px', background: cfg.accent, borderRadius: '2px' }} />
        Learning Panel
        <span style={{ display: 'inline-block', width: '1.5rem', height: '2px', background: cfg.accent, borderRadius: '2px' }} />
      </div>
      {renderContent()}
    </div>
  )
}
