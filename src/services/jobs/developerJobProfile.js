import { repoById } from '../../data/constants.js';
import { projectResult } from '../lifecycle.js';

const EVIDENCE_RANK = { detected: 0, verified: 1, demonstrated: 2 };

/** Normalized profile for job matching — derived only from analyzed app data. */
export function buildDeveloperJobProfile(state) {
  if (!state?.analyzed || !state?.profile || !Array.isArray(state.profile.skills)) {
    return null;
  }

  const profile = state.profile;
  const selectedIds = Array.isArray(state.selected) && state.selected.length
    ? state.selected
    : [...new Set(profile.skills.flatMap((skill) => skill.repos))];

  const skills = profile.skills.map((skill) => ({
    name: skill.name,
    evidence: skill.evidence || 'detected',
    evidenceRank: EVIDENCE_RANK[skill.evidence] ?? 0,
    repos: Array.isArray(skill.repos) ? [...skill.repos] : [],
    category: skill.category || '',
  }));

  const projects = selectedIds.map((id) => {
    const repo = repoById(id);
    if (!repo) return null;
    const lifecycle = projectResult(state.projects, id);
    return {
      id: repo.id,
      name: repo.name,
      description: repo.description || '',
      language: repo.language || '',
      skills: Array.isArray(repo.skills) ? [...repo.skills] : [],
      stage: lifecycle?.stage || null,
    };
  }).filter(Boolean);

  const skillNameSet = new Set(skills.map((s) => s.name.toLowerCase()));
  const demonstrated = skills.filter((s) => s.evidence === 'demonstrated').map((s) => s.name);
  const verified = skills.filter((s) => s.evidence === 'verified').map((s) => s.name);

  return {
    skills,
    skillNameSet,
    demonstratedSkills: demonstrated,
    verifiedSkills: verified,
    languages: Array.isArray(profile.languages) ? [...profile.languages] : [],
    projects,
    evidenceTotals: profile.stats?.evidence || { detected: 0, verified: 0, demonstrated: 0 },
    totalSkills: skills.length,
    analyzedRepositories: profile.stats?.analyzed || projects.length,
    generatedAt: profile.generatedAt || null,
    professionalTitle: typeof state.cvProfile?.personal?.title === 'string' ? state.cvProfile.personal.title.trim() : '',
    location: typeof state.cvProfile?.personal?.location === 'string' ? state.cvProfile.personal.location.trim() : '',
  };
}

export function inferExperienceLevel(jobProfile) {
  if (!jobProfile) return 'Junior';
  const e = jobProfile.evidenceTotals;
  if (e.demonstrated >= 3) return 'Senior';
  if (e.demonstrated >= 1 && jobProfile.totalSkills >= 10) return 'Mid-level';
  if (e.verified >= 4 || jobProfile.totalSkills >= 14) return 'Mid-level';
  if (jobProfile.totalSkills >= 8) return 'Mid-level';
  if (e.demonstrated >= 1) return 'Mid-level';
  return 'Junior';
}

export function profileStrengthCoverage(jobProfile) {
  if (!jobProfile || !jobProfile.totalSkills) return null;
  const { detected, verified, demonstrated } = jobProfile.evidenceTotals;
  const weighted = demonstrated * 2 + verified * 1.5 + detected * 0.5;
  const max = jobProfile.totalSkills * 2;
  return Math.round(Math.min(100, (weighted / max) * 100));
}
