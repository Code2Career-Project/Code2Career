import { repoById } from '../data/constants.js';
import { ACTIVITY_TEMPLATES } from '../data/activityTemplates.js';
import { classifyEventForLinkedIn } from './linkedinEventClassifier.js';
import { draftFromClassifiedEvent } from './linkedinPostWriter.js';

const RANK = { detected: 0, verified: 1, demonstrated: 2 };
const BY_RANK = ['detected', 'verified', 'demonstrated'];
const EVIDENCE_TYPES = new Set(['pull_request', 'merge', 'release']);

export function nextSimulatedEvent(existingEvents, nowIso) {
  const list = Array.isArray(existingEvents) ? existingEvents : [];
  const template = ACTIVITY_TEMPLATES[list.length % ACTIVITY_TEMPLATES.length];
  const id = `evt-${template.repoId}-${template.type}-${list.length + 1}`;
  if (list.some((event) => event.id === id)) return null;
  return {
    id,
    repoId: template.repoId,
    type: template.type,
    title: template.title,
    description: template.description,
    timestamp: nowIso,
    status: 'pending',
    metadata: { ...template.metadata },
  };
}

export function applyNextEvent(state, processedAt = new Date().toISOString()) {
  const events = (Array.isArray(state.githubEvents) ? state.githubEvents : []).map((event) => ({
    ...event,
    metadata: { ...(event.metadata || {}) },
  }));
  const processed = new Set(Array.isArray(state.processedEventIds) ? state.processedEventIds : []);
  const index = events.findIndex((event) => event.status === 'pending' && event.id && !processed.has(event.id));
  if (index === -1) return { changed: false, state, outcome: { kind: 'idle' } };

  const event = events[index];
  const repo = repoById(event.repoId);
  const classification = repo ? classifyEventForLinkedIn(event, repo) : { qualifies: false, reason: 'unknown_repository', category: null };
  const outcome = {
    kind: 'processed',
    eventId: event.id,
    repoId: event.repoId,
    skillUpdate: null,
    draftCreated: false,
    skipped: null,
    linkedinQualifying: classification.qualifies,
    linkedinCategory: classification.category,
    linkedinSkipReason: classification.reason,
  };
  let profile = state.profile;
  let projects = state.projects && typeof state.projects === 'object' ? { ...state.projects } : {};
  let drafts = Array.isArray(state.linkedinDrafts) ? state.linkedinDrafts.slice() : [];

  if (!repo) {
    outcome.skipped = 'Unknown repository. The event was closed without changing skills or projects.';
  } else {
    const update = raiseEvidence(profile, repo, event, processedAt);
    if (update) {
      profile = update.profile;
      outcome.skillUpdate = update.change;
    }
    projects[repo.id] = rememberActivity(projects[repo.id], event);
    if (classification.qualifies && !drafts.some((draft) => draft.eventId === event.id)) {
      if (event.metadata?.simulateDraftFailure === true) {
        outcome.generationFailed = true;
        outcome.generationFailureReason = 'Simulated draft writer failure (demo/test).';
      } else {
        const { draft } = draftFromClassifiedEvent(event, repo);
        if (draft) {
          drafts = [draft, ...drafts];
          outcome.draftCreated = true;
          outcome.draftId = draft.id;
        } else {
          outcome.generationFailed = true;
          outcome.generationFailureReason = 'Draft writer returned no content for a qualifying event.';
        }
      }
    }
  }

  let analysisResult = 'skipped';
  if (outcome.linkedinQualifying === true) {
    if (outcome.draftCreated) analysisResult = 'qualified';
    else if (outcome.generationFailed) analysisResult = 'generation_failed';
    else analysisResult = 'generation_failed';
  }

  events[index] = { ...event, status: 'processed' };
  processed.add(event.id);
  const history = Array.isArray(state.syncHistory) ? state.syncHistory : [];
  return {
    changed: true,
    outcome: { ...outcome, analysisResult },
    state: {
      ...state,
      profile,
      projects,
      linkedinDrafts: drafts,
      githubEvents: events,
      processedEventIds: Array.from(processed),
      lastSyncAt: processedAt,
      syncHistory: [{
        id: `sync-${event.id}`,
        at: processedAt,
        eventId: event.id,
        repoId: event.repoId,
        eventType: event.type,
        eventTitle: event.title,
        eventDescription: event.description,
        skillUpdate: outcome.skillUpdate,
        draftCreated: outcome.draftCreated,
        draftId: outcome.draftId || null,
        skipped: outcome.skipped,
        linkedinQualifying: outcome.linkedinQualifying,
        linkedinCategory: outcome.linkedinCategory,
        linkedinSkipReason: outcome.linkedinSkipReason,
        analysisResult,
        generationFailed: !!outcome.generationFailed,
        generationFailureReason: outcome.generationFailureReason || '',
      }, ...history].slice(0, 100),
    },
  };
}

export function syncAllPending(state, processedAt = new Date().toISOString()) {
  let current = state;
  const outcomes = [];
  let guard = 0;
  while (guard < 100) {
    const step = applyNextEvent(current, processedAt);
    if (!step.changed) break;
    current = step.state;
    outcomes.push(step.outcome);
    guard += 1;
  }
  return { state: current, outcomes };
}

function raiseEvidence(profile, repo, event, processedAt) {
  if (!profile || !Array.isArray(profile.skills)) return null;
  if (!EVIDENCE_TYPES.has(event.type)) return null;
  const skillName = event.metadata?.skill;
  if (typeof skillName !== 'string' || !repo.skills.includes(skillName)) return null;
  const current = profile.skills.find((skill) => skill.name === skillName && skill.repos.includes(repo.id));
  if (!current || RANK[current.evidence] === undefined || RANK[current.evidence] >= 2) return null;
  const next = BY_RANK[RANK[current.evidence] + 1];
  const skills = profile.skills.map((skill) => (
    skill.name === skillName ? { ...skill, evidence: next, lastDetected: processedAt } : skill
  ));
  const evidence = { detected: 0, verified: 0, demonstrated: 0 };
  skills.forEach((skill) => { evidence[skill.evidence] += 1; });
  return {
    change: { name: skillName, from: current.evidence, to: next },
    profile: { ...profile, skills, stats: { ...profile.stats, evidence } },
  };
}

export function retainEvidence(nextProfile, previous) {
  if (!previous || !Array.isArray(previous.skills)) return nextProfile;
  const prior = new Map(previous.skills.map((skill) => [skill.name, skill.evidence]));
  const skills = nextProfile.skills.map((skill) => {
    const older = prior.get(skill.name);
    if (older && RANK[older] !== undefined && RANK[older] > RANK[skill.evidence]) return { ...skill, evidence: older };
    return skill;
  });
  const evidence = { detected: 0, verified: 0, demonstrated: 0 };
  skills.forEach((skill) => { evidence[skill.evidence] += 1; });
  return { ...nextProfile, skills, stats: { ...nextProfile.stats, evidence } };
}

function rememberActivity(entry, event) {
  const current = entry && typeof entry === 'object' ? entry : {};
  const activity = current.activity && typeof current.activity === 'object' ? current.activity : {};
  return {
    ...current,
    activity: {
      lastEventId: event.id,
      lastEventAt: event.timestamp,
      lastEventTitle: event.title,
      lastEventType: event.type,
      processedCount: (Number(activity.processedCount) || 0) + 1,
    },
  };
}
