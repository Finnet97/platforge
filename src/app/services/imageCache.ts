/**
 * Singleton image cache — maps original PSN CDN URLs to base64 data URLs.
 * Populated passively during preview (via canvas onLoad) and consumed
 * during export to avoid re-fetching through the proxy.
 */

const MAX_ENTRIES = 200;

class ImageCacheService {
  private cache = new Map<string, string>();

  get(url: string): string | undefined {
    return this.cache.get(url);
  }

  set(url: string, dataUrl: string): void {
    // LRU-style eviction: delete oldest entries when over limit
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

  clear(): void {
    this.cache.clear();
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
