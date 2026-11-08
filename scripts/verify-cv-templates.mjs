import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CV_TEMPLATE_IDS,
  CV_ACCENT_PRESETS,
  defaultCvDesign,
  normalizeCvDesign,
  normalizeHexColor,
  resolveAccentColor,
} from '../src/services/cv/cvDesign.js';
import { buildCvViewModel } from '../src/services/cv/cvViewModel.js';
import { contactEntries } from '../src/services/cv/cvContact.js';
import { normalizeProfilePhotoData, resolveProfilePhotoSrc } from '../src/services/cv/cvProfilePhoto.js';
import { normalizeCV, normalizeState } from '../src/services/storage.js';
import { REPOS } from '../src/data/constants.js';
import { buildProfile } from '../src/services/profile.js';

assert.equal(CV_TEMPLATE_IDS.length, 5);

const design = normalizeCvDesign({ templateId: 'sidebar', accentPreset: 'custom', accentCustom: '#112233' });
assert.equal(design.templateId, 'sidebar');
assert.equal(resolveAccentColor(design), '#112233');

const preset = normalizeCvDesign({ accentPreset: 'teal' });
assert.equal(resolveAccentColor(preset), CV_ACCENT_PRESETS.teal);

const fresh = normalizeState(null);
assert.deepEqual(fresh.cvProfile.design, defaultCvDesign());

const repos = REPOS.slice(0, 3);
const profile = buildProfile(repos);
const cv = normalizeCV({
  personal: { name: 'Alex Rivera', title: 'Developer', email: 'a@example.com' },
  summary: 'Summary text',
  skills: ['React', 'TypeScript'],
  projects: repos.map((r) => r.id),
  experience: [{ role: 'Engineer', company: 'Co', dates: '2024', details: 'Built apps' }],
  design: { templateId: 'modern', accentPreset: 'blue' },
});
const vm = buildCvViewModel(cv, {}, profile.skills);
assert.equal(vm.personal.name, 'Alex Rivera');
assert.ok(vm.projects.length >= 1);
assert.ok(vm.skillGroups.length >= 1);

CV_TEMPLATE_IDS.forEach((id) => {
  const d = normalizeCvDesign({ templateId: id, accentPreset: 'purple' });
  assert.equal(d.templateId, id);
  assert.ok(resolveAccentColor(d));
});

assert.equal(normalizeHexColor('#abc'), '#aabbcc');
assert.equal(normalizeHexColor('bad'), '');

const builder = readFileSync(new URL('../src/pages/CvBuilderPage.jsx', import.meta.url), 'utf8');
assert.ok(builder.includes('CvDesignToolbar'));
assert.ok(builder.includes('onProfilePhotoUpload'));
assert.ok(!builder.includes('profilePhotoUrl'));
assert.ok(!builder.includes('Job preferences'));

const doc = readFileSync(new URL('../src/components/cv/CvDocument.jsx', import.meta.url), 'utf8');
assert.ok(doc.includes('CvTemplateView'));
assert.ok(doc.includes('photoEditable'));

const templates = readFileSync(new URL('../src/components/cv/CvTemplateViews.jsx', import.meta.url), 'utf8');
assert.ok(templates.includes('CvProfilePhotoCircle'));
assert.ok(templates.includes('ContactLabeled'));
assert.ok(templates.includes('cv-skill-group-label') === false);
assert.ok(templates.includes('ContactSidebarList'));

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
assert.ok(css.includes('.cv-contact-label'));
assert.ok(css.includes('.cv-skill-group-label'));

const noPhoto = buildCvViewModel(normalizeCV({ personal: { name: 'No Photo' } }), {}, []);
assert.equal(noPhoto.profilePhotoSrc, '');

const withData = normalizeCV({
  personal: {
    name: 'Photo',
    profilePhotoData: 'data:image/jpeg;base64,/9j/4AAQ',
  },
});
assert.ok(withData.personal.profilePhotoData.startsWith('data:image/'));
assert.equal(resolveProfilePhotoSrc(withData.personal), withData.personal.profilePhotoData);
assert.equal(buildCvViewModel(withData, {}, []).profilePhotoSrc, withData.personal.profilePhotoData);

assert.equal(normalizeProfilePhotoData('not-data'), '');
assert.equal(normalizeProfilePhotoData('data:image/png;base64,abc'), 'data:image/png;base64,abc');

const labeled = contactEntries({ email: 'a@b.com', phone: '  ' });
assert.equal(labeled.length, 1);
assert.equal(labeled[0].label, 'Email');

console.log('verify-cv-templates: templates, accents, photo persistence, contact labels, and view model passed');
