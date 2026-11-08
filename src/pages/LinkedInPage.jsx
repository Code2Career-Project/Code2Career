import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Copy,
  Eye,
  Linkedin,
  Pencil,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Unlink,
  XCircle,
} from 'lucide-react';
import {
  DEMO_PUBLISHED_STATUS,
  DRAFT_TONES,
  LINKEDIN_DEMO_USER,
  PENDING_STATUS,
  REJECTED_STATUS,
  filterLinkedInDrafts,
  isPendingDraft,
  isPublishedDraft,
  isRejectedDraft,
  isDemoSeedDraft,
  linkedinAccountLabel,
  linkedinDraftStats,
  postPreviewText,
} from '../services/linkedin';
import {
  ANALYSIS_RESULT,
  analysisResultLabel,
  linkedinStudioAnalytics,
  migrateDraftOrigin,
  originLabel,
} from '../services/linkedinAnalytics';
import { REPOS, repoById } from '../data/constants';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, CardHeader, EmptyState, Note } from '../components/common/ui';
import { cx } from '../utils/format';

const TABS = [
  { id: 'pending', label: 'Pending Approval', tone: 'amber' },
  { id: 'published', label: 'Published Posts', tone: 'green' },
  { id: 'rejected', label: 'Rejected Posts', tone: 'red' },
];

function formatDateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function previewBody(body, max = 200) {
  if (!body || body.length <= max) return body || '';
  return `${body.slice(0, max).trim()}…`;
}

function relatedLabel(draft) {
  const repo = repoById(draft.repoId);
  return repo?.name || draft.repoId;
}

function copyPost(draft, toast) {
  return navigator.clipboard.writeText(postPreviewText(draft))
    .then(() => toast('Post copied to clipboard', 'check'))
    .catch(() => toast('Clipboard access is unavailable', 'info'));
}

function StatTile({ label, value, hint, accent, compact = false }) {
  return (
    <Card className={cx('p-4', compact && 'p-3')}>
      <div className="text-[11.5px] font-medium text-muted">{label}</div>
      <div className={cx(
        'font-display mt-1 font-semibold tracking-[-0.03em]',
        compact ? 'text-[20px]' : 'text-[26px]',
        accent,
      )}
      >
        {value}
      </div>
      <p className={cx('mt-1 text-faint', compact ? 'text-[10.5px]' : 'text-[11px]')}>{hint}</p>
    </Card>
  );
}

function PrimaryMetricCard({ label, value, description, accent }) {
  return (
    <div className="rounded-xl border border-brand-500/35 bg-gradient-to-br from-brand-950/40 to-surface/80 p-4 shadow-card">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-brand-700">{label}</div>
      <div className={cx('font-display mt-2 text-[34px] font-semibold leading-none tracking-[-0.04em] sm:text-[38px]', accent || 'text-ink')}>
        {value}
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">{description}</p>
    </div>
  );
}

function DraftEditor({ draft, onClose }) {
  const { updateDraft } = useApp();
  if (!draft) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
      <Card className="border-brand-500/40 p-5">
        <CardHeader title="Edit draft" sub="Changes save automatically. Status stays in Pending Approval until you approve or reject." />
        <label className="mt-4 grid gap-1.5 text-[13px]">
          <span className="font-semibold">Post title</span>
          <input value={draft.title} onChange={(e) => updateDraft(draft.id, { title: e.target.value })} className="rounded-lg border border-line bg-surface px-3 py-2" />
        </label>
        <label className="mt-3 grid gap-1.5 text-[13px]">
          <span className="font-semibold">Post body</span>
          <textarea value={draft.body} onChange={(e) => updateDraft(draft.id, { body: e.target.value })} rows={8} className="rounded-lg border border-line bg-surface px-3 py-2" />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-[13px]">
            <span className="font-semibold">Hashtags</span>
            <input value={draft.hashtags.join(', ')} onChange={(e) => updateDraft(draft.id, { hashtags: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} className="rounded-lg border border-line bg-surface px-3 py-2" />
          </label>
          <label className="grid gap-1.5 text-[13px]">
            <span className="font-semibold">Tone</span>
            <select value={draft.tone} onChange={(e) => updateDraft(draft.id, { tone: e.target.value })} className="rounded-lg border border-line bg-surface px-3 py-2">
              {DRAFT_TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <Button className="mt-4" variant="secondary" onClick={onClose}>Done editing</Button>
      </Card>
    </motion.div>
  );
}

function PostCard({ draft, children, borderClass = 'border-line', highlight = false }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
      <Card className={cx('flex h-full flex-col p-4', borderClass, highlight && 'ring-2 ring-brand-500/70')}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {draft.aiGenerated && <Badge tone="gray" icon={Sparkles}>AI Draft Simulation</Badge>}
          <Badge tone="gray">{originLabel(migrateDraftOrigin(draft.source, draft.eventId, draft.alternativeOf))}</Badge>
          {isDemoSeedDraft(draft) && <Badge tone="gray">Sample only — not from GitHub sync</Badge>}
          <Badge tone={isPendingDraft(draft) ? 'amber' : isPublishedDraft(draft) ? 'green' : 'red'}>{draft.status}</Badge>
        </div>
        <strong className="text-[15px] leading-snug">{draft.title}</strong>
        <p className="mt-2 flex-1 whitespace-pre-wrap text-[13px] leading-relaxed text-muted">{previewBody(draft.body)}</p>
        <p className="mt-2 text-[12.5px] text-brand-700">{draft.hashtags.map((t) => `#${t}`).join(' ') || '—'}</p>
        <p className="mt-2 text-[12px] text-faint">
          {relatedLabel(draft)}
          {draft.purpose ? ` · ${draft.purpose}` : ''}
          {draft.eventCategoryLabel ? ` · ${draft.eventCategoryLabel}` : ''}
          {' · '}
          Generated {formatDateTime(draft.createdAt)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">{children}</div>
      </Card>
    </motion.article>
  );
}

export function LinkedInPage() {
  const {
    state,
    openModal,
    toast,
    publishLinkedInDraft,
    rejectLinkedInDraft,
    resubmitLinkedInDraft,
    movePublishedToDrafts,
    generateAlternativeLinkedInDraft,
    disconnectLinkedIn,
    focusLinkedInDraft,
    linkedinHighlightDraftId,
    clearLinkedInHighlight,
  } = useApp();

  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [repoFilter, setRepoFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [editingId, setEditingId] = useState('');

  const stats = useMemo(() => linkedinDraftStats(state.linkedinDrafts), [state.linkedinDrafts]);
  const analytics = useMemo(() => linkedinStudioAnalytics(state), [state]);
  const tabCounts = { pending: stats.pending, published: stats.published, rejected: stats.rejected };

  const openPreview = (draft) => openModal({ type: 'linkedinPreview', draft: { ...draft, hashtags: [...draft.hashtags] } });

  const openDraftFromHistory = (draftId) => {
    const draft = state.linkedinDrafts.find((d) => d.id === draftId);
    if (!draft) {
      toast('Draft is no longer in this workspace', 'info');
      return;
    }
    if (isPendingDraft(draft)) setTab('pending');
    else if (isPublishedDraft(draft)) setTab('published');
    else setTab('rejected');
    focusLinkedInDraft(draft.id);
    openPreview(draft);
  };

  const filtered = useMemo(
    () => filterLinkedInDrafts(state.linkedinDrafts, { tab, q: search, repoId: repoFilter, sort }),
    [state.linkedinDrafts, tab, search, repoFilter, sort],
  );

  const editingDraft = useMemo(
    () => state.linkedinDrafts.find((d) => d.id === editingId && isPendingDraft(d)) || null,
    [editingId, state.linkedinDrafts],
  );

  useEffect(() => {
    if (editingId && !editingDraft) setEditingId('');
  }, [editingId, editingDraft]);

  useEffect(() => {
    if (!linkedinHighlightDraftId) return undefined;
    const timer = setTimeout(() => clearLinkedInHighlight(), 8000);
    return () => clearTimeout(timer);
  }, [linkedinHighlightDraftId, clearLinkedInHighlight]);

  const accountLabel = linkedinAccountLabel(LINKEDIN_DEMO_USER);

  const openApprove = (draft) => {
    if (!state.linkedinConnected) {
      toast('Connect your demo LinkedIn account before publishing', 'info');
      return;
    }
    if (!isPendingDraft(draft)) return;
    openModal({
      type: 'linkedinPublish',
      draft: { ...draft, hashtags: [...draft.hashtags] },
      onConfirm: () => {
        publishLinkedInDraft(draft.id);
        setEditingId('');
        setTab('published');
      },
    });
  };

  const openReject = (draft) => {
    if (!isPendingDraft(draft)) return;
    openModal({
      type: 'linkedinReject',
      draft,
      onConfirm: (reason, notes) => {
        rejectLinkedInDraft(draft.id, reason, notes);
        setEditingId('');
        setTab('rejected');
      },
    });
  };

  if (!state.linkedinConnected) {
    return (
      <div className="max-w-xl">
        <Note>LinkedIn Studio uses a simulated connection. AI Draft Simulation runs locally — no external AI or LinkedIn APIs.</Note>
        <Card className="mt-4">
          <EmptyState
            icon={Linkedin}
            title="Connect your LinkedIn account (demo)"
            text="Authorize the demo account to review AI-generated drafts, approve simulated publishing, and manage rejection history."
            action={<Button icon={Linkedin} onClick={() => openModal({ type: 'linkedin-oauth' })}>Connect LinkedIn</Button>}
          />
          {stats.total > 0 && (
            <p className="border-t border-line px-5 py-3 text-[12.5px] text-muted">
              {stats.pending} pending · {stats.published} published · {stats.rejected} rejected — stored locally until you connect.
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <Note>
        Code2Career automatically analyzes meaningful GitHub activity during Sync Pending Activity and prepares LinkedIn post suggestions for your approval. AI Draft Simulation uses local templates only — no external AI or LinkedIn API.
      </Note>

      <Card className="mb-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#0A66C2] text-sm font-semibold text-white">AR</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{LINKEDIN_DEMO_USER.name}</strong>
              <Badge tone="green" icon={Check}>Connected (demo)</Badge>
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted">{accountLabel}</p>
            <p className="text-[12px] text-faint">{LINKEDIN_DEMO_USER.headline}</p>
          </div>
          <Button size="sm" variant="secondary" icon={Unlink} onClick={disconnectLinkedIn}>Disconnect</Button>
        </div>
      </Card>

      <Card className="mb-4 border-brand-500/25 bg-brand-950/10 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <strong className="text-[14px]">Event-driven draft generation</strong>
            <p className="mt-1 max-w-2xl text-[12.5px] text-muted">
              Metrics below count unique GitHub events processed during Sync Pending Activity only. The three sample demo posts are labeled separately and never affect these totals.
            </p>
          </div>
          <Badge tone="green" icon={Check}>Active</Badge>
        </div>

        {analytics.eventsAnalyzed === 0 && (
          <p className="mt-3 rounded-lg border border-line bg-surface/50 px-3 py-2 text-[12px] text-muted">
            No GitHub events analyzed yet — all event metrics are zero. Use GitHub Activity → Sync Pending Activity. Sample demo drafts ({analytics.seededDemoDrafts}) remain available for review.
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PrimaryMetricCard
            label="Events Analyzed"
            value={analytics.eventsAnalyzed}
            description="Unique GitHub events that finished processing (pending events are excluded)."
            accent="text-cyan-300"
          />
          <PrimaryMetricCard
            label="Events Skipped"
            value={analytics.eventsSkipped}
            description="Analyzed events not meaningful enough for LinkedIn (minor, formatting-only, or insufficient context)."
            accent="text-muted"
          />
          <PrimaryMetricCard
            label="Drafts Created"
            value={analytics.draftsCreated}
            description="Auto-generated drafts from qualifying GitHub events. Demo samples are excluded."
            accent="text-emerald-300"
          />
          <PrimaryMetricCard
            label="Qualifying Events"
            value={analytics.qualifyingEvents}
            description="Events classified as meaningful and eligible — includes successful drafts and generation failures."
            accent="text-brand-700"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile compact label="Pending Approval" value={analytics.pendingApproval} hint="Draft workflow — not GitHub analysis" accent="text-amber-300" />
          <StatTile compact label="Published (Demo)" value={analytics.publishedDemo} hint="Approved locally — does not change event metrics" accent="text-emerald-300" />
          <StatTile compact label="Rejected" value={analytics.rejected} hint="Rejected posts — event stats unchanged" accent="text-red-300" />
          <StatTile compact label="Generation Failed" value={analytics.generationFailed} hint="Qualifying events where auto-draft creation failed" accent="text-orange-300" />
        </div>
      </Card>

      <Card className="mb-4 overflow-hidden p-0">
        <div className="border-b border-line px-4 py-3 sm:px-5">
          <CardHeader title="GitHub Event Analysis History" sub="One row per processed event — re-sync does not duplicate counts" />
        </div>
        {analytics.records.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-muted sm:px-5">No processed GitHub events yet. History appears after you sync pending activity.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[12.5px]">
              <thead className="bg-surface/80 text-[11px] uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-2.5 font-semibold sm:px-5">Event</th>
                  <th className="px-3 py-2.5 font-semibold">Repository</th>
                  <th className="px-3 py-2.5 font-semibold">Type</th>
                  <th className="px-3 py-2.5 font-semibold">Result</th>
                  <th className="px-3 py-2.5 font-semibold">Reason / draft</th>
                  <th className="px-3 py-2.5 font-semibold sm:pr-5">Processed</th>
                </tr>
              </thead>
              <tbody>
                {analytics.records.map((row) => {
                  const draft = row.draftId ? state.linkedinDrafts.find((d) => d.id === row.draftId) : null;
                  const resultTone = row.analysisResult === ANALYSIS_RESULT.QUALIFIED
                    ? 'text-emerald-300'
                    : row.analysisResult === ANALYSIS_RESULT.GENERATION_FAILED
                      ? 'text-orange-300'
                      : 'text-muted';
                  return (
                    <tr key={row.eventId} className="border-t border-line/80 align-top">
                      <td className="max-w-[220px] px-4 py-3 sm:px-5">
                        <div className="font-medium text-ink">{row.eventTitle}</div>
                        <div className="mt-0.5 line-clamp-2 text-[11.5px] text-faint">{row.eventDescription || '—'}</div>
                      </td>
                      <td className="px-3 py-3 text-muted">{row.repoName}</td>
                      <td className="px-3 py-3 capitalize text-muted">{row.eventType}</td>
                      <td className={cx('px-3 py-3 font-semibold', resultTone)}>{analysisResultLabel(row.analysisResult)}</td>
                      <td className="max-w-[240px] px-3 py-3 text-[12px] text-muted">
                        {row.analysisResult === ANALYSIS_RESULT.SKIPPED && (
                          <span>{row.skipReasonLabel}</span>
                        )}
                        {row.analysisResult === ANALYSIS_RESULT.GENERATION_FAILED && (
                          <span>{row.skipReasonLabel}</span>
                        )}
                        {row.analysisResult === ANALYSIS_RESULT.QUALIFIED && draft && (
                          <Button size="sm" variant="secondary" onClick={() => openDraftFromHistory(draft.id)}>Open draft</Button>
                        )}
                        {row.analysisResult === ANALYSIS_RESULT.QUALIFIED && !draft && (
                          <span className="text-faint">Draft reference missing</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-faint sm:pr-5">{formatDateTime(row.at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-line pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cx(
              'rounded-t-lg px-3 py-2 text-[13px] font-semibold transition',
              tab === item.id ? 'bg-surface text-brand-700 shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {item.label}
            <span className="ml-1.5 rounded-full bg-canvas px-1.5 py-0.5 text-[11px]">{tabCounts[item.id]}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or content…" className="h-[38px] w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-[13px]" />
        </label>
        <select value={repoFilter} onChange={(e) => setRepoFilter(e.target.value)} className="h-[38px] rounded-lg border border-line bg-surface px-3 text-[13px]">
          <option value="all">All projects</option>
          {REPOS.map((repo) => <option key={repo.id} value={repo.id}>{repo.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-[38px] rounded-lg border border-line bg-surface px-3 text-[13px]">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {tab === 'pending' && (
        <section>
          <CardHeader title="Pending Approval" sub={`${stats.pending} draft(s) need review`} />
          {filtered.length === 0 ? (
            <Card className="mt-3"><EmptyState icon={Sparkles} title="No pending drafts" text="Sync pending GitHub Activity to auto-generate posts from qualifying events. Demo samples appear after reset or fresh install." /></Card>
          ) : (
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((draft) => (
                  <PostCard
                    key={draft.id}
                    draft={draft}
                    borderClass="border-amber-500/30"
                    highlight={draft.id === linkedinHighlightDraftId}
                  >
                    <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setEditingId(draft.id)}>Edit Draft</Button>
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => openPreview(draft)}>Preview Post</Button>
                    <Button size="sm" icon={Send} onClick={() => openApprove(draft)}>Approve & Publish</Button>
                    <Button size="sm" variant="secondary" icon={XCircle} onClick={() => openReject(draft)}>Reject</Button>
                    <Button size="sm" variant="secondary" icon={Copy} onClick={() => copyPost(draft, toast)}>Copy Post</Button>
                  </PostCard>
                ))}
              </AnimatePresence>
            </div>
          )}
          <DraftEditor draft={editingDraft} onClose={() => setEditingId('')} />
        </section>
      )}

      {tab === 'published' && (
        <section>
          <CardHeader title="Published Posts" sub="Simulated publication — not sent to LinkedIn" />
          {filtered.length === 0 ? (
            <Card className="mt-3 p-5 text-[13px] text-muted">Approved posts appear here with a publication timestamp.</Card>
          ) : (
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((draft) => (
                  <PostCard key={draft.id} draft={draft} borderClass="border-emerald-500/35 bg-emerald-950/10">
                    <p className="w-full text-[12px] text-emerald-300 mb-1">{formatDateTime(draft.publishedAt)} · {draft.publishedAs ? linkedinAccountLabel({ ...LINKEDIN_DEMO_USER, vanity: draft.publishedAs }) : accountLabel}</p>
                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => openPreview(draft)}>Preview</Button>
                    <Button size="sm" variant="secondary" icon={Copy} onClick={() => copyPost(draft, toast)}>Copy Content</Button>
                    <Button size="sm" variant="secondary" onClick={() => openModal({ type: 'linkedinPublicationDetails', draft })}>View Publication Details</Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={RotateCcw}
                      onClick={() => openModal({
                        type: 'confirm',
                        title: 'Move back to Pending Approval?',
                        body: 'This removes the simulated published status and returns the post to the approval queue. Nothing is changed on LinkedIn.',
                        confirmLabel: 'Move to drafts',
                        onConfirm: () => {
                          movePublishedToDrafts(draft.id);
                          setTab('pending');
                        },
                      })}
                    >
                      Move back to Drafts
                    </Button>
                  </PostCard>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}

      {tab === 'rejected' && (
        <section>
          <CardHeader title="Rejected Posts" sub="History with reasons — edit or generate alternatives" />
          {filtered.length === 0 ? (
            <Card className="mt-3 p-5 text-[13px] text-muted">Rejected posts stay here with reasons and notes.</Card>
          ) : (
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((draft) => (
                  <PostCard key={draft.id} draft={draft} borderClass="border-red-500/35 bg-red-950/10">
                    <p className="w-full text-[12px] text-red-200/90 mb-1">{draft.rejectionReason} · {formatDateTime(draft.rejectedAt)}</p>
                    {draft.rejectionNotes && <p className="w-full text-[12px] text-muted mb-1">Notes: {draft.rejectionNotes}</p>}
                    <Button size="sm" variant="secondary" onClick={() => openModal({ type: 'linkedinRejectedDetails', draft })}>View Details</Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Pencil}
                      onClick={() => {
                        resubmitLinkedInDraft(draft.id);
                        setTab('pending');
                        setEditingId(draft.id);
                      }}
                    >
                      Edit & Resubmit
                    </Button>
                    <Button size="sm" variant="secondary" icon={Sparkles} onClick={() => { generateAlternativeLinkedInDraft(draft.id); setTab('pending'); }}>Generate Alternative Draft</Button>
                  </PostCard>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
