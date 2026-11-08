import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REPOS } from '../src/data/constants.js';
import { applyNextEvent } from '../src/services/activity.js';
import { classifyEventForLinkedIn } from '../src/services/linkedinEventClassifier.js';
import { draftFromEvent, seedSampleLinkedInDrafts } from '../src/services/linkedin.js';
import { normalizeState } from '../src/services/storage.js';
import { buildProfile } from '../src/services/profile.js';

const repo = (id) => REPOS.find((item) => item.id === id);

function baseState() {
  const state = normalizeState(null);
  state.connected = true;
  state.selected = ['chat-widget-sdk', 'portfolio-website'];
  state.profile = buildProfile(state.selected.map((id) => repo(id)).filter(Boolean));
  return state;
}

function pendingEvent(overrides) {
  return {
    id: overrides.id || `evt-test-${Math.random().toString(36).slice(2, 8)}`,
    repoId: overrides.repoId,
    type: overrides.type,
    title: overrides.title,
    description: overrides.description,
    timestamp: '2026-03-05T10:00:00.000Z',
    status: 'pending',
    metadata: overrides.metadata || {},
  };
}

const bug = pendingEvent({
  id: 'evt-bug-1',
  repoId: 'task-management-api',
  type: 'merge',
  title: 'Merge: fix authentication token validation',
  description: 'Merged a fix for authentication validation edge cases.',
  metadata: { meaningful: true, linkedinCategory: 'bug_fix', skill: 'Go' },
});
assert.equal(classifyEventForLinkedIn(bug, repo('task-management-api')).qualifies, true);
assert.ok(draftFromEvent(bug, repo('task-management-api')));

const feature = pendingEvent({
  id: 'evt-feature-1',
  repoId: 'ml-image-classifier',
  type: 'merge',
  title: 'Merge: PyTorch inference path',
  description: 'Feature merge',
  metadata: { meaningful: true, linkedinCategory: 'new_feature', skill: 'PyTorch' },
});
assert.ok(draftFromEvent(feature, repo('ml-image-classifier')));

const ui = pendingEvent({
  id: 'evt-ui-1',
  repoId: 'education-dashboard',
  type: 'pull_request',
  title: 'Pull request: responsive analytics dashboard layout',
  description: 'Dashboard UI improvements',
  metadata: { meaningful: true, linkedinCategory: 'ui_ux' },
});
assert.ok(draftFromEvent(ui, repo('education-dashboard')));

const perf = pendingEvent({
  id: 'evt-perf-1',
  repoId: 'dev-portfolio-api',
  type: 'pull_request',
  title: 'Pull request: optimize content query batching',
  description: 'Refactored query batching paths',
  metadata: { meaningful: true, linkedinCategory: 'performance' },
});
assert.ok(draftFromEvent(perf, repo('dev-portfolio-api')));

const minor = pendingEvent({
  id: 'evt-minor-1',
  repoId: 'education-dashboard',
  type: 'commit',
  title: 'Commit: adjust gradebook copy',
  description: 'typo fix',
  metadata: { meaningful: false },
});
assert.equal(classifyEventForLinkedIn(minor, repo('education-dashboard')).qualifies, false);
assert.equal(draftFromEvent(minor, repo('education-dashboard')), null);

const emptyish = pendingEvent({
  id: 'evt-empty-1',
  repoId: 'dev-portfolio-api',
  type: 'push',
  title: 'Push to feature/content-endpoints',
  description: 'push only',
  metadata: { meaningful: false },
});
assert.equal(draftFromEvent(emptyish, repo('dev-portfolio-api')), null);

let state = { ...baseState(), githubEvents: [bug], processedEventIds: [], linkedinDrafts: seedSampleLinkedInDrafts() };
const first = applyNextEvent(state);
assert.equal(first.outcome.draftCreated, true);
assert.equal(first.state.linkedinDrafts.filter((d) => d.eventId === bug.id).length, 1);
assert.equal(first.state.linkedinDrafts.filter((d) => d.eventId === bug.id)[0].eventId, bug.id);

const dup = applyNextEvent(first.state);
assert.equal(dup.changed, false);

state = { ...baseState(), githubEvents: [bug, feature], processedEventIds: [], linkedinDrafts: [] };
const batch = applyNextEvent(state);
const batch2 = applyNextEvent(batch.state);
assert.equal(batch2.state.linkedinDrafts.length, 2);

const page = readFileSync(new URL('../src/pages/LinkedInPage.jsx', import.meta.url), 'utf8');
assert.ok(!page.includes('Generate New Post'));
assert.ok(page.includes('GitHub Event Analysis History'));

const fresh = normalizeState(null);
assert.equal(fresh.linkedinDrafts.length, 3);
assert.ok(fresh.linkedinDrafts.every((d) => d.source === 'seeded_demo' || d.source === 'demo_seed' || String(d.eventId).startsWith('seed-event')));

console.log('verify-linkedin-events: classification, sync generation, dedupe, and UI restrictions passed');
