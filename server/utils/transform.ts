import type { TrophyTitle } from "psn-api";
import { format, parseISO } from "date-fns";

export interface PlatForgeTrophy {
  id: number;
  gameTitle: string;
  platform: "PS3" | "PS4" | "PS5" | "Vita" | "PSVR";
  dateEarned: string;
  rarity: number;
  timeToPlatinum: string;
  order: number;
  imageUrl: string;
  // Internal fields for progressive loading
  npCommunicationId: string;
  npServiceName: "trophy" | "trophy2";
  rarityLoaded: boolean;
}

export interface PlatForgeProfile {
  username: string;
  psnLevel: number;
  totalPlatinums: number;
  avatar: string;
  rarestPlatinum: PlatForgeTrophy | null;
}

function mapPlatform(platform: string): PlatForgeTrophy["platform"] {
  // Platform can be comma-separated like "PS4,PSVITA"
  const p = platform.toUpperCase();
  if (p.includes("PS5")) return "PS5";
  if (p.includes("PS4")) return "PS4";
  if (p.includes("PS3")) return "PS3";
  if (p.includes("VITA") || p.includes("PSVITA")) return "Vita";
  if (p.includes("PSVR")) return "PSVR";
  return "PS4"; // fallback
}

function formatDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), "MMMM d, yyyy");
  } catch {
    return isoDate;
  }
}

/**
 * Transform PSN TrophyTitle[] into PlatForge Trophy[].
 * Titles should already be filtered to only platinum-earned titles.
 * Sorted by lastUpdatedDateTime descending (most recent first).
 */
export function transformTrophies(titles: TrophyTitle[]): PlatForgeTrophy[] {
  // Sort by date descending (most recent first)
  const sorted = [...titles].sort(
    (a, b) => new Date(b.lastUpdatedDateTime).getTime() - new Date(a.lastUpdatedDateTime).getTime()
  );

  return sorted.map((title, index) => ({
    id: index + 1,
    gameTitle: title.trophyTitleName,
    platform: mapPlatform(String(title.trophyTitlePlatform)),
    dateEarned: formatDate(title.lastUpdatedDateTime),
    rarity: 0, // Will be loaded progressively
    timeToPlatinum: "--",
    order: sorted.length - index, // Most recent = highest order
    imageUrl: title.trophyTitleIconUrl,
    npCommunicationId: title.npCommunicationId,
    npServiceName: title.npServiceName,
    rarityLoaded: false,
  }));
}

export function transformProfile(
  profileData: { onlineId: string; avatarUrl: string; trophyLevel: number; totalPlatinums: number },
  rarestTrophy: PlatForgeTrophy | null
): PlatForgeProfile {
  return {
    username: profileData.onlineId,
    psnLevel: profileData.trophyLevel,
    totalPlatinums: profileData.totalPlatinums,
    avatar: profileData.avatarUrl,
    rarestPlatinum: rarestTrophy,
  };
}
