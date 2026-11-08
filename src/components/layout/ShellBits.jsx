import { useEffect } from 'react';
import { AlertTriangle, Check, GitBranch, Github, Info, LayoutDashboard, RotateCcw, Settings, Sparkles, Unlink } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const ICONS = {
  info: Info,
  github: Github,
  'git-branch': GitBranch,
  check: Check,
  sparkles: Sparkles,
  unlink: Unlink,
  'rotate-ccw': RotateCcw,
  settings: Settings,
  'layout-dashboard': LayoutDashboard,
  'alert-triangle': AlertTriangle,
};

export function ToastHost() {
  const { toasts } = useApp();
  const reduce = useReducedMotion();
  return (
    <div className="no-print fixed right-4 bottom-4 left-4 z-[200] flex flex-col gap-2 sm:left-auto sm:w-[340px]">
      <AnimatePresence>
        {toasts.map((item) => {
          const Icon = ICONS[item.icon] || Info;
          return (
            <motion.div
              key={item.id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 8 }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-navy-900 px-3.5 py-2.5 text-[13px] font-medium text-[#F6EFE6] shadow-[var(--shadow-card)]"
            >
              <Icon size={16} className="shrink-0 text-cyan-300" />
              <span>{item.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useShellEffects() {
  const { modal, mobileNav, closeModal, setNotifOpen, setUserOpen } = useApp();
  useEffect(() => {
    document.body.classList.toggle('no-scroll', Boolean(modal) || mobileNav);
    return () => document.body.classList.remove('no-scroll');
  }, [modal, mobileNav]);

  useEffect(() => {
    const onDown = (event) => {
      if (event.key === 'Escape') {
        if (modal) closeModal();
        else {
          setNotifOpen(false);
          setUserOpen(false);
        }
      }
    };
    const onClick = (event) => {
      if (!event.target.closest('[data-menu]')) {
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('keydown', onDown);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onDown);
      document.removeEventListener('click', onClick);
    };
  }, [modal, closeModal, setNotifOpen, setUserOpen]);
}
