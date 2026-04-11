export default function PrivacyPolicy({ onClose, isDark, colors }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000, padding: '1rem',
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      <div style={{
        background: isDark ? 'rgba(15,23,42,0.98)' : 'rgba(248,250,252,0.98)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '1.25rem',
        maxWidth: '680px', width: '100%',
        maxHeight: '85vh', overflowY: 'auto',
        padding: '2rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: colors.text, fontSize: '1.4rem', fontWeight: 700 }}>
            🔒 Privacy Policy
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: colors.textSecondary,
            fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1,
          }}>×</button>
        </div>

        <p style={{ color: colors.textSecondary, fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          Last updated: April 4, 2026
        </p>

        {[
          {
            title: '1. Information We Collect',
            body: `When you create an optional identity (Name#code), we store your display name, country, and city in our database to power the leaderboard. Your typing scores (WPM, CPM, accuracy, difficulty, language) are stored to compute statistics. We do not collect passwords, email addresses, or payment information.`
          },
          {
            title: '2. Local Storage',
            body: `We use your browser's localStorage to remember your theme preference, language selection, and identity code so you don't have to re-enter them. You can clear this at any time by clearing your browser data.`
          },
          {
            title: '3. Cookies & Advertising',
            body: `This site may display ads served by Google AdSense. Google uses cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising by visiting Google's Ads Settings. We do not control the cookies set by third-party advertisers.`
          },
          {
            title: '4. Analytics',
            body: `We may use privacy-friendly analytics to understand aggregate usage (pages viewed, session counts). No personally identifiable information is shared with analytics providers.`
          },
          {
            title: '5. Data Sharing',
            body: `We do not sell, trade, or rent your personal data to third parties. Leaderboard data (display name, country, city, WPM stats) is publicly visible to all users of this site by design.`
          },
          {
            title: '6. Data Retention',
            body: `Your scores and identity data are retained indefinitely to maintain leaderboard continuity. You may request deletion by contacting us.`
          },
          {
            title: '7. Children\'s Privacy',
            body: `This site is intended for general audiences and does not knowingly collect personal information from children under 13. If you believe a child has provided personal information, please contact us so we can remove it.`
          },
          {
            title: '8. Changes to This Policy',
            body: `We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated date. Continued use of the site after changes constitutes acceptance.`
          },
          {
            title: '9. Contact',
            body: `For questions about this policy or data deletion requests, contact us at: privacy@typely.app`
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ color: colors.text, fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>{title}</h3>
            <p style={{ color: colors.textSecondary, fontSize: '0.875rem', margin: 0, lineHeight: 1.65 }}>{body}</p>
          </div>
        ))}

        <div style={{
          marginTop: '2rem', padding: '1rem',
          background: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.06)',
          borderRadius: '0.625rem',
          border: '1px solid rgba(6,182,212,0.2)',
        }}>
          <p style={{ margin: 0, color: colors.textSecondary, fontSize: '0.8rem', textAlign: 'center' }}>
            By using Typely you agree to this Privacy Policy.
            <br />© {new Date().getFullYear()} Typely · <a href="mailto:privacy@typely.app" style={{ color: '#06b6d4' }}>Contact</a>
          </p>
        </div>
      </div>
    </div>
  )
}
