import { MATCH_WEIGHTS, calculateJobMatch } from './jobs/jobMatching.js';
import { explainJobMatch } from './jobs/jobMatchExplanation.js';
import { recommendJobs, MIN_MATCH_PERCENT, SORT_MODES } from './jobs/jobRecommendations.js';
import { buildDeveloperJobProfile, profileStrengthCoverage } from './jobs/developerJobProfile.js';

export { MATCH_WEIGHTS, MIN_MATCH_PERCENT, SORT_MODES, recommendJobs, buildDeveloperJobProfile, profileStrengthCoverage };

/** @deprecated Manual preferences are ignored; uses profile-derived recommendations. */
export function rankJobs(profile, _preferences, options) {
  if (!profile) return [];
  const selected = [...new Set((profile.skills || []).flatMap((skill) => skill.repos))];
  return recommendJobs({
    analyzed: true,
    profile,
    selected,
    projects: {},
    connected: true,
    cvProfile: null,
  }, options).recommendations;
}

export function matchJob(job, profile) {
  const jobProfile = profile?.skills
    ? buildDeveloperJobProfile({ analyzed: true, profile, selected: [...new Set(profile.skills.flatMap((s) => s.repos))], projects: {} })
    : null;
  const match = calculateJobMatch(job, jobProfile);
  const explanation = explainJobMatch(job, jobProfile, match);
  return {
    ...match,
    reasons: explanation.bullets,
    summary: explanation.summary,
  };
}

export function salaryEligible() {
  return true;
}
