import type {
  AuthorizationPayload,
  AuthTokensResponse,
  TrophyTitle,
  UserThinTrophy,
} from "psn-api";

// psn-api is a CJS package; use dynamic import for ESM compatibility
let psnApi: typeof import("psn-api");
async function getPsnApi() {
  if (!psnApi) {
    psnApi = await import("psn-api");
  }
  return psnApi;
}

let authTokens: AuthTokensResponse | null = null;
let authExpiresAt: number = 0;

export function isAuthenticated(): boolean {
  return authTokens !== null;
}

export async function authenticate(npsso: string): Promise<void> {
  const { exchangeNpssoForAccessCode, exchangeAccessCodeForAuthTokens } = await getPsnApi();
  const accessCode = await exchangeNpssoForAccessCode(npsso);
  authTokens = await exchangeAccessCodeForAuthTokens(accessCode);
  authExpiresAt = Date.now() + authTokens.expiresIn * 1000;
}

export async function getAuth(): Promise<AuthorizationPayload> {
  if (!authTokens) {
    throw new Error("Not authenticated. Submit an NPSSO token first.");
  }

  // Refresh if expired or about to expire (30s buffer)
  if (Date.now() >= authExpiresAt - 30000) {
    try {
      const { exchangeRefreshTokenForAuthTokens } = await getPsnApi();
      authTokens = await exchangeRefreshTokenForAuthTokens(authTokens.refreshToken);
      authExpiresAt = Date.now() + authTokens.expiresIn * 1000;
    } catch {
      authTokens = null;
      authExpiresAt = 0;
      throw new Error("Session expired. Please submit a new NPSSO token.");
    }
  }

  return { accessToken: authTokens.accessToken };
}

export function clearAuth(): void {
  authTokens = null;
  authExpiresAt = 0;
}

export async function searchUser(username: string): Promise<string> {
  const { getProfileFromUserName, makeUniversalSearch } = await getPsnApi();
  const auth = await getAuth();

  // 1. Try exact lookup via legacy API (handles underscores and special chars)
  try {
    const legacyProfile = await getProfileFromUserName(auth, username);
    if (legacyProfile.profile?.accountId) {
      return legacyProfile.profile.accountId;
    }
  } catch {
    // Legacy API failed, fall through to search
  }

  // 2. Fallback: universal search
  const response = await makeUniversalSearch(auth, username, "SocialAllAccounts");
  const results = response.domainResponses?.[0]?.results;
  if (!results?.length) {
    throw new Error(`User "${username}" not found.`);
  }

  // Find exact match (case-insensitive)
  const exact = results.find(
    (r) => r.socialMetadata.onlineId.toLowerCase() === username.toLowerCase()
  );

  if (!exact) {
    const suggestions = results.slice(0, 5).map((r) => r.socialMetadata.onlineId);
    throw new Error(
      `Exact match for "${username}" not found. Did you mean: ${suggestions.join(", ")}?`
    );
  }

  return exact.socialMetadata.accountId;
}

export async function fetchProfile(accountId: string) {
  const { getProfileFromAccountId, getUserTrophyProfileSummary } = await getPsnApi();
  const auth = await getAuth();
  const [profile, trophySummary] = await Promise.all([
    getProfileFromAccountId(auth, accountId),
    getUserTrophyProfileSummary(auth, accountId),
  ]);

  return {
    onlineId: profile.onlineId,
    avatarUrl: profile.avatars?.[0]?.url ?? "",
    trophyLevel: Number(trophySummary.trophyLevel),
    // Note: earnedTrophies.platinum from the profile summary IS the total count
    // despite the type saying 0|1 (that type is for per-title, not the summary)
    totalPlatinums: trophySummary.earnedTrophies.platinum as number,
    earnedTrophies: trophySummary.earnedTrophies,
  };
}

/** Fetch all titles that have at least 1 platinum defined (i.e. games with platinum trophies). */
export async function fetchPlatinumTitles(accountId: string): Promise<TrophyTitle[]> {
  const { getUserTitles } = await getPsnApi();
  const auth = await getAuth();
  const allTitles: TrophyTitle[] = [];
  let offset = 0;
  const limit = 800;

  while (true) {
    const response = await getUserTitles(auth, accountId, { limit, offset });
    if (response.trophyTitles?.length) {
      allTitles.push(...response.trophyTitles);
    }

    if (!response.nextOffset || !response.trophyTitles?.length) break;
    offset = response.nextOffset;
  }

  // Filter to titles that have a platinum trophy and where the user earned it
  return allTitles.filter(
    (t) => t.definedTrophies.platinum > 0 && t.earnedTrophies.platinum > 0
  );
}

/** Fetch the platinum trophy's earned rate for a specific title. */
export async function fetchPlatinumRarity(
  accountId: string,
  npCommunicationId: string,
  npServiceName: "trophy" | "trophy2"
): Promise<{ rarity: number; earnedDate: string | null }> {
  const { getUserTrophiesEarnedForTitle } = await getPsnApi();
  const auth = await getAuth();
  const response = await getUserTrophiesEarnedForTitle(
    auth,
    accountId,
    npCommunicationId,
    "all",
    { npServiceName }
  );

  // Find the platinum trophy (trophyType === "platinum")
  const platinum = response.trophies.find(
    (t: UserThinTrophy) => t.trophyType === "platinum" && t.earned
  );

  if (!platinum) {
    return { rarity: 0, earnedDate: null };
  }

  return {
    rarity: platinum.trophyEarnedRate ? parseFloat(platinum.trophyEarnedRate) : 0,
    earnedDate: platinum.earnedDateTime ?? null,
  };
}
