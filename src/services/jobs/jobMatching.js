import { inferExperienceLevel } from './developerJobProfile.js';

export const MATCH_WEIGHTS = {
  requiredSkills: 55,
  optionalSkills: 20,
  projectEvidence: 15,
  experienceAlignment: 10,
};

const SENIORITY_RANK = {
  Internship: 0,
  Junior: 1,
  'Mid-level': 2,
  Senior: 3,
};

function hasSkill(jobProfile, skillName) {
  return jobProfile.skillNameSet.has(String(skillName).toLowerCase());
}

function matchSkillList(jobProfile, list) {
  const items = Array.isArray(list) ? list : [];
  const matched = items.filter((skill) => hasSkill(jobProfile, skill));
  const missing = items.filter((skill) => !hasSkill(jobProfile, skill));
  return { matched, missing, total: items.length };
}

function projectEvidenceScore(jobProfile, matchedRequired) {
  if (!matchedRequired.length || !jobProfile.projects.length) return 0;
  let withProject = 0;
  matchedRequired.forEach((skill) => {
    const key = skill.toLowerCase();
    const hit = jobProfile.projects.some((project) => project.skills.some((s) => s.toLowerCase() === key));
    if (hit) withProject += 1;
  });
  return withProject / matchedRequired.length;
}

function seniorityAlignment(job, jobProfile) {
  const inferred = inferExperienceLevel(jobProfile);
  const jobRank = SENIORITY_RANK[job.seniority] ?? 2;
  const devRank = SENIORITY_RANK[inferred] ?? 1;
  const diff = Math.abs(jobRank - devRank);
  if (diff === 0) return 1;
  if (diff === 1) return 0.65;
  if (diff === 2) return 0.35;
  return 0.15;
}

function relatedProjects(jobProfile, matchedSkills) {
  const wanted = new Set(matchedSkills.map((s) => s.toLowerCase()));
  const ids = new Set();
  jobProfile.projects.forEach((project) => {
    if (project.skills.some((skill) => wanted.has(skill.toLowerCase()))) ids.add(project.id);
  });
  jobProfile.skills.forEach((skill) => {
    if (!wanted.has(skill.name.toLowerCase())) return;
    skill.repos.forEach((id) => ids.add(id));
  });
  return Array.from(ids);
}

/** Deterministic match score from developer profile and vacancy only. */
export function calculateJobMatch(job, jobProfile) {
  if (!jobProfile) {
    return {
      percent: 0,
      matchedRequired: [],
      missingRequired: job.requiredSkills || [],
      matchedOptional: [],
      missingOptional: job.optionalSkills || [],
      relatedProjects: [],
      demonstratedTechnologies: [],
      factors: {},
      inferredExperience: 'Junior',
    };
  }

  const required = matchSkillList(jobProfile, job.requiredSkills);
  const optional = matchSkillList(jobProfile, job.optionalSkills);
  const requiredScore = required.total ? required.matched.length / required.total : 0;
  const optionalScore = optional.total ? optional.matched.length / optional.total : 0;
  const projectScore = projectEvidenceScore(jobProfile, required.matched);
  const experienceScore = seniorityAlignment(job, jobProfile);

  const percent = Math.round(
    requiredScore * MATCH_WEIGHTS.requiredSkills
    + optionalScore * MATCH_WEIGHTS.optionalSkills
    + projectScore * MATCH_WEIGHTS.projectEvidence
    + experienceScore * MATCH_WEIGHTS.experienceAlignment,
  );

  const related = relatedProjects(jobProfile, [...required.matched, ...optional.matched]);
  const demonstratedTechnologies = jobProfile.skills
    .filter((skill) => required.matched.some((r) => r.toLowerCase() === skill.name.toLowerCase())
      || optional.matched.some((o) => o.toLowerCase() === skill.name.toLowerCase()))
    .map((skill) => ({ name: skill.name, evidence: skill.evidence }));

  return {
    percent: Math.max(0, Math.min(100, percent)),
    matchedRequired: required.matched,
    missingRequired: required.missing,
    matchedOptional: optional.matched,
    missingOptional: optional.missing,
    relatedProjects: related,
    demonstratedTechnologies,
    inferredExperience: inferExperienceLevel(jobProfile),
    factors: {
      requiredSkills: Math.round(requiredScore * 100),
      optionalSkills: Math.round(optionalScore * 100),
      projectEvidence: Math.round(projectScore * 100),
      experienceAlignment: Math.round(experienceScore * 100),
    },
  };
}
