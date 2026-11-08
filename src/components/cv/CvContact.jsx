import { CV_CONTACT_FIELDS, contactEntries } from '../../services/cv/cvContact.js';

export { CV_CONTACT_FIELDS, contactEntries };

/** Labeled contact rows — accent on labels only (via .cv-contact-label). */
export function ContactLabeled({ personal, className = '', itemClassName = '' }) {
  const rows = contactEntries(personal);
  if (!rows.length) return null;
  return (
    <dl className={`cv-contact-labeled ${className}`}>
      {rows.map(({ key, label, value }) => (
        <div key={key} className={`cv-contact-row ${itemClassName}`}>
          <dt className="cv-contact-label">{label}</dt>
          <dd className="cv-contact-value">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ContactInline({ personal, className = '' }) {
  const rows = contactEntries(personal);
  if (!rows.length) return null;
  return (
    <div className={`cv-contact cv-contact-inline ${className}`}>
      {rows.map(({ key, label, value }, index) => (
        <span key={key} className="cv-contact-inline-item">
          {index > 0 && <span className="cv-contact-sep" aria-hidden> · </span>}
          <span className="cv-contact-label">{label}</span>
          {': '}
          <span className="cv-contact-value">{value}</span>
        </span>
      ))}
    </div>
  );
}

export function ContactSidebarList({ personal }) {
  const rows = contactEntries(personal);
  if (!rows.length) return null;
  return (
    <ul className="cv-sidebar-list">
      {rows.map(({ key, label, value }) => (
        <li key={key}>
          <span className="cv-sidebar-item-label">{label}</span>
          <span className="cv-sidebar-item-value">{value}</span>
        </li>
      ))}
    </ul>
  );
}
