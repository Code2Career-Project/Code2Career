/** Official brand mark — served from /public/brand */
export const BRAND_LOGO_SRC = '/brand/code2career-logo.png';

const DEFAULT_ALT = 'Code2Career — Code to Skills to Career';

/**
 * Compact mark for tight spaces (mobile top bar, icons).
 * Uses the full brand lockup scaled down (same asset as the main logo).
 */
export function LogoMark({ size = 32, title = DEFAULT_ALT, className = '' }) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt={title}
      className={`shrink-0 object-contain object-left ${className}`}
      style={{ height: size, width: 'auto', maxWidth: Math.round(size * 2.6) }}
      decoding="async"
    />
  );
}

/**
 * Primary logo — replaces legacy SVG + wordmark.
 * @param compact — sidebar collapsed / modal headers
 * @param subtitle — ignored (tagline is in the artwork)
 * @param tone — kept for API compatibility with existing call sites
 */
export function Logo({
  tone = 'onLight',
  compact = false,
  subtitle = false,
  textClassName = '',
  className = '',
}) {
  void tone;
  void subtitle;
  const height = compact ? 40 : 52;
  const maxWidth = compact ? 148 : 240;

  return (
    <img
      src={BRAND_LOGO_SRC}
      alt={DEFAULT_ALT}
      className={`object-contain object-left ${textClassName} ${className}`}
      style={{ height, width: 'auto', maxWidth }}
      decoding="async"
    />
  );
}
