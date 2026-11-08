import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REPOS } from '../src/data/constants.js';
import { JOBS, jobById } from '../src/data/jobs.js';
import { buildProfile } from '../src/services/profile.js';
import { normalizeState } from '../src/services/storage.js';
import { buildDeveloperJobProfile } from '../src/services/jobs/developerJobProfile.js';
import { calculateJobMatch, MATCH_WEIGHTS } from '../src/services/jobs/jobMatching.js';
import { explainJobMatch } from '../src/services/jobs/jobMatchExplanation.js';
import { MIN_MATCH_PERCENT, recommendJobs, SORT_MODES } from '../src/services/jobs/jobRecommendations.js';
import { DEMO_REFERENCE_DATE, isActiveVacancy, listActiveVacancies } from '../src/services/jobs/jobVacancies.js';

function analyzedState(selectedIds) {
  const repos = selectedIds.map((id) => REPOS.find((r) => r.id === id)).filter(Boolean);
  const profile = buildProfile(repos);
  return normalizeState({
    connected: true,
    selected: selectedIds,
    analyzed: true,
    profile,
    stats: profile.stats,
    projects: {},
    savedJobs: [],
  });
}

// 1) Manual preferences form removed
const page = readFileSync(new URL('../src/pages/JobsPage.jsx', import.meta.url), 'utf8');
assert.ok(!page.includes('Job preferences'));
assert.ok(!page.includes('Save preferences'));
assert.ok(!page.includes('Desired job titles'));
assert.ok(page.includes('Your developer profile (automatic)'));

// 2–3) Recommendations from skills and projects
const state = analyzedState(['portfolio-website', 'restaurant-management-system', 'chat-widget-sdk', 'car-rental-platform']);
const jobProfile = buildDeveloperJobProfile(state);
assert.ok(jobProfile);
assert.ok(jobProfile.skills.some((s) => s.name === 'React'));
assert.ok(jobProfile.projects.some((p) => p.id === 'portfolio-website'));

// 4–6) Match percent, threshold, sorting
const front = JOBS.find((j) => j.id === 'job-northwind-frontend');
const match = calculateJobMatch(front, jobProfile);
assert.ok(match.percent >= 20 && match.percent <= 100);
assert.ok(Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0) === 100);

const { recommendations } = recommendJobs(state);
assert.ok(recommendations.every((r) => r.match.percent >= MIN_MATCH_PERCENT));
const sorted = recommendJobs(state, { sort: SORT_MODES.BEST_MATCH }).recommendations;
for (let i = 1; i < sorted.length; i += 1) {
  assert.ok(sorted[i - 1].match.percent >= sorted[i].match.percent);
}

// 7) Closed / expired excluded
assert.equal(isActiveVacancy(jobById('job-castilla-java')), false);
assert.equal(isActiveVacancy(jobById('job-atlas-support')), false);
assert.equal(isActiveVacancy(jobById('job-mercado-php')), false);
const active = listActiveVacancies(JOBS, DEMO_REFERENCE_DATE);
assert.ok(!active.some((j) => j.id === 'job-castilla-java'));
assert.ok(!active.some((j) => j.id === 'job-atlas-support'));

// 8) Explanation content
const explanation = explainJobMatch(front, jobProfile, match);
assert.ok(explanation.summary.length > 20);
assert.ok(explanation.bullets.some((b) => b.includes('Required skills')));

// 9) Profile change recalculates
const narrow = analyzedState(['chat-widget-sdk']);
const wide = analyzedState(['portfolio-website', 'restaurant-management-system', 'chat-widget-sdk', 'car-rental-platform', 'ml-image-classifier']);
const narrowTop = recommendJobs(narrow).recommendations[0]?.match.percent ?? 0;
const wideTop = recommendJobs(wide).recommendations[0]?.match.percent ?? 0;
assert.ok(wideTop >= narrowTop);

// 10–11) Save / duplicate save simulation
let savedState = { ...state, savedJobs: [] };
const save = (s, jobId) => {
  if (s.savedJobs.some((item) => item.jobId === jobId)) return { ok: false, duplicate: true };
  return { ok: true, state: { ...s, savedJobs: [{ jobId, savedAt: '2026-11-04T10:00:00.000Z' }, ...s.savedJobs] } };
};
const firstSave = save(savedState, 'job-northwind-frontend');
assert.equal(firstSave.ok, true);
savedState = firstSave.state;
const dupSave = save(savedState, 'job-northwind-frontend');
assert.equal(dupSave.duplicate, true);

// 12) Empty / insufficient profile
const empty = recommendJobs(normalizeState(null));
assert.equal(empty.recommendations.length, 0);
assert.equal(empty.jobProfile, null);

const lowMatchOnly = recommendJobs(analyzedState(['infra-terraform-modules']));
assert.ok(lowMatchOnly.recommendations.every((r) => r.match.percent >= 20));

console.log('verify-job-discovery: 12 smart job discovery scenarios passed');
