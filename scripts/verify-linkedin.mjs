import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEMO_PUBLISHED_STATUS, LINKEDIN_DEMO_USER, PENDING_STATUS, isPendingDraft, isPublishedDraft, postPreviewText } from '../src/services/linkedin.js';
import { normalizeState } from '../src/services/storage.js';

const page = readFileSync(new URL('../src/pages/LinkedInPage.jsx', import.meta.url), 'utf8');
assert.ok(page.includes('Pending Approval'));
assert.ok(page.includes('Published Posts'));
assert.ok(page.includes('Rejected Posts'));
assert.ok(page.includes('Approve & Publish'));
assert.ok(page.includes('Confirm Publication') === false, 'confirm label lives in ModalHost');
const modal = readFileSync(new URL('../src/components/modals/ModalHost.jsx', import.meta.url), 'utf8');
assert.ok(modal.includes('Confirm Publication'));
assert.ok(modal.includes('linkedin-oauth'));
assert.ok(modal.includes('linkedinPublish'));

const loaded = normalizeState({
  linkedinConnected: true,
  linkedinConnectedAt: '2026-03-01T12:00:00.000Z',
  linkedinDrafts: [{
    id: 'draft-1',
    eventId: 'evt-1',
    repoId: 'portfolio-website',
    eventType: 'release',
    eventTitle: 'Release shipped',
    title: 'Ship note',
    body: 'Body text',
    hashtags: ['React', 'TypeScript'],
    tone: 'Professional',
    status: DEMO_PUBLISHED_STATUS,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-02T10:00:00.000Z',
    publishedAt: '2026-03-02T10:00:00.000Z',
    publishedAs: LINKEDIN_DEMO_USER.vanity,
  }, {
    id: 'draft-2',
    eventId: 'evt-2',
    repoId: 'portfolio-website',
    eventType: 'merge',
    eventTitle: 'Merge',
    title: 'Pending',
    body: 'Pending body',
    hashtags: ['Go'],
    tone: 'Professional',
    status: PENDING_STATUS,
    createdAt: '2026-03-03T10:00:00.000Z',
    updatedAt: '2026-03-03T10:00:00.000Z',
  }],
});

assert.equal(loaded.linkedinConnected, true);
assert.equal(loaded.linkedinConnectedAt, '2026-03-01T12:00:00.000Z');
assert.equal(loaded.linkedinDrafts.length, 2);
assert.ok(isPublishedDraft(loaded.linkedinDrafts[0]));
assert.ok(isPendingDraft(loaded.linkedinDrafts[1]));
assert.ok(postPreviewText(loaded.linkedinDrafts[0]).includes('#React'));
assert.ok(postPreviewText(loaded.linkedinDrafts[0]).includes('Ship note'));

const disconnected = normalizeState({ linkedinConnected: false, linkedinDrafts: loaded.linkedinDrafts });
assert.equal(disconnected.linkedinConnected, false);
assert.equal(disconnected.linkedinDrafts.length, 2);

console.log('verify-linkedin: connection state, sections, modals, and draft persistence passed');
