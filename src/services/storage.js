import { EVIDENCE_SEED, NOTIFICATIONS, REPOS } from '../data/constants.js';
import { EVENT_TYPES } from '../data/activityTemplates.js';
import { EMPLOYMENT_TYPES, JOBS, SENIORITY_LEVELS, WORK_ARRANGEMENTS, jobById } from '../data/jobs.js';
import { DEMO_PUBLISHED_STATUS, DRAFT_TONES, normalizeDraftStatus, seedSampleLinkedInDrafts } from './linkedin.js';
import { normalizeCvDesign } from './cv/cvDesign.js';
import { normalizeProfilePhotoData } from './cv/cvProfilePhoto.js';
import { migrateDraftOrigin } from './linkedinAnalytics.js';

export const STORAGE_KEY = 'devcareer-ai:phase1';

let persistBlocked = false;
let migrationWrite = false;

export function canPersist() {
  return !persistBlocked;
}

export function allowPersist() {
  persistBlocked = false;
}

export function consumeMigrationWrite() {
  const pending = migrationWrite;
  migrationWrite = false;
  return pending;
}

export function normalizeCV(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const personal = {};
  ['name', 'title', 'email', 'phone', 'location', 'github', 'linkedin', 'portfolio', 'profilePhotoUrl'].forEach((key) => {
    personal[key] = typeof source.personal?.[key] === 'string' ? source.personal[key] : '';
  });
  personal.profilePhotoData = normalizeProfilePhotoData(source.personal?.profilePhotoData);
  const arr = (key) => (Array.isArray(source[key])
    ? source[key].filter((item) => item && typeof item === 'object' && !Array.isArray(item)).map((item) => ({ ...item }))
    : []);
  return {
    personal,
    summary: typeof source.summary === 'string' ? source.summary : '',
    skills: Array.isArray(source.skills) ? source.skills.filter((item) => typeof item === 'string') : [],
    projects: Array.isArray(source.projects) ? source.projects.filter((item) => typeof item === 'string') : [],
    descriptions: source.descriptions && typeof source.descriptions === 'object' && !Array.isArray(source.descriptions)
      ? { ...source.descriptions }
      : {},
    education: arr('education'),
    experience: arr('experience'),
    certifications: arr('certifications'),
    languages: Array.isArray(source.languages) ? source.languages.filter((item) => typeof item === 'string') : [],
    design: normalizeCvDesign(source.design),
    snapshotData: source.snapshotData && typeof source.snapshotData === 'object' ? source.snapshotData : null,
  };
}

export function defaultPreferences() {
  return {
    titles: [],
    technologies: [],
    locations: [],
    arrangement: 'any',
    employmentType: 'any',
    seniority: 'any',
    minSalary: '',
  };
}

export function defaultState() {
  return {
    version: 4,
    projects: {},
    cvProfile: null,
    cvVersions: [],
    currentCvVersionId: null,
    connected: false,
    selected: [],
    analyzing: false,
    analyzed: false,
    analysisStartedAt: null,
    analysisFinishedAt: null,
    profile: null,
    stats: null,
    activity: [],
    notifications: NOTIFICATIONS.map((item) => ({ ...item })),
    sidebarCollapsed: false,
    settings: { notifyOnAnalysis: true, notifyOnComplete: true, compactSkillCards: false },
    githubEvents: [],
    processedEventIds: [],
    lastSyncAt: null,
    syncHistory: [],
    jobPreferences: defaultPreferences(),
    savedJobs: [],
    linkedinDrafts: seedSampleLinkedInDrafts(),
    linkedinConnected: false,
    linkedinConnectedAt: null,
  };
}

export function normalizeState(raw) {
  const base = JSON.parse(JSON.stringify(defaultState()));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    base.cvProfile = normalizeCV(null);
    return base;
  }

  const state = Object.assign(base, raw);
  state.settings = Object.assign({}, defaultState().settings, raw.settings && typeof raw.settings === 'object' ? raw.settings : {});
  state.projects = raw.projects && typeof raw.projects === 'object' && !Array.isArray(raw.projects) ? raw.projects : {};
  state.cvProfile = normalizeCV(raw.cvProfile);
  state.cvVersions = Array.isArray(raw.cvVersions)
    ? raw.cvVersions
      .filter((version) => version && typeof version === 'object' && version.id && version.snapshot && typeof version.snapshot === 'object')
      .map((version) => ({ ...version, snapshot: normalizeCV(version.snapshot) }))
    : [];
  state.currentCvVersionId = typeof raw.currentCvVersionId === 'string' ? raw.currentCvVersionId : null;
  state.selected = Array.isArray(raw.selected)
    ? raw.selected.filter((id) => typeof id === 'string' && REPOS.some((repo) => repo.id === id))
    : [];
  state.activity = Array.isArray(raw.activity) ? raw.activity.filter((item) => item && REPOS.some((repo) => repo.id === item.repoId)) : [];
  state.notifications = Array.isArray(raw.notifications) && raw.notifications.length
    ? raw.notifications.filter((item) => item && item.title)
    : NOTIFICATIONS.map((item) => ({ ...item }));

  const profileOk = raw.profile && Array.isArray(raw.profile.skills) && raw.profile.stats && typeof raw.profile.stats === 'object';
  if (profileOk) {
    state.profile = raw.profile;
    state.profile.skills = state.profile.skills
      .filter((skill) => skill && typeof skill.name === 'string' && Array.isArray(skill.repos))
      .map((skill) => ({ ...skill, evidence: EVIDENCE_SEED[skill.name] || 'detected' }));
    const counts = { detected: 0, verified: 0, demonstrated: 0 };
    state.profile.skills.forEach((skill) => { counts[skill.evidence] += 1; });
    state.profile.languages = Array.isArray(state.profile.languages)
      ? state.profile.languages
      : state.profile.skills.filter((skill) => skill.category === 'languages').map((skill) => skill.name);
    state.profile.generatedAt = state.profile.generatedAt || raw.analysisFinishedAt || new Date().toISOString();
    state.profile.stats.evidence = counts;
    state.stats = state.profile.stats;
    state.analyzed = raw.analyzed !== false;
  } else {
    state.profile = null;
    state.stats = null;
    state.analyzed = false;
  }
  if (!state.analysisFinishedAt) state.analysisFinishedAt = state.analyzed ? state.profile.generatedAt : null;
  state.analyzing = false;
  state.connected = !!state.connected;
  state.linkedinConnected = !!state.linkedinConnected;
  state.linkedinConnectedAt = typeof raw.linkedinConnectedAt === 'string' ? raw.linkedinConnectedAt : null;
  state.sidebarCollapsed = !!state.sidebarCollapsed;
  state.version = 4;
  state.githubEvents = dedupe(listOf(raw.githubEvents, normalizeEvent));
  state.processedEventIds = stringList(raw.processedEventIds).filter((id, index, all) => all.indexOf(id) === index);
  state.lastSyncAt = typeof raw.lastSyncAt === 'string' ? raw.lastSyncAt : null;
  state.syncHistory = listOf(raw.syncHistory, normalizeSyncReport).slice(0, 30);
  state.jobPreferences = normalizePreferences(raw.jobPreferences);
  state.savedJobs = migrateSavedJobs(raw.savedJobs, raw.applications);
  state.linkedinDrafts = dedupe(listOf(raw.linkedinDrafts, normalizeDraft));
  delete state.applications;
  return state;
}

export function migrateSavedJobs(rawSaved, rawApplications) {
  const map = new Map();
  const add = (jobId, savedAt) => {
    if (typeof jobId !== 'string' || !jobId || !jobById(jobId)) return;
    const at = typeof savedAt === 'string' && savedAt ? savedAt : new Date().toISOString();
    const existing = map.get(jobId);
    if (!existing || at.localeCompare(existing.savedAt) > 0) map.set(jobId, { jobId, savedAt: at });
  };
  if (Array.isArray(rawSaved)) {
    rawSaved.forEach((item) => {
      if (typeof item === 'string') add(item, '');
      else if (item && typeof item === 'object' && typeof item.jobId === 'string') add(item.jobId, item.savedAt);
    });
  }
  if (Array.isArray(rawApplications)) {
    rawApplications.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      if (typeof item.jobId === 'string' && item.jobId) add(item.jobId, item.updatedAt || item.appliedAt);
    });
  }
  return Array.from(map.values()).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

const stringList = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : []);

function listOf(value, normalize) {
  if (!Array.isArray(value)) return [];
  return value.map(normalize).filter(Boolean);
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function normalizePreferences(raw) {
  const next = defaultPreferences();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return next;
  next.titles = stringList(raw.titles);
  next.technologies = stringList(raw.technologies);
  next.locations = stringList(raw.locations);
  next.arrangement = ['any', ...WORK_ARRANGEMENTS].includes(raw.arrangement) ? raw.arrangement : 'any';
  next.employmentType = ['any', ...EMPLOYMENT_TYPES].includes(raw.employmentType) ? raw.employmentType : 'any';
  next.seniority = ['any', ...SENIORITY_LEVELS].includes(raw.seniority) ? raw.seniority : 'any';
  const salary = String(raw.minSalary ?? '').trim();
  next.minSalary = salary !== '' && !Number.isNaN(Number(salary)) && Number(salary) >= 0 ? String(Number(salary)) : '';
  return next;
}

function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || typeof raw.repoId !== 'string') return null;
  if (!EVENT_TYPES.includes(raw.type)) return null;
  if (raw.status !== 'pending' && raw.status !== 'processed') return null;
  if (typeof raw.title !== 'string' || typeof raw.description !== 'string' || typeof raw.timestamp !== 'string') return null;
  const metadata = raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata) ? { ...raw.metadata } : {};
  return {
    id: raw.id,
    repoId: raw.repoId,
    type: raw.type,
    title: raw.title,
    description: raw.description,
    timestamp: raw.timestamp,
    status: raw.status,
    metadata,
  };
}

function normalizeDraft(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') return null;
  const status = normalizeDraftStatus(raw.status);
  if (!status || !DRAFT_TONES.includes(raw.tone)) return null;
  if (typeof raw.title !== 'string' || typeof raw.body !== 'string' || typeof raw.repoId !== 'string') return null;
  const eventId = typeof raw.eventId === 'string' ? raw.eventId : `legacy-${raw.id}`;
  return {
    id: raw.id,
    eventId,
    repoId: raw.repoId,
    eventType: typeof raw.eventType === 'string' ? raw.eventType : 'release',
    eventTitle: typeof raw.eventTitle === 'string' ? raw.eventTitle : raw.title,
    purpose: typeof raw.purpose === 'string' ? raw.purpose : 'Project Announcement',
    title: raw.title,
    body: raw.body,
    hashtags: stringList(raw.hashtags).map((item) => item.replace(/^#/, '')),
    tone: raw.tone,
    status,
    skill: typeof raw.skill === 'string' ? raw.skill : null,
    customized: !!raw.customized,
    aiGenerated: raw.aiGenerated !== false,
    alternativeOf: typeof raw.alternativeOf === 'string' ? raw.alternativeOf : null,
    rejectionReason: typeof raw.rejectionReason === 'string' ? raw.rejectionReason : '',
    rejectionNotes: typeof raw.rejectionNotes === 'string' ? raw.rejectionNotes : '',
    rejectedAt: typeof raw.rejectedAt === 'string' ? raw.rejectedAt : null,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : raw.updatedAt || '',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : raw.createdAt || '',
    publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt : (status === DEMO_PUBLISHED_STATUS ? raw.updatedAt || '' : ''),
    publishedAs: typeof raw.publishedAs === 'string' ? raw.publishedAs : '',
    eventCategory: typeof raw.eventCategory === 'string' ? raw.eventCategory : '',
    eventCategoryLabel: typeof raw.eventCategoryLabel === 'string' ? raw.eventCategoryLabel : '',
    source: migrateDraftOrigin(raw.source, eventId, typeof raw.alternativeOf === 'string' ? raw.alternativeOf : null),
  };
}

function normalizeSyncReport(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || typeof raw.eventId !== 'string') return null;
  return {
    id: raw.id,
    at: typeof raw.at === 'string' ? raw.at : '',
    eventId: raw.eventId,
    repoId: typeof raw.repoId === 'string' ? raw.repoId : '',
    eventType: typeof raw.eventType === 'string' ? raw.eventType : '',
    eventTitle: typeof raw.eventTitle === 'string' ? raw.eventTitle : '',
    eventDescription: typeof raw.eventDescription === 'string' ? raw.eventDescription : '',
    skillUpdate: raw.skillUpdate && typeof raw.skillUpdate === 'object' ? { ...raw.skillUpdate } : null,
    draftCreated: !!raw.draftCreated,
    draftId: typeof raw.draftId === 'string' ? raw.draftId : (raw.draftCreated ? `draft-${raw.eventId}` : null),
    skipped: typeof raw.skipped === 'string' ? raw.skipped : null,
    linkedinQualifying: raw.linkedinQualifying === true,
    linkedinCategory: typeof raw.linkedinCategory === 'string' ? raw.linkedinCategory : null,
    linkedinSkipReason: typeof raw.linkedinSkipReason === 'string' ? raw.linkedinSkipReason : null,
    analysisResult: typeof raw.analysisResult === 'string' ? raw.analysisResult : null,
    generationFailed: raw.generationFailed === true,
    generationFailureReason: typeof raw.generationFailureReason === 'string' ? raw.generationFailureReason : '',
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeState(null);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Stored state is not an object');
    migrationWrite = parsed.version !== 4 || !Array.isArray(parsed.savedJobs) || Array.isArray(parsed.applications);
    return normalizeState(parsed);
  } catch (error) {
    persistBlocked = true;
    migrationWrite = false;
    console.warn('Stored Code2Career data could not be read and was left unchanged:', error);
    return normalizeState(null);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save state:', error);
  }
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
