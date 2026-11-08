import { ContactInline } from './CvContact';

export function ProfilePhoto({ url, className = '' }) {
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      className={`cv-photo object-cover ${className}`}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}

export function SectionHeading({ children, className = '' }) {
  return <h2 className={className}>{children}</h2>;
}

export function SummarySection({ summary }) {
  if (!summary) return null;
  return (
    <section className="cv-section">
      <SectionHeading>Professional summary</SectionHeading>
      <p>{summary}</p>
    </section>
  );
}

export function ExperienceSection({ experience }) {
  if (!experience?.length) return null;
  return (
    <section className="cv-section">
      <SectionHeading>Experience</SectionHeading>
      {experience.map((entry, index) => (
        <div className="cv-item" key={`ex-${index}`}>
          <h3>{entry.role || 'Role'}</h3>
          <div className="cv-meta">{entry.company}{entry.dates ? ` · ${entry.dates}` : ''}</div>
          {entry.details && <p>{entry.details}</p>}
        </div>
      ))}
    </section>
  );
}

export function ProjectsSection({ projects }) {
  if (!projects?.length) return null;
  return (
    <section className="cv-section">
      <SectionHeading>Projects</SectionHeading>
      {projects.map(({ repo, result, description }) => (
        <div className="cv-item" key={repo.id}>
          <h3>
            {repo.name}
            {result?.stage && (
              <span className="cv-stage-hint">
                {' '}
                ·
                {result.stage === 'Published' ? ' ready for the CV' : ' still in development'}
              </span>
            )}
          </h3>
          <p>{description}</p>
          <div className="cv-meta">{(repo.skills || []).join(' · ')}</div>
        </div>
      ))}
    </section>
  );
}

export function EducationSection({ education }) {
  if (!education?.length) return null;
  return (
    <section className="cv-section">
      <SectionHeading>Education</SectionHeading>
      {education.map((entry, index) => (
        <div className="cv-item" key={`ed-${index}`}>
          <h3>{entry.qualification || 'Qualification'}</h3>
          <div className="cv-meta">{entry.institution}{entry.dates ? ` · ${entry.dates}` : ''}</div>
          {entry.details && <p>{entry.details}</p>}
        </div>
      ))}
    </section>
  );
}

export function SkillsSection({ skillGroups, compact = false }) {
  if (!skillGroups?.length) return null;
  return (
    <section className="cv-section">
      <SectionHeading>Technical skills</SectionHeading>
      {skillGroups.map((group) => (
        <div key={group.label} className={compact ? 'cv-skill-line' : 'cv-skill-block'}>
          <strong className="cv-skill-group-label">{group.label}:</strong>
          {' '}
          <span className="cv-skill-names">{group.names.join(', ')}</span>
        </div>
      ))}
    </section>
  );
}

export function SkillsList({ skillGroups, skillNames }) {
  if (skillGroups?.length) {
    return skillGroups.flatMap((g) => g.names).join(', ');
  }
  return (skillNames || []).join(', ');
}

export function CertificationsSection({ certifications }) {
  if (!certifications?.length) return null;
  return (
    <section className="cv-section">
      <SectionHeading>Certifications</SectionHeading>
      {certifications.map((entry, index) => (
        <div className="cv-item" key={`ce-${index}`}>
          <h3>{entry.name || 'Certification'}</h3>
          <div className="cv-meta">{entry.issuer}{entry.dates ? ` · ${entry.dates}` : ''}</div>
          {entry.details && <p>{entry.details}</p>}
        </div>
      ))}
    </section>
  );
}

export function LanguagesSection({ languages }) {
  if (!languages?.length) return null;
  return (
    <section className="cv-section">
      <SectionHeading>Languages</SectionHeading>
      <p>{languages.join(' · ')}</p>
    </section>
  );
}

export function IdentityBlock({ vm, layout = 'stack' }) {
  const { personal } = vm;
  return (
    <header className={`cv-identity cv-identity-${layout}`}>
      {layout === 'photo-row' && <ProfilePhoto url={vm.profilePhotoUrl} className="cv-photo-lg" />}
      <div className="cv-identity-text">
        <h1>{personal.name || 'Your name'}</h1>
        {personal.title && <div className="cv-title">{personal.title}</div>}
        <ContactInline personal={personal} />
      </div>
    </header>
  );
}
