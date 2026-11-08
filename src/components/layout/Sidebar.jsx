import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, FolderKanban, GitBranch, LayoutDashboard, PanelLeftClose, Settings, Sparkles, Activity, Linkedin, Briefcase, ClipboardList } from 'lucide-react';
import { easeOut } from '../../utils/motion';
import { Logo } from '../brand/Logo';
import { isPendingDraft } from '../../services/linkedin';
import { useApp } from '../../context/AppContext';
import { cx } from '../../utils/format';

const GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/repositories', label: 'GitHub Repositories', icon: GitBranch, badge: 'repos' },
      { to: '/skills', label: 'Developer Skills', icon: Sparkles, badge: 'skills' },
      { to: '/projects', label: 'My Projects', icon: FolderKanban },
      { to: '/cv', label: 'CV Builder', icon: FileText },
    ],
  },
  {
    label: 'Career',
    items: [
      { to: '/activity', label: 'GitHub Activity', icon: Activity, badge: 'activity' },
      { to: '/linkedin', label: 'LinkedIn Studio', icon: Linkedin, badge: 'drafts' },
      { to: '/jobs', label: 'Job Opportunities', icon: Briefcase, badge: 'savedJobs' },
      { to: '/applications', label: 'Saved Jobs', icon: ClipboardList, badge: 'savedJobs' },
    ],
  },
  {
    label: 'Account',
    items: [{ to: '/settings', label: 'Settings', icon: Settings }],
  },
];

export function Sidebar() {
  const { state, mobileNav, setMobileNav, toggleCollapsed } = useApp();
  const reduce = useReducedMotion();
  const collapsed = state.sidebarCollapsed;
  const hide = collapsed ? 'min-[901px]:sr-only' : '';
  const skillCount = state.profile?.skills?.length || 0;
  const badgeCount = (key) => {
    if (key === 'repos') return state.selected.length;
    if (key === 'skills') return skillCount;
    if (key === 'activity') return state.githubEvents.filter((event) => event.status === 'pending').length;
    if (key === 'drafts') return state.linkedinDrafts.filter((draft) => isPendingDraft(draft)).length;
    if (key === 'savedJobs') return state.savedJobs.length;
    return 0;
  };

  return (
    <aside
      className={cx(
        'no-print fixed inset-y-0 left-0 z-[60] flex w-[264px] flex-col border-r border-white/10 bg-navy-900 text-slate-300 transition-[transform,width] duration-300',
        collapsed && 'min-[901px]:w-[76px]',
        mobileNav ? 'translate-x-0' : 'max-[900px]:-translate-x-full',
      )}
    >
      <div className={cx('flex h-16 items-center border-b border-white/10 px-4', collapsed && 'min-[901px]:justify-center min-[901px]:px-2')}>
        <Logo tone="onDark" subtitle textClassName={collapsed ? 'min-[901px]:hidden' : ''} compact={collapsed} />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <div className={cx('px-2.5 pt-2 pb-1.5 text-[10.5px] font-bold tracking-[0.12em] text-slate-500 uppercase', collapsed && 'min-[901px]:h-3 min-[901px]:overflow-hidden min-[901px]:p-0 min-[901px]:opacity-0')}>
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const count = item.badge ? badgeCount(item.badge) : 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileNav(false)}
                  title={item.label}
                  className={({ isActive }) => cx(
                    'relative mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[#D9CFC3] transition hover:text-white',
                    collapsed && 'min-[901px]:justify-center min-[901px]:px-0',
                    isActive && 'font-semibold text-white',
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId={reduce ? undefined : 'c2c-nav-pill'}
                          className="absolute inset-0 rounded-lg bg-white/10"
                          transition={{ duration: 0.22, ease: easeOut }}
                        />
                      )}
                      {isActive && <span className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r bg-cyan-400" />}
                      <Icon size={18} strokeWidth={1.9} className="relative z-[1] shrink-0" />
                      <span className={cx('relative z-[1] truncate', hide)}>{item.label}</span>
                      {count > 0 && (
                        <span className={cx('relative z-[1] ml-auto rounded-full bg-cyan-400/15 px-1.5 text-[11px] font-bold text-cyan-300', collapsed && 'min-[901px]:hidden')}>
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-slate-300 hover:bg-white/8 hover:text-white min-[901px]:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeftClose size={17} className={cx('shrink-0 transition', collapsed && 'rotate-180')} />
          <span className={hide}>Collapse sidebar</span>
        </button>
        <div className={cx('mt-2.5 rounded-lg border border-cyan-400/25 bg-white/5 px-3 py-2.5', collapsed && 'min-[901px]:hidden')}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-cyan-300 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Local demo
          </div>
          <p className="mt-1 text-[11.5px] leading-snug text-slate-400">Local simulation only. No real GitHub or AI calls.</p>
        </div>
      </div>
    </aside>
  );
}
