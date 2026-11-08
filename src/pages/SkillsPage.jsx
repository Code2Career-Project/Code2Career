import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { easeOut } from '../utils/motion';
import { BadgeCheck, Clock, CodeXml, FileSearch, Folder, GitBranch, Github, Play, RefreshCw, ScanSearch, ShieldCheck, Sparkles, Code2, LayoutTemplate, Server, Database, Container } from 'lucide-react';
import { CATEGORIES, EVIDENCE_META, repoById } from '../data/constants';
import { useApp } from '../context/AppContext';
import { Button, Card, EmptyState, StatCard } from '../components/common/ui';
import { cx, timeAgo } from '../utils/format';

const CATEGORY_ICONS = { 'code-2': Code2, 'layout-template': LayoutTemplate, server: Server, database: Database, container: Container };
const EVIDENCE_ICONS = { detected: FileSearch, verified: ShieldCheck, demonstrated: BadgeCheck };
const EVIDENCE_CLASS = {
  detected: 'bg-[#f3ece3] text-[#5c5146]',
  verified: 'bg-brand-100 text-brand-700',
  demonstrated: 'bg-[#e7f3ea] text-[#1f6b45]',
};
const EVIDENCE_RAIL = {
  detected: 'bg-[#cfc3b4]',
  verified: 'bg-brand-600',
  demonstrated: 'bg-[#1f6b45]',
};

export function SkillsPage() {
  const navigate = useNavigate();
  const { state, openModal, startAnalysis } = useApp();
  const compact = state.settings.compactSkillCards;
  const reduce = useReducedMotion();

  if (!state.connected) {
    return (
      <Card>
        <EmptyState icon={Github} title="GitHub account not connected" text="Connect GitHub and run an initial analysis to generate your Developer Skill Profile." action={<Button icon={Github} onClick={() => openModal({ type: 'oauth' })}>Connect GitHub</Button>} />
      </Card>
    );
  }

  if (!state.analyzed || !state.profile) {
    return (
      <Card>
        <EmptyState
          icon={ScanSearch}
          title="No skill profile yet"
          text={state.selected.length ? `You have ${state.selected.length} repositories selected. Run the initial analysis to extract your skill profile.` : 'Select the repositories you want analysed, then run the initial analysis to extract your skill profile.'}
          action={<Button icon={state.selected.length ? Play : GitBranch} onClick={() => (state.selected.length ? startAnalysis() : navigate('/repositories'))}>{state.selected.length ? 'Run initial analysis' : 'Select repositories'}</Button>}
        />
      </Card>
    );
  }

  const profile = state.profile;
  const maxCount = profile.skills.reduce((max, skill) => Math.max(max, skill.repoCount), 1);

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} icon={GitBranch} accent value={profile.stats.analyzed} label="Analysed repositories" delta="Scope of the generated profile" />
        <StatCard index={1} icon={CodeXml} value={profile.stats.languages} label="Programming languages" delta="Detected across selected repositories" />
        <StatCard index={2} icon={Sparkles} value={profile.stats.totalSkills} label="Technical skills" delta="With supporting repository evidence" />
        <StatCard index={3} icon={BadgeCheck} value={profile.stats.evidence.demonstrated} label="Demonstrated skills" delta={`${profile.stats.evidence.verified} verified · ${profile.stats.evidence.detected} detected`} />
      </div>

      <div className="mb-5 flex gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-brand-700" />
        <div>
          <h4 className="text-[13.5px] font-semibold text-ink">How to read this profile</h4>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            All evidence levels are <strong>simulated demo data</strong>; no files or source code were actually inspected. Labels illustrate what a future real analysis could report.
            <strong> Detected</strong> — the technology appears in project files. <strong> Verified</strong> — actual usage was found in source code.
            <strong> Demonstrated</strong> — meaningful or repeated usage was found in the codebase.
            Repository analysis demonstrates technical usage, but it does not automatically prove complete professional mastery of a technology.
            No Beginner / Intermediate / Expert proficiency rating is assigned.
          </p>
        </div>
      </div>

      <Card className="mb-5">
        <div className="flex flex-wrap gap-3.5 p-3.5">
          {Object.entries(EVIDENCE_META).map(([key, meta]) => {
            const Icon = EVIDENCE_ICONS[key];
            return (
              <div key={key} className="flex min-w-[210px] flex-1 items-start gap-2">
                <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', EVIDENCE_CLASS[key])}><Icon size={11} />{meta.label}</span>
                <span className="text-[12.5px] text-muted">{meta.desc}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {CATEGORIES.map((category) => {
        const list = profile.skills.filter((skill) => skill.category === category.key);
        if (!list.length) return null;
        const Icon = CATEGORY_ICONS[category.icon] || Sparkles;
        return (
          <section key={category.key} className="mb-6">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand-100 text-brand-700"><Icon size={16} /></span>
              <h3 className="font-display text-[18px] font-semibold tracking-[-0.02em]">{category.label}</h3>
              <span className="text-xs text-faint">{list.length} skill{list.length === 1 ? '' : 's'}</span>
            </div>
            <div className={cx('grid gap-3', compact ? 'sm:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-3')}>
              {list.map((skill, index) => {
                const meta = EVIDENCE_META[skill.evidence];
                const EvIcon = EVIDENCE_ICONS[skill.evidence];
                return (
                  <motion.article
                    key={skill.name}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: easeOut, delay: reduce ? 0 : Math.min(index, 8) * 0.03 }}
                    className={cx('relative overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-brand-500', compact ? 'p-3' : 'p-4')}
                  >
                    <span className={cx('absolute inset-x-0 top-0 h-[3px]', EVIDENCE_RAIL[skill.evidence])} />
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1 text-sm font-semibold">
                        {skill.name}
                        {skill.subcategory && <span className="mt-0.5 block text-[11.5px] font-medium text-faint">{skill.subcategory}</span>}
                      </div>
                      <span title={meta.desc} className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', EVIDENCE_CLASS[skill.evidence])}><EvIcon size={11} />{meta.label}</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-brand-600 transition-[width] duration-500" style={{ width: `${Math.round((skill.repoCount / maxCount) * 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold whitespace-nowrap text-faint">{skill.repoCount} repo{skill.repoCount === 1 ? '' : 's'}</span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {skill.repos.map((id) => {
                        const repo = repoById(id);
                        return <span key={id} title={repo?.name || id} className="max-w-full truncate rounded-md bg-white/8 px-2 py-0.5 font-mono text-[11px] text-muted">{repo?.name || id}</span>;
                      })}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-line pt-2.5 text-[11.5px] text-faint">
                      <span className="inline-flex items-center gap-1"><Clock size={12} />Detected {timeAgo(skill.lastDetected)}</span>
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      <span className="inline-flex items-center gap-1"><Folder size={12} />{skill.repos.length} source{skill.repos.length === 1 ? '' : 's'}</span>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        );
      })}

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-[240px] flex-1">
            <h3 className="text-sm font-semibold">Profile metadata</h3>
            <p className="mt-1 text-[12.5px] text-muted">
              Generated {timeAgo(profile.generatedAt)} from {profile.stats.analyzed} selected repositories · {profile.stats.avgTechPerRepo} technologies detected per repository on average · {profile.stats.totalStars} combined stars.
            </p>
          </div>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => startAnalysis(true)}>Re-run analysis</Button>
          <Button size="sm" variant="secondary" icon={GitBranch} onClick={() => navigate('/repositories')}>Change repository selection</Button>
        </div>
      </Card>
    </div>
  );
}
