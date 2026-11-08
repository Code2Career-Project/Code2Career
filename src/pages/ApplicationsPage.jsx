import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Briefcase, ExternalLink, Trash2 } from 'lucide-react';
import { jobById } from '../data/jobs';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, EmptyState, Note } from '../components/common/ui';
import { formatDate } from '../utils/format';

function salaryLabel(job) {
  if (!job?.salary) return null;
  const { min, max, currency } = job.salary;
  if (String(currency).includes('day')) return `${min}–${max} ${currency}`;
  return `${min.toLocaleString()}–${max.toLocaleString()} ${currency}`;
}

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { state, removeSavedJob, openModal } = useApp();
  const [selectedJobId, setSelectedJobId] = useState(state.savedJobs[0]?.jobId || '');

  const entries = useMemo(() => state.savedJobs
    .map((entry) => ({ entry, job: jobById(entry.jobId) }))
    .filter((item) => item.job), [state.savedJobs]);

  const selected = entries.find((item) => item.entry.jobId === selectedJobId) || entries[0] || null;

  return (
    <div>
      <Note>Saved Jobs is a personal bookmark list only. Saving a job does not mean you applied for it. All listings remain simulated demo data.</Note>
      <Card className="mb-4 p-4">
        <div className="text-[12px] text-muted">Saved jobs</div>
        <div className="font-display mt-1 text-[28px] font-semibold tracking-[-0.03em]">{entries.length}</div>
      </Card>
      {entries.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            text="When you find a simulated opportunity on Job Opportunities, click Save to Tracker and it will appear here."
            action={<Button variant="secondary" onClick={() => navigate('/jobs')}>Browse job opportunities</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="grid gap-3">
            {entries.map(({ entry, job }) => (
              <Card key={entry.jobId} className={`p-4 ${selected?.entry.jobId === entry.jobId ? 'border-brand-500' : ''}`}>
                <button type="button" className="w-full text-left" onClick={() => setSelectedJobId(entry.jobId)}>
                  <strong className="text-[15px]">{job.title}</strong>
                  <p className="mt-1 text-[13px] text-muted">{job.company} · {job.location} · {job.arrangement}</p>
                  <p className="mt-2 text-[12px] text-faint">Saved {formatDate(entry.savedAt.slice(0, 10))}</p>
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" icon={ExternalLink} onClick={() => navigate('/jobs', { state: { focusJobId: job.id } })}>View job details</Button>
                  <Button size="sm" variant="secondary" icon={Trash2} onClick={() => openModal({
                    type: 'confirm',
                    danger: true,
                    title: `Remove ${job.title}?`,
                    body: 'This removes the job from your saved list. It does not delete the listing from Job Opportunities.',
                    confirmLabel: 'Remove',
                    onConfirm: () => {
                      const remaining = state.savedJobs.filter((item) => item.jobId !== job.id);
                      removeSavedJob(job.id);
                      setSelectedJobId(remaining[0]?.jobId || '');
                    },
                  })}
                  >Remove</Button>
                </div>
              </Card>
            ))}
          </div>
          {selected && (
            <Card className="p-5 xl:sticky xl:top-[82px]">
              <Badge tone="gray" className="mb-3">Simulated listing</Badge>
              <h3 className="text-lg font-semibold">{selected.job.title}</h3>
              <p className="mt-1 text-[13px] text-muted">{selected.job.company}</p>
              <div className="mt-4 grid gap-2 text-[13px] text-muted">
                <div>Location: {selected.job.location}</div>
                <div>Work arrangement: {selected.job.arrangement}</div>
                <div>Employment type: {selected.job.employmentType}</div>
                <div>Seniority: {selected.job.seniority}</div>
                {salaryLabel(selected.job) && <div>Salary: {salaryLabel(selected.job)}</div>}
                <div>Saved: {formatDate(selected.entry.savedAt.slice(0, 10))}</div>
              </div>
              <p className="mt-4 text-[13px] text-muted">{selected.job.description}</p>
              <div className="mt-4">
                <strong className="text-sm text-ink">Required skills</strong>
                <p className="mt-1 text-[13px] text-muted">{selected.job.requiredSkills.join(', ')}</p>
              </div>
              {selected.job.optionalSkills?.length > 0 && (
                <div className="mt-3">
                  <strong className="text-sm text-ink">Optional skills</strong>
                  <p className="mt-1 text-[13px] text-muted">{selected.job.optionalSkills.join(', ')}</p>
                </div>
              )}
              <Button className="mt-5" variant="secondary" icon={ExternalLink} onClick={() => navigate('/jobs', { state: { focusJobId: selected.job.id } })}>Open in Job Opportunities</Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
