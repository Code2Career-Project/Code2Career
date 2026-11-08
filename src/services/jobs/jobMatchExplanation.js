import { repoById } from '../../data/constants.js';
import { MATCH_WEIGHTS } from './jobMatching.js';

function projectNames(ids) {
  return ids.map((id) => repoById(id)?.name).filter(Boolean);
}

/** Human-readable, profile-specific explanation — no invented skills. */
export function explainJobMatch(job, jobProfile, match) {
  const bullets = [];
  if (match.matchedRequired.length) {
    bullets.push(`Required skills in your analyzed profile: ${match.matchedRequired.join(', ')}.`);
  }
  if (match.missingRequired.length) {
    bullets.push(`Required skills not found in your profile: ${match.missingRequired.join(', ')}.`);
  }
  if (match.matchedOptional.length) {
    bullets.push(`Optional skills you also have: ${match.matchedOptional.join(', ')}.`);
  }
  const projects = projectNames(match.relatedProjects);
  if (projects.length) {
    bullets.push(`Relevant projects: ${projects.join(', ')}.`);
  }
  if (match.demonstratedTechnologies?.length) {
    const strong = match.demonstratedTechnologies
      .filter((item) => item.evidence === 'demonstrated' || item.evidence === 'verified')
      .map((item) => `${item.name} (${item.evidence})`);
    if (strong.length) bullets.push(`Strongest evidence: ${strong.join(', ')}.`);
  }
  bullets.push(
    `Score breakdown — required ${match.factors.requiredSkills}% of ${MATCH_WEIGHTS.requiredSkills}, `
    + `optional ${match.factors.optionalSkills}% of ${MATCH_WEIGHTS.optionalSkills}, `
    + `projects ${match.factors.projectEvidence}% of ${MATCH_WEIGHTS.projectEvidence}, `
    + `experience fit ${match.factors.experienceAlignment}% of ${MATCH_WEIGHTS.experienceAlignment}.`,
  );
  bullets.push(`Inferred experience level from your profile: ${match.inferredExperience}; role seniority: ${job.seniority}.`);

  const summary = buildSummary(match, projects);
  return { summary, bullets, mainReason: summary };
}

function buildSummary(match, projects) {
  const matched = [...match.matchedRequired, ...match.matchedOptional];
  const missing = match.missingRequired;
  let text = '';
  if (matched.length && projects.length) {
    const skillPhrase = matched.slice(0, 3).join(' and ');
    const projectPhrase = projects.slice(0, 2).join(' and ');
    text = `Your ${skillPhrase} experience, demonstrated through your ${projectPhrase} project${projects.length > 1 ? 's' : ''}, aligns with this vacancy.`;
  } else if (matched.length) {
    text = `Your ${matched.slice(0, 4).join(', ')} skills overlap with this role's requirements.`;
  } else {
    text = 'Your current analyzed profile has limited overlap with the required skills for this role.';
  }
  if (missing.length) {
    const miss = missing.slice(0, 3).join(', ');
    text += ` ${miss}${missing.length > 3 ? ', and others,' : ''} ${missing.length > 1 ? 'are' : 'is'} still missing from your profile.`;
  }
  return text.trim();
}
