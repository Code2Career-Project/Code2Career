import { CheckCheck, Github, Play, Search, X } from 'lucide-react';
import { GH_USER, REPOS, uniqueLanguages } from '../data/constants';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, EmptyState } from '../components/common/ui';
import { RepoRow } from '../components/repositories/RepoRow';
import { filteredRepos } from '../utils/repos';

export function RepositoriesPage() {
  const { state, openModal, repoFilters, setRepoFilters, toggleRepo, applyVisibleSelection, startAnalysis } = useApp();
  if (!state.connected) {
    return (
      <Card>
        <EmptyState
          icon={Github}
          title="GitHub account not connected"
          text="Connect your GitHub account to load the list of available repositories for analysis."
          action={<Button icon={Github} onClick={() => openModal({ type: 'oauth' })}>Connect GitHub</Button>}
        />
      </Card>
    );
  }

  const visible = filteredRepos(repoFilters);
  const languages = uniqueLanguages();
  const count = state.selected.length;

  return (
    <div>
      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-navy-900 text-base font-semibold text-cyan-300">{GH_USER.avatarInitials}</span>
          <div className="min-w-[200px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-[15px]">{GH_USER.name}</strong>
              <Badge tone="green">Connected</Badge>
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted">@{GH_USER.login} · {GH_USER.company} · {GH_USER.location}</div>
          </div>
          <div className="flex gap-5">
            {[[REPOS.length, 'Repositories'], [GH_USER.followers, 'Followers'], [GH_USER.publicRepos, 'Public repos']].map(([value, label]) => (
              <div key={label} className="text-right">
                <div className="text-lg font-bold">{value}</div>
                <div className="text-[11.5px] text-faint">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-[220px] max-w-[380px] flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input value={repoFilters.q} onChange={(event) => setRepoFilters({ ...repoFilters, q: event.target.value })} placeholder="Search repositories…" className="h-[38px] w-full rounded-lg border border-line bg-surface pr-3 pl-9" />
        </label>
        <select aria-label="Visibility" className="h-[38px] rounded-lg border border-line bg-surface px-3" value={repoFilters.visibility} onChange={(event) => setRepoFilters({ ...repoFilters, visibility: event.target.value })}>
          <option value="all">All visibility</option>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>
        <select aria-label="Language" className="h-[38px] rounded-lg border border-line bg-surface px-3" value={repoFilters.language} onChange={(event) => setRepoFilters({ ...repoFilters, language: event.target.value })}>
          <option value="all">All languages</option>
          {languages.map((language) => <option key={language}>{language}</option>)}
        </select>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" icon={CheckCheck} onClick={() => applyVisibleSelection(visible.map((repo) => repo.id), true)}>Select all</Button>
          <Button size="sm" variant="secondary" icon={X} onClick={() => applyVisibleSelection(visible.map((repo) => repo.id), false)}>Deselect all</Button>
        </div>
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3.5 p-3.5">
          <div className="min-w-[220px] flex-1">
            <div className="text-[13.5px] font-semibold">{count} repositor{count === 1 ? 'y' : 'ies'} selected</div>
            <div className="mt-0.5 text-[12.5px] text-muted">Repositories are never selected automatically — only what you pick is analysed.</div>
          </div>
          <Button icon={Play} disabled={!count} onClick={() => startAnalysis()}>
            {count === 1 ? 'Analyze 1 selected repository' : `Analyze ${count} selected repositories`}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="grid gap-2 p-3.5 sm:p-4">
          {visible.length === 0 && <EmptyState icon={Search} title="No repositories match your filters" text="Try a different search term or clear the visibility and language filters." />}
          {visible.map((repo) => (
            <RepoRow key={repo.id} repo={repo} selected={state.selected.includes(repo.id)} onToggle={() => toggleRepo(repo.id)} />
          ))}
        </div>
      </Card>
    </div>
  );
}
