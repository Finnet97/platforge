import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import trophyRoutes from "./routes/trophies.js";
import { initServiceAuth } from "./services/psn.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/trophies", trophyRoutes);

// Image proxy — allows html-to-image to capture cross-origin images
app.get("/api/image-proxy", async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).end();
      return;
    }
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch {
    res.status(502).json({ error: "Failed to fetch image" });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Initialize service account auth (non-blocking)
initServiceAuth().catch((err) => {
  console.warn("[server] Service account init failed:", err.message);
});

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});
