import { CATEGORIES, EVIDENCE_SEED, SKILL_CATEGORY, SKILL_SUBCAT } from '../data/constants.js';

/** Build the Developer Skill Profile from the repositories explicitly selected. */
export function buildProfile(repos) {
  const map = new Map();
  repos.forEach((repo) => {
    repo.skills.forEach((skill) => {
      if (!map.has(skill)) {
        map.set(skill, {
          name: skill,
          repos: [],
          category: SKILL_CATEGORY[skill] || 'devops',
          sub: SKILL_SUBCAT[skill] || '',
        });
      }
      map.get(skill).repos.push(repo.id);
    });
  });

  const skills = Array.from(map.values()).map((skill) => {
    const count = skill.repos.length;
    const evidence = EVIDENCE_SEED[skill.name] || 'detected';
    return {
      name: skill.name,
      category: skill.category,
      subcategory: skill.sub,
      repos: skill.repos,
      repoCount: count,
      evidence,
      lastDetected: new Date().toISOString(),
    };
  }).sort((a, b) => b.repoCount - a.repoCount || a.name.localeCompare(b.name));

  const languages = skills.filter((skill) => skill.category === 'languages').map((skill) => skill.name);
  const byCategory = {};
  CATEGORIES.forEach((category) => {
    byCategory[category.key] = skills.filter((skill) => skill.category === category.key).length;
  });

  const evidenceCounts = { detected: 0, verified: 0, demonstrated: 0 };
  skills.forEach((skill) => { evidenceCounts[skill.evidence] += 1; });

  return {
    skills,
    languages,
    stats: {
      analyzed: repos.length,
      totalSkills: skills.length,
      languages: languages.length,
      categories: byCategory,
      evidence: evidenceCounts,
      avgTechPerRepo: Math.round((repos.reduce((sum, repo) => sum + repo.skills.length, 0) / Math.max(1, repos.length)) * 10) / 10,
      totalStars: repos.reduce((sum, repo) => sum + repo.stars, 0),
    },
    generatedAt: new Date().toISOString(),
  };
}
