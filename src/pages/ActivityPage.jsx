import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Github, Linkedin, RefreshCw, Sparkles } from 'lucide-react';
import { repoById } from '../data/constants';
import { workspaceMetrics } from '../services/workspaceMetrics';
import { classifyEventForLinkedIn } from '../services/linkedinEventClassifier';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, EmptyState, Note } from '../components/common/ui';
import { formatDate } from '../utils/format';

const FILTERS = ['all', 'pending', 'processed'];

export function ActivityPage() {
  const navigate = useNavigate();
  const { state, simulateActivity, syncNextPending } = useApp();
  const m = workspaceMetrics(state);
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(null);
  const events = [...state.githubEvents].sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  const visible = events.filter((event) => filter === 'all' || event.status === filter);
  const pending = events.filter((event) => event.status === 'pending').length;

  const syncPending = async () => {
    if (syncing || pending === 0) return;
    setSyncing(true);
    let processed = 0;
    while (processed < 100) {
      const outcome = syncNextPending();
      if (!outcome || outcome.kind === 'idle') break;
      processed += 1;
      setProgress({ processed, last: outcome });
      await new Promise((resolve) => setTimeout(resolve, 420));
    }
    setSyncing(false);
    setProgress(null);
  };

  return (
    <div>
      <Note>Simulated GitHub activity only. Incremental sync processes pending events one repository at a time and never reruns the full repository analysis.</Note>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Last sync', state.lastSyncAt ? formatDate(state.lastSyncAt.slice(0, 10)) : 'Not yet synced'],
          ['Pending', String(pending)],
          ['Processed', String(m.processedGithubEvents)],
          ['Total events', String(events.length)],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <div className="text-[12px] text-muted">{label}</div>
            <div className="font-display mt-1 text-[24px] font-semibold tracking-[-0.03em]">{value}</div>
          </Card>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button icon={Github} onClick={simulateActivity}>Simulate New GitHub Activity</Button>
        <Button variant="secondary" icon={RefreshCw} disabled={!pending || syncing} onClick={syncPending}>
          {syncing ? 'Syncing pending activity…' : 'Sync Pending Activity'}
        </Button>
        {FILTERS.map((item) => (
          <Button key={item} size="sm" variant={filter === item ? 'primary' : 'secondary'} onClick={() => setFilter(item)}>
            {item === 'all' ? 'All events' : item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </div>
      {syncing && progress && (
        <Card className="mb-4 p-4">
          <strong>Processing pending events…</strong>
          <p className="mt-1 text-[13px] text-muted">{progress.processed} event{progress.processed === 1 ? '' : 's'} processed in this run.</p>
        </Card>
      )}
      {visible.length === 0 ? (
        <Card><EmptyState icon={Activity} title="No activity yet" text="Simulate a GitHub event to add it to the pending queue." action={<Button icon={Github} onClick={simulateActivity}>Simulate New GitHub Activity</Button>} /></Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((event) => {
            const repo = repoById(event.repoId);
            return (
              <Card key={event.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-[15px]">{event.title}</strong>
                      <Badge tone={event.status === 'pending' ? 'amber' : 'green'}>{event.status}</Badge>
                      <Badge tone="gray">{event.type.replaceAll('_', ' ')}</Badge>
                    </div>
                    <p className="mt-2 text-[13px] text-muted">{event.description}</p>
                    <p className="mt-2 text-[12.5px] text-faint">{repo?.name || event.repoId} · {formatDate(event.timestamp.slice(0, 10))}</p>
                  </div>
                  {repo && classifyEventForLinkedIn(event, repo).qualifies && <Badge tone="green" icon={Sparkles}>LinkedIn candidate</Badge>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {m.linkedinDraftsPending > 0 && (
        <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-[13px] text-muted">{m.linkedinDraftsPending} LinkedIn draft suggestion(s) ready in LinkedIn Studio after meaningful synced events.</p>
          <Button size="sm" variant="secondary" icon={Linkedin} onClick={() => navigate('/linkedin')}>Open LinkedIn Studio</Button>
        </Card>
      )}
    </div>
  );
}
