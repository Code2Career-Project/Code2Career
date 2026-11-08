import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { STAGES, repoById, uniqueLanguages } from '../data/constants';
import { projectResult } from '../services/lifecycle';
import { useApp } from '../context/AppContext';
import { Button, Card, EmptyState, Note, StageBadge } from '../components/common/ui';
import { formatDate } from '../utils/format';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { state, projectFilters, setProjectFilters } = useApp();
  const all = state.connected ? state.selected.map(repoById).filter(Boolean) : [];
  const counts = [...STAGES, 'Unanalyzed'].map((stage) => ({
    stage,
    count: all.filter((repo) => (projectResult(state.projects, repo.id)?.stage || 'Unanalyzed') === stage).length,
  }));

  const q = projectFilters.q.toLowerCase().trim();
  const filtered = all
    .filter((repo) => (!q || `${repo.name} ${repo.skills.join(' ')}`.toLowerCase().includes(q))
      && (projectFilters.stage === 'all' || (projectResult(state.projects, repo.id)?.stage || 'Unanalyzed') === projectFilters.stage)
      && (projectFilters.language === 'all' || repo.language === projectFilters.language))
    .sort((a, b) => (projectFilters.sort === 'completion'
      ? (projectResult(state.projects, b.id)?.completionPercentage ?? -1) - (projectResult(state.projects, a.id)?.completionPercentage ?? -1)
      : b.updated.localeCompare(a.updated)));

  return (
    <div>
      <Note>Projects come from the repositories you explicitly selected. History and lifecycle evidence are simulated; no source code is scanned.</Note>
      <div className="mb-4 flex flex-wrap gap-2">
        {counts.map((item) => (
          <span key={item.stage} className="rounded-full border border-line bg-white/8 px-2.5 py-1 text-[11.5px] font-semibold text-muted">
            {item.stage === 'Unanalyzed' ? 'Not analyzed' : item.stage} · {item.count}
          </span>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input aria-label="Search projects" value={projectFilters.q} onChange={(event) => setProjectFilters({ ...projectFilters, q: event.target.value })} placeholder="Search project or technology" className="h-[38px] w-full rounded-lg border border-line bg-surface pr-3 pl-9" />
        </label>
        <select aria-label="Lifecycle status" className="h-[38px] rounded-lg border border-line bg-surface px-3" value={projectFilters.stage} onChange={(event) => setProjectFilters({ ...projectFilters, stage: event.target.value })}>
          <option value="all">All statuses</option>
          <option value="Unanalyzed">Not analyzed</option>
          {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
        </select>
        <select aria-label="Language" className="h-[38px] rounded-lg border border-line bg-surface px-3" value={projectFilters.language} onChange={(event) => setProjectFilters({ ...projectFilters, language: event.target.value })}>
          <option value="all">All languages</option>
          {uniqueLanguages().map((language) => <option key={language}>{language}</option>)}
        </select>
        <select aria-label="Sort projects" className="h-[38px] rounded-lg border border-line bg-surface px-3" value={projectFilters.sort} onChange={(event) => setProjectFilters({ ...projectFilters, sort: event.target.value })}>
          <option value="activity">Latest activity</option>
          <option value="completion">CV readiness</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <Card><EmptyState icon={Search} title={all.length ? 'No projects match your filters' : 'No projects available'} text={all.length ? 'Try another search or filter.' : 'Connect GitHub and select repositories to see projects.'} /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((repo) => {
            const result = projectResult(state.projects, repo.id);
            return (
              <Card key={repo.id} className="relative overflow-hidden p-5 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-brand-600">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold break-words">{repo.name}</h3>
                  <StageBadge stage={result?.stage} />
                </div>
                <p className="mt-2 text-[12.5px] text-muted">{repo.description}</p>
                <div className="my-3 flex flex-wrap gap-1.5">
                  {repo.skills.slice(0, 5).map((skill) => <span key={skill} className="rounded-md bg-white/8 px-2 py-0.5 font-mono text-[11px] text-muted">{skill}</span>)}
                </div>
                <div className="text-[12.5px] text-muted">{repo.language} · {repo.visibility} · ★ {repo.stars} · Forks {repo.forks} · Updated {formatDate(repo.updated)}</div>
                <div className="my-2.5 h-1.5 overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-brand-600" style={{ width: `${result ? result.completionPercentage : 0}%` }} /></div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12.5px] text-muted">{result ? result.analysisSummary : 'Not analyzed yet'}</span>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/projects/${repo.id}`)}>View project</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
