import assert from 'node:assert/strict';
import { REPOS } from '../src/data/constants.js';
import { applyNextEvent, nextSimulatedEvent, syncAllPending } from '../src/services/activity.js';
import { buildProfile } from '../src/services/profile.js';
import { rankJobs } from '../src/services/matching.js';
import { MIN_MATCH_PERCENT } from '../src/services/jobs/jobRecommendations.js';
import { normalizeState, defaultState } from '../src/services/storage.js';

const base = () => {
  const state = normalizeState(null);
  state.connected = true;
  state.selected = ['chat-widget-sdk', 'portfolio-website', 'car-rental-platform'];
  state.analyzed = true;
  state.profile = buildProfile(state.selected.map((id) => REPOS.find((repo) => repo.id === id)).filter(Boolean));
  state.stats = state.profile.stats;
  return state;
};

const first = nextSimulatedEvent([], '2026-03-01T10:00:00.000Z');
assert.ok(first);
assert.equal(first.status, 'pending');

let state = { ...base(), githubEvents: [first], processedEventIds: [] };
const once = applyNextEvent(state);
assert.equal(once.changed, true);
assert.equal(once.state.githubEvents[0].status, 'processed');
assert.equal(once.state.processedEventIds.length, 1);
const again = applyNextEvent(once.state);
assert.equal(again.changed, false);

const mergeTemplate = {
  repoId: 'chat-widget-sdk',
  type: 'merge',
  title: 'Merge: WebSocket presence updates',
  description: 'test',
  metadata: { skill: 'WebSocket', meaningful: true, linkedinCategory: 'new_feature' },
};
const mergeEvent = {
  id: 'evt-chat-widget-sdk-merge-test',
  ...mergeTemplate,
  timestamp: '2026-03-02T10:00:00.000Z',
  status: 'pending',
};
state = { ...base(), githubEvents: [mergeEvent], processedEventIds: [], linkedinDrafts: [] };
const before = state.profile.skills.find((skill) => skill.name === 'WebSocket').evidence;
const merged = applyNextEvent(state);
assert.notEqual(before, merged.state.profile.skills.find((skill) => skill.name === 'WebSocket').evidence);
assert.equal(merged.outcome.draftCreated, true);
assert.equal(merged.state.linkedinDrafts.length, 1);

const migrated = normalizeState({ version: 2, connected: true, selected: ['portfolio-website'], analyzed: false });
assert.equal(migrated.version, 4);
assert.deepEqual(migrated.githubEvents, []);
assert.ok(migrated.jobPreferences);

const profile = buildProfile(REPOS.slice(0, 4));
const ranked = rankJobs(profile);
assert.ok(ranked.length > 0);
const top = ranked[0];
assert.ok(top.match.percent >= MIN_MATCH_PERCENT);
assert.ok(Array.isArray(top.match.missingRequired));

const batchState = { ...base(), githubEvents: [first, mergeEvent], processedEventIds: [] };
const batch = syncAllPending(batchState);
assert.ok(batch.outcomes.length >= 2);

console.log('verify-phase3: activity sync, migration, and matching passed');
