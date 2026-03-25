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
    const status = err.message?.includes("not found") ? 404 : 500;
    res.status(status).json({ error: err.message || "Failed to fetch profile." });
  }
});

export default router;
