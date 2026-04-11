/**
 * Document templates — data-driven.
 * Adding a new template = adding one object here, zero code changes.
 * Each section is either 'locked' (static heading) or 'field' (user fills in).
 */

export const DOC_TEMPLATES = [
  // ─── CV / Resume ────────────────────────────────────────────────
  {
    id: 'cv',
    name: 'CV / Resume',
    icon: '📋',
    description: 'Professional resume for job applications',
    color: '#3b82f6',
    sections: [
      { type: 'locked', text: 'Personal Information' },
      { type: 'field', id: 'fullName',    label: 'Full Name',         placeholder: 'Muhammad Ali Khan',     inputType: 'text' },
      { type: 'field', id: 'email',       label: 'Email',             placeholder: 'ali@example.com',       inputType: 'text' },
      { type: 'field', id: 'phone',       label: 'Phone',             placeholder: '+92 300 1234567',       inputType: 'text' },
      { type: 'field', id: 'city',        label: 'City / Location',   placeholder: 'Lahore, Pakistan',      inputType: 'text' },
      { type: 'field', id: 'linkedin',    label: 'LinkedIn / Portfolio', placeholder: 'linkedin.com/in/ali', inputType: 'text' },

      { type: 'locked', text: 'Professional Summary' },
      { type: 'field', id: 'summary',     label: 'Summary',           placeholder: 'Results-driven professional with X years of experience in…', inputType: 'textarea', rows: 4, voice: true },

      { type: 'locked', text: 'Work Experience' },
      { type: 'field', id: 'exp1Title',   label: 'Job Title',         placeholder: 'Senior Developer',      inputType: 'text' },
      { type: 'field', id: 'exp1Company', label: 'Company',           placeholder: 'ABC Technologies',      inputType: 'text' },
      { type: 'field', id: 'exp1Period',  label: 'Period',            placeholder: 'Jan 2021 – Present',    inputType: 'text' },
      { type: 'field', id: 'exp1Desc',    label: 'Key Responsibilities', placeholder: '• Led team of 5 developers\n• Reduced load time by 40%\n• Delivered 15 client projects', inputType: 'textarea', rows: 4, voice: true },

      { type: 'locked', text: 'Education' },
      { type: 'field', id: 'eduDegree',   label: 'Degree',            placeholder: 'BSc Computer Science',  inputType: 'text' },
      { type: 'field', id: 'eduSchool',   label: 'Institution',       placeholder: 'University of Engineering, Lahore', inputType: 'text' },
      { type: 'field', id: 'eduYear',     label: 'Year',              placeholder: '2019',                  inputType: 'text' },

      { type: 'locked', text: 'Skills' },
      { type: 'field', id: 'skills',      label: 'Skills (comma separated)', placeholder: 'JavaScript, React, Node.js, Python, SQL, Git', inputType: 'textarea', rows: 2 },

      { type: 'locked', text: 'Languages' },
      { type: 'field', id: 'languages',   label: 'Languages',         placeholder: 'Urdu (Native), English (Fluent)', inputType: 'text' },
    ],
  },

  // ─── Cover Letter ────────────────────────────────────────────────
  {
    id: 'cover-letter',
    name: 'Cover Letter',
    icon: '✉️',
    description: 'Professional cover letter for job applications',
    color: '#10b981',
    sections: [
      { type: 'locked', text: 'Your Details' },
      { type: 'field', id: 'yourName',    label: 'Your Name',         placeholder: 'Muhammad Ali Khan',     inputType: 'text' },
      { type: 'field', id: 'yourEmail',   label: 'Your Email',        placeholder: 'ali@example.com',       inputType: 'text' },
      { type: 'field', id: 'date',        label: 'Date',              placeholder: 'April 11, 2026',        inputType: 'text' },

      { type: 'locked', text: 'Employer Details' },
      { type: 'field', id: 'hiringMgr',   label: 'Hiring Manager Name', placeholder: 'Mr. Ahmed Hassan',   inputType: 'text' },
      { type: 'field', id: 'companyName', label: 'Company Name',      placeholder: 'XYZ Solutions',         inputType: 'text' },
      { type: 'field', id: 'companyCity', label: 'Company City',      placeholder: 'Karachi, Pakistan',     inputType: 'text' },

      { type: 'locked', text: 'Letter Content' },
      { type: 'field', id: 'jobTitle',    label: 'Position Applied For', placeholder: 'Senior Software Engineer', inputType: 'text' },
      { type: 'field', id: 'opening',     label: 'Opening Paragraph', placeholder: 'I am writing to express my interest in the [Position] role at [Company]. With X years of experience in…', inputType: 'textarea', rows: 4, voice: true },
      { type: 'field', id: 'body',        label: 'Why You & Why Them', placeholder: 'My background in [skill] and proven track record of [achievement] make me an ideal candidate. I am particularly drawn to your company because…', inputType: 'textarea', rows: 5, voice: true },
      { type: 'field', id: 'closing',     label: 'Closing Paragraph', placeholder: 'I look forward to discussing how my skills align with your team\'s goals. Please feel free to contact me at your convenience.', inputType: 'textarea', rows: 3, voice: true },
    ],
  },

  // ─── Professional Email ──────────────────────────────────────────
  {
    id: 'email',
    name: 'Professional Email',
    icon: '📧',
    description: 'Formal email for clients, bosses, or partners',
    color: '#f59e0b',
    sections: [
      { type: 'locked', text: 'Email Details' },
      { type: 'field', id: 'to',          label: 'To',                placeholder: 'client@company.com',    inputType: 'text' },
      { type: 'field', id: 'subject',     label: 'Subject',           placeholder: 'Follow-up: Project Proposal',  inputType: 'text' },

      { type: 'locked', text: 'Content' },
      { type: 'field', id: 'greeting',    label: 'Greeting',          placeholder: 'Dear Mr. Hassan,',      inputType: 'text' },
      { type: 'field', id: 'mainBody',    label: 'Main Message',      placeholder: 'I hope this email finds you well. I am writing to follow up on our discussion regarding…', inputType: 'textarea', rows: 6, voice: true },
      { type: 'field', id: 'cta',         label: 'Call to Action',    placeholder: 'Please let me know if you are available for a call this week to discuss further.', inputType: 'textarea', rows: 2, voice: true },
      { type: 'field', id: 'signoff',     label: 'Sign-off',          placeholder: 'Best regards,\nMuhammad Ali\n+92 300 1234567', inputType: 'textarea', rows: 3 },
    ],
  },

  // ─── Freelance Invoice ───────────────────────────────────────────
  {
    id: 'invoice',
    name: 'Freelance Invoice',
    icon: '🧾',
    description: 'Simple invoice for freelance work',
    color: '#8b5cf6',
    sections: [
      { type: 'locked', text: 'Your Business' },
      { type: 'field', id: 'bizName',     label: 'Your Name / Business', placeholder: 'Ali Khan Freelance Services', inputType: 'text' },
      { type: 'field', id: 'bizEmail',    label: 'Your Email',         placeholder: 'ali@example.com',       inputType: 'text' },
      { type: 'field', id: 'bizPhone',    label: 'Your Phone',         placeholder: '+92 300 1234567',       inputType: 'text' },

      { type: 'locked', text: 'Client Details' },
      { type: 'field', id: 'clientName',  label: 'Client Name',        placeholder: 'ABC Company',           inputType: 'text' },
      { type: 'field', id: 'clientEmail', label: 'Client Email',       placeholder: 'billing@abccompany.com',inputType: 'text' },

      { type: 'locked', text: 'Invoice Details' },
      { type: 'field', id: 'invoiceNo',   label: 'Invoice #',          placeholder: 'INV-2026-001',          inputType: 'text' },
      { type: 'field', id: 'invoiceDate', label: 'Invoice Date',       placeholder: 'April 11, 2026',        inputType: 'text' },
      { type: 'field', id: 'dueDate',     label: 'Due Date',           placeholder: 'April 25, 2026',        inputType: 'text' },

      { type: 'locked', text: 'Services' },
      { type: 'field', id: 'services',    label: 'Services Provided',  placeholder: '• Website Development (React) — PKR 50,000\n• Logo Design — PKR 10,000\n• SEO Setup — PKR 8,000', inputType: 'textarea', rows: 5 },
      { type: 'field', id: 'total',       label: 'Total Amount',       placeholder: 'PKR 68,000',            inputType: 'text' },
      { type: 'field', id: 'paymentInfo', label: 'Payment Instructions', placeholder: 'Bank: HBL\nAccount: 0123456789\nTitle: Muhammad Ali Khan', inputType: 'textarea', rows: 3 },
      { type: 'field', id: 'notes',       label: 'Notes (optional)',   placeholder: 'Payment due within 14 days. Thank you for your business!', inputType: 'textarea', rows: 2 },
    ],
  },
]

export function getTemplateById(id) {
  return DOC_TEMPLATES.find((t) => t.id === id) || null
}
