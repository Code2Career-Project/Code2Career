import { Bell, Check, CheckCircle2, Github, LayoutGrid, Linkedin, RotateCcw, Unlink } from 'lucide-react';
import { GH_USER, REPOS } from '../data/constants';
import { LINKEDIN_DEMO_USER, linkedinAccountLabel } from '../services/linkedin';
import { STORAGE_KEY } from '../services/storage';
import { workspaceMetrics } from '../services/workspaceMetrics';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, CardHeader, EmptyState, Switch } from '../components/common/ui';
import { timeAgo } from '../utils/format';

function Row({ icon: Icon, title, text, control }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-line px-4 py-4 last:border-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-brand-100 text-brand-700"><Icon size={17} /></span>
      <div className="min-w-[200px] flex-1">
        <strong className="block text-[13.5px]">{title}</strong>
        <p className="mt-0.5 max-w-xl text-[12.5px] text-muted">{text}</p>
      </div>
      {control}
    </div>
  );
}

export function SettingsPage() {
  const { state, openModal, disconnectGithub, disconnectLinkedIn, toggleSetting } = useApp();
  const m = workspaceMetrics(state);
  const toggles = [
    ['notifyOnAnalysis', Bell, 'Notify during analysis', 'Show the notification badge while a repository analysis is running.'],
    ['notifyOnComplete', CheckCircle2, 'Notify on completion', 'Mark the initial analysis as complete in the notifications dropdown.'],
    ['compactSkillCards', LayoutGrid, 'Compact skill cards', 'Reduce the visual density of skill cards on the Developer Skills page.'],
  ];

  return (
    <div className="grid max-w-[820px] gap-4">
      <Card>
        <CardHeader title="GitHub account" sub={state.connected ? 'Connected' : 'Not connected'} />
        {state.connected ? (
          <>
            <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-navy-900 font-semibold text-cyan-300">{GH_USER.avatarInitials}</span>
              <div className="min-w-[200px] flex-1">
                <div className="flex flex-wrap items-center gap-2"><strong>{GH_USER.name}</strong><Badge tone="green" icon={Check}>Connected</Badge></div>
                <div className="mt-0.5 text-[12.5px] text-muted">@{GH_USER.login} · {GH_USER.email}</div>
              </div>
              <Button size="sm" variant="secondary" icon={Unlink} onClick={disconnectGithub}>Disconnect</Button>
            </div>
            {[
              ['GitHub handle', `@${GH_USER.login}`],
              ['Organisation', GH_USER.company],
              ['Location', GH_USER.location],
              ['Member since', GH_USER.joined],
              ['Public repositories', GH_USER.publicRepos],
              ['Repositories available for analysis', REPOS.length],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-3 border-t border-line px-4 py-2.5 text-[13px]">
                <span className="text-muted">{label}</span><span className="font-semibold">{value}</span>
              </div>
            ))}
          </>
        ) : (
          <EmptyState icon={Github} title="No GitHub account connected" text="Connect a GitHub account to load repositories and generate your skill profile." action={<Button icon={Github} onClick={() => openModal({ type: 'oauth' })}>Connect GitHub</Button>} />
        )}
      </Card>

      <Card>
        <CardHeader title="LinkedIn account" sub={state.linkedinConnected ? 'Connected (demo)' : 'Not connected'} />
        {state.linkedinConnected ? (
          <>
            <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#0A66C2] text-sm font-semibold text-white">AR</span>
              <div className="min-w-[200px] flex-1">
                <div className="flex flex-wrap items-center gap-2"><strong>{LINKEDIN_DEMO_USER.name}</strong><Badge tone="green" icon={Check}>Connected</Badge></div>
                <div className="mt-0.5 text-[12.5px] text-muted">{linkedinAccountLabel(LINKEDIN_DEMO_USER)}</div>
              </div>
              <Button size="sm" variant="secondary" icon={Unlink} onClick={disconnectLinkedIn}>Disconnect</Button>
            </div>
            <div className="border-t border-line px-4 py-2.5 text-[12.5px] text-muted">
              Disconnecting keeps {m.linkedinDraftsPending} draft(s) and {m.linkedinPublishedPosts} published post(s) in this browser.
            </div>
          </>
        ) : (
          <EmptyState icon={Linkedin} title="No LinkedIn account connected" text="Connect the demo account to manage post drafts and simulated publishing in LinkedIn Studio." action={<Button icon={Linkedin} onClick={() => openModal({ type: 'linkedin-oauth' })}>Connect LinkedIn</Button>} />
        )}
      </Card>

      <Card>
        <CardHeader title="Analysis preferences" sub="Local demo behaviour" />
        {toggles.map(([key, icon, title, text]) => (
          <Row key={key} icon={icon} title={title} text={text} control={<Switch on={!!state.settings[key]} label={title} onClick={() => toggleSetting(key, title)} />} />
        ))}
      </Card>

      <Card>
        <CardHeader title="Analysis data" sub="Current workspace state" />
        {[
          ['GitHub connection', state.connected ? 'Connected' : 'Not connected'],
          ['LinkedIn connection (demo)', state.linkedinConnected ? 'Connected' : 'Not connected'],
          ['Selected repositories', `${m.selectedRepositories} of ${m.totalDemoRepositories}`],
          ['Initial analysis', state.analyzed ? `Completed ${timeAgo(state.analysisFinishedAt)}` : (state.analyzing ? 'Running' : 'Not started')],
          ['Detected skills', m.detectedSkills],
          ['Tracked projects', m.trackedProjects],
          ['GitHub events processed', m.processedGithubEvents],
          ['GitHub events pending sync', m.pendingGithubEvents],
          ['LinkedIn drafts (pending)', m.linkedinDraftsPending],
          ['LinkedIn published (demo)', m.linkedinPublishedPosts],
          ['LinkedIn rejected', m.linkedinRejectedPosts],
          ['LinkedIn total drafts', m.linkedinTotalDrafts],
          ['Saved jobs', m.savedJobs],
          ['Repository analysis log entries', m.analysisActivityEntries],
          ['Storage', `localStorage · ${STORAGE_KEY}`],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-3 border-b border-line px-4 py-2.5 text-[13px] last:border-0">
            <span className="text-muted">{label}</span><span className="text-right font-semibold">{value}</span>
          </div>
        ))}
      </Card>

      <Card className="border-red-200">
        <CardHeader title="Reset demo data" sub="Return Code2Career to its initial local state" />
        <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <div className="min-w-[220px] flex-1">
            <strong className="block text-[13.5px]">Reset Demo Data</strong>
            <p className="mt-1 text-[12.5px] text-muted">Clears connections, analysis, projects, CV, GitHub activity sync, LinkedIn drafts, job preferences, and saved jobs from this browser. Mock repository and job catalogues in the app are unchanged.</p>
          </div>
          <Button variant="danger" icon={RotateCcw} onClick={() => openModal({ type: 'reset' })}>Reset Demo Data</Button>
        </div>
      </Card>
    </div>
  );
}
