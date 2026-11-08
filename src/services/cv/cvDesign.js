export const CV_TEMPLATE_IDS = ['classic', 'modern', 'minimal-image', 'minimal', 'sidebar'];

export const CV_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column layout with elegant separators. Best for ATS-friendly applications.',
    atsRecommended: true,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Full-width accent header with name and contact details. Strong visual identity.',
    atsRecommended: false,
  },
  {
    id: 'minimal-image',
    name: 'Minimal Image',
    description: 'Clean layout with optional profile photo. Photo is never generated automatically.',
    atsRecommended: false,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Compact single-column CV with minimal decoration. Optimized for readability and ATS.',
    atsRecommended: true,
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Two-column layout with accent sidebar. Some ATS parsers may misread column order.',
    atsRecommended: false,
    multiColumnWarning: true,
  },
];

export const CV_ACCENT_PRESETS = {
  blue: '#2563eb',
  indigo: '#4f46e5',
  purple: '#7c3aed',
  green: '#059669',
  red: '#dc2626',
  orange: '#ea580c',
  teal: '#0d9488',
  pink: '#db2777',
  grey: '#475569',
  black: '#0f172a',
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHexColor(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!HEX.test(trimmed)) return '';
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function defaultCvDesign() {
  return { templateId: 'modern', accentPreset: 'blue', accentCustom: '' };
}

export function normalizeCvDesign(raw) {
  const base = defaultCvDesign();
  if (!raw || typeof raw !== 'object') return base;
  if (CV_TEMPLATE_IDS.includes(raw.templateId)) base.templateId = raw.templateId;
  const custom = normalizeHexColor(raw.accentCustom);
  if (raw.accentPreset === 'custom' && custom) {
    base.accentPreset = 'custom';
    base.accentCustom = custom;
    return base;
  }
  if (Object.prototype.hasOwnProperty.call(CV_ACCENT_PRESETS, raw.accentPreset)) {
    base.accentPreset = raw.accentPreset;
    base.accentCustom = '';
  }
  if (custom && !Object.prototype.hasOwnProperty.call(CV_ACCENT_PRESETS, raw.accentPreset)) {
    base.accentPreset = 'custom';
    base.accentCustom = custom;
  }
  return base;
}

export function resolveAccentColor(design) {
  const normalized = normalizeCvDesign(design);
  if (normalized.accentPreset === 'custom') {
    return normalized.accentCustom || CV_ACCENT_PRESETS.blue;
  }
  return CV_ACCENT_PRESETS[normalized.accentPreset] || CV_ACCENT_PRESETS.blue;
}

function luminance(hex) {
  const c = normalizeHexColor(hex).slice(1);
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function textOnAccent(hex) {
  return luminance(hex) > 0.45 ? '#0f172a' : '#f8fafc';
}

export function accentSoft(hex, alpha = 0.12) {
  const c = normalizeHexColor(hex).slice(1);
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function templateMeta(id) {
  return CV_TEMPLATES.find((t) => t.id === id) || CV_TEMPLATES[1];
}
