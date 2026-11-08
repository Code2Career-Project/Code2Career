import { REPOS, repoById } from '../data/constants.js';
import { isPendingDraft, isPublishedDraft, isRejectedDraft } from './linkedin.js';
import { projectResult } from './lifecycle.js';

/** Derived workspace counters — single source for Overview, Settings, and tests. */
export function workspaceMetrics(state) {
  const hasAnalysis = Boolean(state.analyzed && state.profile && state.stats);
  const events = Array.isArray(state.githubEvents) ? state.githubEvents : [];
  const drafts = Array.isArray(state.linkedinDrafts) ? state.linkedinDrafts : [];
  const saved = Array.isArray(state.savedJobs) ? state.savedJobs : [];
  const selectedRepos = state.connected
    ? state.selected.map((id) => repoById(id)).filter(Boolean)
    : [];

  return {
    hasAnalysis,
    connected: !!state.connected,
    selectedRepositories: state.connected ? state.selected.length : 0,
    totalDemoRepositories: REPOS.length,
    analyzedRepositories: hasAnalysis ? state.stats.analyzed : 0,
    trackedProjects: selectedRepos.length,
    publishedProjects: selectedRepos.filter((repo) => projectResult(state.projects, repo.id)?.stage === 'Published').length,
    programmingLanguages: hasAnalysis ? state.profile.languages.length : 0,
    detectedSkills: hasAnalysis ? state.profile.skills.length : 0,
    processedGithubEvents: events.filter((event) => event.status === 'processed').length,
    pendingGithubEvents: events.filter((event) => event.status === 'pending').length,
    linkedinDraftsPending: drafts.filter(isPendingDraft).length,
    linkedinPublishedPosts: drafts.filter(isPublishedDraft).length,
    linkedinRejectedPosts: drafts.filter(isRejectedDraft).length,
    linkedinTotalDrafts: drafts.length,
    savedJobs: saved.length,
    analysisActivityEntries: Array.isArray(state.activity) ? state.activity.length : 0,
  };
}
