import { buildCvViewModel } from '../../services/cv/cvViewModel';
import { defaultCvDesign, normalizeCvDesign, resolveAccentColor, textOnAccent, accentSoft } from '../../services/cv/cvDesign';
import { CvTemplateView } from './CvTemplateViews';

export function CvDocument({
  cv,
  projects,
  skills,
  design: designProp,
  photoEditable = false,
  onProfilePhotoUpload,
  onProfilePhotoRemove,
}) {
  const design = normalizeCvDesign(designProp || cv?.design || defaultCvDesign());
  const vm = buildCvViewModel(cv, projects, skills);
  const accent = resolveAccentColor(design);
  const onAccent = textOnAccent(accent);
  const allowPhotoEdit = photoEditable && design.templateId === 'minimal-image';

  return (
    <article
      className={`cv-document cv-template-${design.templateId}`}
      style={{
        '--cv-accent': accent,
        '--cv-accent-soft': accentSoft(accent, 0.14),
        '--cv-on-accent': onAccent,
      }}
      data-template={design.templateId}
    >
      <CvTemplateView
        templateId={design.templateId}
        vm={vm}
        photoEditable={allowPhotoEdit}
        onProfilePhotoUpload={onProfilePhotoUpload}
        onProfilePhotoRemove={onProfilePhotoRemove}
      />
    </article>
  );
}
