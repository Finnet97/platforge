import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import trophyRoutes from "./routes/trophies.js";
import { initServiceAuth } from "./services/psn.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// CORS — only needed in dev (in production, frontend is served from same origin)
if (process.env.NODE_ENV !== "production") {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:5173"];
  app.use(cors({ origin: allowedOrigins }));
}
app.use(express.json());

// Rate limiting
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, validate: { xForwardedForHeader: false } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, validate: { xForwardedForHeader: false } });
const proxyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, validate: { xForwardedForHeader: false } });
app.use("/api/auth", authLimiter);
app.use("/api/image-proxy", proxyLimiter);
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/trophies", trophyRoutes);

// Image proxy — allows html-to-image to capture cross-origin images
const ALLOWED_IMAGE_HOSTS = [
  "playstation.net",
  "playstation.com",
  "sonyentertainmentnetwork.com",
  "googleapis.com",  // PSN avatar CDN
  "ggpht.com",       // PSN avatar CDN (alt)
];

const PROXY_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.playstation.com/",
  "Sec-Fetch-Dest": "image",
  "Sec-Fetch-Mode": "no-cors",
  "Sec-Fetch-Site": "cross-site",
};

const PROXY_MAX_ATTEMPTS = 3;
const PROXY_TIMEOUT_MS = 15000;
const PROXY_BACKOFF = [0, 500, 1500];

function delayMs(ms: number) { return new Promise(r => setTimeout(r, ms)); }

app.get("/api/image-proxy", async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  // Upgrade http to https for allowed domains
  if (parsed.protocol === "http:") {
    parsed.protocol = "https:";
  }

  if (!ALLOWED_IMAGE_HOSTS.some(h => parsed.hostname.endsWith(h))) {
    res.status(403).json({ error: "Domain not allowed" });
    return;
  }

  for (let attempt = 0; attempt < PROXY_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await delayMs(PROXY_BACKOFF[attempt]);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
      const response = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: PROXY_HEADERS,
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        // Don't retry 4xx errors (permanent failures)
        if (response.status < 500 || attempt === PROXY_MAX_ATTEMPTS - 1) {
          res.status(response.status).end();
          return;
        }
        continue;
      }

      const contentType = response.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
      return;
    } catch {
      if (attempt === PROXY_MAX_ATTEMPTS - 1) {
        res.status(502).json({ error: "Failed to fetch image" });
        return;
      }
    }
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// In production, serve the Vite-built frontend
const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API routes (React Router handles client-side routing)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "Not found" });
  } else {
    res.sendFile(path.join(distPath, "index.html"));
  }
});

// Global error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Initialize service account auth (non-blocking)
initServiceAuth().catch((err) => {
  console.warn("[server] Service account init failed:", err.message);
});

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});
