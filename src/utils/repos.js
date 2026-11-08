import { REPOS } from '../data/constants.js';

export function filteredRepos(filters) {
  const q = (filters.q || '').trim().toLowerCase();
  return REPOS.filter((repo) => {
    if (filters.visibility !== 'all' && repo.visibility !== filters.visibility) return false;
    if (filters.language !== 'all' && repo.language !== filters.language) return false;
    if (q) {
      const hay = `${repo.name} ${repo.description} ${repo.language} ${repo.skills.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
