import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PENDING_STATUS,
  DEMO_PUBLISHED_STATUS,
  REJECTED_STATUS,
  filterLinkedInDrafts,
  generateAlternativeDraft,
  isPendingDraft,
  isPublishedDraft,
  isRejectedDraft,
  normalizeDraftStatus,
  seedSampleLinkedInDrafts,
  buildSimulatedDraft,
} from '../src/services/linkedin.js';
import { normalizeState } from '../src/services/storage.js';

const seeds = seedSampleLinkedInDrafts();
assert.equal(seeds.length, 3);
assert.ok(seeds.every((d) => isPendingDraft(d)));
assert.ok(seeds.every((d) => d.aiGenerated));
assert.ok(new Set(seeds.map((d) => d.id)).size === 3);
assert.ok(seeds.some((d) => d.repoId === 'restaurant-management-system'));

const fresh = normalizeState(null);
assert.equal(fresh.linkedinDrafts.length, 3);

assert.equal(normalizeDraftStatus('Draft'), PENDING_STATUS);
assert.equal(normalizeDraftStatus('Ready for Review'), PENDING_STATUS);

const gen = buildSimulatedDraft({ repoId: 'portfolio-website', purpose: 'Project Announcement', tone: 'Professional' });
assert.ok(gen && isPendingDraft(gen));

const alt = generateAlternativeDraft(seeds[0]);
assert.ok(alt && alt.id !== seeds[0].id && alt.alternativeOf === seeds[0].id);

const filtered = filterLinkedInDrafts([...seeds, { ...seeds[0], id: 'pub-1', status: DEMO_PUBLISHED_STATUS, publishedAt: '2026-01-01T00:00:00.000Z' }], { tab: 'pending', q: 'restaurant' });
assert.equal(filtered.length, 1);

const page = readFileSync(new URL('../src/pages/LinkedInPage.jsx', import.meta.url), 'utf8');
assert.ok(page.includes('Pending Approval'));
assert.ok(!page.includes('Generate New Post'));
assert.ok(page.includes('GitHub Event Analysis History'));
assert.ok(page.includes('Events Analyzed'));

const migrated = normalizeState({
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
    status: 'Draft',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  }],
}).linkedinDrafts[0];
assert.equal(migrated.status, PENDING_STATUS);

console.log('verify-linkedin-studio: seeds, migration, filters, and UI hooks passed');
