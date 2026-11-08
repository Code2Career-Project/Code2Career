import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Github, GitBranch, Info, Linkedin, Play, Search, Sparkles, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { GH_USER, REPOS, uniqueLanguages } from '../../data/constants';
import { STORAGE_KEY } from '../../services/storage';
import { Logo } from '../brand/Logo';
import { Button } from '../common/ui';
import { RepoRow } from '../repositories/RepoRow';
import { CvDocument } from '../cv/CvDocument';
import { useApp } from '../../context/AppContext';
import { filteredRepos } from '../../utils/repos';
import { cx, formatDate } from '../../utils/format';
import { LINKEDIN_DEMO_USER, REJECTION_REASONS, linkedinAccountLabel, postPreviewText } from '../../services/linkedin';

function Frame({ title, sub, icon: Icon, wide = false, children, footer, onClose, iconClass = 'bg-navy-900 text-white' }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/50 p-4"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className={cx('flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)]', wide ? 'max-w-[900px]' : 'max-w-[560px]')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          {Icon && <div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', iconClass)}><Icon size={20} /></div>}
          <div className="min-w-0">
            <h3 className="text-base font-semibold">{title}</h3>
            {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
          </div>
          <button type="button" className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-faint hover:bg-white/8 hover:text-ink" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center gap-3 border-t border-line bg-canvas px-5 py-3.5">{footer}</div>}
      </motion.div>
    </motion.div>
  );
}

function OAuthModal() {
  const { closeModal, connectGithub } = useApp();
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  return (
    <Frame title="Connect GitHub account" sub="Simulated authorization — no real GitHub API is contacted." icon={Github} onClose={closeModal} footer={(
      <>
        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        <div className="ml-auto" />
        <Button icon={busy ? undefined : Check} disabled={busy} onClick={() => {
          if (started.current) return;
          started.current = true;
          setBusy(true);
          setTimeout(connectGithub, 1100);
        }}
        >
          {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {busy ? 'Authorizing…' : 'Authorize Code2Career'}
        </Button>
      </>
    )}
    >
      <div className="mb-5 flex items-center justify-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-900 text-white"><Github size={20} /></span>
        <span><strong className="block text-[15px]">GitHub</strong><span className="text-[11.5px] text-faint">Authorize Code2Career</span></span>
      </div>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-white/5 p-4">
        <Logo compact />
        <span className="min-w-0"><strong className="block text-[13.5px]">Code2Career wants to access your account</strong><span className="text-xs text-faint">{GH_USER.login} · Demo environment</span></span>
      </div>
      <div className="mb-4 grid gap-2">
        {[
          ['Read repository metadata', 'Repository names, languages, visibility and activity dates.'],
          ['Read repository contents', 'Dependency manifests and source files, used for local analysis simulation.'],
          ['Maintain your skill profile', 'Store the resulting Developer Skill Profile in your workspace.'],
        ].map(([title, text]) => (
          <div key={title} className="flex gap-2.5 rounded-[10px] border border-line px-3 py-2.5">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <span><strong className="block text-[13px]">{title}</strong><span className="text-xs text-muted">{text}</span></span>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-faint">This is a local demo. No network request is made, no tokens are issued and nothing leaves your browser. You can disconnect or reset the demo at any time from Settings.</p>
    </Frame>
  );
}

function LinkedInOAuthModal() {
  const { closeModal, connectLinkedIn } = useApp();
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  return (
    <Frame
      title="Connect LinkedIn account"
      sub="Simulated authorization — no real LinkedIn API is contacted."
      icon={Linkedin}
      iconClass="bg-[#0A66C2] text-white"
      onClose={closeModal}
      footer={(
        <>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <div className="ml-auto" />
          <Button icon={busy ? undefined : Check} disabled={busy} onClick={() => {
            if (started.current) return;
            started.current = true;
            setBusy(true);
            setTimeout(connectLinkedIn, 1100);
          }}
          >
            {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {busy ? 'Authorizing…' : 'Authorize Code2Career'}
          </Button>
        </>
      )}
    >
      <div className="mb-5 flex items-center justify-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#0A66C2] text-white"><Linkedin size={20} /></span>
        <span><strong className="block text-[15px]">LinkedIn</strong><span className="text-[11.5px] text-faint">Authorize Code2Career</span></span>
      </div>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-white/5 p-4">
        <Logo compact />
        <span className="min-w-0"><strong className="block text-[13.5px]">Code2Career wants to share on your behalf (demo)</strong><span className="text-xs text-faint">{linkedinAccountLabel(LINKEDIN_DEMO_USER)} · Demo environment</span></span>
      </div>
      <div className="mb-4 grid gap-2">
        {[
          ['Read your basic profile', 'Name and headline for simulated post attribution.'],
          ['Create share drafts', 'Store LinkedIn post drafts generated from simulated GitHub activity.'],
          ['Simulate publishing', 'Mark posts as published locally only — nothing is posted to LinkedIn.'],
        ].map(([title, text]) => (
          <div key={title} className="flex gap-2.5 rounded-[10px] border border-line px-3 py-2.5">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <span><strong className="block text-[13px]">{title}</strong><span className="text-xs text-muted">{text}</span></span>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-faint">This is a local demo. No network request is made and no real LinkedIn post is ever created. Disconnecting keeps your drafts and publication history in this browser.</p>
    </Frame>
  );
}

function LinkedInPreviewModal({ modal }) {
  const { closeModal } = useApp();
  const text = postPreviewText(modal.draft);
  return (
    <Frame wide title="Preview post" sub="Simulated LinkedIn feed layout" icon={Linkedin} iconClass="bg-[#0A66C2] text-white" onClose={closeModal} footer={<Button variant="secondary" onClick={closeModal}>Close</Button>}>
      <p className="mb-3 text-[12.5px] text-muted">Posting as <strong className="text-ink">{linkedinAccountLabel(LINKEDIN_DEMO_USER)}</strong></p>
      <div className="rounded-xl border border-line bg-white p-4 text-navy-950 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0A66C2] text-sm font-semibold text-white">AR</span>
          <div>
            <strong className="block text-[14px]">{LINKEDIN_DEMO_USER.name}</strong>
            <span className="text-[12px] text-neutral-600">{LINKEDIN_DEMO_USER.headline}</span>
          </div>
        </div>
        <strong className="block text-[15px]">{modal.draft.title}</strong>
        <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-neutral-800">{modal.draft.body}</p>
        <p className="mt-3 text-[13px] text-[#0A66C2]">{modal.draft.hashtags.map((tag) => `#${tag}`).join(' ')}</p>
      </div>
      <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-dashed border-line bg-canvas/60 p-3 text-[11.5px] text-muted">{text}</pre>
    </Frame>
  );
}

function LinkedInPublishModal({ modal }) {
  const { closeModal } = useApp();
  const text = postPreviewText(modal.draft);
  return (
    <Frame
      title="Approve & publish post?"
      sub="Simulation only — confirm before marking this post as published."
      icon={Linkedin}
      iconClass="bg-[#0A66C2] text-white"
      onClose={() => { modal.onCancel?.(); closeModal(); }}
      footer={(
        <>
          <Button variant="secondary" onClick={() => { modal.onCancel?.(); closeModal(); }}>Cancel</Button>
          <div className="ml-auto" />
          <Button onClick={() => { closeModal(); modal.onConfirm?.(); }}>Confirm Publication</Button>
        </>
      )}
    >
      <NoteSimulation />
      <p className="mb-3 text-[13px] text-muted">
        This post will be attributed to your connected demo account:
        {' '}
        <strong className="text-ink">{linkedinAccountLabel(LINKEDIN_DEMO_USER)}</strong>
      </p>
      <div className="rounded-xl border border-line bg-canvas/60 p-4">
        <strong className="block text-[15px]">{modal.draft.title}</strong>
        <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-muted">{modal.draft.body}</p>
        <p className="mt-3 text-[12.5px] text-brand-700">{modal.draft.hashtags.map((tag) => `#${tag}`).join(' ')}</p>
      </div>
      <p className="mt-3 text-[12px] text-faint">Full text to store as published (demo):</p>
      <pre className="mt-1 max-h-36 overflow-auto rounded-lg border border-line bg-surface p-3 text-[11.5px] text-muted">{text}</pre>
    </Frame>
  );
}

function NoteSimulation() {
  return (
    <div className="mb-4 flex gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2.5 text-[12.5px] text-amber-100">
      <Info size={16} className="mt-0.5 shrink-0" />
      <span>No real LinkedIn post is created. Code2Career only updates local demo status to <strong>Published (Demo)</strong>.</span>
    </div>
  );
}

function LinkedInRejectModal({ modal }) {
  const { closeModal } = useApp();
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const [notes, setNotes] = useState('');
  return (
    <Frame
      title="Reject this draft?"
      sub="The post moves to Rejected Posts with your reason."
      icon={AlertTriangle}
      iconClass="bg-red-500 text-white"
      onClose={closeModal}
      footer={(
        <>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <div className="ml-auto" />
          <Button variant="danger" onClick={() => { closeModal(); modal.onConfirm?.(reason, notes); }}>Confirm Rejection</Button>
        </>
      )}
    >
      <p className="mb-3 text-[13px] text-muted"><strong>{modal.draft.title}</strong></p>
      <label className="mb-3 grid gap-1.5 text-[13px]">
        <span className="font-semibold">Rejection reason</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2">
          {REJECTION_REASONS.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5 text-[13px]">
        <span className="font-semibold">Optional notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="rounded-lg border border-line bg-surface px-3 py-2" placeholder="Add context for your demo review…" />
      </label>
    </Frame>
  );
}

function LinkedInPublicationDetailsModal({ modal }) {
  const { closeModal } = useApp();
  const d = modal.draft;
  return (
    <Frame title="Publication details (demo)" sub="Simulated only — not sent to LinkedIn" onClose={closeModal} footer={<Button variant="secondary" onClick={closeModal}>Close</Button>}>
      <div className="grid gap-2 text-[13px] text-muted">
        <div><strong className="text-ink">Status:</strong> {d.status}</div>
        <div><strong className="text-ink">Published at:</strong> {d.publishedAt || '—'}</div>
        <div><strong className="text-ink">Account:</strong> {d.publishedAs ? linkedinAccountLabel({ ...LINKEDIN_DEMO_USER, vanity: d.publishedAs }) : linkedinAccountLabel()}</div>
        <div><strong className="text-ink">Project:</strong> {d.repoId}</div>
      </div>
      <pre className="mt-4 max-h-48 overflow-auto rounded-lg border border-line bg-canvas/60 p-3 text-[12px] text-muted">{postPreviewText(d)}</pre>
    </Frame>
  );
}

function LinkedInRejectedDetailsModal({ modal }) {
  const { closeModal } = useApp();
  const d = modal.draft;
  return (
    <Frame title="Rejection details" sub={d.title} onClose={closeModal} footer={<Button variant="secondary" onClick={closeModal}>Close</Button>}>
      <div className="grid gap-2 text-[13px] text-muted">
        <div><strong className="text-ink">Rejected:</strong> {d.rejectedAt || '—'}</div>
        <div><strong className="text-ink">Reason:</strong> {d.rejectionReason || '—'}</div>
        {d.rejectionNotes && <div><strong className="text-ink">Notes:</strong> {d.rejectionNotes}</div>}
      </div>
      <p className="mt-4 whitespace-pre-wrap text-[13px] text-muted">{d.body}</p>
    </Frame>
  );
}

function PickerModal() {
  const { state, pickerFilters, setPickerFilters, closeModal, commitSelection, startAnalysis, toast } = useApp();
  const [temp, setTemp] = useState(() => new Set(state.selected));
  const languages = uniqueLanguages();
  const visible = filteredRepos(pickerFilters);
  const toggle = (id) => {
    const next = new Set(temp);
    if (next.has(id)) next.delete(id); else next.add(id);
    setTemp(next);
  };
  return (
    <Frame
      wide
      title="Select repositories to analyse"
      sub={`${REPOS.length} repositories available in @${GH_USER.login}. Nothing is selected for you.`}
      icon={GitBranch}
      iconClass="bg-navy-900 text-cyan-300"
      onClose={closeModal}
      footer={(
        <>
          <span className="text-[13px] text-muted"><strong className="text-brand-700">{temp.size}</strong> of {REPOS.length} repositories selected</span>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button icon={Play} disabled={temp.size === 0} onClick={() => {
              const ids = Array.from(temp);
              commitSelection(ids);
              closeModal();
              toast(`${ids.length} repositories queued for analysis`, 'git-branch');
              startAnalysis(ids);
            }}
            >
              Analyze {temp.size || ''} selected
            </Button>
          </div>
        </>
      )}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <label className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input value={pickerFilters.q} onChange={(event) => setPickerFilters({ ...pickerFilters, q: event.target.value })} placeholder="Search by name, language or technology…" className="h-[38px] w-full rounded-lg border border-line bg-surface pr-3 pl-9" />
        </label>
        <select className="h-[38px] rounded-lg border border-line bg-surface px-3" value={pickerFilters.visibility} onChange={(event) => setPickerFilters({ ...pickerFilters, visibility: event.target.value })} aria-label="Visibility">
          <option value="all">All visibility</option>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>
        <select className="h-[38px] rounded-lg border border-line bg-surface px-3" value={pickerFilters.language} onChange={(event) => setPickerFilters({ ...pickerFilters, language: event.target.value })} aria-label="Language">
          <option value="all">All languages</option>
          {languages.map((language) => <option key={language}>{language}</option>)}
        </select>
      </div>
      <div className="mb-2.5 flex items-center gap-2 text-[12.5px]">
        <button type="button" className="font-semibold text-brand-700" onClick={() => setTemp(new Set([...temp, ...visible.map((repo) => repo.id)]))}>Select all</button>
        <button type="button" className="font-semibold text-brand-700" onClick={() => setTemp(new Set())}>Deselect all</button>
        <span className="ml-auto text-muted"><strong className="text-brand-700">{temp.size}</strong> selected</span>
      </div>
      <div className="grid max-h-[46vh] gap-2 overflow-y-auto pr-1">
        {visible.length === 0 && <p className="py-8 text-center text-sm text-muted">No matching repositories. Adjust your search or filters.</p>}
        {visible.map((repo) => <RepoRow key={repo.id} repo={repo} selected={temp.has(repo.id)} onToggle={() => toggle(repo.id)} detailed={false} />)}
      </div>
      <p className="mt-3 flex gap-1.5 text-xs text-faint"><Info size={14} className="mt-0.5 shrink-0" />Select only the repositories you want included in your skill profile. Skills detected in excluded repositories are not counted.</p>
    </Frame>
  );
}

function FieldsModal({ modal }) {
  const { closeModal } = useApp();
  const [values, setValues] = useState(() => Object.fromEntries(modal.fields.map((field) => [field.key, field.defaultValue || ''])));
  return (
    <Frame title={modal.title} sub={modal.sub} onClose={closeModal} footer={(
      <>
        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        <div className="ml-auto" />
        <Button onClick={() => { modal.onSubmit(values); closeModal(); }}>Save</Button>
      </>
    )}
    >
      <div className="grid gap-3">
        {modal.fields.map((field) => (
          <label key={field.key} className="grid gap-1 text-xs font-semibold text-muted">
            {field.label}
            {field.multiline
              ? <textarea value={values[field.key]} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} className="min-h-[74px] rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink" />
              : <input value={values[field.key]} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink" />}
          </label>
        ))}
      </div>
    </Frame>
  );
}

export function ModalHost() {
  const { modal, closeModal, resetDemo } = useApp();
  useEffect(() => {
    if (!modal) return undefined;
    const prev = document.body.style.overflow;
    return () => { document.body.style.overflow = prev; };
  }, [modal]);
  if (!modal) return null;
  if (modal.type === 'oauth') return <OAuthModal />;
  if (modal.type === 'linkedin-oauth') return <LinkedInOAuthModal />;
  if (modal.type === 'linkedinPreview') return <LinkedInPreviewModal modal={modal} />;
  if (modal.type === 'linkedinPublish') return <LinkedInPublishModal modal={modal} />;
  if (modal.type === 'linkedinReject') return <LinkedInRejectModal modal={modal} />;
  if (modal.type === 'linkedinPublicationDetails') return <LinkedInPublicationDetailsModal modal={modal} />;
  if (modal.type === 'linkedinRejectedDetails') return <LinkedInRejectedDetailsModal modal={modal} />;
  if (modal.type === 'picker') return <PickerModal />;
  if (modal.type === 'fields') return <FieldsModal modal={modal} />;
  if (modal.type === 'version') {
    return (
      <Frame wide title={modal.version.name || 'Untitled version'} sub={`${formatDate(modal.version.createdAt)} · ${modal.version.description || 'No description'}`} onClose={closeModal} footer={<Button variant="secondary" onClick={closeModal}>Close</Button>}>
        <CvDocument cv={modal.version.snapshot} projects={{}} skills={null} design={modal.version.snapshot?.design} />
      </Frame>
    );
  }
  if (modal.type === 'confirm') {
    return (
      <Frame title={modal.title} sub={modal.sub} icon={modal.danger ? AlertTriangle : Info} iconClass={modal.danger ? 'bg-red-500 text-white' : 'bg-navy-900 text-white'} onClose={() => { modal.onCancel?.(); closeModal(); }} footer={(
        <>
          <Button variant="secondary" onClick={() => { modal.onCancel?.(); closeModal(); }}>Cancel</Button>
          <div className="ml-auto" />
          <Button variant={modal.danger ? 'danger' : 'primary'} onClick={() => { closeModal(); modal.onConfirm?.(); }}>{modal.confirmLabel || 'Confirm'}</Button>
        </>
      )}
      >
        <div className="text-[13.5px] leading-relaxed text-muted">{modal.body}</div>
      </Frame>
    );
  }
  if (modal.type === 'reset') {
    return (
    <Frame title="Reset demo data?" sub="This clears all locally stored demo state in this browser." icon={AlertTriangle} iconClass="bg-red-500 text-white" onClose={closeModal} footer={(
      <>
        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        <div className="ml-auto" />
        <Button variant="danger" icon={AlertTriangle} onClick={resetDemo}>Reset Demo Data</Button>
      </>
    )}
    >
      <p className="text-[13.5px] leading-relaxed text-muted">The following will be permanently removed from local storage key <strong className="text-ink">{STORAGE_KEY}</strong>:</p>
      <ul className="mt-3 grid gap-2">
        {[
          'GitHub and LinkedIn connection simulation',
          'Selected repositories and analysis results',
          'Developer Skill Profile and statistics',
          'Project lifecycle reports',
          'CV profile and version history',
          'Simulated GitHub activity and sync history',
          'LinkedIn drafts and published (demo) posts',
          'Job preferences and Saved Jobs bookmarks',
        ].map((item) => (
          <li key={item} className="text-[13px] text-muted">• {item}</li>
        ))}
      </ul>
    </Frame>
    );
  }
  return (
    <Frame title="Unknown dialog" sub="Close and try again." icon={AlertTriangle} onClose={closeModal} footer={<Button variant="secondary" onClick={closeModal}>Close</Button>}>
      <p className="text-[13px] text-muted">This dialog type is not supported.</p>
    </Frame>
  );
}
