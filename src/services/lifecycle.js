import { PROJECT_EVENTS, STAGES } from '../data/constants.js';

const STAGE_MAP = {
  Planning: 'In development',
  'In Development': 'In development',
  Testing: 'In development',
  'Deployment Ready': 'In development',
  'In development': 'In development',
  Deployed: 'Published',
  Maintenance: 'Published',
  Archived: 'Published',
  Published: 'Published',
};

export function cvAdvice(stage) {
  return stage === 'Published'
    ? 'Published. Include this project in the CV.'
    : 'Still in development. Follow the commits for skills, and add it to the CV after it is published.';
}

export function projectEvents(repo, extra = []) {
  const base = PROJECT_EVENTS[repo.id] || [];
  const demo = base.map((event, index) => ({
    type: event[0],
    text: event[1],
    date: new Date(Date.parse(`${repo.updated}T12:00:00Z`) - (base.length - index) * 86400000 * 12).toISOString(),
  }));
  return demo
    .concat(extra.filter((event) => event && typeof event.type === 'string' && typeof event.text === 'string' && !Number.isNaN(Date.parse(event.date))))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

export function analyzeProjectLifecycle(repo, projectEntry) {
  const extra = Array.isArray(projectEntry?.events) ? projectEntry.events : [];
  const events = projectEvents(repo, extra);
  const latest = (wanted) => {
    for (let i = events.length - 1; i >= 0; i -= 1) {
      if (wanted.includes(events[i].type)) return i;
    }
    return -1;
  };
  const deploy = latest(['deployment']);
  const laterBuild = latest(['feature', 'architecture', 'integration']);
  const published = deploy >= 0 && laterBuild <= deploy;
  const stage = published ? 'Published' : 'In development';
  const commits = events.filter((event) => event.type === 'commit');
  const evidence = (commits.length ? commits : events.slice(-3)).map((event) => ({ kind: 'Commit', text: event.text, date: event.date }));
  if (!published && deploy >= 0) evidence.push({ kind: 'Commit', text: 'New work started after the last publication.', date: events[laterBuild].date });
  const advice = cvAdvice(stage);
  return {
    stage,
    completionPercentage: published ? 100 : 40,
    confidence: published ? 'High' : 'Medium',
    evidence,
    remainingTasks: [advice],
    analyzedAt: new Date().toISOString(),
    analysisSummary: advice,
  };
}

export function projectResult(projects, id) {
  const result = projects?.[id]?.result;
  const stage = STAGE_MAP[result?.stage];
  if (!stage || !STAGES.includes(stage) || !Array.isArray(result.evidence) || !Array.isArray(result.remainingTasks)) return null;
  return { ...result, stage, completionPercentage: stage === 'Published' ? 100 : 40, analysisSummary: cvAdvice(stage) };
}
