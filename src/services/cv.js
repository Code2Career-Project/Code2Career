import { CATEGORIES, repoById } from '../data/constants.js';
import { projectResult } from './lifecycle.js';
import { clone, normalizeCV } from './storage.js';

export function cvId() {
  return `cv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function snapshotCV(cv, live) {
  const snapshot = normalizeCV(clone(cv));
  snapshot.snapshotData = {
    skills: clone(cv.snapshotData?.skills || live.profile?.skills || []),
    results: {},
    repositories: {},
  };
  snapshot.projects.forEach((id) => {
    snapshot.snapshotData.results[id] = clone(
      cv.snapshotData ? (cv.snapshotData.results?.[id] || null) : projectResult(live.projects, id),
    );
    const repo = cv.snapshotData?.repositories?.[id] || repoById(id);
    if (repo) snapshot.snapshotData.repositories[id] = clone(repo);
  });
  return snapshot;
}

export function skillGroups(cv, liveSkills) {
  const available = cv.snapshotData?.skills || liveSkills || [];
  return CATEGORIES.map((category) => {
    const names = available
      .filter((skill) => skill.category === category.key && cv.skills.includes(skill.name))
      .map((skill) => skill.name);
    return names.length ? { label: category.label, names } : null;
  }).filter(Boolean);
}

export function cvProjects(cv, projects = {}) {
  return cv.projects
    .map((id) => cv.snapshotData?.repositories?.[id] || repoById(id))
    .filter(Boolean)
    .map((repo) => ({
      repo,
      result: cv.snapshotData ? (cv.snapshotData.results?.[repo.id] || null) : projectResult(projects, repo.id),
      description: cv.descriptions[repo.id] !== undefined ? cv.descriptions[repo.id] : repo.description,
    }));
}
