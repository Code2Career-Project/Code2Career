import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, LayoutTemplate, Palette } from 'lucide-react';
import {
  CV_ACCENT_PRESETS,
  CV_TEMPLATES,
  normalizeHexColor,
  resolveAccentColor,
  templateMeta,
} from '../../services/cv/cvDesign';
import { cx } from '../../utils/format';

function TemplateThumb({ id, accent }) {
  const base = 'rounded border border-[#e6dcd0] bg-[#fffcf8] overflow-hidden h-[72px] w-full';
  if (id === 'modern') {
    return (
      <div className={base}>
        <div className="h-[22px]" style={{ background: accent }} />
        <div className="space-y-1 p-1.5">
          <div className="h-1 w-2/3 rounded bg-[#ddd]" />
          <div className="h-1 w-full rounded bg-[#eee]" />
        </div>
      </div>
    );
  }
  if (id === 'sidebar') {
    return (
      <div className={`${base} flex`}>
        <div className="w-[30%]" style={{ background: accent }} />
        <div className="flex-1 space-y-1 p-1">
          <div className="h-1 w-2/3 rounded bg-[#ddd]" />
          <div className="h-1 w-full rounded bg-[#eee]" />
        </div>
      </div>
    );
  }
  if (id === 'minimal-image') {
    return (
      <div className={`${base} flex gap-1 p-1.5`}>
        <div className="h-8 w-8 shrink-0 rounded-full bg-[#ddd]" />
        <div className="flex-1 space-y-1">
          <div className="h-1 w-2/3 rounded bg-[#ccc]" />
          <div className="h-1 w-full rounded bg-[#eee]" />
        </div>
      </div>
    );
  }
  return (
    <div className={`${base} p-1.5 space-y-1`}>
      <div className="h-1.5 w-1/2 rounded" style={{ background: accent }} />
      <div className="h-1 w-full rounded bg-[#eee]" />
      <div className="h-1 w-5/6 rounded bg-[#eee]" />
    </div>
  );
}

export function CvDesignToolbar({ design, onDesignChange }) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const wrapRef = useRef(null);
  const accent = resolveAccentColor(design);
  const currentTemplate = templateMeta(design.templateId);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setTemplateOpen(false);
        setColorOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const setTemplate = (templateId) => {
    onDesignChange({ ...design, templateId });
    setTemplateOpen(false);
  };

  const setPreset = (accentPreset) => {
    onDesignChange({ templateId: design.templateId, accentPreset, accentCustom: '' });
  };

  const setCustom = (value) => {
    const hex = normalizeHexColor(value);
    if (!hex) return;
    onDesignChange({ ...design, accentPreset: 'custom', accentCustom: hex });
  };

  const presetLabel = design.accentPreset === 'custom'
    ? 'Custom'
    : design.accentPreset.charAt(0).toUpperCase() + design.accentPreset.slice(1);

  return (
    <div ref={wrapRef} className="no-print mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative">
        <button
          type="button"
          className="inline-flex h-10 min-w-[140px] items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-ink shadow-sm hover:border-brand-500"
          onClick={() => { setColorOpen(false); setTemplateOpen(!templateOpen); }}
        >
          <span className="inline-flex items-center gap-2">
            <LayoutTemplate size={16} className="text-brand-700" />
            Template
          </span>
          <ChevronDown size={14} className="text-muted" />
        </button>
        {templateOpen && (
          <div className="absolute left-0 z-50 mt-2 w-[min(92vw,420px)] rounded-xl border border-line bg-surface p-3 shadow-[var(--shadow-card)]">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Choose layout</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CV_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplate(tpl.id)}
                  className={cx(
                    'rounded-lg border p-2 text-left transition hover:border-brand-500',
                    design.templateId === tpl.id ? 'border-brand-600 ring-1 ring-brand-500/40' : 'border-line',
                  )}
                >
                  <TemplateThumb id={tpl.id} accent={accent} />
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-[13px]">{tpl.name}</strong>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted">{tpl.description}</p>
                    </div>
                    {design.templateId === tpl.id && <Check size={16} className="shrink-0 text-brand-700" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          className="inline-flex h-10 min-w-[140px] items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-ink shadow-sm hover:border-brand-500"
          onClick={() => { setTemplateOpen(false); setColorOpen(!colorOpen); }}
        >
          <span className="inline-flex items-center gap-2">
            <Palette size={16} className="text-brand-700" />
            Accent color
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-4 w-4 rounded-full border border-line" style={{ background: accent }} />
            <ChevronDown size={14} className="text-muted" />
          </span>
        </button>
        {colorOpen && (
          <div className="absolute left-0 z-50 mt-2 w-[min(92vw,320px)] rounded-xl border border-line bg-surface p-3 shadow-[var(--shadow-card)]">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Preset colors</p>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(CV_ACCENT_PRESETS).map(([key, hex]) => (
                <button
                  key={key}
                  type="button"
                  title={key}
                  aria-label={key}
                  onClick={() => setPreset(key)}
                  className={cx(
                    'flex flex-col items-center gap-1 rounded-lg p-1.5 text-[10px] capitalize hover:bg-white/8',
                    design.accentPreset === key && 'ring-1 ring-brand-500',
                  )}
                >
                  <span className="h-7 w-7 rounded-full border border-line" style={{ background: hex }} />
                  {key}
                </button>
              ))}
            </div>
            <label className="mt-3 grid gap-1.5 text-[12px] font-semibold text-muted">
              Custom color
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.accentPreset === 'custom' ? design.accentCustom : accent}
                  onChange={(e) => setCustom(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-line bg-surface"
                />
                <input
                  type="text"
                  placeholder="#2563eb"
                  defaultValue={design.accentCustom}
                  onBlur={(e) => setCustom(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-line bg-canvas px-2 text-[13px] text-ink"
                />
              </div>
            </label>
          </div>
        )}
      </div>

      <span className="text-[12px] text-muted sm:ml-auto">
        {currentTemplate.name}
        {' · '}
        {presetLabel}
        {currentTemplate.multiColumnWarning && ' · Multi-column ATS note applies'}
      </span>
    </div>
  );
}
