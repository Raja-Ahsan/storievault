/** Must exist under public/assets/images */
export const DEFAULT_COVER_IMAGE = '/assets/images/image-not-available.jpg';

/** Stops infinite onError loops when fallback is missing or returns non-image (e.g. 302 HTML). */
export function onCoverImageError(event) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === '1') {
    img.onerror = null;
    return;
  }
  img.dataset.fallbackApplied = '1';
  img.src = DEFAULT_COVER_IMAGE;
}
