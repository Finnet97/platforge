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
    if (msg.includes("not found")) status = 404;
    if (msg === "fetch failed" || msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT")) {
      userMessage = "PSN API is unreachable. Please check your connection or try again later.";
    }
    if (msg.includes("expired") || msg.includes("Not authenticated")) {
      status = 401;
      userMessage = "Session expired. Please reconnect your PSN account.";
    }

    res.status(status).json({ error: userMessage });
  }
});

export default router;
