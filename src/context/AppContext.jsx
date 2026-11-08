import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ANALYSIS_STEPS, REPOS, repoById } from '../data/constants';
import { snapshotCV, cvId } from '../services/cv';
import { buildProfile } from '../services/profile';
import { applyNextEvent, nextSimulatedEvent, retainEvidence } from '../services/activity';
import {
  DEMO_PUBLISHED_STATUS,
  LINKEDIN_DEMO_USER,
  PENDING_STATUS,
  REJECTED_STATUS,
  generateAlternativeDraft,
  isPendingDraft,
  isPublishedDraft,
  isRejectedDraft,
  withTone,
} from '../services/linkedin';
import { jobById } from '../data/jobs';
import { allowPersist, canPersist, clone, consumeMigrationWrite, loadState, normalizeCV, normalizePreferences, normalizeState, saveState, STORAGE_KEY } from '../services/storage';

const AppContext = createContext(null);
let didBootToast = false;

const blankFilters = () => ({ q: '', visibility: 'all', language: 'all' });

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const [state, setState] = useState(() => loadState());
  const [toasts, setToasts] = useState([]);
  const [linkedinHighlightDraftId, setLinkedInHighlightDraftId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [repoFilters, setRepoFilters] = useState(blankFilters);
  const [pickerFilters, setPickerFilters] = useState(blankFilters);
  const [projectFilters, setProjectFilters] = useState({ q: '', stage: 'all', language: 'all', sort: 'activity' });
  const [mobileNav, setMobileNav] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [modal, setModal] = useState(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const lastSaved = useRef(null);
  const analysisTimer = useRef(null);
  const runningRef = useRef(false);
  const sessionRef = useRef(null);

  const toast = useCallback((message, icon = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((list) => [...list, { id, message, icon }]);
    setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3200);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((next) => setModal(next), []);
  const closeMenus = useCallback(() => {
    setNotifOpen(false);
    setUserOpen(false);
    setMobileNav(false);
  }, []);

  useEffect(() => {
    if (!canPersist()) return;
    const json = JSON.stringify(state);
    if (lastSaved.current === null) {
      lastSaved.current = json;
      if (consumeMigrationWrite()) saveState(state);
      return;
    }
    if (lastSaved.current === json) return;
    lastSaved.current = json;
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (didBootToast) return;
    didBootToast = true;
    if (!canPersist()) toast('Stored data could not be read. It was left unchanged.', 'info');
    else if (stateRef.current.analyzed) toast('Skill profile restored from this browser', 'sparkles');
  }, [toast]);

  useEffect(() => () => clearTimeout(analysisTimer.current), []);

  const stopAnalysis = useCallback(() => {
    clearTimeout(analysisTimer.current);
    analysisTimer.current = null;
    runningRef.current = false;
    sessionRef.current = null;
    setAnalysis(null);
  }, []);

  const publish = useCallback((session, extra = {}) => {
    const totalUnits = Math.max(1, session.repos.length * 6);
    const stepContribution = session.stepIdx >= 6 ? 6 : session.stepIdx;
    const doneUnits = session.completed * 6 + stepContribution;
    const pct = extra.pct ?? Math.min(100, Math.round((doneUnits / totalUnits) * 100));
    const repo = session.repos[Math.min(session.repoIdx, Math.max(0, session.repos.length - 1))] || null;
    const step = ANALYSIS_STEPS[Math.min(session.stepIdx, ANALYSIS_STEPS.length - 1)];
    setAnalysis({
      phase: extra.phase || 'running',
      repos: session.repos,
      repoIdx: session.repoIdx,
      stepIdx: session.stepIdx,
      completed: session.completed,
      stepTimes: [...session.stepTimes],
      logs: session.logs.map((line) => ({ ...line })),
      pct,
      repo,
      step,
      remaining: Math.max(0, session.repos.length - session.completed),
      badge: extra.badge || step?.label || 'Scanning',
    });
  }, []);

  const pushLog = useCallback((session, text, kind = 'info') => {
    session.logs.push({
      ts: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      text,
      kind,
    });
  }, []);

  const startAnalysis = useCallback((overrideIds) => {
    const current = stateRef.current;
    const selected = Array.isArray(overrideIds) ? overrideIds : current.selected;
    if (!current.connected) {
      toast('Connect GitHub first', 'github');
      return;
    }
    if (!selected.length) {
      toast('Select at least one repository', 'alert-triangle');
      return;
    }
    if (current.analyzing || runningRef.current) return;

    const repos = selected.map(repoById).filter(Boolean);
    runningRef.current = true;
    clearTimeout(analysisTimer.current);
    setState((prev) => ({
      ...prev,
      selected,
      analyzing: true,
      analyzed: false,
      analysisStartedAt: new Date().toISOString(),
      profile: null,
      stats: null,
      activity: [],
    }));

    const session = {
      repos,
      repoIdx: 0,
      stepIdx: 0,
      completed: 0,
      stepTimes: [],
      logs: [],
    };
    sessionRef.current = session;
    pushLog(session, 'Analysis workspace initialised — simulating local scan', 'info');
    publish(session);
    navigate('/analysis');

    const finish = () => {
      session.stepIdx = ANALYSIS_STEPS.length;
      session.stepTimes[ANALYSIS_STEPS.length - 1] = session.stepTimes[ANALYSIS_STEPS.length - 1] || '1.10s';
      pushLog(session, '▸ Aggregating cross-repository statistics…', 'info');
      publish(session, { pct: 100, badge: 'Profile generated' });
      analysisTimer.current = setTimeout(() => {
        if (sessionRef.current !== session) return;
        const profile = retainEvidence(buildProfile(repos), stateRef.current.profile);
        setState((prev) => ({
          ...prev,
          profile,
          stats: profile.stats,
          analyzed: true,
          analyzing: false,
          analysisFinishedAt: new Date().toISOString(),
        }));
        setAnalysis((prev) => (prev ? { ...prev, phase: 'complete', pct: 100, badge: 'Profile generated', remaining: 0, completed: repos.length } : prev));
        runningRef.current = false;
        sessionRef.current = null;
        navigate('/analysis');
      }, 700);
    };

    const nextTick = () => {
      if (sessionRef.current !== session) return;
      if (session.repoIdx >= repos.length) {
        finish();
        return;
      }
      const repo = repos[session.repoIdx];
      if (session.stepIdx === 0) pushLog(session, `▸ Starting analysis of ${repo.name} (${repo.language})`, 'info');
      publish(session);
      const delay = session.stepIdx === 0 ? 1100 : 260;
      analysisTimer.current = setTimeout(() => {
        if (sessionRef.current !== session) return;
        session.stepTimes[session.stepIdx] = session.stepTimes[session.stepIdx] || `${(0.25 + Math.random() * 0.6).toFixed(2)}s`;
        session.stepIdx += 1;
        if (session.stepIdx === 4) pushLog(session, `  ✓ detected ${repo.skills.length} technologies in ${repo.name}`, 'ok');
        if (session.stepIdx === 6) {
          pushLog(session, `  ✓ ${repo.name} complete — ${repo.skills.length} technologies, ${repo.stars}★`, 'ok');
          const entry = {
            repoId: repo.id,
            date: new Date().toISOString(),
            dateLabel: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'complete',
            technologies: repo.skills.slice(0, 5),
          };
          session.stepIdx = 0;
          session.completed = session.repoIdx + 1;
          session.repoIdx += 1;
          setState((prev) => ({ ...prev, activity: [...prev.activity, entry] }));
        }
        publish(session);
        nextTick();
      }, delay);
    };

    nextTick();
  }, [navigate, publish, pushLog, toast]);

  const connectGithub = useCallback(() => {
    setState((prev) => ({ ...prev, connected: true }));
    setModal(null);
    toast('GitHub account connected', 'github');
    navigate('/repositories');
    setTimeout(() => setModal({ type: 'picker' }), 320);
  }, [navigate, toast]);

  const disconnectGithub = useCallback(() => {
    stopAnalysis();
    setState((prev) => ({
      ...prev,
      connected: false,
      selected: [],
      analyzed: false,
      analyzing: false,
      profile: null,
      stats: null,
      activity: [],
    }));
    toast('GitHub account disconnected', 'unlink');
    navigate('/');
  }, [navigate, stopAnalysis, toast]);

  const connectLinkedIn = useCallback(() => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      linkedinConnected: true,
      linkedinConnectedAt: prev.linkedinConnectedAt || now,
    }));
    setModal(null);
    toast('LinkedIn account connected (demo)', 'check');
  }, [toast]);

  const disconnectLinkedIn = useCallback(() => {
    setState((prev) => ({ ...prev, linkedinConnected: false }));
    toast('LinkedIn disconnected. Drafts and publication history are kept locally.', 'unlink');
  }, [toast]);

  const resetDemo = useCallback(() => {
    stopAnalysis();
    allowPersist();
    const next = normalizeState(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore quota/private mode */ }
    lastSaved.current = JSON.stringify(next);
    saveState(next);
    setState(next);
    setRepoFilters(blankFilters());
    setPickerFilters(blankFilters());
    setProjectFilters({ q: '', stage: 'all', language: 'all', sort: 'activity' });
    setModal(null);
    toast('Demo data reset', 'rotate-ccw');
    navigate('/');
  }, [navigate, stopAnalysis, toast]);

  const toggleRepo = useCallback((id) => {
    setState((prev) => {
      const selected = prev.selected.includes(id)
        ? prev.selected.filter((item) => item !== id)
        : [...prev.selected, id];
      return { ...prev, selected };
    });
  }, []);

  const applyVisibleSelection = useCallback((ids, select) => {
    setState((prev) => {
      const selected = new Set(prev.selected);
      ids.forEach((id) => { if (select) selected.add(id); else selected.delete(id); });
      return { ...prev, selected: Array.from(selected) };
    });
  }, []);

  const commitSelection = useCallback((ids) => {
    setState((prev) => ({ ...prev, selected: ids }));
  }, []);

  const toggleSetting = useCallback((key, label) => {
    const next = !stateRef.current.settings[key];
    setState((prev) => ({ ...prev, settings: { ...prev.settings, [key]: next } }));
    toast(`${label} ${next ? 'enabled' : 'disabled'}`, 'settings');
  }, [toast]);

  const markAllRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({ ...item, unread: false })),
    }));
    toast('All notifications marked as read', 'check');
  }, [toast]);

  const markRead = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    }));
  }, []);

  const toggleCollapsed = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const patchCv = useCallback((mutator) => {
    setState((prev) => {
      const cv = normalizeCV(clone(prev.cvProfile));
      mutator(cv);
      return { ...prev, cvProfile: cv };
    });
  }, []);

  const createVersion = useCallback((name, description) => {
    const current = stateRef.current;
    const version = {
      id: cvId(),
      name: (name || '').trim() || `CV v${current.cvVersions.length + 1}`,
      description: (description || '').trim(),
      createdAt: new Date().toISOString(),
      snapshot: snapshotCV(current.cvProfile, current),
    };
    setState((prev) => ({
      ...prev,
      cvVersions: [...prev.cvVersions, version],
      currentCvVersionId: version.id,
    }));
    toast('CV version saved', 'check');
  }, [toast]);

  const restoreVersion = useCallback((version) => {
    const cvProfile = normalizeCV(clone(version.snapshot));
    const restored = {
      id: cvId(),
      name: `Restored from ${version.name}`,
      description: `Restored version ${version.name} (${version.id})`,
      createdAt: new Date().toISOString(),
      snapshot: clone(cvProfile),
    };
    setState((prev) => ({
      ...prev,
      cvProfile,
      cvVersions: [...prev.cvVersions, restored],
      currentCvVersionId: restored.id,
    }));
    toast('Version restored and recorded', 'check');
  }, [toast]);

  const renameVersion = useCallback((id, name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      cvVersions: prev.cvVersions.map((version) => (version.id === id ? { ...version, name: trimmed } : version)),
    }));
  }, []);

  const deleteVersion = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      cvVersions: prev.cvVersions.filter((version) => version.id !== id),
      currentCvVersionId: prev.currentCvVersionId === id ? null : prev.currentCvVersionId,
    }));
  }, []);

  const saveLifecycle = useCallback((repoId, result) => {
    setState((prev) => ({
      ...prev,
      projects: {
        ...prev.projects,
        [repoId]: {
          ...(prev.projects[repoId] && typeof prev.projects[repoId] === 'object' ? prev.projects[repoId] : {}),
          result,
        },
      },
    }));
    toast('Simulated lifecycle report saved', 'check');
  }, [toast]);

  const simulateActivity = useCallback(() => {
    const event = nextSimulatedEvent(stateRef.current.githubEvents, new Date().toISOString());
    if (!event) {
      toast('No new simulated event could be created', 'info');
      return;
    }
    setState((prev) => ({ ...prev, githubEvents: [...prev.githubEvents, event] }));
    toast('Simulated event added to the queue', 'github');
  }, [toast]);

  const syncNextPending = useCallback(() => {
    const step = applyNextEvent(stateRef.current);
    if (!step.changed) return step.outcome;
    stateRef.current = step.state;
    setState(step.state);
    if (step.outcome.draftCreated && step.outcome.eventId) {
      setLinkedInHighlightDraftId(`draft-${step.outcome.eventId}`);
      toast('New LinkedIn draft created from GitHub activity — pending your approval', 'sparkles');
    }
    return step.outcome;
  }, [toast]);

  const saveJobPreferences = useCallback((preferences) => {
    setState((prev) => ({ ...prev, jobPreferences: normalizePreferences(preferences) }));
    toast('Job preferences saved', 'check');
  }, [toast]);

  const saveJobToTracker = useCallback((jobId) => {
    if (!jobById(jobId)) {
      toast('This simulated job could not be found', 'info');
      return { ok: false };
    }
    if (stateRef.current.savedJobs.some((item) => item.jobId === jobId)) {
      return { ok: false, duplicate: true };
    }
    const entry = { jobId, savedAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, savedJobs: [entry, ...prev.savedJobs] }));
    toast('Job saved to your tracker', 'check');
    return { ok: true };
  }, [toast]);

  const removeSavedJob = useCallback((jobId) => {
    setState((prev) => ({ ...prev, savedJobs: prev.savedJobs.filter((item) => item.jobId !== jobId) }));
    toast('Removed from saved jobs', 'check');
  }, [toast]);

  const publishLinkedInDraft = useCallback((id) => {
    if (!stateRef.current.linkedinConnected) {
      toast('Connect your demo LinkedIn account before publishing', 'info');
      return false;
    }
    const current = stateRef.current.linkedinDrafts.find((d) => d.id === id);
    if (!current || !isPendingDraft(current)) {
      toast('Only posts awaiting approval can be published', 'info');
      return false;
    }
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      linkedinDrafts: prev.linkedinDrafts.map((draft) => (
        draft.id === id
          ? {
            ...draft,
            status: DEMO_PUBLISHED_STATUS,
            publishedAt: now,
            publishedAs: LINKEDIN_DEMO_USER.vanity,
            updatedAt: now,
            rejectionReason: '',
            rejectionNotes: '',
            rejectedAt: null,
          }
          : draft
      )),
    }));
    toast('Post published (demo). No real LinkedIn post was created.', 'check');
    return true;
  }, [toast]);

  const rejectLinkedInDraft = useCallback((id, reason, notes = '') => {
    const current = stateRef.current.linkedinDrafts.find((d) => d.id === id);
    if (!current || !isPendingDraft(current)) {
      toast('Only pending posts can be rejected', 'info');
      return false;
    }
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      linkedinDrafts: prev.linkedinDrafts.map((draft) => (
        draft.id === id
          ? {
            ...draft,
            status: REJECTED_STATUS,
            rejectionReason: reason || 'Other',
            rejectionNotes: String(notes || '').trim(),
            rejectedAt: now,
            updatedAt: now,
          }
          : draft
      )),
    }));
    toast('Post rejected and moved to history', 'check');
    return true;
  }, [toast]);

  const resubmitLinkedInDraft = useCallback((id) => {
    const current = stateRef.current.linkedinDrafts.find((d) => d.id === id);
    if (!current || !isRejectedDraft(current)) {
      toast('Only rejected posts can be resubmitted', 'info');
      return false;
    }
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      linkedinDrafts: prev.linkedinDrafts.map((draft) => (
        draft.id === id
          ? {
            ...draft,
            status: PENDING_STATUS,
            rejectionReason: '',
            rejectionNotes: '',
            rejectedAt: null,
            updatedAt: now,
          }
          : draft
      )),
    }));
    toast('Draft returned to Pending Approval', 'check');
    return true;
  }, [toast]);

  const movePublishedToDrafts = useCallback((id) => {
    const current = stateRef.current.linkedinDrafts.find((d) => d.id === id);
    if (!current || !isPublishedDraft(current)) {
      toast('Only published posts can move back to drafts', 'info');
      return false;
    }
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      linkedinDrafts: prev.linkedinDrafts.map((draft) => (
        draft.id === id
          ? {
            ...draft,
            status: PENDING_STATUS,
            publishedAt: '',
            publishedAs: '',
            updatedAt: now,
          }
          : draft
      )),
    }));
    toast('Post moved back to Pending Approval', 'check');
    return true;
  }, [toast]);

  const generateAlternativeLinkedInDraft = useCallback((id) => {
    const source = stateRef.current.linkedinDrafts.find((d) => d.id === id);
    if (!source) return null;
    const draft = generateAlternativeDraft(source);
    if (!draft) return null;
    setState((prev) => ({ ...prev, linkedinDrafts: [draft, ...prev.linkedinDrafts] }));
    toast('Alternative draft generated (AI Draft Simulation)', 'sparkles');
    return draft;
  }, [toast]);

  const updateDraft = useCallback((id, patch) => {
    setState((prev) => ({
      ...prev,
      linkedinDrafts: prev.linkedinDrafts.map((draft) => {
        if (draft.id !== id) return draft;
        const toneChanged = patch.tone && patch.tone !== draft.tone;
        const next = toneChanged ? withTone(draft, patch.tone) : { ...draft, updatedAt: new Date().toISOString() };
        if (!toneChanged && typeof patch.body === 'string') {
          next.body = patch.body;
          next.customized = patch.body !== draft.body;
        }
        if (typeof patch.title === 'string') next.title = patch.title;
        if (Array.isArray(patch.hashtags)) next.hashtags = patch.hashtags.map((item) => String(item).replace(/^#/, '').trim()).filter(Boolean);
        if (typeof patch.purpose === 'string') next.purpose = patch.purpose;
        return next;
      }),
    }));
  }, []);

  const deleteDraft = useCallback((id) => {
    setState((prev) => ({ ...prev, linkedinDrafts: prev.linkedinDrafts.filter((draft) => draft.id !== id) }));
    toast('Draft deleted', 'check');
  }, [toast]);

  const value = useMemo(() => ({
    state,
    repos: REPOS,
    toasts,
    modal,
    analysis,
    repoFilters,
    setRepoFilters,
    pickerFilters,
    setPickerFilters,
    projectFilters,
    setProjectFilters,
    mobileNav,
    setMobileNav,
    notifOpen,
    setNotifOpen,
    userOpen,
    setUserOpen,
    toast,
    openModal,
    closeModal,
    closeMenus,
    connectGithub,
    disconnectGithub,
    connectLinkedIn,
    disconnectLinkedIn,
    resetDemo,
    toggleRepo,
    applyVisibleSelection,
    commitSelection,
    startAnalysis,
    toggleSetting,
    markAllRead,
    markRead,
    toggleCollapsed,
    patchCv,
    createVersion,
    restoreVersion,
    renameVersion,
    deleteVersion,
    saveLifecycle,
    simulateActivity,
    syncNextPending,
    saveJobPreferences,
    saveJobToTracker,
    removeSavedJob,
    publishLinkedInDraft,
    rejectLinkedInDraft,
    resubmitLinkedInDraft,
    movePublishedToDrafts,
    generateAlternativeLinkedInDraft,
    linkedinHighlightDraftId,
    clearLinkedInHighlight: () => setLinkedInHighlightDraftId(''),
    focusLinkedInDraft: (id) => setLinkedInHighlightDraftId(id || ''),
    updateDraft,
    deleteDraft,
  }), [
    state, toasts, modal, analysis, repoFilters, pickerFilters, projectFilters, mobileNav, notifOpen, userOpen, linkedinHighlightDraftId,
    toast, openModal, closeModal, closeMenus, connectGithub, disconnectGithub, connectLinkedIn, disconnectLinkedIn, resetDemo, toggleRepo,
    applyVisibleSelection, commitSelection, startAnalysis, toggleSetting, markAllRead, markRead, toggleCollapsed,
    patchCv, createVersion, restoreVersion, renameVersion, deleteVersion, saveLifecycle,
    simulateActivity, syncNextPending, saveJobPreferences, saveJobToTracker, removeSavedJob,
    publishLinkedInDraft, rejectLinkedInDraft, resubmitLinkedInDraft, movePublishedToDrafts,
    generateAlternativeLinkedInDraft, linkedinHighlightDraftId,
    updateDraft, deleteDraft,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
