import assert from 'node:assert/strict';
import { REPOS } from '../src/data/constants.js';
import { analyzeProjectLifecycle, projectResult } from '../src/services/lifecycle.js';
import { buildProfile } from '../src/services/profile.js';
import { STORAGE_KEY, normalizeCV, normalizeState } from '../src/services/storage.js';
import { filteredRepos } from '../src/utils/repos.js';

const byId = (id) => REPOS.find((repo) => repo.id === id);
const stageOf = (id) => analyzeProjectLifecycle(byId(id), {}).stage;

const expectedStages = {
  'restaurant-management-system': 'In development',
  'car-rental-platform': 'Published',
  'education-dashboard': 'In development',
  'portfolio-website': 'Published',
  'task-management-api': 'In development',
  'ecommerce-platform': 'In development',
  'university-management-system': 'In development',
  'dev-portfolio-api': 'In development',
  'chat-widget-sdk': 'In development',
  'ml-image-classifier': 'In development',
  'react-native-notes': 'In development',
  'infra-terraform-modules': 'Published',
};

Object.entries(expectedStages).forEach(([id, stage]) => {
  assert.equal(stageOf(id), stage, `${id} stage`);
});

const restaurant = analyzeProjectLifecycle(byId('restaurant-management-system'), {});
assert.equal(restaurant.completionPercentage, 40);
assert.match(restaurant.analysisSummary, /add it to the CV after it is published/i);

const published = analyzeProjectLifecycle(byId('car-rental-platform'), {});
assert.equal(published.completionPercentage, 100);
assert.match(published.analysisSummary, /Include this project in the CV/);

const resumed = analyzeProjectLifecycle(byId('dev-portfolio-api'), {});
assert.equal(resumed.stage, 'In development');
assert.ok(resumed.evidence.some((item) => item.text.includes('after the last publication')));

const saved = projectResult({
  'portfolio-website': { result: { stage: 'Maintenance', evidence: [{ kind: 'Existing', text: 'old' }], remainingTasks: ['old task'], completionPercentage: 80 } },
}, 'portfolio-website');
assert.equal(saved.stage, 'Published');
assert.match(saved.analysisSummary, /Include this project in the CV/);

const fresh = normalizeState(null);
assert.equal(fresh.connected, false);
assert.equal(fresh.cvProfile.personal.name, '');
assert.equal(fresh.version, 4);
assert.equal(fresh.notifications.length, 3);
assert.equal(STORAGE_KEY, 'devcareer-ai:phase1');

const migrated = normalizeState({
  connected: 1,
  selected: ['missing-repo', 'portfolio-website'],
  notifications: [],
  profile: {
    skills: [{ name: 'React', repos: ['portfolio-website'], category: 'frontend', evidence: 'detected' }],
    stats: { analyzed: 1 },
  },
  analyzed: true,
});
assert.deepEqual(migrated.selected, ['portfolio-website']);
assert.equal(migrated.connected, true);
assert.equal(migrated.profile.skills[0].evidence, 'demonstrated');
assert.equal(migrated.analyzed, true);
assert.equal(migrated.notifications.length, 3);
assert.equal(migrated.analyzing, false);

const broken = normalizeState({ profile: { skills: 'nope' }, cvProfile: { personal: { name: 12 }, skills: ['Go', 4] } });
assert.equal(broken.analyzed, false);
assert.equal(broken.profile, null);
assert.equal(broken.cvProfile.personal.name, '');
assert.deepEqual(broken.cvProfile.skills, ['Go']);

const profile = buildProfile([byId('restaurant-management-system'), byId('chat-widget-sdk')]);
assert.equal(profile.stats.analyzed, 2);
assert.ok(profile.skills.find((skill) => skill.name === 'React').repoCount === 2);
assert.equal(profile.skills.find((skill) => skill.name === 'React').evidence, 'demonstrated');
assert.ok(profile.skills.find((skill) => skill.name === 'Vitest').evidence === 'detected');

const filtered = filteredRepos({ q: 'prisma', visibility: 'Private', language: 'TypeScript' });
assert.deepEqual(filtered.map((repo) => repo.id), ['restaurant-management-system']);
assert.deepEqual(normalizeCV(null).projects, []);

console.log(`verify-logic: ${REPOS.length} repositories, lifecycle stages, storage migration, and profile builder passed`);
