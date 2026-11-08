import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/ui';
import { CvDocument } from '../components/cv/CvDocument';
import { CvDesignToolbar } from '../components/cv/CvDesignToolbar';
import { normalizeCvDesign, templateMeta } from '../services/cv/cvDesign';

export function CvPreviewPage() {
  const navigate = useNavigate();
  const { state, patchCv } = useApp();
  const cv = state.cvProfile;
  const design = normalizeCvDesign(cv?.design);

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2.5">
        <Button variant="secondary" onClick={() => navigate('/cv')}>← Back to builder</Button>
        <Button onClick={() => window.print()}>Print / Save as PDF</Button>
        <span className="text-[12.5px] text-muted">Export uses the same template and accent as the preview (A4 print).</span>
      </div>
      <div className="no-print mx-auto max-w-[860px]">
        <CvDesignToolbar
          design={design}
          onDesignChange={(next) => patchCv((draft) => { draft.design = normalizeCvDesign(next); })}
        />
        {templateMeta(design.templateId).multiColumnWarning && (
          <p className="mb-2 text-[11.5px] text-amber-300/90">Multi-column layout — ATS parsing may differ from on-screen order.</p>
        )}
      </div>
      <div className="mx-auto max-w-[860px] print-reset">
        <CvDocument
          cv={cv}
          projects={state.projects}
          skills={state.profile?.skills}
          design={design}
          photoEditable={design.templateId === 'minimal-image'}
          onProfilePhotoUpload={(dataUrl) => patchCv((draft) => {
            draft.personal.profilePhotoData = dataUrl;
          })}
          onProfilePhotoRemove={() => patchCv((draft) => {
            draft.personal.profilePhotoData = '';
          })}
        />
      </div>
    </div>
  );
}
