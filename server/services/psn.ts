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

// --- User auth state (optional, for private profiles) ---
let userAuthTokens: AuthTokensResponse | null = null;
let userAuthExpiresAt: number = 0;

// --- Service account auth state (for public mode) ---
let serviceAuthTokens: AuthTokensResponse | null = null;
let serviceAuthExpiresAt: number = 0;

// ==================== Service Account Auth ====================

export async function initServiceAuth(): Promise<void> {
  const npsso = process.env.SERVICE_NPSSO;
  if (!npsso) {
    console.warn("[psn] SERVICE_NPSSO not set — public mode unavailable. Users must provide their own NPSSO token.");
    return;
  }

  const { exchangeNpssoForAccessCode, exchangeAccessCodeForAuthTokens } = await getPsnApi();
  try {
    const accessCode = await exchangeNpssoForAccessCode(npsso);
    serviceAuthTokens = await exchangeAccessCodeForAuthTokens(accessCode);
    serviceAuthExpiresAt = Date.now() + serviceAuthTokens.expiresIn * 1000;
    console.log("[psn] Service account authenticated successfully");
  } catch (err: any) {
    console.warn("[psn] Service account auth failed:", err.message);
    console.warn("[psn] Public mode unavailable — users must provide their own NPSSO token.");
  }
}

export function isServiceAuthenticated(): boolean {
  return serviceAuthTokens !== null;
}

async function getServiceAuth(): Promise<AuthorizationPayload> {
  if (!serviceAuthTokens) {
    throw new Error("Service account not configured. Public mode unavailable.");
  }

  if (Date.now() >= serviceAuthExpiresAt - 30000) {
    try {
      const { exchangeRefreshTokenForAuthTokens } = await getPsnApi();
      serviceAuthTokens = await exchangeRefreshTokenForAuthTokens(serviceAuthTokens.refreshToken);
      serviceAuthExpiresAt = Date.now() + serviceAuthTokens.expiresIn * 1000;
      console.log("[psn] Service account token refreshed");
    } catch {
      serviceAuthTokens = null;
      serviceAuthExpiresAt = 0;
      console.error("[psn] Service account token refresh failed — public mode unavailable");
      throw new Error("Service account session expired. Public mode unavailable.");
    }
  }

  return { accessToken: serviceAuthTokens.accessToken };
}

// ==================== User Auth ====================

export function isUserAuthenticated(): boolean {
  return userAuthTokens !== null;
}

export async function authenticateUser(npsso: string): Promise<void> {
  const { exchangeNpssoForAccessCode, exchangeAccessCodeForAuthTokens } = await getPsnApi();
  let accessCode: string;
  try {
    accessCode = await exchangeNpssoForAccessCode(npsso);
  } catch (err: any) {
    const msg = err.message || "";
    console.error("[psn] exchangeNpssoForAccessCode failed:", msg);
    if (msg === "fetch failed" || msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT")) {
      throw new Error("Cannot reach PSN servers. Check your internet connection and try again.");
    }
    if (msg.includes("Invalid NPSSO") || msg.includes("401") || msg.includes("grant_code") || msg.includes("access code") || msg.includes("NPSSO")) {
      throw new Error("NPSSO token is invalid or expired. Please get a fresh token from ca.account.sony.com/api/v1/ssocookie");
    }
    throw new Error(`Authentication failed: ${msg}`);
  }
  try {
    userAuthTokens = await exchangeAccessCodeForAuthTokens(accessCode);
    userAuthExpiresAt = Date.now() + userAuthTokens.expiresIn * 1000;
  } catch (err: any) {
    console.error("[psn] exchangeAccessCodeForAuthTokens failed:", err.message);
    throw new Error("Failed to exchange access code for tokens. The NPSSO token may have expired.");
  }
}

async function getUserAuth(): Promise<AuthorizationPayload> {
  if (!userAuthTokens) {
    throw new Error("Not authenticated. Submit an NPSSO token first.");
  }

  if (Date.now() >= userAuthExpiresAt - 30000) {
    try {
      const { exchangeRefreshTokenForAuthTokens } = await getPsnApi();
      userAuthTokens = await exchangeRefreshTokenForAuthTokens(userAuthTokens.refreshToken);
      userAuthExpiresAt = Date.now() + userAuthTokens.expiresIn * 1000;
    } catch {
      userAuthTokens = null;
      userAuthExpiresAt = 0;
      throw new Error("Session expired. Please submit a new NPSSO token.");
    }
  }

  return { accessToken: userAuthTokens.accessToken };
}

export function clearUserAuth(): void {
  userAuthTokens = null;
  userAuthExpiresAt = 0;
}

// ==================== Unified Auth Resolver ====================

/** Returns the best available auth: user auth (preferred) > service auth. */
async function getAuth(): Promise<AuthorizationPayload> {
  if (isUserAuthenticated()) return getUserAuth();
  if (isServiceAuthenticated()) return getServiceAuth();
  throw new Error("No authentication available. Please connect your PSN account or configure a service account.");
}

// ==================== PSN Data Functions ====================

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
