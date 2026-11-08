import assert from 'node:assert/strict';
import { repoById } from '../src/data/constants.js';
import { buildProfile } from '../src/services/profile.js';
import { workspaceMetrics } from '../src/services/workspaceMetrics.js';
import { DEMO_PUBLISHED_STATUS } from '../src/services/linkedin.js';
import { normalizeState } from '../src/services/storage.js';

const repos = ['portfolio-website', 'restaurant-management-system'].map(repoById).filter(Boolean);
const profile = buildProfile(repos);

const empty = workspaceMetrics(normalizeState(null));
assert.equal(empty.processedGithubEvents, 0);
assert.equal(empty.pendingGithubEvents, 0);
assert.equal(empty.linkedinDraftsPending, 3);
assert.equal(empty.linkedinTotalDrafts, 3);
assert.equal(empty.linkedinPublishedPosts, 0);
assert.equal(empty.savedJobs, 0);
assert.equal(empty.analyzedRepositories, 0);

const busy = workspaceMetrics(normalizeState({
  connected: true,
  selected: repos.map((repo) => repo.id),
  analyzed: true,
  analysisFinishedAt: '2026-03-01T10:00:00.000Z',
  profile,
  stats: profile.stats,
  githubEvents: [
    { id: 'e1', repoId: 'portfolio-website', type: 'release', title: 'Release', description: 'Shipped', timestamp: '2026-03-01T10:00:00.000Z', status: 'processed', metadata: {} },
    { id: 'e2', repoId: 'portfolio-website', type: 'commit', title: 'Commit', description: 'Work', timestamp: '2026-03-02T10:00:00.000Z', status: 'pending', metadata: {} },
  ],
  linkedinDrafts: [
    { id: 'd1', eventId: 'e1', repoId: 'portfolio-website', eventType: 'release', eventTitle: 'R', title: 'T', body: 'B', hashtags: [], tone: 'Professional', status: 'Awaiting Approval', createdAt: '2026-03-01T10:00:00.000Z', updatedAt: '2026-03-01T10:00:00.000Z' },
    { id: 'd2', eventId: 'e2', repoId: 'portfolio-website', eventType: 'release', eventTitle: 'R', title: 'T2', body: 'B2', hashtags: [], tone: 'Professional', status: DEMO_PUBLISHED_STATUS, createdAt: '2026-03-01T10:00:00.000Z', updatedAt: '2026-03-02T10:00:00.000Z', publishedAt: '2026-03-02T10:00:00.000Z' },
  ],
  savedJobs: [{ jobId: 'job-northwind-frontend', savedAt: '2026-03-01T12:00:00.000Z' }],
}));

assert.equal(busy.trackedProjects, 2);
assert.equal(busy.analyzedRepositories, 2);
assert.ok(busy.detectedSkills > 0);
assert.equal(busy.processedGithubEvents, 1);
assert.equal(busy.pendingGithubEvents, 1);
assert.equal(busy.linkedinDraftsPending, 1);
assert.equal(busy.linkedinPublishedPosts, 1);
assert.equal(busy.savedJobs, 1);

console.log('verify-phase4: workspace metrics and demo consistency checks passed');
