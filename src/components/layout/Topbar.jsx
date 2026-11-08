import { Bell, ChevronDown, GitBranch, Menu, RotateCcw, Sparkles, User } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { easeOut } from '../../utils/motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { GH_USER } from '../../data/constants';
import { LogoMark } from '../brand/Logo';
import { useApp } from '../../context/AppContext';
import { cx } from '../../utils/format';

function titles(pathname, analysis) {
  if (pathname.startsWith('/projects/') && pathname !== '/projects') return ['Project Details', 'Lifecycle evidence · demo'];
  if (pathname === '/analysis') {
    return analysis?.phase === 'complete'
      ? ['Analysis complete', 'Developer skill profile generated']
      : ['Analysis', 'Repository analysis in progress'];
  }
  const map = {
    '/': ['Overview', 'Your developer career workspace'],
    '/repositories': ['GitHub Repositories', 'Choose which repositories to analyse'],
    '/skills': ['Developer Skills', 'Evidence-based technical skill profile'],
    '/projects': ['My Projects', 'Repository-backed project intelligence · demo'],
    '/cv': ['CV Builder', 'Build your professional profile'],
    '/cv/preview': ['CV Preview', 'Document preview'],
    '/settings': ['Settings', 'Account, notifications and demo data'],
    '/activity': ['GitHub Activity', 'Incremental sync and simulated repository events'],
    '/linkedin': ['LinkedIn Studio', 'Simulated post drafts, approval, and demo publishing'],
    '/jobs': ['Job Opportunities', 'Explainable matching against simulated listings'],
    '/applications': ['Saved Jobs', 'Jobs you bookmarked from matching'],
  };
  return map[pathname] || ['Code2Career', 'Developer career workspace'];
}

export function Topbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    state, analysis, setMobileNav, notifOpen, setNotifOpen, userOpen, setUserOpen,
    openModal, markAllRead, markRead, toast, closeMenus,
  } = useApp();
  const [title, sub] = titles(pathname, analysis);
  const unread = state.notifications.some((item) => item.unread);
  const reduce = useReducedMotion();
  const menuMotion = reduce
    ? {}
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 4 }, transition: { duration: 0.18, ease: easeOut } };

  return (
    <header className="no-print sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-[#070b16]/75 px-3 backdrop-blur-xl sm:px-5">
      <button type="button" className="grid h-9 w-9 place-items-center rounded-[10px] text-muted hover:bg-white/8 min-[901px]:hidden" aria-label="Open navigation" onClick={() => setMobileNav(true)}>
        <Menu size={18} />
      </button>
      <div className="min-[901px]:hidden">
        <LogoMark size={32} className="min-[901px]:hidden" />
      </div>
      <div className="min-w-0">
        <div className="font-display truncate text-[17px] font-semibold tracking-[-0.03em]">{title}</div>
        <div className="truncate text-xs text-faint max-[640px]:hidden">{sub}</div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          title={state.connected ? `GitHub account connected as @${GH_USER.login}` : 'Connect your GitHub account'}
          onClick={() => (state.connected ? navigate('/repositories') : openModal({ type: 'oauth' }))}
          className={cx(
            'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap',
            state.connected
              ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
              : 'border-line bg-surface text-muted hover:border-brand-600 hover:text-brand-700',
          )}
        >
          <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', state.connected ? 'bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]' : 'bg-slate-400')} />
          <span className="hidden sm:inline">{state.connected ? `Connected · @${GH_USER.login}` : 'GitHub not connected'}</span>
          <span className="sm:hidden">{state.connected ? 'GitHub' : 'Connect'}</span>
        </button>

        <div className="relative" data-menu>
          <button type="button" aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-[10px] text-muted hover:bg-white/8 hover:text-ink" onClick={() => { setUserOpen(false); setNotifOpen(!notifOpen); }}>
            <Bell size={18} />
            {unread && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-canvas bg-brand-600" />}
          </button>
          <AnimatePresence>
          {notifOpen && (
            <motion.div {...menuMotion} className="absolute right-0 z-50 mt-2 w-[min(92vw,320px)] overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b border-line px-3.5 py-3">
                <strong className="text-[13px]">Notifications</strong>
                <button type="button" className="text-xs font-semibold text-brand-700 hover:underline" onClick={markAllRead}>Mark all read</button>
              </div>
              <div className="max-h-[330px] overflow-y-auto">
                {state.notifications.length === 0 && <div className="px-4 py-6 text-center text-xs text-faint">No notifications</div>}
                {state.notifications.map((item) => (
                  <button key={item.id} type="button" className="flex w-full gap-2.5 border-b border-line px-3.5 py-2.5 text-left last:border-0 hover:bg-brand-50" onClick={() => markRead(item.id)}>
                    <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', item.unread ? 'bg-brand-600' : 'bg-transparent')} />
                    <span>
                      <span className="block text-[12.8px]">{item.title}</span>
                      <span className="mt-0.5 block text-[11.5px] text-muted">{item.body}</span>
                      <time className="mt-1 block text-[11px] text-faint">{item.time}</time>
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-line bg-canvas px-3 py-2 text-center">
                <button type="button" className="text-xs font-semibold text-brand-700" onClick={() => { closeMenus(); navigate('/'); toast('Activity is summarised on the Overview page', 'layout-dashboard'); }}>
                  View all activity
                </button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div className="relative" data-menu>
          <button type="button" aria-label="Profile menu" className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-white/8" onClick={() => { setNotifOpen(false); setUserOpen(!userOpen); }}>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-xs font-semibold text-cyan-300">{GH_USER.avatarInitials}</span>
            <span className="hidden text-left leading-tight sm:block">
              <strong className="block text-xs font-semibold">{GH_USER.name}</strong>
              <span className="block text-[11px] text-faint">@{GH_USER.login}</span>
            </span>
            <ChevronDown size={15} className="text-faint" />
          </button>
          <AnimatePresence>
          {userOpen && (
            <motion.div {...menuMotion} className="absolute right-0 z-50 mt-2 w-[250px] overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-navy-900 text-sm font-semibold text-cyan-300">{GH_USER.avatarInitials}</span>
                <span>
                  <strong className="block text-[13.5px]">{GH_USER.name}</strong>
                  <span className="text-[11.5px] text-faint">@{GH_USER.login}</span>
                </span>
              </div>
              <div className="my-1 h-px bg-line" />
              <MenuLink icon={User} label="Profile & account" onClick={() => { closeMenus(); navigate('/settings'); }} />
              <MenuLink icon={GitBranch} label="My repositories" onClick={() => { closeMenus(); navigate('/repositories'); }} />
              <MenuLink icon={Sparkles} label="Skill profile" onClick={() => { closeMenus(); navigate('/skills'); }} />
              <div className="my-1 h-px bg-line" />
              <MenuLink icon={RotateCcw} label="Reset demo data" danger onClick={() => { closeMenus(); openModal({ type: 'reset' }); }} />
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button type="button" onClick={onClick} className={cx('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-muted hover:bg-white/8 hover:text-ink', danger && 'hover:bg-red-50 hover:text-red-600')}>
      <Icon size={16} />
      {label}
    </button>
  );
}
