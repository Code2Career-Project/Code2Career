import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/constants';
import { useApp } from '../context/AppContext';
import { repoById } from '../data/constants';
import { Button, Card, Note, StageBadge } from '../components/common/ui';
import { cvAdvice, projectResult } from '../services/lifecycle';
import { CvDesignToolbar } from '../components/cv/CvDesignToolbar';
import { CvDocument } from '../components/cv/CvDocument';
import { templateMeta, normalizeCvDesign } from '../services/cv/cvDesign';
import { formatDate } from '../utils/format';

const inputClass = 'w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-[13px] font-medium text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100';

function Field({ label, value, onChange, textarea = false }) {
  return (
    <label className="grid min-w-0 gap-1 text-xs font-semibold text-muted">
      {label}
      {textarea
        ? <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} className={`${inputClass} min-h-[74px] resize-y`} />
        : <input value={value || ''} onChange={(event) => onChange(event.target.value)} className={inputClass} />}
    </label>
  );
}

function EntryEditor({ type, entries, fields, onAdd, onRemove, onChange }) {
  const label = type === 'experience' ? 'Experience' : type === 'education' ? 'Education' : 'Certification';
  const addLabel = type === 'experience' ? 'experience' : type === 'education' ? 'education' : 'certification';
  return (
    <div className="grid gap-3">
      {entries.map((entry, index) => (
        <div key={`${type}-${index}`} className="rounded-[10px] border border-line p-3.5">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <strong>{label} {index + 1}</strong>
            <Button size="sm" variant="secondary" onClick={() => onRemove(index)}>Delete</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map(([key, fieldLabel]) => (
              <Field key={key} label={fieldLabel} textarea={key === 'details'} value={entry[key] || ''} onChange={(value) => onChange(index, key, value)} />
            ))}
          </div>
        </div>
      ))}
      <Button size="sm" variant="secondary" onClick={onAdd}>+ Add {addLabel}</Button>
    </div>
  );
}

export function CvBuilderPage() {
  const navigate = useNavigate();
  const { state, patchCv, openModal, toast, createVersion, restoreVersion, renameVersion, deleteVersion } = useApp();
  const cv = state.cvProfile;
  const skills = state.profile?.skills || [];
  const projects = state.connected ? state.selected.map(repoById).filter(Boolean) : [];
  const personal = [
    ['name', 'Full name'], ['title', 'Professional title'], ['email', 'Email'], ['phone', 'Phone'],
    ['location', 'Location'], ['github', 'GitHub URL'], ['linkedin', 'LinkedIn URL'], ['portfolio', 'Portfolio URL'],
  ];
  const design = cv.design || { templateId: 'modern', accentPreset: 'blue', accentCustom: '' };

  const askVersion = () => openModal({
    type: 'fields',
    title: 'Save CV version',
    sub: 'Snapshots are kept locally.',
    fields: [
      { key: 'name', label: 'Version name', defaultValue: `CV v${state.cvVersions.length + 1}` },
      { key: 'description', label: 'Short description of changes', defaultValue: '' },
    ],
    onSubmit: (values) => createVersion(values.name, values.description),
  });

  return (
    <div>
      <Note>Your CV is saved locally. Personal details and career history are manual inputs; project and skill evidence is simulated.</Note>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Button onClick={() => openModal({
          type: 'confirm',
          title: 'CV saved',
          body: 'CV saved. Create a named version snapshot now?',
          confirmLabel: 'Create version',
          onConfirm: askVersion,
          onCancel: () => toast('CV saved locally', 'check'),
        })}
        >Save CV</Button>
        <Button variant="secondary" onClick={() => navigate('/cv/preview')}>Open CV preview</Button>
        <span className="text-[12.5px] text-muted">Changes are also saved as you edit.</span>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <div>
          <Card className="mb-4 p-5">
            <h3 className="mb-3 font-semibold">Personal information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {personal.map(([key, label]) => (
                <Field key={key} label={label} value={cv.personal[key]} onChange={(value) => patchCv((draft) => { draft.personal[key] = value; })} />
              ))}
            </div>
          </Card>
          <Card className="mb-4 p-5">
            <h3 className="mb-3 font-semibold">Professional summary</h3>
            <Field label="Summary" textarea value={cv.summary} onChange={(value) => patchCv((draft) => { draft.summary = value; })} />
          </Card>
          <Card className="mb-4 p-5">
            <h3 className="mb-3 font-semibold">Languages (optional)</h3>
            <Field
              label="Comma-separated languages"
              value={(cv.languages || []).join(', ')}
              onChange={(value) => patchCv((draft) => {
                draft.languages = value.split(',').map((s) => s.trim()).filter(Boolean);
              })}
            />
          </Card>
          <Card className="mb-4 p-5">
            <h3 className="mb-3 font-semibold">Technical skills</h3>
            {skills.length === 0 ? <p className="text-[12.5px] text-muted">Run the initial repository analysis to import skills from your Developer Skill Profile.</p> : (
              <div className="grid gap-3">
                {CATEGORIES.map((category) => {
                  const list = skills.filter((skill) => skill.category === category.key);
                  if (!list.length) return null;
                  return (
                    <div key={category.key}>
                      <strong className="text-sm">{category.label}</strong>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {list.map((skill) => (
                          <label key={skill.name} className="flex items-start gap-2 text-[13px]">
                            <input type="checkbox" className="mt-1 accent-brand-700" checked={cv.skills.includes(skill.name)} onChange={(event) => patchCv((draft) => {
                              draft.snapshotData = null;
                              draft.skills = draft.skills.filter((name) => name !== skill.name);
                              if (event.target.checked) draft.skills.push(skill.name);
                            })} />
                            <span>{skill.name} <span className="text-muted">({skill.evidence} · simulated)</span></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Card className="mb-4 p-5">
            <h3 className="mb-3 font-semibold">Projects</h3>
            {projects.length === 0 ? <p className="text-[12.5px] text-muted">Select repositories to import projects.</p> : (
              <div className="grid gap-3">
                {projects.map((repo) => {
                  const decision = projectResult(state.projects, repo.id);
                  return (
                  <div key={repo.id} className="rounded-[10px] border border-line p-3.5">
                    <label className="flex items-start gap-2 text-[13px]">
                      <input type="checkbox" className="mt-1 accent-brand-700" checked={cv.projects.includes(repo.id)} onChange={(event) => patchCv((draft) => {
                        draft.snapshotData = null;
                        draft.projects = draft.projects.filter((id) => id !== repo.id);
                        if (event.target.checked) draft.projects.push(repo.id);
                      })} />
                      <strong>{repo.name}</strong>
                      {decision?.stage && <StageBadge stage={decision.stage} />}
                    </label>
                    <p className="mt-1 text-[12.5px] text-muted">{decision ? cvAdvice(decision.stage) : 'Run lifecycle analysis to see if this project is ready for the CV.'}</p>
                    <p className="mt-1 text-[12.5px] text-muted">{repo.skills.join(' · ')}</p>
                    <div className="mt-2">
                      <Field label="CV description (does not alter repository)" textarea value={cv.descriptions[repo.id] !== undefined ? cv.descriptions[repo.id] : repo.description} onChange={(value) => patchCv((draft) => { draft.descriptions[repo.id] = value; })} />
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Card className="mb-4 p-5">
            <h3 className="mb-3 font-semibold">Education</h3>
            <EntryEditor type="education" entries={cv.education} fields={[['qualification', 'Qualification'], ['institution', 'Institution'], ['dates', 'Dates'], ['details', 'Details']]} onAdd={() => patchCv((draft) => { draft.education.push({}); })} onRemove={(index) => patchCv((draft) => { draft.education.splice(index, 1); })} onChange={(index, key, value) => patchCv((draft) => { draft.education[index][key] = value; })} />
          </Card>
          <Card className="mb-4 p-5">
            <h3 className="mb-3 font-semibold">Work experience</h3>
            <EntryEditor type="experience" entries={cv.experience} fields={[['role', 'Role'], ['company', 'Company'], ['dates', 'Dates'], ['details', 'Details']]} onAdd={() => patchCv((draft) => { draft.experience.push({}); })} onRemove={(index) => patchCv((draft) => { draft.experience.splice(index, 1); })} onChange={(index, key, value) => patchCv((draft) => { draft.experience[index][key] = value; })} />
          </Card>
          <Card className="mb-4 p-5">
            <h3 className="mb-3 font-semibold">Certifications</h3>
            <EntryEditor type="certifications" entries={cv.certifications} fields={[['name', 'Certification'], ['issuer', 'Issuer'], ['dates', 'Date']]} onAdd={() => patchCv((draft) => { draft.certifications.push({}); })} onRemove={(index) => patchCv((draft) => { draft.certifications.splice(index, 1); })} onChange={(index, key, value) => patchCv((draft) => { draft.certifications[index][key] = value; })} />
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 font-semibold">CV version history</h3>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={askVersion}>+ Create version</Button>
              <span className="text-[12.5px] text-muted">Snapshots are kept locally.</span>
            </div>
            {state.cvVersions.length === 0 ? <p className="text-[12.5px] text-muted">No versions yet. Save a snapshot to track a revision.</p> : (
              <div className="grid gap-3">
                {state.cvVersions.slice().reverse().map((version) => (
                  <div key={version.id} className="rounded-[10px] border border-line p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{version.name || 'Untitled version'}</strong>
                      <span className="text-[12.5px] text-muted">{formatDate(version.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted">{version.description || 'No description'}{state.currentCvVersionId === version.id ? ' · Current snapshot' : ''}</p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openModal({ type: 'version', version })}>View</Button>
                      <Button size="sm" variant="secondary" onClick={() => openModal({
                        type: 'confirm',
                        title: `Restore ${version.name}?`,
                        body: `Restore ${version.name}? A new snapshot will record this restoration.`,
                        confirmLabel: 'Restore',
                        onConfirm: () => restoreVersion(version),
                      })}>Restore</Button>
                      <Button size="sm" variant="secondary" onClick={() => openModal({
                        type: 'fields',
                        title: 'Rename version',
                        fields: [{ key: 'name', label: 'New version name', defaultValue: version.name || '' }],
                        onSubmit: (values) => renameVersion(version.id, values.name),
                      })}>Rename</Button>
                      <Button size="sm" variant="secondary" onClick={() => openModal({
                        type: 'confirm',
                        danger: true,
                        title: `Delete version ${version.name}?`,
                        body: `Delete version ${version.name}? This removes the snapshot from local history.`,
                        confirmLabel: 'Delete',
                        onConfirm: () => deleteVersion(version.id),
                      })}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="xl:sticky xl:top-[82px]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Live preview</h3>
            <span className="text-[12.5px] text-muted">Updates as you type</span>
          </div>
          <CvDesignToolbar
            design={design}
            onDesignChange={(next) => patchCv((draft) => { draft.design = normalizeCvDesign(next); })}
          />
          {templateMeta(design.templateId).multiColumnWarning && (
            <p className="no-print mb-2 text-[11.5px] text-amber-300/90">
              Sidebar layout: some ATS systems may read columns out of order. Classic and Minimal are better for strict ATS parsing.
            </p>
          )}
          {design.templateId === 'minimal-image' && (
            <p className="no-print mb-2 text-[11.5px] text-muted">
              Minimal Image template: click the circle in the preview to upload a profile photo (optional). Photos are saved locally.
            </p>
          )}
          <CvDocument
            cv={cv}
            projects={state.projects}
            skills={state.profile?.skills}
            design={design}
            photoEditable
            onProfilePhotoUpload={(dataUrl) => patchCv((draft) => {
              draft.personal.profilePhotoData = dataUrl;
            })}
            onProfilePhotoRemove={() => patchCv((draft) => {
              draft.personal.profilePhotoData = '';
            })}
          />
        </div>
      </div>
    </div>
  );
}
