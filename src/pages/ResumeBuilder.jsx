import { useState, useEffect } from 'react'
import ToolLayout from '../components/ToolLayout'
import { useTheme } from '../hooks/useTheme'

const STORAGE_KEY = 'rafiqy_resume_builder'

const EMPTY_RESUME = {
  personal: { name: '', email: '', phone: '', city: '', linkedin: '', portfolio: '' },
  summary: '',
  experience: [{ title: '', company: '', duration: '', bullets: [''] }],
  education: [{ degree: '', institution: '', year: '', grade: '' }],
  skills: [],
  projects: [{ name: '', tech: '', description: '', url: '' }],
  certifications: [{ name: '', issuer: '', year: '' }],
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || EMPTY_RESUME } catch { return EMPTY_RESUME }
}

export default function ResumeBuilder() {
  const { isDark, colors } = useTheme()
  const [data, setData] = useState(load)
  const [template, setTemplate] = useState('modern')
  const [mobileTab, setMobileTab] = useState('form')
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  function setPersonal(field, value) {
    setData(d => ({ ...d, personal: { ...d.personal, [field]: value } }))
  }

  function addExp() {
    setData(d => ({ ...d, experience: [...d.experience, { title: '', company: '', duration: '', bullets: [''] }] }))
  }
  function removeExp(i) {
    setData(d => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }))
  }
  function setExp(i, field, value) {
    setData(d => {
      const exp = [...d.experience]
      exp[i] = { ...exp[i], [field]: value }
      return { ...d, experience: exp }
    })
  }
  function setExpBullet(i, bi, value) {
    setData(d => {
      const exp = [...d.experience]
      const bullets = [...exp[i].bullets]
      bullets[bi] = value
      exp[i] = { ...exp[i], bullets }
      return { ...d, experience: exp }
    })
  }
  function addBullet(i) {
    setData(d => {
      const exp = [...d.experience]
      exp[i] = { ...exp[i], bullets: [...exp[i].bullets, ''] }
      return { ...d, experience: exp }
    })
  }
  function removeBullet(i, bi) {
    setData(d => {
      const exp = [...d.experience]
      exp[i] = { ...exp[i], bullets: exp[i].bullets.filter((_, idx) => idx !== bi) }
      return { ...d, experience: exp }
    })
  }

  function addEdu() {
    setData(d => ({ ...d, education: [...d.education, { degree: '', institution: '', year: '', grade: '' }] }))
  }
  function removeEdu(i) {
    setData(d => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }))
  }
  function setEdu(i, field, value) {
    setData(d => {
      const edu = [...d.education]
      edu[i] = { ...edu[i], [field]: value }
      return { ...d, education: edu }
    })
  }

  function addSkill(e) {
    if (e.key === 'Enter' && skillInput.trim()) {
      setData(d => ({ ...d, skills: [...d.skills, skillInput.trim()] }))
      setSkillInput('')
    }
  }
  function removeSkill(i) {
    setData(d => ({ ...d, skills: d.skills.filter((_, idx) => idx !== i) }))
  }

  function addProject() {
    setData(d => ({ ...d, projects: [...d.projects, { name: '', tech: '', description: '', url: '' }] }))
  }
  function removeProject(i) {
    setData(d => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }))
  }
  function setProject(i, field, value) {
    setData(d => {
      const projects = [...d.projects]
      projects[i] = { ...projects[i], [field]: value }
      return { ...d, projects }
    })
  }

  function addCert() {
    setData(d => ({ ...d, certifications: [...d.certifications, { name: '', issuer: '', year: '' }] }))
  }
  function removeCert(i) {
    setData(d => ({ ...d, certifications: d.certifications.filter((_, idx) => idx !== i) }))
  }
  function setCert(i, field, value) {
    setData(d => {
      const certifications = [...d.certifications]
      certifications[i] = { ...certifications[i], [field]: value }
      return { ...d, certifications }
    })
  }

  const inputStyle = {
    width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px',
    border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text,
    fontSize: '0.875rem', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: '0.75rem', color: colors.textSecondary, display: 'block', marginBottom: '0.25rem', fontWeight: 600 }
  const sectionHead = { fontSize: '1rem', fontWeight: 700, color: colors.text, marginBottom: '0.75rem', borderBottom: `2px solid ${colors.border}`, paddingBottom: '0.35rem' }
  const cardStyle = { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }
  const addBtn = { padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#06b6d4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }
  const removeBtn = { padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }

  const formPanel = (
    <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)', paddingRight: '0.5rem' }}>
      {/* Personal Info */}
      <div style={cardStyle}>
        <div style={sectionHead}>Personal Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[['name','Full Name'],['email','Email'],['phone','Phone'],['city','City'],['linkedin','LinkedIn URL'],['portfolio','GitHub / Portfolio']].map(([f,l]) => (
            <div key={f}>
              <label style={labelStyle}>{l}</label>
              <input style={inputStyle} value={data.personal[f]} onChange={e => setPersonal(f, e.target.value)}
                placeholder={f === 'city' ? 'Karachi, Lahore, Islamabad…' : ''} />
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={cardStyle}>
        <div style={sectionHead}>Professional Summary</div>
        <label style={labelStyle}>Summary ({data.summary.length}/500)</label>
        <textarea value={data.summary} onChange={e => e.target.value.length <= 500 && setData(d => ({ ...d, summary: e.target.value }))}
          rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief professional summary…" />
      </div>

      {/* Experience */}
      <div style={cardStyle}>
        <div style={{ ...sectionHead, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Experience</span>
          <button style={addBtn} onClick={addExp}>+ Add</button>
        </div>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button style={removeBtn} onClick={() => removeExp(i)}>✕ Remove</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div><label style={labelStyle}>Job Title</label><input style={inputStyle} value={exp.title} onChange={e => setExp(i,'title',e.target.value)} /></div>
              <div><label style={labelStyle}>Company</label><input style={inputStyle} value={exp.company} onChange={e => setExp(i,'company',e.target.value)} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Duration</label><input style={inputStyle} value={exp.duration} onChange={e => setExp(i,'duration',e.target.value)} placeholder="Jan 2022 – Present" /></div>
            </div>
            <label style={labelStyle}>Bullet Points</label>
            {exp.bullets.map((b, bi) => (
              <div key={bi} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <input style={{ ...inputStyle, flex: 1 }} value={b} onChange={e => setExpBullet(i, bi, e.target.value)} placeholder={`Bullet ${bi+1}`} />
                <button style={removeBtn} onClick={() => removeBullet(i, bi)}>✕</button>
              </div>
            ))}
            <button style={{ ...addBtn, background: colors.card, color: colors.text, outline: `1px solid ${colors.border}` }} onClick={() => addBullet(i)}>+ Bullet</button>
          </div>
        ))}
      </div>

      {/* Education */}
      <div style={cardStyle}>
        <div style={{ ...sectionHead, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Education</span>
          <button style={addBtn} onClick={addEdu}>+ Add</button>
        </div>
        {data.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}><button style={removeBtn} onClick={() => removeEdu(i)}>✕ Remove</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={labelStyle}>Degree</label><input style={inputStyle} value={edu.degree} onChange={e => setEdu(i,'degree',e.target.value)} /></div>
              <div><label style={labelStyle}>Institution</label><input style={inputStyle} value={edu.institution} onChange={e => setEdu(i,'institution',e.target.value)} /></div>
              <div><label style={labelStyle}>Year</label><input style={inputStyle} value={edu.year} onChange={e => setEdu(i,'year',e.target.value)} /></div>
              <div><label style={labelStyle}>Grade / CGPA</label><input style={inputStyle} value={edu.grade} onChange={e => setEdu(i,'grade',e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div style={cardStyle}>
        <div style={sectionHead}>Skills</div>
        <label style={labelStyle}>Type a skill and press Enter</label>
        <input style={inputStyle} value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="e.g. React, Python…" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
          {data.skills.map((s, i) => (
            <span key={i} onClick={() => removeSkill(i)} style={{ background: '#06b6d422', color: '#06b6d4', border: '1px solid #06b6d4', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
              {s} ✕
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div style={cardStyle}>
        <div style={{ ...sectionHead, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Projects</span>
          <button style={addBtn} onClick={addProject}>+ Add</button>
        </div>
        {data.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}><button style={removeBtn} onClick={() => removeProject(i)}>✕ Remove</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={labelStyle}>Project Name</label><input style={inputStyle} value={p.name} onChange={e => setProject(i,'name',e.target.value)} /></div>
              <div><label style={labelStyle}>Tech Stack</label><input style={inputStyle} value={p.tech} onChange={e => setProject(i,'tech',e.target.value)} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={p.description} onChange={e => setProject(i,'description',e.target.value)} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>URL</label><input style={inputStyle} value={p.url} onChange={e => setProject(i,'url',e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div style={cardStyle}>
        <div style={{ ...sectionHead, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Certifications</span>
          <button style={addBtn} onClick={addCert}>+ Add</button>
        </div>
        {data.certifications.map((c, i) => (
          <div key={i} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}><button style={removeBtn} onClick={() => removeCert(i)}>✕ Remove</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '0.5rem' }}>
              <div><label style={labelStyle}>Name</label><input style={inputStyle} value={c.name} onChange={e => setCert(i,'name',e.target.value)} /></div>
              <div><label style={labelStyle}>Issuer</label><input style={inputStyle} value={c.issuer} onChange={e => setCert(i,'issuer',e.target.value)} /></div>
              <div><label style={labelStyle}>Year</label><input style={inputStyle} value={c.year} onChange={e => setCert(i,'year',e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const previewPanel = <ResumePreview data={data} template={template} />

  return (
    <ToolLayout toolId="resume-builder">
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .resume-print-wrapper { display: block !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; z-index: 9999 !important; background: white !important; }
        }
      `}</style>
      <div style={{ color: colors.text }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>📋 AI Resume Builder</h1>
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>Build a professional resume — all data stays in your browser.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>Template:</span>
            {['modern','classic'].map(t => (
              <button key={t} onClick={() => setTemplate(t)} style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: template === t ? '#06b6d4' : colors.card, color: template === t ? '#fff' : colors.text, outline: template === t ? '2px solid #06b6d4' : `1px solid ${colors.border}`, textTransform: 'capitalize' }}>{t}</button>
            ))}
            <button onClick={() => window.print()} style={{ padding: '0.4rem 1rem', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>🖨 Export PDF</button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {['form','preview'].map(t => (
            <button key={t} onClick={() => setMobileTab(t)} style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: mobileTab === t ? '#06b6d4' : colors.card, color: mobileTab === t ? '#fff' : colors.text, outline: mobileTab === t ? '2px solid #06b6d4' : `1px solid ${colors.border}`, textTransform: 'capitalize' }}>{t === 'form' ? '✍️ Form' : '👁 Preview'}</button>
          ))}
        </div>

        {/* Desktop layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>{formPanel}</div>
          <div style={{ position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            {previewPanel}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

function ResumePreview({ data, template }) {
  const p = data.personal
  if (template === 'modern') {
    return (
      <div className="resume-print-wrapper" style={{ background: '#fff', color: '#111', fontFamily: 'Georgia, serif', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: '0.85rem' }}>
        {/* Header */}
        <div style={{ background: '#06b6d4', color: '#fff', padding: '1.5rem 2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{p.name || 'Your Name'}</div>
          <div style={{ opacity: 0.85, marginTop: '0.25rem', fontSize: '0.8rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {p.email && <span>✉ {p.email}</span>}
            {p.phone && <span>📞 {p.phone}</span>}
            {p.city && <span>📍 {p.city}</span>}
            {p.linkedin && <span>🔗 {p.linkedin}</span>}
            {p.portfolio && <span>🌐 {p.portfolio}</span>}
          </div>
        </div>
        <div style={{ padding: '1.25rem 2rem' }}>
          {data.summary && <><div style={{ fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem', color: '#06b6d4' }}>SUMMARY</div><p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{data.summary}</p></>}
          {data.experience.some(e => e.title || e.company) && <>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem', color: '#06b6d4' }}>EXPERIENCE</div>
            {data.experience.filter(e => e.title || e.company).map((exp, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>{exp.title}</span><span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#6b7280' }}>{exp.duration}</span></div>
                <div style={{ color: '#374151', marginBottom: '0.3rem' }}>{exp.company}</div>
                <ul style={{ paddingLeft: '1.25rem', margin: '0.25rem 0' }}>{exp.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ marginBottom: '0.1rem' }}>{b}</li>)}</ul>
              </div>
            ))}
          </>}
          {data.education.some(e => e.degree || e.institution) && <>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem', color: '#06b6d4', marginTop: '0.75rem' }}>EDUCATION</div>
            {data.education.filter(e => e.degree || e.institution).map((edu, i) => (
              <div key={i} style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                <div><span style={{ fontWeight: 700 }}>{edu.degree}</span>{edu.institution && `, ${edu.institution}`}{edu.grade && ` — ${edu.grade}`}</div>
                <span style={{ color: '#6b7280', fontSize: '0.78rem' }}>{edu.year}</span>
              </div>
            ))}
          </>}
          {data.skills.length > 0 && <>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem', color: '#06b6d4', marginTop: '0.75rem' }}>SKILLS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>{data.skills.map((s, i) => <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '12px', padding: '0.15rem 0.6rem', fontSize: '0.78rem', fontWeight: 600 }}>{s}</span>)}</div>
          </>}
          {data.projects.some(p => p.name) && <>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem', color: '#06b6d4', marginTop: '0.75rem' }}>PROJECTS</div>
            {data.projects.filter(p => p.name).map((pr, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700 }}>{pr.name}</span>{pr.tech && <span style={{ color: '#6b7280', fontSize: '0.78rem' }}> · {pr.tech}</span>}
                {pr.description && <div style={{ color: '#374151' }}>{pr.description}</div>}
                {pr.url && <div style={{ color: '#06b6d4', fontSize: '0.78rem' }}>{pr.url}</div>}
              </div>
            ))}
          </>}
          {data.certifications.some(c => c.name) && <>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem', color: '#06b6d4', marginTop: '0.75rem' }}>CERTIFICATIONS</div>
            {data.certifications.filter(c => c.name).map((c, i) => (
              <div key={i} style={{ marginBottom: '0.25rem' }}><span style={{ fontWeight: 700 }}>{c.name}</span>{c.issuer && ` — ${c.issuer}`}{c.year && ` (${c.year})`}</div>
            ))}
          </>}
        </div>
      </div>
    )
  }

  // Classic: two-column
  return (
    <div className="resume-print-wrapper" style={{ background: '#fff', color: '#111', fontFamily: 'Arial, sans-serif', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', fontSize: '0.85rem' }}>
      <div style={{ padding: '1.5rem 2rem', borderBottom: '3px solid #111' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.name || 'Your Name'}</div>
        <div style={{ color: '#374151', fontSize: '0.78rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.city && <span>{p.city}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 0 }}>
        {/* Left col */}
        <div style={{ padding: '1rem 1.25rem', background: '#f9fafb', borderRight: '1px solid #e5e7eb' }}>
          {data.skills.length > 0 && <>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#111' }}>Skills</div>
            {data.skills.map((s, i) => <div key={i} style={{ marginBottom: '0.2rem', fontSize: '0.78rem' }}>• {s}</div>)}
          </>}
          {data.education.some(e => e.degree) && <>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem', color: '#111' }}>Education</div>
            {data.education.filter(e => e.degree).map((edu, i) => (
              <div key={i} style={{ marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                <div>{edu.institution}</div>
                <div style={{ color: '#6b7280' }}>{edu.year}{edu.grade && ` · ${edu.grade}`}</div>
              </div>
            ))}
          </>}
          {data.certifications.some(c => c.name) && <>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '1rem', color: '#111' }}>Certifications</div>
            {data.certifications.filter(c => c.name).map((c, i) => (
              <div key={i} style={{ marginBottom: '0.3rem', fontSize: '0.78rem' }}><div style={{ fontWeight: 700 }}>{c.name}</div><div style={{ color: '#6b7280' }}>{c.issuer} {c.year}</div></div>
            ))}
          </>}
        </div>
        {/* Right col */}
        <div style={{ padding: '1rem 1.25rem' }}>
          {data.summary && <>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.4rem', color: '#111' }}>Summary</div>
            <p style={{ marginBottom: '0.75rem', lineHeight: 1.55, fontSize: '0.82rem' }}>{data.summary}</p>
          </>}
          {data.experience.some(e => e.title || e.company) && <>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#111' }}>Experience</div>
            {data.experience.filter(e => e.title || e.company).map((exp, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700 }}>{exp.title} {exp.company && <span style={{ fontWeight: 400 }}>at {exp.company}</span>}</div>
                <div style={{ color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.2rem' }}>{exp.duration}</div>
                <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>{exp.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ fontSize: '0.8rem', marginBottom: '0.1rem' }}>{b}</li>)}</ul>
              </div>
            ))}
          </>}
          {data.projects.some(p => p.name) && <>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', marginTop: '0.5rem', color: '#111' }}>Projects</div>
            {data.projects.filter(p => p.name).map((pr, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700 }}>{pr.name}</span>{pr.tech && <span style={{ color: '#6b7280', fontSize: '0.78rem' }}> · {pr.tech}</span>}
                {pr.description && <div style={{ fontSize: '0.8rem' }}>{pr.description}</div>}
              </div>
            ))}
          </>}
        </div>
      </div>
    </div>
  )
}
