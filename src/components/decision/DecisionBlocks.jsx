import { fmtPercent } from '../../lib/decision'

export function DecisionHero({ accent, title, eyebrow, description, colors, children }) {
  return (
    <section style={{
      background: `linear-gradient(145deg, ${colors.card}, ${accent}10)`,
      border: `1px solid ${accent}33`,
      borderRadius: '1.25rem',
      padding: '1.45rem',
      marginBottom: '1.25rem',
      boxShadow: `0 10px 30px ${accent}10`,
    }}>
      {eyebrow && (
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: accent,
          marginBottom: '0.55rem',
        }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ margin: '0 0 0.55rem', fontSize: '2rem', lineHeight: 1.12, color: colors.text, letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      <p style={{ margin: 0, color: colors.textSecondary, maxWidth: '72ch', lineHeight: 1.68, fontSize: '0.98rem' }}>
        {description}
      </p>
      {children && <div style={{ marginTop: '1rem' }}>{children}</div>}
    </section>
  )
}

export function SectionCard({ title, accent, colors, children, subtitle }) {
  return (
    <section style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: '1rem',
      padding: '1.2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {(title || subtitle) && (
        <div>
          {title && (
            <h2 style={{
              margin: 0,
              color: colors.text,
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}>
              <span style={{ color: accent, marginRight: '0.45rem' }}>●</span>{title}
            </h2>
          )}
          {subtitle && (
            <p style={{ margin: title ? '0.4rem 0 0' : 0, color: colors.textSecondary, lineHeight: 1.6, fontSize: '0.92rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

export function FieldsGrid({ children, min = 220 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: '0.9rem' }}>
      {children}
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.92 }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: '0.74rem', opacity: 0.72, lineHeight: 1.45 }}>{hint}</span>}
    </label>
  )
}

const baseInputStyle = (colors) => ({
  width: '100%',
  boxSizing: 'border-box',
  background: colors.input ?? colors.bg,
  border: `1px solid ${colors.inputBorder ?? colors.border}`,
  color: colors.text,
  borderRadius: '0.75rem',
  padding: '0.7rem 0.8rem',
  fontSize: '0.92rem',
  outline: 'none',
})

export function NumberInput({ colors, ...props }) {
  return <input type="number" {...props} style={{ ...baseInputStyle(colors), ...props.style }} />
}

export function SelectInput({ colors, children, ...props }) {
  return <select {...props} style={{ ...baseInputStyle(colors), ...props.style }}>{children}</select>
}

export function SliderInput({ colors, value, onChange, min, max, step = 1, suffix = '', accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        style={{ accentColor: accent }}
      />
      <div style={{ fontSize: '0.82rem', color: colors.text, fontWeight: 700 }}>{value}{suffix}</div>
    </div>
  )
}

export function MetricGrid({ children, min = 170 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: '0.8rem' }}>
      {children}
    </div>
  )
}

export function MetricCard({ label, value, sub, accent, colors }) {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${accent}10, ${colors.card})`,
      border: `1px solid ${accent}28`,
      borderRadius: '0.95rem',
      padding: '0.95rem',
    }}>
      <div style={{ fontSize: '0.76rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.text, marginTop: '0.3rem' }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: '0.4rem', fontSize: '0.81rem', color: colors.textSecondary, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  )
}

export function RecommendationBanner({ accent, title, body, confidence, colors }) {
  return (
    <div style={{
      background: `linear-gradient(145deg, ${accent}18, ${colors.card})`,
      border: `1px solid ${accent}33`,
      borderRadius: '1rem',
      padding: '1rem 1.1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 800, color: colors.text, fontSize: '1.02rem' }}>{title}</div>
        {typeof confidence === 'number' && (
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: accent, background: `${accent}14`, border: `1px solid ${accent}24`, borderRadius: '999px', padding: '0.2rem 0.55rem' }}>
            Confidence: {fmtPercent(confidence, 0)}
          </div>
        )}
      </div>
      <div style={{ color: colors.textSecondary, lineHeight: 1.65, fontSize: '0.92rem' }}>{body}</div>
    </div>
  )
}

export function BulletList({ items, colors }) {
  return (
    <ul style={{ margin: 0, paddingLeft: '1.15rem', color: colors.textSecondary, lineHeight: 1.75 }}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

export function ScoreBars({ scores, colors }) {
  return (
    <div style={{ display: 'grid', gap: '0.65rem' }}>
      {Object.entries(scores).map(([label, value]) => (
        <div key={label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
            <span style={{ color: colors.text }}>{label}</span>
            <span style={{ color: colors.textSecondary }}>{value}/100</span>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', background: colors.input }}>
            <div style={{
              width: `${Math.max(6, value)}%`,
              height: '100%',
              borderRadius: '999px',
              background: value >= 75 ? '#22c55e' : value >= 55 ? '#06b6d4' : value >= 40 ? '#f59e0b' : '#ef4444',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ComparisonBars({ items, colors, accent = '#06b6d4', currency = false }) {
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1)
  return (
    <div style={{ display: 'grid', gap: '0.7rem' }}>
      {items.map((item) => {
        const width = Math.max(8, ((Number(item.value) || 0) / max) * 100)
        return (
          <div key={item.label} style={{ display: 'grid', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline' }}>
              <span style={{ color: colors.text, fontSize: '0.84rem', fontWeight: 700 }}>{item.label}</span>
              <span style={{ color: item.color || accent, fontSize: '0.84rem', fontWeight: 800 }}>{item.display}</span>
            </div>
            <div style={{ height: '10px', borderRadius: '999px', background: colors.input, overflow: 'hidden' }}>
              <div style={{ width: `${width}%`, height: '100%', borderRadius: '999px', background: item.color || accent }} />
            </div>
            {item.note && <div style={{ color: colors.textSecondary, fontSize: '0.76rem', lineHeight: 1.45 }}>{item.note}</div>}
          </div>
        )
      })}
    </div>
  )
}
