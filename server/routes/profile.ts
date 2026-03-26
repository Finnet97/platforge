import { Router } from "express";
import { searchUser, fetchProfile, fetchPlatinumTitles } from "../services/psn.js";
import { transformTrophies, transformProfile } from "../utils/transform.js";

const router = Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // 1. Search for accountId
    const accountId = await searchUser(username);

    // 2. Fetch profile and trophy titles in parallel
    const [profileData, platinumTitles] = await Promise.all([
      fetchProfile(accountId),
      fetchPlatinumTitles(accountId),
    ]);

    // 3. Transform trophies
    const trophies = transformTrophies(platinumTitles);

    // 4. Build profile (rarestPlatinum will be null until rarity is loaded)
    const profile = transformProfile(profileData, null);

    res.json({ profile, trophies, accountId });
  } catch (err: any) {
    const msg = err.message || "Failed to fetch profile.";
    console.error("[profile] Error:", msg);
    if (err.cause) console.error("[profile] Cause:", err.cause);

    let status = 500;
    let userMessage = msg;
    let errorCode: string | undefined;

    if (msg.includes("not found")) {
      status = 404;
    } else if (msg === "fetch failed" || msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT")) {
      userMessage = "PSN API is unreachable. Please check your connection or try again later.";
    } else if (msg.includes("No authentication available") || msg.includes("Service account not configured")) {
      status = 503;
      errorCode = "service_unavailable";
      userMessage = "Service temporarily unavailable. Please try again later or connect your PSN account.";
    } else if (msg.includes("Service account session expired")) {
      status = 503;
      errorCode = "service_unavailable";
      userMessage = "Service temporarily unavailable. Please try again later.";
    } else if (msg.includes("expired") || msg.includes("Not authenticated")) {
      status = 401;
      userMessage = "Session expired. Please reconnect your PSN account.";
    } else if (msg.includes("403") || msg.includes("Forbidden") || msg.includes("private") || msg.includes("not allowed")) {
      status = 403;
      errorCode = "private_profile";
      userMessage = "This profile is private. Connect your PSN account to view it.";
    }

    res.status(status).json({ error: userMessage, ...(errorCode && { code: errorCode }) });
  }
});

export default router;
