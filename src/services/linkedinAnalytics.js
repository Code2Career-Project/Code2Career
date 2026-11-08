import {
  DEMO_PUBLISHED_STATUS,
  isPendingDraft,
  isPublishedDraft,
  isRejectedDraft,
  linkedinDraftStats,
} from './linkedin.js';
import { repoById } from '../data/constants.js';

export const DRAFT_ORIGIN = {
  SEEDED_DEMO: 'seeded_demo',
  GITHUB_EVENT: 'github_event',
  LEGACY_UNKNOWN: 'legacy_unknown',
};

export const ANALYSIS_RESULT = {
  QUALIFIED: 'qualified',
  SKIPPED: 'skipped',
  GENERATION_FAILED: 'generation_failed',
};

const SKIP_REASON_COPY = {
  minor_activity: 'Minor change — not meaningful enough for a LinkedIn post (e.g. routine push).',
  formatting_only: 'Formatting-only or cosmetic commit without substantive technical context.',
  insufficient_detail: 'Insufficient technical detail to write an accurate, evidence-based post.',
  unknown_repository: 'Repository could not be resolved during sync.',
  missing_event: 'Event payload was incomplete.',
};

export function migrateDraftOrigin(rawSource, eventId, alternativeOf) {
  if (rawSource === 'seeded_demo' || rawSource === 'demo_seed') return DRAFT_ORIGIN.SEEDED_DEMO;
  if (String(eventId || '').startsWith('seed-event')) return DRAFT_ORIGIN.SEEDED_DEMO;
  if (rawSource === 'github_event') return DRAFT_ORIGIN.GITHUB_EVENT;
  if (rawSource === 'legacy_unknown') return DRAFT_ORIGIN.LEGACY_UNKNOWN;
  if (alternativeOf) return DRAFT_ORIGIN.LEGACY_UNKNOWN;
  return DRAFT_ORIGIN.LEGACY_UNKNOWN;
}

export function isSeededDemoDraft(draft) {
  return migrateDraftOrigin(draft?.source, draft?.eventId, draft?.alternativeOf) === DRAFT_ORIGIN.SEEDED_DEMO;
}

export function isEventGeneratedDraft(draft) {
  if (draft?.alternativeOf) return false;
  if (migrateDraftOrigin(draft?.source, draft?.eventId, draft?.alternativeOf) !== DRAFT_ORIGIN.GITHUB_EVENT) return false;
  return true;
}

export function originLabel(origin) {
  if (origin === DRAFT_ORIGIN.SEEDED_DEMO) return 'Demo sample';
  if (origin === DRAFT_ORIGIN.GITHUB_EVENT) return 'GitHub event';
  return 'Legacy / unknown';
}

export function linkedinSkipReasonLabel(reason) {
  if (!reason) return '—';
  return SKIP_REASON_COPY[reason] || String(reason);
}

export function analysisResultLabel(result) {
  if (result === ANALYSIS_RESULT.QUALIFIED) return 'Qualified';
  if (result === ANALYSIS_RESULT.GENERATION_FAILED) return 'Generation Failed';
  if (result === ANALYSIS_RESULT.SKIPPED) return 'Skipped';
  return '—';
}

/** Derive analysis result for legacy sync rows. */
export function resolveAnalysisResult(entry) {
  if (entry?.analysisResult === ANALYSIS_RESULT.QUALIFIED
    || entry?.analysisResult === ANALYSIS_RESULT.SKIPPED
    || entry?.analysisResult === ANALYSIS_RESULT.GENERATION_FAILED) {
    return entry.analysisResult;
  }
  if (entry?.linkedinQualifying === true) {
    if (entry.draftCreated === true || entry.draftId) return ANALYSIS_RESULT.QUALIFIED;
    return ANALYSIS_RESULT.GENERATION_FAILED;
  }
  return ANALYSIS_RESULT.SKIPPED;
}

export function normalizeAnalysisRecord(raw, eventLookup) {
  if (!raw || typeof raw !== 'object' || typeof raw.eventId !== 'string') return null;
  const event = eventLookup?.get(raw.eventId);
  const analysisResult = resolveAnalysisResult(raw);
  const repo = repoById(raw.repoId || event?.repoId);
  return {
    id: typeof raw.id === 'string' ? raw.id : `sync-${raw.eventId}`,
    at: typeof raw.at === 'string' ? raw.at : '',
    eventId: raw.eventId,
    repoId: raw.repoId || event?.repoId || '',
    eventType: typeof raw.eventType === 'string' ? raw.eventType : (event?.type || '—'),
    eventTitle: typeof raw.eventTitle === 'string' ? raw.eventTitle : (event?.title || '—'),
    eventDescription: typeof raw.eventDescription === 'string' ? raw.eventDescription : (event?.description || ''),
    repoName: repo?.name || raw.repoId || '—',
    analysisResult,
    skipReason: typeof raw.linkedinSkipReason === 'string' ? raw.linkedinSkipReason : (analysisResult === ANALYSIS_RESULT.SKIPPED ? raw.linkedinSkipReason : null),
    skipReasonLabel: analysisResult === ANALYSIS_RESULT.SKIPPED
      ? linkedinSkipReasonLabel(raw.linkedinSkipReason)
      : (analysisResult === ANALYSIS_RESULT.GENERATION_FAILED
        ? (raw.generationFailureReason || 'Draft generation failed after the event was classified as qualifying.')
        : '—'),
    draftId: typeof raw.draftId === 'string' ? raw.draftId : (raw.draftCreated && typeof raw.eventId === 'string' ? `draft-${raw.eventId}` : null),
    linkedinQualifying: raw.linkedinQualifying === true || analysisResult !== ANALYSIS_RESULT.SKIPPED,
    linkedinCategory: typeof raw.linkedinCategory === 'string' ? raw.linkedinCategory : null,
  };
}

/** One row per unique eventId — first completed processing wins (re-sync is idempotent). */
export function completedEventAnalysisRecords(state) {
  const history = Array.isArray(state?.syncHistory) ? state.syncHistory : [];
  const events = Array.isArray(state?.githubEvents) ? state.githubEvents : [];
  const eventLookup = new Map(events.map((event) => [event.id, event]));
  const byEvent = new Map();
  [...history].reverse().forEach((row) => {
    const normalized = normalizeAnalysisRecord(row, eventLookup);
    if (!normalized || byEvent.has(normalized.eventId)) return;
    byEvent.set(normalized.eventId, normalized);
  });
  return Array.from(byEvent.values()).sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Single source of truth for LinkedIn Studio analytics.
 *
 * Partition (each processed GitHub event counted once):
 *   eventsAnalyzed = eventsSkipped + draftsCreated + generationFailed
 *   qualifyingEvents (eligible) = draftsCreated + generationFailed
 */
export function linkedinStudioAnalytics(state) {
  const records = completedEventAnalysisRecords(state);
  const drafts = Array.isArray(state?.linkedinDrafts) ? state.linkedinDrafts : [];
  const draftStats = linkedinDraftStats(drafts);

  let eventsSkipped = 0;
  let generationFailed = 0;
  let draftsCreated = 0;

  records.forEach((row) => {
    if (row.analysisResult === ANALYSIS_RESULT.SKIPPED) eventsSkipped += 1;
    else if (row.analysisResult === ANALYSIS_RESULT.GENERATION_FAILED) generationFailed += 1;
    else if (row.analysisResult === ANALYSIS_RESULT.QUALIFIED) draftsCreated += 1;
  });

  const eventsAnalyzed = records.length;
  const qualifyingEvents = draftsCreated + generationFailed;

  return {
    eventsAnalyzed,
    eventsSkipped,
    draftsCreated,
    qualifyingEvents,
    generationFailed,
    pendingApproval: draftStats.pending,
    publishedDemo: draftStats.published,
    rejected: draftStats.rejected,
    seededDemoDrafts: drafts.filter((d) => isSeededDemoDraft(d)).length,
    records,
    formulas: {
      eventsAnalyzed: 'eventsSkipped + draftsCreated + generationFailed',
      qualifyingEvents: 'draftsCreated + generationFailed',
      draftsCreated: 'github_event auto-drafts (excludes seeded_demo and alternatives)',
    },
  };
}

/** @deprecated Use linkedinStudioAnalytics */
export function linkedinAutomationStats(state) {
  const a = linkedinStudioAnalytics(state);
  return {
    active: true,
    eventsAnalyzed: a.eventsAnalyzed,
    qualifyingEvents: a.qualifyingEvents,
    draftsCreated: a.draftsCreated,
    eventsSkipped: a.eventsSkipped,
    generationFailed: a.generationFailed,
  };
}
