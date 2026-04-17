import { usePreferences } from '../hooks/usePreferences'
import { useTheme } from '../hooks/useTheme'

const CONTENT = {
  storage: {
    icon: '💾',
    en: {
      strong: 'Data stored locally.',
      body: "Your data is saved in this browser's local storage. Clearing browser cache or cookies will permanently erase it. Export or screenshot important records for safekeeping.",
    },
    ur: {
      strong: 'ڈیٹا آپ کے براؤزر میں محفوظ ہے۔',
      body: 'آپ کا ڈیٹا اس براؤزر کی لوکل اسٹوریج میں محفوظ کیا جاتا ہے۔ براؤزر کیش یا کوکیز صاف کرنے سے ڈیٹا مستقل طور پر ضائع ہو جائے گا۔ اہم ریکارڈز محفوظ رکھیں۔',
    },
    accentColor: '#f59e0b',
  },
  noApi: {
    icon: '🔌',
    en: {
      strong: 'Manual or CSV import only.',
      body: 'No bank, payment, or third-party API is connected. Data is entered manually or imported via CSV. When open-banking APIs become available in your region, automatic import can be enabled.',
    },
    ur: {
      strong: 'صرف دستی یا CSV درآمد۔',
      body: 'کوئی بینک، ادائیگی یا تھرڈ پارٹی API منسلک نہیں ہے۔ ڈیٹا دستی طور پر درج کیا جاتا ہے یا CSV کے ذریعے درآمد کیا جاتا ہے۔',
    },
    accentColor: '#6366f1',
  },
  professional: {
    icon: '⚠️',
    en: {
      strong: 'For informational purposes only.',
      body: 'This tool provides estimates and general guidance. It is not a substitute for professional advice. Consult a qualified professional before making any financial, legal, medical, or technical decisions.',
    },
    ur: {
      strong: 'صرف معلوماتی مقاصد کے لیے۔',
      body: 'یہ ٹول تخمینے اور عمومی رہنمائی فراہم کرتا ہے۔ یہ پیشہ ورانہ مشورے کا متبادل نہیں ہے۔ کوئی بھی فیصلہ کرنے سے پہلے کسی مستند پیشہ ور سے مشورہ کریں۔',
    },
    accentColor: '#f59e0b',
  },
  tax: {
    icon: '⚠️',
    en: {
      strong: 'Disclaimer:',
      body: 'For educational and informational purposes only. Not affiliated with FBR or any government agency. Calculations are based on Finance Act 2025 and are estimates only. Consult a certified tax practitioner (RTP) or CA before filing returns.',
    },
    ur: {
      strong: 'اعلامیہ:',
      body: 'یہ ٹول صرف تعلیمی اور معلوماتی مقاصد کے لیے ہے۔ یہ FBR یا کسی سرکاری ادارے سے وابستہ نہیں۔ حسابات فنانس ایکٹ 2025 پر مبنی تخمینے ہیں۔ ریٹرن فائل کرنے سے پہلے کسی مستند ٹیکس پریکٹیشنر سے رجوع کریں۔',
    },
    accentColor: '#f59e0b',
  },
  health: {
    icon: '⚠️',
    en: {
      strong: 'Not medical advice.',
      body: 'This tool is for personal tracking and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.',
    },
    ur: {
      strong: 'طبی مشورہ نہیں۔',
      body: 'یہ ٹول صرف ذاتی ٹریکنگ اور معلوماتی مقاصد کے لیے ہے۔ یہ پیشہ ورانہ طبی مشورے، تشخیص یا علاج کا متبادل نہیں ہے۔ ہمیشہ کسی اہل معالج سے مشورہ کریں۔',
    },
    accentColor: '#f59e0b',
  },
  financial: {
    icon: '💰',
    en: {
      strong: 'Not financial advice.',
      body: 'Prices are entered manually and may not reflect real-time market rates. Gold and silver values fluctuate daily. This tool is for informational purposes only — always verify rates with a certified jeweller or sarafa bazar before transacting.',
    },
    ur: {
      strong: 'مالی مشورہ نہیں۔',
      body: 'قیمتیں دستی طور پر درج کی جاتی ہیں اور حقیقی وقت کی مارکیٹ شرح کی عکاسی نہیں کر سکتیں۔ سونے اور چاندی کی قیمتیں روزانہ بدلتی رہتی ہیں۔ لین دین سے پہلے ہمیشہ کسی مستند جیولر یا صرافہ بازار سے شرح کی تصدیق کریں۔',
    },
    accentColor: '#f59e0b',
  },
}

/**
 * DisclaimerBlock — reusable bilingual disclaimer banner.
 * Respects `urduLabels` preference automatically.
 *
 * @param {'storage'|'noApi'|'professional'|'tax'|'health'|'financial'} type
 * @param {string} [overrideBodyEn] - optional custom body text (English only)
 */
export default function DisclaimerBlock({ type = 'storage', overrideBodyEn }) {
  const { prefs } = usePreferences()
  const { isDark, colors } = useTheme()
  const c = CONTENT[type] || CONTENT.storage
  const isUrdu = prefs.urduLabels
  const lang = isUrdu ? 'ur' : 'en'
  const body = (!isUrdu && overrideBodyEn) ? overrideBodyEn : c[lang].body
  const strong = c[lang].strong
  const accent = c.accentColor

  return (
    <div style={{
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      padding: '0.9rem 1rem',
      background: isDark ? `${accent}11` : `${accent}0d`,
      border: `1px solid ${accent}33`,
      borderRadius: '0.75rem',
      marginTop: '1rem',
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.05rem' }}>{c.icon}</span>
      <p style={{
        margin: 0, fontSize: '0.78rem',
        color: colors.textSecondary, lineHeight: 1.7,
        direction: isUrdu ? 'rtl' : 'ltr',
        textAlign: isUrdu ? 'right' : 'left',
      }}>
        <strong style={{ color: colors.text }}>{strong}</strong>{' '}
        {body}
      </p>
    </div>
  )
}
