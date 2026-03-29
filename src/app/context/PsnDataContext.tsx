import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Trophy } from "../data/mockData";
import { mockTrophies, mockProfile } from "../data/mockData";
import { fetchJson, postJson } from "../services/api";

export interface Profile {
  username: string;
  psnLevel: number;
  totalPlatinums: number;
  avatar: string;
  rarestPlatinum: Trophy | null;
}

interface PsnDataState {
  trophies: Trophy[];
  profile: Profile;
  isAuthenticated: boolean;
  serviceAvailable: boolean;
  canSearch: boolean;
  isLoading: boolean;
  loadingProgress: { loaded: number; total: number };
  error: string | null;
  submitNpsso: (token: string) => Promise<void>;
  loadProfile: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const PsnDataContext = createContext<PsnDataState | null>(null);

export function usePsnData(): PsnDataState {
  const ctx = useContext(PsnDataContext);
  if (!ctx) throw new Error("usePsnData must be used within PsnDataProvider");
  return ctx;
}

// API response types
interface ProfileResponse {
  profile: {
    username: string;
    psnLevel: number;
    totalPlatinums: number;
    avatar: string;
    rarestPlatinum: null;
  };
  trophies: Array<Trophy & {
    npCommunicationId: string;
    npServiceName: "trophy" | "trophy2";
    rarityLoaded: boolean;
  }>;
  accountId: string;
}

interface RarityResponse {
  rarity: number;
  earnedDate: string | null;
  trophyIconUrl: string | null;
}

export function PsnDataProvider({ children }: { children: ReactNode }) {
  const [trophies, setTrophies] = useState<Trophy[]>(mockTrophies);
  const [profile, setProfile] = useState<Profile>({
    ...mockProfile,
    rarestPlatinum: mockProfile.rarestPlatinum,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const canSearch = isAuthenticated || serviceAvailable;
  const hasAutoLoaded = useRef(false);

  const checkAuth = useCallback(async () => {
    try {
      const [authData, serviceData] = await Promise.all([
        fetchJson<{ authenticated: boolean }>("/auth/status"),
        fetchJson<{ available: boolean }>("/auth/service-status"),
      ]);
      setIsAuthenticated(authData.authenticated);
      setServiceAvailable(serviceData.available);
    } catch {
      setIsAuthenticated(false);
      setServiceAvailable(false);
    }
  }, []);

  const submitNpsso = useCallback(async (token: string) => {
    setError(null);
    try {
      await postJson("/auth/npsso", { npsso: token });
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await postJson("/auth/logout", {});
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setTrophies(mockTrophies);
    setProfile({ ...mockProfile, rarestPlatinum: mockProfile.rarestPlatinum });
  }, []);

  const loadProfile = useCallback(async (username: string) => {
    // Cancel any previous loading
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setIsLoading(true);
    setError(null);
    setLoadingProgress({ loaded: 0, total: 0 });

    try {
      // 1. Fetch profile + basic trophy data
      const data = await fetchJson<ProfileResponse>(`/profile/${encodeURIComponent(username)}`);

      if (abort.signal.aborted) return;

      // Strip internal fields for display
      const baseTrophies: Trophy[] = data.trophies.map((t) => ({
        id: t.id,
        gameTitle: t.gameTitle,
        platform: t.platform,
        dateEarned: t.dateEarned,
        rarity: t.rarity,
        timeToPlatinum: t.timeToPlatinum,
        order: t.order,
        imageUrl: t.imageUrl,
      }));

      setTrophies(baseTrophies);
      setProfile({
        username: data.profile.username,
        psnLevel: data.profile.psnLevel,
        totalPlatinums: data.profile.totalPlatinums,
        avatar: data.profile.avatar,
        rarestPlatinum: baseTrophies[0] ?? null, // Will be set once rarity data loads
      });
      setLoadingProgress({ loaded: 0, total: data.trophies.length });

      // 2. Progressive rarity loading (batches of 3)
      const accountId = data.accountId;
      const enrichedTrophies = [...baseTrophies];
      let loaded = 0;

      const batchSize = 3;
      for (let i = 0; i < data.trophies.length; i += batchSize) {
        if (abort.signal.aborted) return;

        const batch = data.trophies.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((t) =>
            fetchJson<RarityResponse>(
              `/trophies/${accountId}/${t.npCommunicationId}/rarity?npServiceName=${t.npServiceName}`
            )
          )
        );

        for (let j = 0; j < results.length; j++) {
          const trophyIndex = i + j;
          const result = results[j];
          if (result.status === "fulfilled") {
            enrichedTrophies[trophyIndex] = {
              ...enrichedTrophies[trophyIndex],
              ...(result.value.rarity > 0 && { rarity: result.value.rarity }),
              ...(result.value.trophyIconUrl && { trophyImageUrl: result.value.trophyIconUrl }),
            };
          }
        }

        loaded += batch.length;
        if (abort.signal.aborted) return;

        setTrophies([...enrichedTrophies]);
        setLoadingProgress({ loaded, total: data.trophies.length });

        // Update rarestPlatinum
        const withRarity = enrichedTrophies.filter((t) => t.rarity > 0);
        if (withRarity.length > 0) {
          const rarest = withRarity.reduce((min, t) => (t.rarity < min.rarity ? t : min));
          setProfile((prev) => ({ ...prev, rarestPlatinum: rarest }));
        }

        // Small delay between batches to avoid PSN rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (err: any) {
      if (!abort.signal.aborted) {
        const msg = err.message || "Failed to fetch profile.";
        setError(msg);

        // If user session expired, mark as unauthenticated
        if (msg.includes("expired") || msg.includes("Not authenticated") || msg.includes("reconnect")) {
          setIsAuthenticated(false);
        }

        // Only fall back to mock data if it's an auth/session error
        // For service errors (503) or private profiles (403), keep current state
        if (msg.includes("expired") || msg.includes("Not authenticated") || msg.includes("reconnect")) {
          setTrophies(mockTrophies);
          setProfile({ ...mockProfile, rarestPlatinum: mockProfile.rarestPlatinum });
        }
      }
    } finally {
      if (!abort.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Auto-load default profile on startup when service is available
  useEffect(() => {
    if (canSearch && !hasAutoLoaded.current) {
      hasAutoLoaded.current = true;
      loadProfile("Chipo97_");
    }
  }, [canSearch, loadProfile]);

  return (
    <PsnDataContext.Provider
      value={{
        trophies,
        profile,
        isAuthenticated,
        serviceAvailable,
        canSearch,
        isLoading,
        loadingProgress,
        error,
        submitNpsso,
        loadProfile,
        logout,
        checkAuth,
      }}
    >
      {children}
    </PsnDataContext.Provider>
  );
}
