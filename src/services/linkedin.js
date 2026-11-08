import { REPOS, repoById } from '../data/constants.js';
import { draftFromClassifiedEvent, writeAlternativeFromDraft } from './linkedinPostWriter.js';

export const DRAFT_TONES = ['Professional', 'Technical', 'Achievement-focused', 'Friendly'];
export const PENDING_STATUS = 'Awaiting Approval';
export const DEMO_PUBLISHED_STATUS = 'Published (Demo)';
export const REJECTED_STATUS = 'Rejected';
export const DRAFT_STATUSES = [PENDING_STATUS, DEMO_PUBLISHED_STATUS, REJECTED_STATUS];

export const POST_PURPOSES = [
  'Project Announcement',
  'Technical Achievement',
  'Development Milestone',
  'New Technology',
  'Learning Journey',
];

export const REJECTION_REASONS = [
  'Content is not relevant',
  'Writing style is not suitable',
  'Technical information is inaccurate',
  'Duplicate or repetitive content',
  'Other',
];

export const LINKEDIN_DEMO_USER = {
  name: 'Alex Rivera',
  headline: 'Full-stack Developer · Barcelona',
  vanity: 'alexrivera-dev',
  email: 'alex.rivera.dev@example.com',
};

const tag = (skill) => skill.replace(/[^A-Za-z0-9+]/g, '');

export function linkedinAccountLabel(user = LINKEDIN_DEMO_USER) {
  return `${user.name} · linkedin.com/in/${user.vanity}`;
}

export function normalizeDraftStatus(status) {
  if (status === 'Published Externally') return DEMO_PUBLISHED_STATUS;
  if (status === 'Draft' || status === 'Ready for Review') return PENDING_STATUS;
  if (status === PENDING_STATUS || status === DEMO_PUBLISHED_STATUS || status === REJECTED_STATUS) return status;
  return null;
}

export function isPublishedDraft(draft) {
  return draft?.status === DEMO_PUBLISHED_STATUS;
}

export function isPendingDraft(draft) {
  return draft?.status === PENDING_STATUS;
}

export function isRejectedDraft(draft) {
  return draft?.status === REJECTED_STATUS;
}

export function postPreviewText(draft) {
  if (!draft) return '';
  const tags = (draft.hashtags || []).map((t) => `#${String(t).replace(/^#/, '')}`).join(' ');
  return `${draft.title}\n\n${draft.body}\n\n${tags}`.trim();
}

export function linkedinDraftStats(drafts) {
  const list = Array.isArray(drafts) ? drafts : [];
  return {
    pending: list.filter(isPendingDraft).length,
    published: list.filter(isPublishedDraft).length,
    rejected: list.filter(isRejectedDraft).length,
    total: list.length,
  };
}

export function filterLinkedInDrafts(drafts, { tab = 'pending', q = '', repoId = 'all', sort = 'newest' } = {}) {
  let list = Array.isArray(drafts) ? drafts.slice() : [];
  if (tab === 'pending') list = list.filter(isPendingDraft);
  else if (tab === 'published') list = list.filter(isPublishedDraft);
  else if (tab === 'rejected') list = list.filter(isRejectedDraft);

  const query = q.trim().toLowerCase();
  if (query) {
    list = list.filter((draft) => `${draft.title} ${draft.body}`.toLowerCase().includes(query));
  }
  if (repoId && repoId !== 'all') {
    list = list.filter((draft) => draft.repoId === repoId);
  }
  list.sort((a, b) => {
    const aDate = a.publishedAt || a.rejectedAt || a.createdAt || '';
    const bDate = b.publishedAt || b.rejectedAt || b.createdAt || '';
    return sort === 'oldest' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
  });
  return list;
}

function newDraftId(prefix = 'draft') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hashtagsForRepo(repo, extra = []) {
  const fromRepo = (repo?.skills || []).slice(0, 4).map(tag).filter(Boolean);
  return [...new Set([...fromRepo, ...extra.map(tag)])].slice(0, 5);
}

function purposeCopy(repo, purpose, tone, { variant = 0 } = {}) {
  const name = repo?.name || 'my project';
  const lang = repo?.language || 'TypeScript';
  const stack = (repo?.skills || []).slice(0, 3).join(', ') || lang;
  const desc = repo?.description || 'a full-stack demo repository in Code2Career';

  const templates = {
    'Project Announcement': {
      Professional: [
        `Excited to share progress on ${name} — ${desc}`,
        `I've been building ${name}, a ${lang} project focused on real-world workflow patterns. The repository already tracks ${stack}, and this post is a simulated announcement prepared by Code2Career's AI Draft Simulation for your review.`,
        `If you're exploring similar stacks, I'd welcome feedback on architecture choices and developer experience.`,
      ],
      Technical: [
        `Shipping updates on ${name}.`,
        `Stack highlights: ${stack}. The simulated analysis ties this repository to ${lang} and supporting tools listed in the demo workspace.`,
        `This draft was generated locally for approval — no external API calls.`,
      ],
    },
    'Technical Achievement': {
      'Achievement-focused': [
        `Milestone on ${name}: deployment-ready improvements.`,
        `Recent simulated activity marks a meaningful release on this repo. Technologies in play include ${stack}.`,
        `Publishing here is demo-only; the achievement narrative is based on repository metadata in Code2Career.`,
      ],
      Technical: [
        `Technical win on ${name}.`,
        `Release and integration steps in the demo timeline align with ${stack}.`,
        `Prepared for LinkedIn Studio approval — simulation only.`,
      ],
    },
    'Development Milestone': {
      Professional: [
        `Reached a development milestone on ${name}.`,
        `The project combines ${stack} with structured lifecycle reporting in the Code2Career demo.`,
        `This caption is template-generated for graduation demo review.`,
      ],
    },
    'New Technology': {
      Technical: [
        `Experimenting with ${stack.split(',')[0] || lang} on ${name}.`,
        `${desc} Adding this technology is reflected in the repository skill list (${stack}).`,
        `AI Draft Simulation — edit before approving.`,
      ],
      Friendly: [
        `Learning in public on ${name}!`,
        `Trying out ${stack.split(',')[0] || lang} alongside ${lang}. The draft pulls facts from the demo repo record only.`,
      ],
    },
    'Learning Journey': {
      Friendly: [
        `Documenting what I'm learning while improving ${name}.`,
        `Skills tracked in the demo profile include ${stack}. This post is a simulated learning update — not sent to LinkedIn.`,
      ],
      Professional: [
        `Reflections from building ${name}.`,
        `Focused on ${stack} while keeping the project maintainable. Generated locally for approval.`,
      ],
    },
  };

  const purposeSet = templates[purpose] || templates['Project Announcement'];
  const toneLines = purposeSet[tone] || purposeSet[Object.keys(purposeSet)[0]];
  const lines = toneLines || purposeSet[Object.keys(purposeSet)[0]];
  const offset = variant % Math.max(1, lines.length);
  const titleMap = {
    'Project Announcement': `Introducing updates on ${name}`,
    'Technical Achievement': `Achievement: ${name} release track`,
    'Development Milestone': `Milestone reached on ${name}`,
    'New Technology': `Adding ${stack.split(',')[0] || lang} to ${name}`,
    'Learning Journey': `What I learned building ${name}`,
  };
  return {
    title: titleMap[purpose] || `Update: ${name}`,
    body: Array.isArray(lines) ? lines.join('\n\n') : String(lines),
  };
}

export function buildSimulatedDraft({
  repoId,
  purpose = 'Project Announcement',
  tone = 'Professional',
  eventId,
  eventType = 'feature',
  eventTitle = '',
  aiGenerated = true,
  alternativeOf = null,
  variant = 0,
}) {
  const repo = repoById(repoId);
  if (!repo) return null;
  const safePurpose = POST_PURPOSES.includes(purpose) ? purpose : 'Project Announcement';
  const safeTone = DRAFT_TONES.includes(tone) ? tone : 'Professional';
  const now = new Date().toISOString();
  const copy = purposeCopy(repo, safePurpose, safeTone, { variant });
  const id = newDraftId(alternativeOf ? 'draft-alt' : 'draft');
  return {
    id,
    eventId: eventId || `sim-${repo.id}-${safePurpose.replace(/\s+/g, '-').toLowerCase()}`,
    repoId: repo.id,
    eventType,
    eventTitle: eventTitle || `${safePurpose} · ${repo.name}`,
    purpose: safePurpose,
    title: copy.title,
    body: copy.body,
    hashtags: hashtagsForRepo(repo, safePurpose.includes('Learning') ? ['Learning'] : []),
    tone: safeTone,
    status: PENDING_STATUS,
    skill: repo.skills[0] || null,
    customized: false,
    aiGenerated,
    alternativeOf,
    rejectionReason: '',
    rejectionNotes: '',
    rejectedAt: null,
    createdAt: now,
    updatedAt: now,
    publishedAt: '',
    publishedAs: '',
  };
}

export function seedSampleLinkedInDrafts() {
  const specs = [
    { id: 'draft-seed-announcement', repoId: 'restaurant-management-system', purpose: 'Project Announcement', tone: 'Professional', eventTitle: 'Restaurant platform rollout', category: 'new_feature', categoryLabel: 'New feature development' },
    { id: 'draft-seed-milestone', repoId: 'portfolio-website', purpose: 'Technical Achievement', tone: 'Achievement-focused', eventTitle: 'Portfolio deployment milestone', category: 'milestone', categoryLabel: 'Project milestone' },
    { id: 'draft-seed-learning', repoId: 'education-dashboard', purpose: 'Learning Journey', tone: 'Friendly', eventTitle: 'Education dashboard learning update', category: 'ui_ux', categoryLabel: 'UI/UX & design' },
  ];
  return specs.map((spec, index) => {
    const base = buildSimulatedDraft({
      repoId: spec.repoId,
      purpose: spec.purpose,
      tone: spec.tone,
      eventId: `seed-event-${index + 1}`,
      eventTitle: spec.eventTitle,
      aiGenerated: true,
      variant: index,
    });
    if (!base) return null;
    return { ...base, id: spec.id, eventId: `seed-event-${index + 1}`, source: 'seeded_demo', eventCategory: spec.category, eventCategoryLabel: spec.categoryLabel };
  }).filter(Boolean);
}

export function generateAlternativeDraft(source) {
  return writeAlternativeFromDraft(source);
}

export function draftFromEvent(event, repo) {
  const { draft } = draftFromClassifiedEvent(event, repo);
  return draft;
}

export { linkedinAutomationStats, linkedinStudioAnalytics } from './linkedinAnalytics.js';

export function isDemoSeedDraft(draft) {
  return draft?.source === 'seeded_demo' || draft?.source === 'demo_seed' || String(draft?.eventId || '').startsWith('seed-event');
}

export function bodyFor(draft, tone) {
  const repo = repoById(draft.repoId);
  if (repo && draft.purpose) {
    const copy = purposeCopy(repo, draft.purpose, tone, { variant: 0 });
    return copy.body;
  }
  const name = repo?.name || 'a demo repository';
  return `Update about ${name}. (AI Draft Simulation — local template.)`;
}

export function withTone(draft, tone) {
  const nextTone = DRAFT_TONES.includes(tone) ? tone : draft.tone;
  const body = draft.customized ? draft.body : bodyFor({ ...draft, purpose: draft.purpose || 'Project Announcement' }, nextTone);
  return { ...draft, tone: nextTone, body, updatedAt: new Date().toISOString() };
}
