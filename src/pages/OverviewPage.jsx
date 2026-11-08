import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Calendar, Check, Eye, GitBranch, Github, History, ListChecks, Play, RefreshCw, ScanSearch, Sparkles, Activity, Linkedin, Bookmark, Briefcase, FolderKanban } from 'lucide-react';
import { GH_USER, REPOS, langColor, repoById } from '../data/constants';
import { workspaceMetrics } from '../services/workspaceMetrics';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/brand/Logo';
import { AnimatedNumber, Badge, Button, Card, CardHeader, EmptyState } from '../components/common/ui';
import { greeting, timeAgo } from '../utils/format';
import { easeOut } from '../utils/motion';

export function OverviewPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { state, openModal, startAnalysis } = useApp();
  const connected = state.connected;
  const hasAnalysis = Boolean(state.analyzed && state.profile && state.stats);
  const profile = hasAnalysis ? state.profile : null;
  const stats = hasAnalysis ? state.stats : null;
  const hello = greeting();
  const first = GH_USER.name.split(' ')[0];
  const m = workspaceMetrics(state);
  const skills = profile
    ? profile.skills.slice().sort((a, b) => b.repoCount - a.repoCount).slice(0, 12)
    : [];

  const metrics = [
    {
      icon: GitBranch,
      value: m.selectedRepositories,
      label: 'Selected repositories',
      delta: m.connected ? `${m.selectedRepositories} of ${m.totalDemoRepositories} in this demo` : 'Connect GitHub to load repositories',
    },
    {
      icon: ScanSearch,
      value: m.analyzedRepositories,
      label: 'Analyzed repositories',
      delta: m.hasAnalysis ? `Completed ${timeAgo(state.analysisFinishedAt)}` : 'No analysis completed yet',
    },
    {
      icon: FolderKanban,
      value: m.trackedProjects,
      label: 'Tracked projects',
      delta: m.publishedProjects > 0 ? `${m.publishedProjects} published in lifecycle (demo)` : 'From your repository selection',
    },
    {
      icon: Sparkles,
      value: m.detectedSkills,
      label: 'Detected skills',
      delta: m.hasAnalysis ? `${m.programmingLanguages} programming languages detected` : 'Available after analysis',
    },
  ];

  const careerMetrics = [
    {
      icon: Activity,
      value: m.processedGithubEvents,
      label: 'GitHub events processed',
      delta: m.pendingGithubEvents ? `${m.pendingGithubEvents} pending in sync queue` : 'Process pending events on GitHub Activity',
    },
    {
      icon: Linkedin,
      value: m.linkedinDraftsPending,
      label: 'LinkedIn post drafts',
      delta: 'Pending approval — not published yet',
    },
    {
      icon: Check,
      value: m.linkedinPublishedPosts,
      label: 'Published posts (demo)',
      delta: 'Approved in LinkedIn Studio only',
    },
    {
      icon: Bookmark,
      value: m.savedJobs,
      label: 'Saved jobs',
      delta: 'Explicit Save to Tracker bookmarks',
    },
  ];

  const journeySteps = [
    { step: 1, label: 'Overview', to: '/', done: true },
    { step: 2, label: 'Repositories & analysis', to: '/repositories', done: m.hasAnalysis },
    { step: 3, label: 'GitHub Activity', to: '/activity', done: m.processedGithubEvents > 0 },
    { step: 4, label: 'LinkedIn Studio', to: '/linkedin', done: m.linkedinPublishedPosts > 0 },
    { step: 5, label: 'CV Builder', to: '/cv', done: Boolean(state.cvProfile?.personal?.name?.trim()) },
    { step: 6, label: 'Job matching', to: '/jobs', done: m.hasAnalysis },
    { step: 7, label: 'Saved Jobs', to: '/applications', done: m.savedJobs > 0 },
  ];

  const renderMetricGrid = (items, keyPrefix) => items.map((metric, index) => {
    const Icon = metric.icon;
    const border = ['border-b sm:border-r xl:border-b-0', 'border-b xl:border-r xl:border-b-0', 'border-b sm:border-r sm:border-b-0 xl:border-r xl:border-b-0', ''][index];
    return (
      <motion.article
        key={`${keyPrefix}-${metric.label}`}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: easeOut, delay: reduce ? 0 : index * 0.05 }}
        className={`border-line px-4 py-4 ${border}`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium text-muted">{metric.label}</span>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-brand-700">
            <Icon size={14} strokeWidth={2} />
          </span>
        </div>
        <div className="font-display mt-2 text-[30px] leading-none font-semibold tracking-[-0.04em]">
          <AnimatedNumber value={metric.value} />
        </div>
        <p className="mt-2 text-[11.5px] text-faint">{metric.delta}</p>
      </motion.article>
    );
  });

  return (
    <div className="grid min-w-0 gap-4">
      <section className="relative overflow-hidden rounded-xl border border-line bg-[linear-gradient(105deg,rgba(16,24,42,0.97)_0%,rgba(16,24,42,0.94)_38%,rgba(16,24,42,0.2)_74%,rgba(16,24,42,0.12)_100%)] shadow-[var(--shadow-card)] max-[900px]:bg-surface/92">
        <svg className="pointer-events-none absolute -right-8 bottom-0 h-44 w-[360px] opacity-70" viewBox="0 0 360 160" fill="none" aria-hidden="true">
          <path d="M10 130C80 90 120 150 190 100S300 30 360 70" stroke="#e0a36a" strokeWidth="1.4" />
          <path d="M20 145C100 110 150 160 220 120S320 60 370 90" stroke="#5b8def" strokeOpacity="0.7" strokeWidth="1.2" />
          <circle cx="190" cy="100" r="3" fill="#f0b27a" />
          <circle cx="300" cy="48" r="3" fill="#8eb4ff" />
        </svg>
        <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <div className="min-w-0 max-[900px]:rounded-lg max-[900px]:bg-surface/95">
            <Logo tone="onDark" />
            <span className="mt-3 mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-brand-700 uppercase">
              <i className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {connected ? 'GitHub connected' : 'Demo workspace'}
            </span>
            <h1 className="font-display max-w-3xl text-[28px] leading-[1.12] font-semibold tracking-[-0.03em] sm:text-[34px]">
              {hello}, <em className="text-brand-700 not-italic">{first}</em>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              {hasAnalysis
                ? `${stats.analyzed} repositories analysed · ${stats.languages} languages · ${stats.totalSkills} skills with supporting evidence. Re-run the analysis at any time.`
                : 'Choose the demo repositories you want included, then explore a locally generated skill profile. No real code is read or verified.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {!connected && (
                <>
                  <Button size="lg" icon={Github} onClick={() => openModal({ type: 'oauth' })}>Connect GitHub</Button>
                  <Button size="lg" variant="secondary" icon={Eye} onClick={() => navigate('/repositories')}>View demo data</Button>
                </>
              )}
              {connected && !hasAnalysis && (
                <>
                  <Button size="lg" icon={GitBranch} onClick={() => navigate('/repositories')}>{state.selected.length ? 'Continue to repository selection' : 'Select repositories'}</Button>
                  <Button size="lg" variant="secondary" icon={Sparkles} onClick={() => navigate('/skills')}>Developer skills</Button>
                </>
              )}
              {connected && hasAnalysis && (
                <>
                  <Button size="lg" icon={Sparkles} onClick={() => navigate('/skills')}>View skill profile</Button>
                  <Button size="lg" variant="secondary" icon={RefreshCw} onClick={startAnalysis}>Re-run analysis</Button>
                </>
              )}
            </div>
          </div>
          <aside className="rounded-lg bg-canvas px-4 py-3.5 lg:self-end">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy-900 text-sm font-semibold text-cyan-300">{GH_USER.avatarInitials}</span>
              <span className="min-w-0">
                <strong className="block truncate text-sm">{GH_USER.name}</strong>
                <span className="block truncate text-xs text-muted">@{GH_USER.login}</span>
              </span>
            </div>
            <p className="mt-3 text-[12.5px] text-muted">{GH_USER.company} · {GH_USER.location}</p>
            <p className="mt-1 text-[12.5px] text-faint">{REPOS.length} repositories in this demo</p>
          </aside>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)] sm:grid-cols-2 xl:grid-cols-4">
        {renderMetricGrid(metrics, 'core')}
      </section>

      <section>
        <CardHeader title="Career pipeline metrics" sub="Counts from your current demo workspace — not simulated totals" className="mb-2 px-1" />
        <div className="grid overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)] sm:grid-cols-2 xl:grid-cols-4">
          {renderMetricGrid(careerMetrics, 'career')}
        </div>
      </section>

      <Card className="min-w-0">
        <CardHeader title="Graduation demo path" sub="Follow these steps for the end-to-end presentation" action={<Button variant="ghost" size="sm" icon={Briefcase} onClick={() => openModal({ type: 'reset' })}>Reset demo data</Button>} />
        <ol className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:p-5">
          {journeySteps.map((item) => (
            <li key={item.step}>
              <button
                type="button"
                onClick={() => navigate(item.to)}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition hover:border-brand-500 ${item.done ? 'border-emerald-500/35 bg-emerald-950/10' : 'border-line bg-canvas/40'}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${item.done ? 'bg-emerald-600 text-white' : 'bg-white/10 text-muted'}`}>{item.step}</span>
                <span>
                  <strong className="block text-[13px]">{item.label}</strong>
                  <span className="text-[11.5px] text-faint">{item.done ? 'Ready / completed' : 'Next in the demo'}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader title="Developer skills preview" sub="Most prominent detected skills" action={<Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/skills')}>View all</Button>} />
          <div className="p-4 sm:p-5">
            {skills.length ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button key={skill.name} type="button" onClick={() => navigate('/skills')} className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] font-medium transition hover:border-brand-600 hover:bg-brand-50">
                      <i className="h-1.5 w-1.5 rounded-full" style={{ background: langColor(skill.category === 'languages' ? skill.name : '#38BDF8') }} />
                      {skill.name}
                      <span className="text-[11px] font-bold text-brand-700">{skill.repoCount}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-[12.5px] text-faint">Numbers show in how many of your <strong className="text-muted">{state.stats.analyzed} analysed repositories</strong> each skill was detected.</p>
              </>
            ) : (
              <EmptyState icon={Sparkles} title="No skill profile yet" text="Complete the initial analysis and your detected skills will be summarised here with repository evidence." />
            )}
          </div>
        </Card>
        <Card className="min-w-0">
          <CardHeader title="Recent analysis activity" sub="Recently analysed repositories" />
          {state.activity.length ? (
            <ul>
              {state.activity.slice(0, 6).map((item) => {
                const repo = repoById(item.repoId);
                if (!repo) return null;
                return (
                  <li key={`${item.repoId}-${item.date}`} className="grid gap-2 border-t border-line px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-white" style={{ background: langColor(repo.language) }}><GitBranch size={14} /></span>
                        <span className="min-w-0">
                          <strong className="block truncate text-[13.5px]">{repo.name}</strong>
                          <span className="font-mono text-[11.5px] text-faint">{repo.visibility} · {repo.language}</span>
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1 pl-9">
                        {repo.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded-md bg-canvas px-2 py-0.5 text-[11.5px] text-muted">{skill}</span>)}
                        {repo.skills.length > 3 && <span className="rounded-md bg-canvas px-2 py-0.5 text-[11.5px] text-muted">+{repo.skills.length - 3}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 pl-9 sm:flex-col sm:items-end sm:pl-0">
                      <span className="inline-flex items-center gap-1 text-[12px] whitespace-nowrap text-muted"><Calendar size={13} />{item.dateLabel}</span>
                      {item.status === 'complete' ? <Badge tone="green" icon={Check}>Analyzed</Badge> : <Badge tone="amber">In progress</Badge>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-3.5">
              <EmptyState icon={History} title="No analysis activity" text="Analysed repositories appear here with their main technologies and analysis date." />
            </div>
          )}
        </Card>
      </div>

      {!connected && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-line bg-surface p-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700"><Github size={22} /></span>
          <div className="min-w-[220px] flex-1">
            <h3 className="text-[15.5px] font-semibold">Connect your GitHub account</h3>
            <p className="mt-1 max-w-xl text-[13px] text-muted">Code2Career reads your public and private repositories to detect the technologies you genuinely use. You stay in control — you choose exactly which repositories get analysed.</p>
          </div>
          <Button icon={Github} onClick={() => openModal({ type: 'oauth' })}>Connect GitHub</Button>
        </div>
      )}
      {connected && !state.analyzed && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-100 text-brand-700"><ListChecks size={22} /></span>
          <div className="min-w-[220px] flex-1">
            <h3 className="text-[15.5px] font-semibold">{state.selected.length ? `${state.selected.length} repositor${state.selected.length === 1 ? 'y' : 'ies'} selected — ready for initial analysis` : 'Select the repositories to analyse'}</h3>
            <p className="mt-1 max-w-xl text-[13px] text-muted">{state.selected.length ? 'Run the initial analysis to extract languages, frameworks, tools and an evidence-based skill profile from your selection.' : 'Nothing is analysed automatically. Open the repository selector and choose the projects that best represent your technical work.'}</p>
          </div>
          <Button icon={GitBranch} onClick={() => navigate('/repositories')}>{state.selected.length ? 'Review selection' : 'Choose repositories'}</Button>
          {state.selected.length > 0 && <Button variant="secondary" icon={Play} onClick={() => startAnalysis()}>Run analysis</Button>}
        </div>
      )}
    </div>
  );
}
