import { Check, GitBranch, GitFork, Globe, Lock, RefreshCw, Star } from 'lucide-react';
import { langColor } from '../../data/constants';
import { cx, formatDate } from '../../utils/format';
import { Badge } from '../common/ui';

export function RepoRow({ repo, selected, onToggle, detailed = true }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cx(
        'flex w-full items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition duration-200',
        selected ? 'border-brand-600 bg-brand-50 shadow-[0_0_0_1px_var(--color-brand-600)]' : 'border-line bg-surface hover:border-brand-500 hover:shadow-[var(--shadow-card)]',
      )}
    >
      <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border transition', selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-white/25 bg-transparent text-transparent')}>
        <Check size={13} strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <strong className="text-sm font-semibold tracking-[-0.01em]">{repo.name}</strong>
          <Badge tone={repo.visibility === 'Private' ? 'gray' : 'green'} icon={repo.visibility === 'Private' ? Lock : Globe}>{repo.visibility}</Badge>
          {repo.stars > 0 && <Badge tone="amber" icon={Star}>{repo.stars}</Badge>}
          {repo.forks > 0 && <Badge tone="gray" icon={GitFork}>{repo.forks}</Badge>}
        </span>
        <span className="mt-1 block truncate text-[12.5px] text-muted max-[640px]:whitespace-normal">{repo.description}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-faint">
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: langColor(repo.language) }} />{repo.language}</span>
          <span className="inline-flex items-center gap-1"><RefreshCw size={13} />Updated {formatDate(repo.updated)}</span>
          {detailed && <span>Size {repo.size}</span>}
          {detailed && <span className="inline-flex items-center gap-1"><GitBranch size={13} />{repo.branches} branches</span>}
        </span>
      </span>
    </button>
  );
}
