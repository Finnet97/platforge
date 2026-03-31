/**
 * Singleton image cache — maps original PSN CDN URLs to base64 data URLs.
 * Images are preloaded through the server proxy in the background after they
 * load in the browser, so they're ready for export without re-fetching.
 */

const MAX_ENTRIES = 500;

class ImageCacheService {
  private cache = new Map<string, string>();
  private queue: string[] = [];
  private processing = false;

  get(url: string): string | undefined {
    return this.cache.get(url);
  }

  set(url: string, dataUrl: string): void {
    if (this.cache.size >= MAX_ENTRIES) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(url, dataUrl);
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  /** Fetch image through the proxy, convert to data URL, and cache it. */
  async preload(url: string, retries = 3): Promise<string | null> {
    const cached = this.cache.get(url);
    if (cached) return cached;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const resp = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
        if (!resp.ok) {
          if (attempt < retries) { await delay(400 * (attempt + 1)); continue; }
          return null;
        }
        const blob = await resp.blob();
        const dataUrl = await blobToDataUrl(blob);
        this.set(url, dataUrl);
        return dataUrl;
      } catch {
        if (attempt < retries) await delay(400 * (attempt + 1));
      }
    }
    return null;
  }

  /**
   * Ensure all given URLs are cached as data URLs before export.
   * Uses a concurrency pool to fetch missing images in parallel.
   */
  async ensureAllCached(
    urls: string[],
    onProgress?: (done: number, total: number, failed: number) => void,
  ): Promise<{ cached: number; failed: string[] }> {
    const unique = [...new Set(urls)];
    const missing = unique.filter(u => u && !u.startsWith('data:') && !this.cache.has(u));
    const alreadyCached = unique.length - missing.length;
    const failedUrls: string[] = [];
    let done = 0;

    onProgress?.(alreadyCached, unique.length, 0);

    if (missing.length === 0) {
      return { cached: unique.length, failed: [] };
    }

    // Concurrency pool of 5 workers
    let nextIndex = 0;
    const workers = Array.from({ length: Math.min(5, missing.length) }, async () => {
      while (nextIndex < missing.length) {
        const idx = nextIndex++;
        const url = missing[idx];
        const result = await this.preload(url, 3);
        if (!result) failedUrls.push(url);
        done++;
        onProgress?.(alreadyCached + done, unique.length, failedUrls.length);
      }
    });

    await Promise.all(workers);

    return { cached: unique.length - failedUrls.length, failed: failedUrls };
  }

  /**
   * Queue a URL for background preloading. URLs are processed one at a time
   * with delays between requests to avoid PSN CDN rate limiting.
   */
  enqueuePreload(url: string): void {
    if (!url || url.startsWith('data:') || this.cache.has(url)) return;
    if (this.queue.includes(url)) return;
    this.queue.push(url);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const url = this.queue.shift()!;
      if (!this.cache.has(url)) {
        await this.preload(url, 2);
        // Small delay between requests to avoid rate limiting
        await delay(150);
      }
    }

    this.processing = false;
  }

  clear(): void {
    this.cache.clear();
    this.queue = [];
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export const imageCache = new ImageCacheService();
