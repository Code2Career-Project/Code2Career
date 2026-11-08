import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES, LIFECYCLE_STEPS, SKILL_CATEGORY, repoById } from '../data/constants';
import { analyzeProjectLifecycle, projectEvents, projectResult } from '../services/lifecycle';
import { useApp } from '../context/AppContext';
import { Button, Card, EmptyState, Note, StageBadge } from '../components/common/ui';
import { formatDate } from '../utils/format';

function Report({ result }) {
  if (!result) return <p className="text-[12.5px] text-muted">No lifecycle analysis yet. Run the simulation to evaluate the project’s demo evidence.</p>;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StageBadge stage={result.stage} />
        <strong>{result.stage === 'Published' ? 'Ready for the CV' : 'Not ready for the CV'}</strong>
      </div>
      <p className="my-3 text-sm">{result.analysisSummary}</p>
      <p className="text-[12.5px] text-muted">Checked {formatDate(result.analyzedAt)}</p>
      <h4 className="mt-4 font-semibold">Commits used for this decision</h4>
      <div className="my-2.5 grid gap-1.5">
        {result.evidence.map((item, index) => (
          <div key={`${item.kind}-${index}`} className="text-[12.5px] text-muted"><strong>{item.kind}:</strong> {item.text}</div>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { state, saveLifecycle } = useApp();
  const repo = repoById(projectId);
  const selected = state.connected && state.selected.includes(projectId);
  const [progress, setProgress] = useState(null);
  const timer = useRef(null);
  const alive = useRef(true);

  useEffect(() => () => {
    alive.current = false;
    clearTimeout(timer.current);
  }, []);

  if (!repo || !selected) {
    return (
      <Card>
        <EmptyState icon={null} title="Project unavailable" text="Select this repository to view project details." action={<Button variant="secondary" onClick={() => navigate('/projects')}>My Projects</Button>} />
      </Card>
    );
  }

  const result = projectResult(state.projects, repo.id);
  const events = projectEvents(repo, Array.isArray(state.projects[repo.id]?.events) ? state.projects[repo.id].events : []);

  const run = () => {
    if (timer.current) return;
    let step = 0;
    const tick = () => {
      if (!alive.current) {
        timer.current = null;
        return;
      }
      if (step === LIFECYCLE_STEPS.length) {
        const next = analyzeProjectLifecycle(repo, state.projects[repo.id]);
        timer.current = null;
        setProgress(null);
        saveLifecycle(repo.id, next);
        return;
      }
      setProgress(step);
      step += 1;
      timer.current = setTimeout(tick, 350);
    };
    tick();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Button size="sm" variant="secondary" onClick={() => navigate('/projects')}>← My Projects</Button>
        <span className="text-[12.5px] text-muted">Demo project · {repo.visibility} repository</span>
      </div>
      <Note>All timeline events and lifecycle evidence below are simulated demo data. No real repository analysis has occurred.</Note>
      <Card className="mb-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.02em] break-words">{repo.name}</h2>
            <p className="mt-1 text-[12.5px] text-muted">{repo.description}</p>
          </div>
          <StageBadge stage={result?.stage} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[12.5px] text-muted">
          <span>{repo.language}</span><span>★ {repo.stars}</span><span>Forks {repo.forks}</span><span>{repo.branches} branches</span><span>Updated {formatDate(repo.updated)}</span>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 font-semibold">Technology stack</h3>
          <div className="flex flex-wrap gap-1.5">
            {repo.skills.map((skill) => (
              <span key={skill} className="rounded-md bg-white/8 px-2 py-0.5 font-mono text-[11px] text-muted">
                {skill} · {CATEGORIES.find((category) => category.key === SKILL_CATEGORY[skill])?.label || 'Other'}
              </span>
            ))}
          </div>
          <h3 className="mt-6 mb-3 font-semibold">Development history</h3>
          <div className="ml-1.5 grid gap-3 border-l-2 border-brand-100 pl-4">
            {events.map((event) => (
              <div key={`${event.date}-${event.text}`} className="relative">
                <span className="absolute top-1.5 -left-[23px] h-2.5 w-2.5 rounded-full bg-brand-600" />
                <strong className="text-sm">{event.text}</strong>
                <div className="text-[12.5px] text-muted">{formatDate(event.date)} · simulated {event.type} event</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Lifecycle analysis</h3>
            <Button size="sm" disabled={progress !== null} onClick={run}>Analyze Project Lifecycle</Button>
          </div>
          {progress === null ? <Report result={result} /> : (
            <div>
              <strong>Simulating analysis… {Math.round((progress / LIFECYCLE_STEPS.length) * 100)}%</strong>
              <div className="my-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full bg-brand-600 transition-[width] duration-300" style={{ width: `${(progress / LIFECYCLE_STEPS.length) * 100}%` }} />
              </div>
              <div className="grid gap-1">
                {LIFECYCLE_STEPS.map((label, index) => (
                  <div key={label} className="text-[12.5px] text-muted">{index < progress ? '✓' : index === progress ? '◌' : '○'} {label}</div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
