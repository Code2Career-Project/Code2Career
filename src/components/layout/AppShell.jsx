import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { easeOut } from '../../utils/motion';
import { Atmosphere } from './Atmosphere';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastHost, useShellEffects } from './ShellBits';
import { ModalHost } from '../modals/ModalHost';
import { useApp } from '../../context/AppContext';
import { cx } from '../../utils/format';
import { OverviewPage } from '../../pages/OverviewPage';
import { RepositoriesPage } from '../../pages/RepositoriesPage';
import { SkillsPage } from '../../pages/SkillsPage';
import { ProjectsPage } from '../../pages/ProjectsPage';
import { ProjectDetailsPage } from '../../pages/ProjectDetailsPage';
import { CvBuilderPage } from '../../pages/CvBuilderPage';
import { CvPreviewPage } from '../../pages/CvPreviewPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { AnalysisPage } from '../../pages/AnalysisPage';
import { ActivityPage } from '../../pages/ActivityPage';
import { LinkedInPage } from '../../pages/LinkedInPage';
import { JobsPage } from '../../pages/JobsPage';
import { ApplicationsPage } from '../../pages/ApplicationsPage';

function Screen({ children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, ease: easeOut }}>
      {children}
    </motion.div>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const { state, mobileNav, setMobileNav } = useApp();
  useShellEffects();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);

  return (
    <div className="relative min-h-screen">
      <Atmosphere />
      <Sidebar />
      {mobileNav && <button type="button" aria-label="Close navigation" className="no-print fixed inset-0 z-[55] bg-navy-950/45 min-[901px]:hidden" onClick={() => setMobileNav(false)} />}
      <div className={cx('print-reset relative z-10 flex min-h-screen flex-col transition-[margin] duration-300', state.sidebarCollapsed ? 'min-[901px]:ml-[76px]' : 'min-[901px]:ml-[264px]')}>
        <Topbar />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-3.5 py-5 sm:px-5 sm:py-6">
          <Routes>
            <Route path="/" element={<Screen><OverviewPage /></Screen>} />
            <Route path="/repositories" element={<Screen><RepositoriesPage /></Screen>} />
            <Route path="/skills" element={<Screen><SkillsPage /></Screen>} />
            <Route path="/projects" element={<Screen><ProjectsPage /></Screen>} />
            <Route path="/projects/:projectId" element={<Screen><ProjectDetailsPage /></Screen>} />
            <Route path="/cv" element={<Screen><CvBuilderPage /></Screen>} />
            <Route path="/cv/preview" element={<Screen><CvPreviewPage /></Screen>} />
            <Route path="/settings" element={<Screen><SettingsPage /></Screen>} />
            <Route path="/analysis" element={<Screen><AnalysisPage /></Screen>} />
            <Route path="/activity" element={<Screen><ActivityPage /></Screen>} />
            <Route path="/linkedin" element={<Screen><LinkedInPage /></Screen>} />
            <Route path="/jobs" element={<Screen><JobsPage /></Screen>} />
            <Route path="/applications" element={<Screen><ApplicationsPage /></Screen>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <ModalHost />
      <ToastHost />
    </div>
  );
}
