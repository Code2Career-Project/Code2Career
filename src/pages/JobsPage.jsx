import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, Briefcase, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, CardHeader, EmptyState, Note } from '../components/common/ui';
import { repoById } from '../data/constants';
import { formatDate, cx } from '../utils/format';
import {
  profileStrengthCoverage,
  recommendJobs,
  SORT_MODES,
} from '../services/matching';
import { isActiveVacancy } from '../services/jobs/jobVacancies';

function formatSalary(job) {
  if (!job.salary) return 'Salary not listed';
  const { min, max, currency } = job.salary;
  if (currency === 'EUR/day') return `${currency} ${min}–${max} / day (demo)`;
  return `${currency} ${min.toLocaleString()}–${max.toLocaleString()} / year (demo)`;
}

function isSaved(state, jobId) {
  return state.savedJobs.some((item) => item.jobId === jobId);
}

function StatPill({ label, value, hint }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="font-display mt-1 text-[28px] font-semibold tracking-tight text-ink">{value}</div>
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </Card>
  );
}

export function JobsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, saveJobToTracker, toast } = useApp();
  const focusId = location.state?.focusJobId;
  const [sort, setSort] = useState(SORT_MODES.BEST_MATCH);
  const [selectedJobId, setSelectedJobId] = useState(focusId || '');

  const discovery = useMemo(
    () => recommendJobs(state, { sort }),
    [state.analyzed, state.profile, state.selected, state.projects, state.cvProfile, sort],
  );

  const { jobProfile, recommendations, activeVacancyCount, matchingCount } = discovery;
  const strength = profileStrengthCoverage(jobProfile);

  const selected = recommendations.find((item) => item.job.id === selectedJobId)
    || recommendations[0]
    || null;

  const topSkills = useMemo(() => {
    if (!jobProfile) return [];
    return jobProfile.skills
      .slice()
      .sort((a, b) => b.evidenceRank - a.evidenceRank || b.repos.length - a.repos.length)
      .slice(0, 6)
      .map((s) => s.name);
  }, [jobProfile]);

  const topProjects = jobProfile?.projects?.slice(0, 4) || [];

  const saveToTracker = (job) => {
    const result = saveJobToTracker(job.id);
    if (result.duplicate) toast('This job is already in Saved Jobs', 'info');
    else if (result.ok) {
      toast('Saved to Saved Jobs — not an application', 'check');
      navigate('/applications');
    }
  };

  if (!state.analyzed || !state.profile) {
    return (
      <div>
        <Note>Simulated demo vacancies only — not live job listings. Recommendations use your analyzed Developer Skills and selected projects.</Note>
        <Card className="mt-4">
          <EmptyState
            icon={Briefcase}
            title="Complete repository analysis first"
            text="Job recommendations are built from your analyzed skill profile and project technologies. Connect GitHub, select repositories, and run the initial analysis — no manual job preferences are required."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <Note>
        Demo opportunities only — not real vacancies. Code2Career recommends roles automatically from your analyzed skills and projects. Bookmark with Save to Tracker; saving is not applying.
      </Note>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Recommended Jobs" value={matchingCount} hint="Active vacancies ≥ 20% match" />
        <StatPill label="Total Active Opportunities" value={activeVacancyCount} hint="Open demo listings (excludes closed/expired)" />
        <StatPill label="Jobs Matching Your Profile" value={matchingCount} hint="Same as recommended — profile-based" />
        <StatPill label="Jobs Saved" value={state.savedJobs.length} hint="Explicit bookmarks only" />
      </div>

      <Card className="mt-4 p-4 sm:p-5">
        <CardHeader
          title="Your developer profile (automatic)"
          sub="Derived from analyzed skills and selected repositories — updates when your profile changes"
        />
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <div>
            <div className="text-[11px] font-semibold uppercase text-faint">Main technical skills</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {topSkills.length ? topSkills.map((name) => <Badge key={name} tone="gray">{name}</Badge>) : (
                <span className="text-[13px] text-muted">No skills detected</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-faint">Relevant projects</div>
            <ul className="mt-2 grid gap-1 text-[13px] text-muted">
              {topProjects.length ? topProjects.map((p) => (
                <li key={p.id}><strong className="text-ink">{p.name}</strong> · {p.language}{p.stage ? ` · ${p.stage}` : ''}</li>
              )) : <li>No selected projects</li>}
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-faint">Profile strength</div>
            {strength != null ? (
              <p className="mt-2 text-[13px] text-muted">
                Evidence coverage: <strong className="text-brand-700">{strength}%</strong>
                {' '}
                (detected {jobProfile.evidenceTotals.detected}, verified {jobProfile.evidenceTotals.verified}, demonstrated {jobProfile.evidenceTotals.demonstrated})
              </p>
            ) : (
              <p className="mt-2 text-[13px] text-muted">Not enough skill data to score coverage.</p>
            )}
            {jobProfile.professionalTitle && (
              <p className="mt-1 text-[12px] text-faint">Title on file: {jobProfile.professionalTitle}</p>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
        <label className="flex items-center gap-2 text-[13px]">
          <span className="text-muted">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-[36px] rounded-lg border border-line bg-surface px-3"
          >
            <option value={SORT_MODES.BEST_MATCH}>Best Match</option>
            <option value={SORT_MODES.RECENT}>Recently Published</option>
            <option value={SORT_MODES.CLOSING}>Closing Soon</option>
          </select>
        </label>
      </div>

      {recommendations.length === 0 ? (
        <Card className="mt-3">
          <EmptyState
            icon={Sparkles}
            title="No sufficiently relevant opportunities"
            text="None of the active demo vacancies reached the 20% match threshold for your current profile. Expand your repository selection and re-run analysis, or check back when your skills profile grows."
          />
        </Card>
      ) : (
        <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="grid gap-3">
            {recommendations.map(({ job, match }) => (
              <Card
                key={job.id}
                className={cx('p-4 transition', selected?.job.id === job.id && 'border-brand-500 ring-1 ring-brand-500/40')}
              >
                <button type="button" className="w-full text-left" onClick={() => setSelectedJobId(job.id)}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-[15px]">{job.title}</strong>
                        {isActiveVacancy(job) && <Badge tone="green">Active vacancy</Badge>}
                      </div>
                      <p className="mt-1 text-[13px] text-muted">
                        {job.company} · {job.location} · {job.arrangement} · {job.employmentType}
                      </p>
                      <p className="mt-1 text-[12px] text-faint">
                        Posted {formatDate(job.postedAt)}
                        {job.applicationDeadline ? ` · Apply by ${formatDate(job.applicationDeadline)}` : ''}
                      </p>
                      <p className="mt-1 text-[12.5px] text-brand-700">{formatSalary(job)}</p>
                    </div>
                    <Badge tone={match.percent >= 70 ? 'green' : match.percent >= 45 ? 'amber' : 'gray'}>{match.percent}% match</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.requiredSkills.slice(0, 4).map((skill) => (
                      <Badge key={skill} tone={match.matchedRequired.includes(skill) ? 'green' : 'gray'}>{skill}</Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{match.summary}</p>
                </button>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                  {isSaved(state, job.id) ? (
                    <Button size="sm" variant="secondary" icon={Check} disabled>Saved</Button>
                  ) : (
                    <Button size="sm" icon={Bookmark} onClick={() => saveToTracker(job)}>Save to Tracker</Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => setSelectedJobId(job.id)}>View details</Button>
                </div>
              </Card>
            ))}
          </div>

          {selected && (
            <Card className="h-fit p-5 xl:sticky xl:top-[82px]">
              <Badge tone="gray" className="mb-2">Demo listing</Badge>
              <h3 className="text-lg font-semibold">{selected.job.title}</h3>
              <p className="mt-1 text-[13px] text-muted">
                {selected.job.company} · {selected.job.category} · Posted {formatDate(selected.job.postedAt)}
              </p>
              {selected.job.applicationDeadline && (
                <p className="text-[12px] text-amber-300/90">Application deadline: {formatDate(selected.job.applicationDeadline)}</p>
              )}
              <p className="mt-3 text-[13px] text-muted">{selected.job.description}</p>

              <div className="mt-4">
                <strong className="text-sm">Responsibilities</strong>
                <ul className="mt-2 list-disc pl-5 text-[12.5px] text-muted">
                  {selected.job.responsibilities.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </div>

              <div className="mt-4 grid gap-2 text-[12.5px]">
                <div><strong className="text-ink">Required qualifications</strong>
                  <ul className="mt-1 list-disc pl-5 text-muted">
                    {(selected.job.qualificationsRequired.length ? selected.job.qualificationsRequired : selected.job.requiredSkills).map((q) => <li key={q}>{q}</li>)}
                  </ul>
                </div>
                <div><strong className="text-ink">Preferred qualifications</strong>
                  <ul className="mt-1 list-disc pl-5 text-muted">
                    {(selected.job.qualificationsPreferred.length ? selected.job.qualificationsPreferred : selected.job.optionalSkills).map((q) => <li key={q}>{q}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-line bg-canvas/60 p-3">
                <strong className="text-sm">Matching analysis · {selected.match.percent}%</strong>
                <p className="mt-2 text-[12.5px] text-muted">{selected.match.mainReason}</p>
                <div className="mt-3 grid gap-1 text-[12px] text-muted">
                  <div><strong className="text-ink">Skills you have:</strong> {[...selected.match.matchedRequired, ...selected.match.matchedOptional].join(', ') || 'None'}</div>
                  <div><strong className="text-ink">Skills to improve:</strong> {selected.match.missingRequired.join(', ') || 'None'}</div>
                  <div><strong className="text-ink">Related projects:</strong> {selected.match.relatedProjects.map((id) => repoById(id)?.name || id).join(', ') || 'None'}</div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-brand-500/30 bg-brand-950/10 p-3">
                <strong className="text-sm">Why this job matches</strong>
                <ul className="mt-2 grid gap-1 text-[12.5px] text-muted">
                  {selected.match.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {isSaved(state, selected.job.id) ? (
                  <Button variant="secondary" icon={Check} disabled>Saved to Tracker</Button>
                ) : (
                  <Button icon={Bookmark} onClick={() => saveToTracker(selected.job)}>Save to Tracker</Button>
                )}
                <Button variant="secondary" onClick={() => navigate('/applications')}>Open Saved Jobs</Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
