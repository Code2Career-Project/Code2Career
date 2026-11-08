import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEMO_PUBLISHED_STATUS, PENDING_STATUS } from '../src/services/linkedin.js';
import { migrateSavedJobs, normalizeState } from '../src/services/storage.js';

assert.equal(PENDING_STATUS, 'Awaiting Approval');
assert.equal(DEMO_PUBLISHED_STATUS, 'Published (Demo)');

const shell = readFileSync(new URL('../src/components/layout/AppShell.jsx', import.meta.url), 'utf8');
assert.ok(!shell.includes('/insights'));
assert.ok(!shell.includes('InsightsPage'));

const sidebar = readFileSync(new URL('../src/components/layout/Sidebar.jsx', import.meta.url), 'utf8');
assert.ok(!sidebar.includes('Career Insights'));

const migrated = normalizeState({
  version: 3,
  savedJobs: ['job-northwind-frontend'],
  applications: [{
    id: 'app-1',
    jobId: 'job-harbor-fullstack',
    title: 'Full-stack Engineer',
    company: 'Harbor Digital',
    status: 'Applied',
    appliedAt: '2026-03-01',
    updatedAt: '2026-03-02T10:00:00.000Z',
    notes: '',
    interviewDate: '',
    url: '',
  }],
  connected: true,
});
assert.equal(migrated.version, 4);
assert.equal(migrated.applications, undefined);
assert.equal(migrated.savedJobs.length, 2);
assert.ok(migrated.savedJobs.every((item) => item.jobId && item.savedAt));
assert.equal(migrated.savedJobs.filter((item) => item.jobId === 'job-northwind-frontend').length, 1);

const dup = migrateSavedJobs(
  ['job-northwind-frontend', { jobId: 'job-northwind-frontend', savedAt: '2026-01-01T00:00:00.000Z' }],
  [{ jobId: 'job-northwind-frontend', updatedAt: '2026-02-01T00:00:00.000Z' }],
);
assert.equal(dup.length, 1);

const draft = normalizeState({
  linkedinDrafts: [{
    id: 'draft-1',
    eventId: 'evt-1',
    repoId: 'portfolio-website',
    eventType: 'release',
    eventTitle: 'Release',
    title: 'Title',
    body: 'Body',
    hashtags: ['React'],
    tone: 'Professional',
    status: 'Published Externally',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  }],
}).linkedinDrafts[0];
assert.equal(draft.status, DEMO_PUBLISHED_STATUS);

console.log('verify-refinements: insights removal, saved jobs migration, and LinkedIn demo status passed');
