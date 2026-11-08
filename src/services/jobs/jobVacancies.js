import { JOBS, jobById } from '../../data/jobs.js';

/** Fixed reference date for demo vacancy expiry (frontend simulation). */
export const DEMO_REFERENCE_DATE = '2026-11-04';

export function normalizeVacancy(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    ...raw,
    status: raw.status === 'closed' ? 'closed' : 'active',
    applicationDeadline: raw.applicationDeadline || raw.closingDate || null,
    responsibilities: Array.isArray(raw.responsibilities) ? raw.responsibilities : [],
    qualificationsRequired: Array.isArray(raw.qualificationsRequired) ? raw.qualificationsRequired : [],
    qualificationsPreferred: Array.isArray(raw.qualificationsPreferred) ? raw.qualificationsPreferred : [],
    category: typeof raw.category === 'string' ? raw.category : 'Engineering',
  };
}

export function isActiveVacancy(job, referenceDate = DEMO_REFERENCE_DATE) {
  const vacancy = normalizeVacancy(job);
  if (!vacancy) return false;
  if (vacancy.status === 'closed') return false;
  const deadline = vacancy.applicationDeadline;
  if (deadline && deadline < referenceDate) return false;
  return true;
}

export function listActiveVacancies(jobs = JOBS, referenceDate = DEMO_REFERENCE_DATE) {
  return jobs.map(normalizeVacancy).filter((job) => job && isActiveVacancy(job, referenceDate));
}

export function listAllVacancies(jobs = JOBS) {
  return jobs.map(normalizeVacancy).filter(Boolean);
}

export { JOBS, jobById };
