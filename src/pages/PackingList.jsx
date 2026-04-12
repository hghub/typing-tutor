import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import ToolLayout from '../components/ToolLayout';

const ACCENT = '#f59e0b';

const WMO_ICON = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3) return '🌤️';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌦️';
  return '⛈️';
};

const ACTIVITIES = [
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'casual', label: 'Casual / Sightseeing', emoji: '🏛️' },
  { id: 'wedding', label: 'Wedding / Formal', emoji: '👔' },
  { id: 'camping', label: 'Camping', emoji: '⛺' },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' });
}

function daysBetween(a, b) {
  if (!a || !b) return 0;
  const diff = new Date(b) - new Date(a);
  return Math.max(1, Math.round(diff / 86400000) + 1);
}

function generatePackingList({ weather, activities, tripDays, weatherFailed }) {
  const categories = {};

  const add = (cat, item) => {
    if (!categories[cat]) categories[cat] = [];
    if (!categories[cat].includes(item)) categories[cat].push(item);
  };

  // Essentials
  ['Passport / CNIC', 'Boarding pass', 'Travel insurance docs'].forEach(i => add('Documents', i));
  ['Phone charger', 'Power bank'].forEach(i => add('Electronics', i));
  ['Medications (personal)', 'Hand sanitizer', 'Face masks'].forEach(i => add('Health & Safety', i));

  const days = tripDays || 3;
  add('Clothing', `Underwear × ${days + 2}`);
  add('Clothing', `Socks × ${days + 2}`);

  ['Toothbrush', 'Toothpaste', 'Shampoo / Conditioner', 'Soap / Body wash', 'Deodorant', 'Razor'].forEach(i => add('Toiletries', i));

  // Weather-based
  if (!weatherFailed && weather) {
    const maxTemps = weather.daily.temperature_2m_max;
    const rainProbs = weather.daily.precipitation_probability_max;
    const avgMax = maxTemps.reduce((s, t) => s + t, 0) / maxTemps.length;
    const anyRain50 = rainProbs.some(p => p > 50);
    const anyRain80 = rainProbs.some(p => p > 80);

    if (avgMax < 15) {
      ['Heavy jacket', 'Thermal underwear', 'Gloves', 'Scarf', 'Warm socks'].forEach(i => add('Clothing', i));
    } else if (avgMax <= 25) {
      ['Light jacket', 'Cardigan'].forEach(i => add('Clothing', i));
    } else {
      ['Sunscreen SPF 30+', 'Sunglasses', 'Light cotton clothes'].forEach(i => add('Clothing', i));
    }

    if (anyRain50) {
      ['Umbrella / Raincoat', 'Waterproof shoes', 'Extra pair of socks'].forEach(i => add('Clothing', i));
    }
    if (anyRain80) {
      add('Bags & Accessories', 'Waterproof bag cover');
    }
  }

  // Activity-based
  if (activities.beach) {
    ['Swimwear', 'Beach towel', 'Flip-flops', 'Waterproof sunscreen SPF 50', 'After-sun lotion'].forEach(i => add('Beach Gear', i));
  }
  if (activities.hiking) {
    ['Hiking boots', 'Trekking poles', 'Blister plasters', 'Moisture-wicking T-shirts', 'Headlamp'].forEach(i => add('Hiking Gear', i));
  }
  if (activities.business) {
    ['Formal shirts × 2', 'Tie', 'Blazer', 'Dress shoes', 'Business cards', 'Laptop + charger'].forEach(i => add('Business', i));
  }
  if (activities.casual) {
    ['Comfortable walking shoes', 'Casual shirts', 'Jeans'].forEach(i => add('Clothing', i));
  }
  if (activities.wedding) {
    ['Formal outfit', 'Dress shoes', 'Accessories', 'Iron / Steamer'].forEach(i => add('Formal / Wedding', i));
  }
  if (activities.camping) {
    ['Sleeping bag', 'Tent (if not provided)', 'Camp stove', 'Insect repellent', 'First aid kit'].forEach(i => add('Camping Gear', i));
  }

  return categories;
}

export default function PackingList() {
  const { isDark, colors } = useTheme();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [activities, setActivities] = useState({
    beach: false, hiking: false, business: false,
    casual: false, wedding: false, camping: false,
  });
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState('');

  // Step 2 state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherFailed, setWeatherFailed] = useState(false);

  // Step 3 state
  const [checked, setChecked] = useState({});

  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced city autocomplete
  useEffect(() => {
    if (!cityQuery.trim() || cityQuery.trim().length < 2) {
      setCitySuggestions([]);
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCityLoading(true);
      setCityError('');
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery.trim())}&count=5&language=en&format=json`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setCitySuggestions(data.results);
          setShowDropdown(true);
        } else {
          setCitySuggestions([]);
          setShowDropdown(false);
          setCityError('City not found. Please try a different name.');
        }
      } catch {
        setCityError('Could not fetch city suggestions.');
        setShowDropdown(false);
      } finally {
        setCityLoading(false);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [cityQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCitySelect = useCallback((city) => {
    setSelectedCity(city);
    setCityQuery(`${city.name}${city.admin1 ? ', ' + city.admin1 : ''}, ${city.country}`);
    setShowDropdown(false);
    setCityError('');
  }, []);

  const toggleActivity = useCallback((id) => {
    setActivities(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const tripDays = useMemo(() => daysBetween(departure, returnDate), [departure, returnDate]);

  const canProceed = selectedCity && departure && returnDate && new Date(returnDate) >= new Date(departure);

  const fetchWeatherAndProceed = useCallback(async () => {
    if (!canProceed) return;
    setWeatherLoading(true);
    setWeatherFailed(false);
    setWeather(null);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.latitude}&longitude=${selectedCity.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto&forecast_days=7`
      );
      const data = await res.json();
      if (data.daily) {
        setWeather(data);
      } else {
        setWeatherFailed(true);
      }
    } catch {
      setWeatherFailed(true);
    } finally {
      setWeatherLoading(false);
      setStep(2);
    }
  }, [canProceed, selectedCity]);

  const packingCategories = useMemo(() => {
    if (step < 3) return {};
    return generatePackingList({ weather, activities, tripDays, weatherFailed });
  }, [step, weather, activities, tripDays, weatherFailed]);

  const allItems = useMemo(() => {
    const items = [];
    Object.entries(packingCategories).forEach(([cat, list]) => {
      list.forEach(item => items.push({ cat, item, key: `${cat}::${item}` }));
    });
    return items;
  }, [packingCategories]);

  const packedCount = useMemo(() => allItems.filter(i => checked[i.key]).length, [allItems, checked]);

  const toggleItem = useCallback((key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const copyList = useCallback(() => {
    const lines = [];
    Object.entries(packingCategories).forEach(([cat, items]) => {
      lines.push(`\n## ${cat}`);
      items.forEach(item => {
        const done = checked[`${cat}::${item}`] ? '[x]' : '[ ]';
        lines.push(`  ${done} ${item}`);
      });
    });
    navigator.clipboard.writeText(`Packing List — ${cityQuery}\n${lines.join('\n')}`).catch(() => {});
  }, [packingCategories, checked, cityQuery]);

  const reset = useCallback(() => {
    setStep(1);
    setCityQuery('');
    setSelectedCity(null);
    setCitySuggestions([]);
    setDeparture('');
    setReturnDate('');
    setActivities({ beach: false, hiking: false, business: false, casual: false, wedding: false, camping: false });
    setWeather(null);
    setWeatherFailed(false);
    setChecked({});
    setCityError('');
  }, []);

  // ── Styles ──────────────────────────────────────────────────────────────────

  const s = {
    page: {
      maxWidth: 760,
      margin: '0 auto',
      padding: '24px 16px 48px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: colors.text,
    },
    progress: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginBottom: 32,
    },
    stepDot: (n) => ({
      width: 36,
      height: 36,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 14,
      background: step >= n ? ACCENT : (isDark ? '#374151' : '#e5e7eb'),
      color: step >= n ? '#fff' : colors.textSecondary,
      transition: 'background 0.3s',
      flexShrink: 0,
    }),
    stepLine: (n) => ({
      flex: 1,
      height: 3,
      background: step > n ? ACCENT : (isDark ? '#374151' : '#e5e7eb'),
      transition: 'background 0.3s',
    }),
    stepLabel: (n) => ({
      fontSize: 11,
      fontWeight: step === n ? 700 : 400,
      color: step === n ? ACCENT : colors.textSecondary,
      marginTop: 6,
      textAlign: 'center',
    }),
    card: {
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: 16,
      padding: '28px 24px',
      marginBottom: 20,
    },
    h2: {
      fontSize: 20,
      fontWeight: 700,
      marginBottom: 20,
      color: colors.text,
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 16,
    },
    input: {
      width: '100%',
      boxSizing: 'border-box',
      padding: '10px 14px',
      fontSize: 15,
      borderRadius: 10,
      border: `1px solid ${colors.inputBorder}`,
      background: colors.input,
      color: colors.text,
      outline: 'none',
    },
    dateRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: 10,
      marginTop: 4,
      zIndex: 100,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      overflow: 'hidden',
    },
    dropdownItem: (hover) => ({
      padding: '10px 14px',
      cursor: 'pointer',
      fontSize: 14,
      background: hover ? (isDark ? '#374151' : '#f3f4f6') : 'transparent',
      color: colors.text,
    }),
    activitiesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 10,
      marginTop: 8,
    },
    activityChip: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      borderRadius: 10,
      border: `2px solid ${active ? ACCENT : colors.border}`,
      background: active ? (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)') : colors.input,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      color: active ? ACCENT : colors.text,
      transition: 'all 0.2s',
      userSelect: 'none',
    }),
    btn: (primary) => ({
      padding: '11px 24px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 15,
      background: primary ? ACCENT : (isDark ? '#374151' : '#e5e7eb'),
      color: primary ? '#fff' : colors.text,
      transition: 'opacity 0.2s',
    }),
    btnRow: {
      display: 'flex',
      gap: 12,
      marginTop: 24,
      justifyContent: 'flex-end',
    },
    weatherStrip: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 8,
    },
    weatherCard: {
      minWidth: 90,
      background: isDark ? '#1f2937' : '#f9fafb',
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      padding: '12px 8px',
      textAlign: 'center',
      flexShrink: 0,
    },
    weatherDate: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: 600,
      marginBottom: 4,
    },
    weatherIcon: {
      fontSize: 24,
      lineHeight: 1.2,
    },
    weatherTemp: {
      fontSize: 12,
      fontWeight: 700,
      color: colors.text,
      marginTop: 4,
    },
    weatherRain: {
      fontSize: 11,
      color: '#60a5fa',
      marginTop: 2,
    },
    warningBanner: {
      background: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
      border: `1px solid ${ACCENT}`,
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      color: ACCENT,
      marginBottom: 20,
    },
    categoryHeader: {
      fontSize: 13,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: ACCENT,
      marginTop: 24,
      marginBottom: 10,
    },
    itemRow: (done) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 8,
      marginBottom: 4,
      background: done
        ? (isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)')
        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
      cursor: 'pointer',
      transition: 'background 0.15s',
    }),
    checkbox: (done) => ({
      width: 18,
      height: 18,
      borderRadius: 5,
      border: `2px solid ${done ? ACCENT : colors.border}`,
      background: done ? ACCENT : 'transparent',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s',
    }),
    itemText: (done) => ({
      fontSize: 14,
      color: done ? colors.textSecondary : colors.text,
      textDecoration: done ? 'line-through' : 'none',
      flex: 1,
    }),
    progressBar: {
      height: 6,
      borderRadius: 999,
      background: isDark ? '#374151' : '#e5e7eb',
      marginBottom: 20,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      background: ACCENT,
      transition: 'width 0.4s ease',
      width: allItems.length > 0 ? `${(packedCount / allItems.length) * 100}%` : '0%',
    },
    counterText: {
      fontSize: 14,
      fontWeight: 700,
      color: ACCENT,
      marginBottom: 8,
    },
  };

  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);

  return (
    <ToolLayout toolId="packing-list">
      <div style={s.page}>
        {/* Progress indicator */}
        <div>
          <div style={s.progress}>
            {[1, 2, 3].map((n, i) => (
              <span key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={s.stepDot(n)}>{n}</span>
                </span>
                {i < 2 && <span style={s.stepLine(n)} />}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -12, marginBottom: 24 }}>
            {['Trip Details', 'Weather', 'Packing List'].map((label, i) => (
              <span key={label} style={{ ...s.stepLabel(i + 1), flex: 1, textAlign: i === 0 ? 'left' : i === 2 ? 'right' : 'center' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Step 1: Trip Details ── */}
        {step === 1 && (
          <div style={s.card}>
            <div style={s.h2}>🧳 Trip Details</div>

            <label style={s.label}>Destination City</label>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. Lahore, Islamabad, Dubai…"
                value={cityQuery}
                onChange={e => {
                  setCityQuery(e.target.value);
                  setSelectedCity(null);
                  setCityError('');
                }}
                onFocus={() => citySuggestions.length > 0 && setShowDropdown(true)}
                autoComplete="off"
              />
              {cityLoading && (
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: colors.textSecondary }}>
                  Searching…
                </span>
              )}
              {showDropdown && citySuggestions.length > 0 && (
                <div style={s.dropdown}>
                  {citySuggestions.map(city => (
                    <div
                      key={city.id}
                      style={s.dropdownItem(hoveredSuggestion === city.id)}
                      onMouseEnter={() => setHoveredSuggestion(city.id)}
                      onMouseLeave={() => setHoveredSuggestion(null)}
                      onMouseDown={() => handleCitySelect(city)}
                    >
                      <strong>{city.name}</strong>
                      {city.admin1 && <span style={{ color: colors.textSecondary }}>, {city.admin1}</span>}
                      <span style={{ color: colors.textSecondary }}>, {city.country}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cityError && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{cityError}</div>}

            <div style={s.dateRow}>
              <div>
                <label style={s.label}>Departure Date</label>
                <input
                  style={s.input}
                  type="date"
                  value={departure}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDeparture(e.target.value)}
                />
              </div>
              <div>
                <label style={s.label}>Return Date</label>
                <input
                  style={s.input}
                  type="date"
                  value={returnDate}
                  min={departure || new Date().toISOString().split('T')[0]}
                  onChange={e => setReturnDate(e.target.value)}
                />
              </div>
            </div>

            {departure && returnDate && tripDays > 0 && (
              <div style={{ fontSize: 13, color: ACCENT, marginTop: 8, fontWeight: 600 }}>
                📅 {tripDays} day{tripDays !== 1 ? 's' : ''} trip
              </div>
            )}

            <label style={{ ...s.label, marginTop: 20 }}>Activities</label>
            <div style={s.activitiesGrid}>
              {ACTIVITIES.map(act => (
                <div
                  key={act.id}
                  style={s.activityChip(activities[act.id])}
                  onClick={() => toggleActivity(act.id)}
                >
                  <span>{act.emoji}</span>
                  <span>{act.label}</span>
                </div>
              ))}
            </div>

            <div style={s.btnRow}>
              <button
                style={{
                  ...s.btn(true),
                  opacity: canProceed ? 1 : 0.4,
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                }}
                disabled={!canProceed || weatherLoading}
                onClick={fetchWeatherAndProceed}
              >
                {weatherLoading ? 'Fetching weather…' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Weather Summary ── */}
        {step === 2 && (
          <>
            <div style={s.card}>
              <div style={s.h2}>
                🌍 {cityQuery}
                <span style={{ fontSize: 14, fontWeight: 400, color: colors.textSecondary, marginLeft: 10 }}>
                  {formatDate(departure)} – {formatDate(returnDate)} · {tripDays}d
                </span>
              </div>

              {weatherFailed && (
                <div style={s.warningBanner}>
                  ⚠️ Could not fetch weather data — your packing list will be a general one.
                </div>
              )}

              {!weatherFailed && weather && (
                <>
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>7-day forecast</div>
                  <div style={s.weatherStrip}>
                    {weather.daily.time.map((date, i) => (
                      <div key={date} style={s.weatherCard}>
                        <div style={s.weatherDate}>{formatDate(date)}</div>
                        <div style={s.weatherIcon}>{WMO_ICON(weather.daily.weathercode[i])}</div>
                        <div style={s.weatherTemp}>
                          {Math.round(weather.daily.temperature_2m_max[i])}° / {Math.round(weather.daily.temperature_2m_min[i])}°
                        </div>
                        <div style={s.weatherRain}>
                          💧 {weather.daily.precipitation_probability_max[i] ?? 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={s.btnRow}>
              <button style={s.btn(false)} onClick={() => setStep(1)}>← Back</button>
              <button style={s.btn(true)} onClick={() => setStep(3)}>Generate List →</button>
            </div>

            {/* Travel Alerts & Local News */}
            <div style={{
              ...s.card,
              marginTop: 0,
              borderColor: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.4)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: colors.text }}>
                📢 Before You Travel — Check These
              </div>
              <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 1.6 }}>
                Always check local news and travel advisories for <strong style={{ color: ACCENT }}>{selectedCity?.name ?? 'your destination'}</strong> before departing.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {[
                  { label: '🗞️ Dawn News', url: 'https://www.dawn.com', desc: 'Pakistan — English' },
                  { label: '📺 Geo News', url: 'https://www.geo.tv', desc: 'Pakistan — Urdu/English' },
                  { label: '🌍 BBC Travel Alerts', url: 'https://www.bbc.com/news', desc: 'International' },
                  { label: '✈️ IATA Travel Centre', url: 'https://www.iatatravelcentre.com', desc: 'Visa & health rules' },
                  { label: '🏥 WHO Health Advisories', url: 'https://www.who.int/emergencies', desc: 'Health risks' },
                  { label: '🇵🇰 Passport Pakistan', url: 'https://www.passport.gov.pk', desc: 'Travel documents' },
                ].map(({ label, url, desc }) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: `1px solid ${colors.border}`,
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                    onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{label}</div>
                    <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{desc}</div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Step 3: Packing List ── */}
        {step === 3 && (
          <>
            {weatherFailed && (
              <div style={s.warningBanner}>
                ⚠️ No weather data — showing general packing list without weather-based recommendations.
              </div>
            )}

            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div style={{ ...s.h2, margin: 0 }}>📋 Packing List</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ ...s.btn(false), padding: '8px 16px', fontSize: 13 }} onClick={copyList}>
                    📋 Copy list
                  </button>
                  <button style={{ ...s.btn(false), padding: '8px 16px', fontSize: 13 }} onClick={reset}>
                    🔄 Reset
                  </button>
                </div>
              </div>

              <div style={s.counterText}>
                Packed {packedCount} / {allItems.length} items
              </div>
              <div style={s.progressBar}>
                <div style={s.progressFill} />
              </div>

              {Object.entries(packingCategories).map(([cat, items]) => (
                <div key={cat}>
                  <div style={s.categoryHeader}>{cat}</div>
                  {items.map(item => {
                    const key = `${cat}::${item}`;
                    const done = !!checked[key];
                    return (
                      <div key={key} style={s.itemRow(done)} onClick={() => toggleItem(key)}>
                        <div style={s.checkbox(done)}>
                          {done && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span style={s.itemText(done)}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div style={s.btnRow}>
              <button style={s.btn(false)} onClick={() => setStep(2)}>← Back</button>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
