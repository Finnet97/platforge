import { Router } from "express";
import { authenticate, isAuthenticated, clearAuth } from "../services/psn.js";
import {
  loginWithCredentials,
  submitTwoFactorCode,
  cleanupSession,
} from "../services/browser-auth.js";

const router = Router();

// Login with email + password (Puppeteer automated)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const result = await loginWithCredentials(email.trim(), password);

    if (result.npsso) {
      await authenticate(result.npsso);
      res.json({ success: true });
    } else {
      res.json({ requiresTwoFactor: true, sessionId: result.sessionId });
    }
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Login failed." });
  }
});

// Complete 2FA verification
router.post("/verify-2fa", async (req, res) => {
  const { sessionId, code } = req.body;

  if (!sessionId || !code || typeof sessionId !== "string" || typeof code !== "string") {
    res.status(400).json({ error: "Session ID and verification code are required." });
    return;
  }

  try {
    const npsso = await submitTwoFactorCode(sessionId, code.trim());
    await authenticate(npsso);
    res.json({ success: true });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Verification failed." });
  }
});

// Cancel a pending 2FA session
router.post("/cancel-2fa", (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && typeof sessionId === "string") {
    cleanupSession(sessionId);
  }
  res.json({ success: true });
});

// Fallback: manual NPSSO token
router.post("/npsso", async (req, res) => {
  const { npsso } = req.body;

  if (!npsso || typeof npsso !== "string") {
    res.status(400).json({ error: "NPSSO token is required." });
    return;
  }

  try {
    await authenticate(npsso.trim());
    res.json({ success: true });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Authentication failed." });
  }
});

router.get("/status", (_req, res) => {
  res.json({ authenticated: isAuthenticated() });
});

router.post("/logout", (_req, res) => {
  clearAuth();
  res.json({ success: true });
});

export default router;
