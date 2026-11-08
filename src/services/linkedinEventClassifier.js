/** Deterministic LinkedIn qualification rules for simulated GitHub events. */

export const LINKEDIN_EVENT_CATEGORIES = {
  bug_fix: 'Bug fix & problem solving',
  new_feature: 'New feature development',
  milestone: 'Project milestone',
  ui_ux: 'UI/UX & design',
  performance: 'Performance & architecture',
};

const MINOR_TYPES = new Set(['push', 'branch', 'repository_update']);

export function classifyEventForLinkedIn(event, repo) {
  if (!event || typeof event !== 'object') {
    return { qualifies: false, reason: 'missing_event', category: null };
  }
  if (!repo) {
    return { qualifies: false, reason: 'unknown_repository', category: null };
  }
  if (event.metadata?.meaningful === false) {
    return { qualifies: false, reason: 'minor_activity', category: null };
  }

  const text = `${event.title || ''} ${event.description || ''}`.toLowerCase();

  if (event.metadata?.linkedinCategory && LINKEDIN_EVENT_CATEGORIES[event.metadata.linkedinCategory]) {
    return { qualifies: true, category: event.metadata.linkedinCategory, reason: null };
  }

  if (event.metadata?.meaningful === true) {
    if (event.type === 'release' || event.type === 'deployment') {
      return { qualifies: true, category: 'milestone', reason: null };
    }
    if (event.type === 'merge' && event.metadata?.skill) {
      return { qualifies: true, category: 'new_feature', reason: null };
    }
  }

  if (event.type === 'pull_request' && /dashboard|responsive|layout|interface|design|ux|ui/i.test(text)) {
    return { qualifies: true, category: 'ui_ux', reason: null };
  }
  if (/fix|bug|resolve|patch|error|security|validation|sync issue|authentication/i.test(text) && event.type !== 'push') {
    return { qualifies: true, category: 'bug_fix', reason: null };
  }
  if (/feature|module|integration|workflow|endpoint/i.test(text) && (event.type === 'merge' || event.type === 'pull_request')) {
    return { qualifies: true, category: 'new_feature', reason: null };
  }
  if (/performance|refactor|optimi|scalability|architecture|rendering/i.test(text)) {
    return { qualifies: true, category: 'performance', reason: null };
  }
  if (MINOR_TYPES.has(event.type)) {
    return { qualifies: false, reason: 'minor_activity', category: null };
  }
  if (event.type === 'commit' && /typo|format|lint|whitespace/i.test(text)) {
    return { qualifies: false, reason: 'formatting_only', category: null };
  }

  return { qualifies: false, reason: 'insufficient_detail', category: null };
}
