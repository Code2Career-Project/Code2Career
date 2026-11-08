import assert from 'node:assert/strict';
import { REPOS } from '../src/data/constants.js';
import { applyNextEvent } from '../src/services/activity.js';
import {
  DEMO_PUBLISHED_STATUS,
  PENDING_STATUS,
  REJECTED_STATUS,
  seedSampleLinkedInDrafts,
} from '../src/services/linkedin.js';
import {
  ANALYSIS_RESULT,
  DRAFT_ORIGIN,
  linkedinStudioAnalytics,
  migrateDraftOrigin,
} from '../src/services/linkedinAnalytics.js';
import { normalizeState, STORAGE_KEY } from '../src/services/storage.js';

const repo = (id) => REPOS.find((item) => item.id === id);

function baseState() {
  return normalizeState(null);
}

function pendingEvent(overrides) {
  return {
    id: overrides.id,
    repoId: overrides.repoId,
    type: overrides.type,
    title: overrides.title,
    description: overrides.description,
    timestamp: '2026-03-05T10:00:00.000Z',
    status: 'pending',
    metadata: overrides.metadata || {},
  };
}

function metrics(state) {
  return linkedinStudioAnalytics(state);
}

function assertPartition(a) {
  assert.equal(
    a.eventsAnalyzed,
    a.eventsSkipped + a.draftsCreated + a.generationFailed,
    'Events Analyzed partition',
  );
  assert.equal(a.qualifyingEvents, a.draftsCreated + a.generationFailed, 'Qualifying Events');
}

function processEvents(state, events) {
  let current = { ...state, githubEvents: events, processedEventIds: [], syncHistory: [] };
  events.forEach(() => {
    const step = applyNextEvent(current);
    assert.equal(step.changed, true);
    current = step.state;
  });
  return current;
}

// 1) Two skipped + one qualifying with successful draft
{
  const skipA = pendingEvent({
    id: 'evt-skip-a',
    repoId: 'education-dashboard',
    type: 'commit',
    title: 'Commit: adjust gradebook copy',
    description: 'typo fix',
    metadata: { meaningful: false },
  });
  const skipB = pendingEvent({
    id: 'evt-skip-b',
    repoId: 'dev-portfolio-api',
    type: 'push',
    title: 'Push to feature/content-endpoints',
    description: 'push only',
    metadata: { meaningful: false },
  });
  const qualify = pendingEvent({
    id: 'evt-qual-ok',
    repoId: 'task-management-api',
    type: 'merge',
    title: 'Merge: fix authentication token validation',
    description: 'Merged a fix.',
    metadata: { meaningful: true, linkedinCategory: 'bug_fix', skill: 'Go' },
  });
  const state = processEvents(baseState(), [skipA, skipB, qualify]);
  const a = metrics(state);
  assert.equal(a.eventsAnalyzed, 3);
  assert.equal(a.eventsSkipped, 2);
  assert.equal(a.draftsCreated, 1);
  assert.equal(a.generationFailed, 0);
  assert.equal(a.qualifyingEvents, 1);
  assertPartition(a);
}

// 2) Two skipped + one qualifying with generation failure
{
  const fail = pendingEvent({
    id: 'evt-qual-fail',
    repoId: 'ml-image-classifier',
    type: 'merge',
    title: 'Merge: PyTorch inference path',
    description: 'Feature merge',
    metadata: { meaningful: true, linkedinCategory: 'new_feature', skill: 'PyTorch', simulateDraftFailure: true },
  });
  const state = processEvents(baseState(), [
    pendingEvent({ id: 'evt-skip-c', repoId: 'education-dashboard', type: 'commit', title: 'Commit: lint', description: 'format', metadata: { meaningful: false } }),
    pendingEvent({ id: 'evt-skip-d', repoId: 'dev-portfolio-api', type: 'push', title: 'Push', description: 'minor', metadata: { meaningful: false } }),
    fail,
  ]);
  const a = metrics(state);
  assert.equal(a.eventsAnalyzed, 3);
  assert.equal(a.eventsSkipped, 2);
  assert.equal(a.draftsCreated, 0);
  assert.equal(a.generationFailed, 1);
  assert.equal(a.qualifyingEvents, 1);
  assertPartition(a);
  const row = a.records.find((r) => r.eventId === 'evt-qual-fail');
  assert.equal(row.analysisResult, ANALYSIS_RESULT.GENERATION_FAILED);
}

// 3) Three skipped events + three seeded demo drafts — seeds do not affect event metrics
{
  const state = normalizeState(null);
  assert.equal(state.linkedinDrafts.length, 3);
  const skippedOnly = processEvents({ ...state, linkedinDrafts: seedSampleLinkedInDrafts() }, [
    pendingEvent({ id: 'evt-s1', repoId: 'education-dashboard', type: 'commit', title: 'Commit: typo', description: 'x', metadata: { meaningful: false } }),
    pendingEvent({ id: 'evt-s2', repoId: 'dev-portfolio-api', type: 'push', title: 'Push', description: 'x', metadata: { meaningful: false } }),
    pendingEvent({ id: 'evt-s3', repoId: 'education-dashboard', type: 'commit', title: 'Commit: format', description: 'lint', metadata: { meaningful: false } }),
  ]);
  const a = metrics(skippedOnly);
  assert.equal(a.eventsAnalyzed, 3);
  assert.equal(a.eventsSkipped, 3);
  assert.equal(a.draftsCreated, 0);
  assert.equal(a.seededDemoDrafts, 3);
  assertPartition(a);
}

function publishDraft(state, id) {
  const now = '2026-03-06T12:00:00.000Z';
  return {
    ...state,
    linkedinDrafts: state.linkedinDrafts.map((d) => (
      d.id === id ? { ...d, status: DEMO_PUBLISHED_STATUS, publishedAt: now, updatedAt: now } : d
    )),
  };
}

function rejectDraft(state, id) {
  const now = '2026-03-06T12:00:00.000Z';
  return {
    ...state,
    linkedinDrafts: state.linkedinDrafts.map((d) => (
      d.id === id ? { ...d, status: REJECTED_STATUS, rejectedAt: now, updatedAt: now, rejectionReason: 'Other' } : d
    )),
  };
}

// 4) Seeded draft published — event metrics unchanged
{
  const before = metrics(normalizeState(null));
  const seed = before.seededDemoDrafts;
  const published = publishDraft(normalizeState(null), 'draft-seed-announcement');
  const after = metrics(published);
  assert.deepEqual(
    { eventsAnalyzed: after.eventsAnalyzed, draftsCreated: after.draftsCreated, skipped: after.eventsSkipped },
    { eventsAnalyzed: before.eventsAnalyzed, draftsCreated: before.draftsCreated, skipped: before.eventsSkipped },
  );
  assert.equal(after.publishedDemo, 1);
  assert.equal(after.seededDemoDrafts, seed);
}

// 5) Event-generated draft published — event metrics unchanged
{
  const qualify = pendingEvent({
    id: 'evt-pub',
    repoId: 'task-management-api',
    type: 'merge',
    title: 'Merge: fix auth',
    description: 'fix',
    metadata: { meaningful: true, linkedinCategory: 'bug_fix', skill: 'Go' },
  });
  let state = processEvents(baseState(), [qualify]);
  const before = metrics(state);
  state = publishDraft(state, 'draft-evt-pub');
  const after = metrics(state);
  assert.equal(after.eventsAnalyzed, before.eventsAnalyzed);
  assert.equal(after.draftsCreated, before.draftsCreated);
  assert.equal(after.publishedDemo, 1);
}

// 6) Rejected event draft — metrics unchanged
{
  const qualify = pendingEvent({
    id: 'evt-rej',
    repoId: 'task-management-api',
    type: 'merge',
    title: 'Merge: fix auth',
    description: 'fix',
    metadata: { meaningful: true, linkedinCategory: 'bug_fix', skill: 'Go' },
  });
  let state = processEvents(baseState(), [qualify]);
  const before = metrics(state);
  state = rejectDraft(state, 'draft-evt-rej');
  const after = metrics(state);
  assert.deepEqual(
    { analyzed: after.eventsAnalyzed, created: after.draftsCreated, failed: after.generationFailed },
    { analyzed: before.eventsAnalyzed, created: before.draftsCreated, failed: before.generationFailed },
  );
  assert.equal(after.rejected, 1);
}

// 7) Duplicate event processing
{
  const qualify = pendingEvent({
    id: 'evt-dup',
    repoId: 'task-management-api',
    type: 'merge',
    title: 'Merge: fix auth',
    description: 'fix',
    metadata: { meaningful: true, linkedinCategory: 'bug_fix', skill: 'Go' },
  });
  let state = processEvents(baseState(), [qualify]);
  const a1 = metrics(state);
  const dup = applyNextEvent(state);
  assert.equal(dup.changed, false);
  const a2 = metrics(dup.state);
  assert.deepEqual(a1, a2);
}

// 8) Refresh persistence
{
  const qualify = pendingEvent({
    id: 'evt-persist',
    repoId: 'task-management-api',
    type: 'merge',
    title: 'Merge: fix auth',
    description: 'fix',
    metadata: { meaningful: true, linkedinCategory: 'bug_fix', skill: 'Go' },
  });
  const state = processEvents(baseState(), [qualify]);
  const key = `${STORAGE_KEY}-analytics-test`;
  const original = globalThis.localStorage;
  const mem = new Map();
  globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, v); },
    removeItem: (k) => { mem.delete(k); },
  };
  try {
    mem.set(key, JSON.stringify(state));
    const parsed = JSON.parse(mem.get(key));
    const reloaded = metrics(normalizeState(parsed));
    assert.equal(reloaded.eventsAnalyzed, 1);
    assert.equal(reloaded.draftsCreated, 1);
    assertPartition(reloaded);
  } finally {
    globalThis.localStorage = original;
  }
}

// 9) Legacy records with unknown origins
{
  const legacy = normalizeState({
    linkedinDrafts: [{
      id: 'draft-legacy-1',
      eventId: 'evt-old',
      repoId: 'portfolio-website',
      eventType: 'release',
      eventTitle: 'Old',
      title: 'T',
      body: 'B',
      hashtags: [],
      tone: 'Professional',
      status: PENDING_STATUS,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }],
  }).linkedinDrafts[0];
  assert.equal(migrateDraftOrigin(legacy.source, legacy.eventId, legacy.alternativeOf), DRAFT_ORIGIN.LEGACY_UNKNOWN);
}

// 10) History links between events and drafts
{
  const qualify = pendingEvent({
    id: 'evt-link',
    repoId: 'task-management-api',
    type: 'merge',
    title: 'Merge: fix auth',
    description: 'fix',
    metadata: { meaningful: true, linkedinCategory: 'bug_fix', skill: 'Go' },
  });
  const state = processEvents(baseState(), [qualify]);
  const a = metrics(state);
  const row = a.records.find((r) => r.eventId === 'evt-link');
  assert.ok(row);
  assert.equal(row.analysisResult, ANALYSIS_RESULT.QUALIFIED);
  assert.equal(row.draftId, 'draft-evt-link');
  assert.ok(state.linkedinDrafts.some((d) => d.id === row.draftId));
}

console.log('verify-linkedin-analytics: 10 analytics consistency scenarios passed');
