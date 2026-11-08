import { useNavigate } from 'react-router-dom';
import { Check, GitBranch, Info, LayoutDashboard, Sparkles } from 'lucide-react';
import { ANALYSIS_STEPS, langColor } from '../data/constants';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/ui';
import { cx } from '../utils/format';

export function AnalysisPage() {
  const navigate = useNavigate();
  const { state, analysis } = useApp();
  const running = analysis && analysis.phase !== 'complete';

  if (!running && state.analyzed && state.stats) {
    const stats = state.stats;
    return (
      <div className="mx-auto max-w-[880px]">
        <section className="mb-4 rounded-xl border border-line bg-surface px-6 py-10 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 grid h-[76px] w-[76px] place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-500">
            <Check size={36} strokeWidth={2.2} />
          </div>
          <h2 className="font-display text-[26px] font-semibold tracking-[-0.03em]">Initial analysis complete</h2>
          <p className="mx-auto mt-2 max-w-lg text-[13.5px] text-muted">
            Your Developer Skill Profile has been generated from {stats.analyzed} selected repositor{stats.analyzed === 1 ? 'y' : 'ies'}. Every skill below is backed by repository evidence — no proficiency scores are inferred.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              [stats.analyzed, 'Repositories analysed'],
              [stats.languages, 'Programming languages'],
              [stats.totalSkills, 'Technical skills'],
              [stats.evidence.demonstrated, 'Demonstrated skills'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-line bg-canvas px-3 py-3">
                <div className="font-display text-[24px] font-semibold tracking-[-0.03em] text-brand-700">{value}</div>
                <div className="text-[11.5px] text-muted">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Button size="lg" icon={Sparkles} onClick={() => navigate('/skills')}>View Developer Skill Profile</Button>
            <Button size="lg" variant="secondary" icon={LayoutDashboard} onClick={() => navigate('/')}>Back to overview</Button>
            <Button size="lg" variant="ghost" icon={GitBranch} onClick={() => navigate('/repositories')}>Change selection</Button>
          </div>
        </section>
        <div className="flex gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
          <Info size={19} className="mt-0.5 shrink-0 text-brand-700" />
          <div>
            <h4 className="text-[13.5px] font-semibold text-ink">What this analysis does</h4>
            <p className="mt-1 text-[13px] text-muted">This simulated scan inspected repository structure, dependency manifests and source patterns for your selected repositories. It demonstrates technical usage in those codebases. Repository analysis does not automatically prove complete professional mastery of a technology.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!running) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h2 className="text-xl font-bold">No analysis is running</h2>
        <p className="mt-2 text-sm text-muted">Select repositories and start the local analysis from the repository workspace.</p>
        <Button className="mt-5" onClick={() => navigate('/repositories')}>Go to repositories</Button>
      </div>
    );
  }

  const repo = analysis.repo;
  const stepIdx = analysis.stepIdx;
  return (
    <div className="mx-auto max-w-[880px]">
      <div className="mb-5 text-center">
        <h2 className="font-display text-[26px] font-semibold tracking-[-0.03em]">Analysing selected repositories</h2>
        <p className="mt-1.5 text-[13.5px] text-muted">A local simulation of structure, language, framework and skill extraction.</p>
      </div>
      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="border-b border-line bg-brand-50 px-5 py-6 sm:px-7">
          <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-display text-[34px] leading-none font-semibold tracking-[-0.03em] text-brand-700 tabular-nums">{analysis.pct}%</div>
              <div className="mt-1 text-[12.5px] text-muted">{repo ? `Step ${Math.min(stepIdx + 1, 6)} of 6 · ${repo.name}` : 'Preparing analysis workspace…'}</div>
            </div>
            <div className="text-right">
              <div className="text-[19px] font-bold">{analysis.completed} / {analysis.repos.length}</div>
              <div className="text-xs text-muted">repositories completed</div>
            </div>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="prog-sheen h-full rounded-full bg-brand-600 transition-[width] duration-500" style={{ width: `${analysis.pct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-[12.5px] text-muted">
            <span>Current: <b className="text-ink">{repo?.name || '—'}</b></span>
            <span>Step: <b className="text-ink">{analysis.badge || '—'}</b></span>
            <span>Remaining: <b className="text-ink">{analysis.remaining}</b></span>
          </div>
        </div>
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-7">
          <div className="relative grid h-10 w-10 place-items-center rounded-[10px] text-white" style={{ background: langColor(repo?.language) }}>
            <span className="ping-ring absolute inset-0 rounded-[10px] border-2 border-brand-500" />
            <GitBranch size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold tracking-[0.08em] text-faint uppercase">Currently analysing</div>
            <strong className="block truncate font-mono text-[15px]">{repo?.name || 'Preparing…'}</strong>
          </div>
          <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11.5px] font-semibold text-brand-700">{analysis.badge}</span>
        </div>
        <div className="py-2">
          {ANALYSIS_STEPS.map((step, index) => {
            const done = index < stepIdx;
            const active = index === stepIdx;
            return (
              <div key={step.key} className={cx('relative flex items-start gap-3 px-5 py-2.5 sm:px-7', !done && !active && 'opacity-55')}>
                {index < ANALYSIS_STEPS.length - 1 && <span className={cx('absolute top-8 bottom-[-10px] left-[30px] w-px sm:left-[38px]', done ? 'bg-emerald-200' : 'bg-line')} />}
                <span className={cx('relative z-[1] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border text-[10.5px] font-bold', done && 'border-emerald-600 bg-emerald-600 text-white', active && 'border-brand-600 bg-brand-600 text-white shadow-[0_0_0_4px_rgba(156,67,24,0.18)]', !done && !active && 'border-line bg-surface text-faint')}>
                  {done ? <Check size={12} strokeWidth={3} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className={cx('block text-[13.5px]', active ? 'font-semibold text-ink' : 'font-medium text-muted')}>{step.label}</strong>
                  <span className="block text-xs text-faint">{step.desc}</span>
                </span>
                <span className="pt-0.5 text-[11.5px] text-faint tabular-nums">{analysis.stepTimes[index] || ''}</span>
              </div>
            );
          })}
        </div>
        <div className="max-h-[130px] overflow-y-auto border-t border-line bg-white/5 px-5 py-3 font-mono text-xs text-muted sm:px-7">
          {analysis.logs.map((line, index) => (
            <div key={`${line.ts}-${index}`} className="flex gap-2 py-0.5">
              <span className="shrink-0 text-faint">{line.ts}</span>
              <span className={line.kind === 'ok' ? 'text-emerald-600' : 'text-brand-700'}>{line.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
