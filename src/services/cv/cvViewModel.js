import { resolveProfilePhotoSrc } from './cvProfilePhoto.js';
import { contactEntries } from './cvContact.js';
import { skillGroups, cvProjects } from '../cv.js';

export function buildCvViewModel(cv, projects, liveSkills) {
  const personal = cv?.personal || {};
  const profilePhotoSrc = resolveProfilePhotoSrc(personal);
  return {
    personal,
    profilePhotoSrc,
    profilePhotoUrl: profilePhotoSrc,
    contact: contactEntries(personal).map((row) => row.value),
    summary: cv?.summary || '',
    experience: Array.isArray(cv?.experience) ? cv.experience : [],
    education: Array.isArray(cv?.education) ? cv.education : [],
    certifications: Array.isArray(cv?.certifications) ? cv.certifications : [],
    languages: Array.isArray(cv?.languages) ? cv.languages.filter((l) => typeof l === 'string' && l.trim()) : [],
    skillGroups: skillGroups(cv, liveSkills),
    skillNames: Array.isArray(cv?.skills) ? cv.skills : [],
    projects: cvProjects(cv, projects),
  };
}
