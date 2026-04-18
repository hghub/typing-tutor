import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'

/**
 * ToolSEOFooter — SEO description + FAQ accordion section
 * Place just before </ToolLayout> inside any tool page.
 *
 * Props:
 *   heading   string  — H2 heading (keyword-rich, e.g. "Free Typing Speed Test Online")
 *   paras     string[]  — 3-5 description paragraphs (300-600 words total)
 *   faqs      {q: string, a: string}[]  — 4-6 FAQ items
 */
export default function ToolSEOFooter({ heading, paras = [], faqs = [] }) {
  const { isDark, colors } = useTheme()
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section style={{
      marginTop: '3rem',
      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      paddingTop: '2.5rem',
    }}>
      {/* Description */}
      <div style={{ maxWidth: 720, margin: '0 auto', marginBottom: '2.5rem' }}>
        <h2 style={{
          fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem',
          color: colors.text, lineHeight: 1.3,
        }}>{heading}</h2>
        {paras.map((p, i) => (
          <p key={i} style={{
            fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
            lineHeight: 1.75, marginBottom: '0.9rem', margin: i === paras.length - 1 ? 0 : undefined,
          }}>{p}</p>
        ))}
      </div>

      {/* FAQ */}
      {faqs.length > 0 && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h3 style={{
            fontSize: '1rem', fontWeight: 700, marginBottom: '1rem',
            color: colors.text,
          }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '0.75rem', overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    padding: '0.85rem 1rem', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.text, lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: '1rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                    transition: 'transform 0.2s', transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)',
                    flexShrink: 0,
                  }}>▾</span>
                </button>
                {openIdx === i && (
                  <div style={{
                    padding: '0 1rem 0.85rem',
                    fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.6)',
                    lineHeight: 1.65,
                  }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
