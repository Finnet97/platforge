import { imageCache } from '../services/imageCache';

/**
 * Shared image retry chain for PSN CDN images.
 *
 * Attempt 0 (initial): direct CDN URL (set by React src prop)
 * Attempt 1: server proxy with cache-bust
 * Attempt 2: server proxy retry (different cache-bust, after server-side backoff)
 * Attempt 3+: give up — show broken state
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>, originalSrc: string) {
  const img = e.currentTarget;
  if (!originalSrc || originalSrc.startsWith('data:')) return;

  const attempt = Number(img.dataset.retryAttempt || '0');

  if (attempt < 2) {
    img.dataset.retryAttempt = String(attempt + 1);
    img.src = `/api/image-proxy?url=${encodeURIComponent(originalSrc)}&t=${Date.now()}`;
  }
  // attempt >= 2: give up, let browser show broken image or parent handle it
}

/**
 * When an image loads successfully, queue it for background proxy preloading
 * so it's cached as a data URL for export.
 */
export function handleImageLoad(_e: React.SyntheticEvent<HTMLImageElement>, originalSrc: string) {
  if (!originalSrc || originalSrc.startsWith('data:')) return;
  imageCache.enqueuePreload(originalSrc);
}
