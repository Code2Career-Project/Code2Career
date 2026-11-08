export const CV_CONTACT_FIELDS = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'portfolio', label: 'Website' },
];

export function contactEntries(personal) {
  if (!personal) return [];
  return CV_CONTACT_FIELDS
    .map(({ key, label }) => ({ key, label, value: personal[key] }))
    .filter((row) => typeof row.value === 'string' && row.value.trim());
}
