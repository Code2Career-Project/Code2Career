import { buildDeveloperJobProfile } from './developerJobProfile.js';
import { calculateJobMatch } from './jobMatching.js';
import { explainJobMatch } from './jobMatchExplanation.js';
import { DEMO_REFERENCE_DATE, listActiveVacancies } from './jobVacancies.js';

export const MIN_MATCH_PERCENT = 20;

export const SORT_MODES = {
  BEST_MATCH: 'best-match',
  RECENT: 'recent',
  CLOSING: 'closing-soon',
};

function sortRecommendations(list, mode) {
  const copy = list.slice();
  if (mode === SORT_MODES.RECENT) {
    copy.sort((a, b) => b.job.postedAt.localeCompare(a.job.postedAt) || b.match.percent - a.match.percent);
    return copy;
  }
  if (mode === SORT_MODES.CLOSING) {
    copy.sort((a, b) => {
      const da = a.job.applicationDeadline || '9999-12-31';
      const db = b.job.applicationDeadline || '9999-12-31';
      return da.localeCompare(db) || b.match.percent - a.match.percent;
    });
    return copy;
  }
  copy.sort((a, b) => b.match.percent - a.match.percent || a.job.title.localeCompare(b.job.title));
  return copy;
}

/**
 * Recommend active demo vacancies for the current workspace state.
 * Ignores legacy manual job preferences.
 */
export function recommendJobs(state, { sort = SORT_MODES.BEST_MATCH, referenceDate = DEMO_REFERENCE_DATE } = {}) {
  const jobProfile = buildDeveloperJobProfile(state);
  const active = listActiveVacancies(undefined, referenceDate);

  if (!jobProfile) {
    return {
      jobProfile: null,
      activeVacancyCount: active.length,
      recommendations: [],
      matchingCount: 0,
    };
  }

  const scored = active.map((job) => {
    const match = calculateJobMatch(job, jobProfile);
    const explanation = explainJobMatch(job, jobProfile, match);
    return {
      job,
      match: {
        ...match,
        reasons: explanation.bullets,
        summary: explanation.summary,
        mainReason: explanation.mainReason,
      },
    };
  }).filter((entry) => entry.match.percent >= MIN_MATCH_PERCENT);

  const recommendations = sortRecommendations(scored, sort);

  return {
    jobProfile,
    activeVacancyCount: active.length,
    recommendations,
    matchingCount: recommendations.length,
  };
}
