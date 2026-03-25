import { Router } from "express";
import { fetchPlatinumRarity } from "../services/psn.js";

const router = Router();

/** Fetch rarity for a specific title's platinum trophy. */
router.get("/:accountId/:npCommunicationId/rarity", async (req, res) => {
  const { accountId, npCommunicationId } = req.params;
  const npServiceName = (req.query.npServiceName as string) === "trophy" ? "trophy" : "trophy2";

  try {
    const result = await fetchPlatinumRarity(accountId, npCommunicationId, npServiceName);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch rarity." });
  }
});

export default router;
