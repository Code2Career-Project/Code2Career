import {
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  IdentityBlock,
  LanguagesSection,
  ProfilePhoto,
  ProjectsSection,
  SectionHeading,
  SkillsList,
  SkillsSection,
  SummarySection,
} from './CvSections';
import { ContactInline, ContactLabeled, ContactSidebarList } from './CvContact';
import { CvProfilePhotoCircle } from './CvProfilePhotoCircle';

function MinimalImagePhoto({ vm, photoEditable, onProfilePhotoUpload, onProfilePhotoRemove }) {
  const src = vm.profilePhotoSrc || vm.profilePhotoUrl;
  if (!photoEditable && !src) return null;
  return (
    <CvProfilePhotoCircle
      src={src}
      editable={photoEditable}
      onUpload={onProfilePhotoUpload}
      onRemove={onProfilePhotoRemove}
      sizeClass="cv-photo-md"
    />
  );
}

export function TemplateClassic({ vm }) {
  return (
    <>
      <IdentityBlock vm={vm} layout="stack" />
      <SummarySection summary={vm.summary} />
      <ExperienceSection experience={vm.experience} />
      <ProjectsSection projects={vm.projects} />
      <EducationSection education={vm.education} />
      <SkillsSection skillGroups={vm.skillGroups} />
      <CertificationsSection certifications={vm.certifications} />
      <LanguagesSection languages={vm.languages} />
    </>
  );
}

export function TemplateModern({ vm }) {
  return (
    <>
      <header className="cv-modern-header">
        <h1>{vm.personal.name || 'Your name'}</h1>
        {vm.personal.title && <div className="cv-title">{vm.personal.title}</div>}
        <ContactInline personal={vm.personal} className="cv-modern-contact" />
      </header>
      <div className="cv-modern-body">
        <SummarySection summary={vm.summary} />
        <ExperienceSection experience={vm.experience} />
        <ProjectsSection projects={vm.projects} />
        <EducationSection education={vm.education} />
        <SkillsSection skillGroups={vm.skillGroups} />
        <CertificationsSection certifications={vm.certifications} />
        <LanguagesSection languages={vm.languages} />
      </div>
    </>
  );
}

export function TemplateMinimalImage({ vm, photoEditable, onProfilePhotoUpload, onProfilePhotoRemove }) {
  const hasPhotoSlot = photoEditable || Boolean(vm.profilePhotoSrc || vm.profilePhotoUrl);
  return (
    <>
      <header className={`cv-minimal-image-header ${hasPhotoSlot ? 'has-photo' : 'no-photo'}`}>
        <MinimalImagePhoto
          vm={vm}
          photoEditable={photoEditable}
          onProfilePhotoUpload={onProfilePhotoUpload}
          onProfilePhotoRemove={onProfilePhotoRemove}
        />
        <div className="cv-minimal-image-identity">
          <h1>{vm.personal.name || 'Your name'}</h1>
          {vm.personal.title && <div className="cv-title">{vm.personal.title}</div>}
          <ContactLabeled personal={vm.personal} className="cv-minimal-image-contact" />
        </div>
      </header>
      <SummarySection summary={vm.summary} />
      <ExperienceSection experience={vm.experience} />
      <ProjectsSection projects={vm.projects} />
      <EducationSection education={vm.education} />
      <SkillsSection skillGroups={vm.skillGroups} />
      <CertificationsSection certifications={vm.certifications} />
      <LanguagesSection languages={vm.languages} />
    </>
  );
}

export function TemplateMinimal({ vm }) {
  return (
    <>
      <header className="cv-minimal-header">
        <h1>{vm.personal.name || 'Your name'}</h1>
        {vm.personal.title && <div className="cv-title">{vm.personal.title}</div>}
        <ContactInline personal={vm.personal} />
      </header>
      <SummarySection summary={vm.summary} />
      <ExperienceSection experience={vm.experience} />
      <ProjectsSection projects={vm.projects} />
      <EducationSection education={vm.education} />
      <SkillsSection skillGroups={vm.skillGroups} />
      <CertificationsSection certifications={vm.certifications} />
      <LanguagesSection languages={vm.languages} />
    </>
  );
}

export function TemplateSidebar({ vm }) {
  const photoSrc = vm.profilePhotoSrc || vm.profilePhotoUrl;
  return (
    <div className="cv-sidebar-layout">
      <aside className="cv-sidebar">
        {photoSrc && <ProfilePhoto url={photoSrc} className="cv-photo-md cv-sidebar-photo" />}
        <div className="cv-sidebar-block">
          <SectionHeading className="cv-sidebar-heading">Contact</SectionHeading>
          <ContactSidebarList personal={vm.personal} />
        </div>
        {(vm.skillGroups.length > 0 || vm.skillNames.length > 0) && (
          <div className="cv-sidebar-block">
            <SectionHeading className="cv-sidebar-heading">Technical skills</SectionHeading>
            <p className="cv-sidebar-skills">{SkillsList({ skillGroups: vm.skillGroups, skillNames: vm.skillNames })}</p>
          </div>
        )}
        {vm.languages.length > 0 && (
          <div className="cv-sidebar-block">
            <SectionHeading className="cv-sidebar-heading">Languages</SectionHeading>
            <p className="cv-sidebar-skills">{vm.languages.join(' · ')}</p>
          </div>
        )}
        {vm.certifications.length > 0 && (
          <div className="cv-sidebar-block">
            <SectionHeading className="cv-sidebar-heading">Certifications</SectionHeading>
            {vm.certifications.map((entry, index) => (
              <div className="cv-sidebar-cert" key={`sb-ce-${index}`}>
                <strong>{entry.name}</strong>
                <div>{entry.issuer}{entry.dates ? ` · ${entry.dates}` : ''}</div>
              </div>
            ))}
          </div>
        )}
      </aside>
      <main className="cv-sidebar-main">
        <header>
          <h1>{vm.personal.name || 'Your name'}</h1>
          {vm.personal.title && <div className="cv-title">{vm.personal.title}</div>}
        </header>
        <SummarySection summary={vm.summary} />
        <ExperienceSection experience={vm.experience} />
        <ProjectsSection projects={vm.projects} />
        <EducationSection education={vm.education} />
      </main>
    </div>
  );
}

const MAP = {
  classic: TemplateClassic,
  modern: TemplateModern,
  'minimal-image': TemplateMinimalImage,
  minimal: TemplateMinimal,
  sidebar: TemplateSidebar,
};

export function CvTemplateView({
  templateId,
  vm,
  photoEditable = false,
  onProfilePhotoUpload,
  onProfilePhotoRemove,
}) {
  const View = MAP[templateId] || TemplateModern;
  return (
    <View
      vm={vm}
      photoEditable={photoEditable}
      onProfilePhotoUpload={onProfilePhotoUpload}
      onProfilePhotoRemove={onProfilePhotoRemove}
    />
  );
}
