# Public Mode Authentication — Design Spec

## Context

PlatForge currently requires users to manually obtain an NPSSO token from Sony's website before they can use the app. This multi-step process (login to PlayStation Store → visit SSO cookie URL → copy token → paste in PlatForge) creates significant friction and is the #1 barrier to adoption.

Sites like Platinum Mosaic solve this by using a **service account pattern**: the server authenticates with its own PSN account and uses that session to fetch any user's public trophy data. The end user just types their PSN ID.

Sony does not offer public OAuth for third-party apps, so a "Login with PSN" button is not possible. The service account pattern is the industry-standard workaround.

## Goal

Let users search for any PSN ID and see their trophy gallery **without any authentication step**. Optionally, users can still connect their own NPSSO token for accessing private profiles.

## Architecture

### Two Auth Layers

| Layer | Purpose | Token Source | Required |
|-------|---------|-------------|----------|
| **Service account** | Default — fetches public trophy data for any user | `SERVICE_NPSSO` env var | Yes (for public mode) |
| **User NPSSO** | Optional — accesses private profiles | User-provided via UI | No |

### Backend Changes

#### 1. Dual Auth State (`server/services/psn.ts`)

Two independent auth states, each with their own tokens and expiry:

```
// Existing (renamed for clarity)
let userAuthTokens: AuthTokensResponse | null = null;
let userAuthExpiresAt: number = 0;

// New
let serviceAuthTokens: AuthTokensResponse | null = null;
let serviceAuthExpiresAt: number = 0;
```

**New functions:**
- `initServiceAuth()` — reads `SERVICE_NPSSO` from `process.env`, exchanges for tokens. Non-blocking: called with `await` on startup but wrapped in try/catch — if it fails, server still starts and logs a warning.
- `getServiceAuth()` — returns service auth payload with auto-refresh (same 30s buffer logic as existing `getAuth()`). Throws if service account is not configured.
- `isServiceAuthenticated()` — returns `boolean`

**Renamed existing functions:**
- `authenticate(npsso)` → `authenticateUser(npsso)` (user-provided NPSSO)
- `getAuth()` → `getUserAuth()` (user auth payload)
- `isAuthenticated()` → `isUserAuthenticated()` (user auth check)
- `clearAuth()` → `clearUserAuth()` (logout)

**Key design: Auth selection inside `getAuth()` (new unified function):**

The existing service functions (`searchUser`, `fetchProfile`, `fetchPlatinumTitles`, `fetchPlatinumRarity`) all call `getAuth()` internally. Rather than refactoring all of them to accept an auth parameter, we replace `getAuth()` with a **unified resolver**:

```typescript
function getAuth(): AuthorizationPayload {
  // Prefer user auth if available (allows private profile access)
  if (isUserAuthenticated()) return getUserAuth();
  // Fall back to service auth
  if (isServiceAuthenticated()) return getServiceAuth();
  throw new Error('No authentication available');
}
```

This means **no changes needed** in `searchUser`, `fetchProfile`, `fetchPlatinumTitles`, or `fetchPlatinumRarity` — they continue calling `getAuth()` and get the right auth automatically. Route handlers (`profile.ts`, `trophies.ts`) also need no auth selection logic.

#### 2. Server Startup (`server/index.ts`)

```typescript
// Non-blocking init — server starts even if service auth fails
initServiceAuth().catch(err => {
  console.warn('Service account auth failed:', err.message);
  console.warn('Public mode unavailable — users must provide NPSSO');
});
```

#### 3. New Endpoint: Service Status

- `GET /api/auth/service-status` → `{ available: boolean }` — tells frontend whether public mode works

#### 4. Environment Configuration

- New env var: `SERVICE_NPSSO` — the NPSSO token of the service PSN account
- Create `.env.example` with `SERVICE_NPSSO` documentation and usage instructions
- The NPSSO token is used once to bootstrap access/refresh tokens. The refresh token chain keeps auth alive for days/weeks. If the chain breaks (server down for extended period, Sony invalidation), a new `SERVICE_NPSSO` is needed.
- Consider logging a warning when service auth refresh fails, so the operator knows to renew

### Frontend Changes

#### 1. Search Always Enabled (`TopBar.tsx`)

- PSN ID search input is **always enabled**, regardless of auth state
- Remove the auth gate that currently disables search when not authenticated
- "Load Profile" button works immediately — no auth required

#### 2. Auth UI Restructure

- **Remove** the prominent "Connect PSN" button from TopBar
- **Add** a subtle settings/gear icon or link in TopBar that opens auth settings
- The `AuthSettingsModal` keeps its current NPSSO flow but is presented as **optional/advanced**:
  - New intro text: "PlatForge works without login. Connect your PSN account only if you need to view private profiles."
  - Keep the existing 3-step NPSSO guide
  - Keep the connected/disconnect state

#### 3. Status Indicators

- If service account is active: no indicator needed (seamless experience)
- If service account is down/expired: show a subtle warning banner
- If a searched profile is private and no user NPSSO: show message "This profile is private. Connect your PSN account in settings to view it."

#### 4. PsnDataContext Updates (`src/app/context/PsnDataContext.tsx`)

- `checkAuth()` on mount also checks `/api/auth/service-status`
- New state: `serviceAvailable: boolean`
- `loadProfile()` works without user auth — relies on service auth on backend
- Keep `submitNpsso()` and `logout()` for optional user auth
- The auth gate for search is in `TopBar.tsx` (`disabled={isLoading || !isAuthenticated}`), not in `loadProfile()` itself — that TopBar gate is what needs to change
- On error, instead of silently falling back to mock data, show appropriate error messages:
  - 503 (service unavailable) → "Service temporarily unavailable"
  - 403 (private profile) → "This profile is private. Connect your PSN account to view it."
  - Other errors → current behavior (show error message)

### Error Handling

| Scenario | Backend | Frontend |
|----------|---------|----------|
| `SERVICE_NPSSO` not set | Server starts, logs warning, public endpoints return 503 | "Service not configured" message |
| Service token expired | Auto-refresh attempt; if fails, returns 503 | "Service temporarily unavailable. Try again later." |
| Target profile is private | Returns 403 with `{ error: "private_profile" }` | "This profile is private. Connect your PSN account to view it." |
| User NPSSO invalid | Returns 401 (same as today) | Error in auth modal (same as today) |
| Rate limited by PSN | Returns 429 | "Too many requests. Please wait a moment." |

### Security Considerations

- `SERVICE_NPSSO` must never be exposed to the frontend
- Service account tokens stay server-side only
- The service account can only access public data — Sony's API enforces privacy settings server-side
- Rate limiting: existing 200ms batch delay + PSN's own 300 req/15min limit apply
- Consider adding server-side rate limiting per client IP to prevent abuse

## Data Flow

### Public Mode (default)
```
User types PSN ID → Frontend calls GET /api/profile/:username
  → Backend uses serviceAuth to call PSN API
  → Returns profile + trophies (public data only)
  → Frontend renders gallery
```

### Authenticated Mode (optional)
```
User connects NPSSO in settings → POST /api/auth/npsso (same as today)
User types PSN ID → Frontend calls GET /api/profile/:username
  → Backend detects user auth is active, uses userAuth
  → Returns profile + trophies (including private data if accessible)
  → Frontend renders gallery
```

## Files to Modify

| File | Changes |
|------|---------|
| `server/services/psn.ts` | Add service account auth state, `initServiceAuth()`, `getServiceAuth()`, modify auth selection |
| `server/index.ts` | Call `initServiceAuth()` on startup |
| `server/routes/auth.ts` | Add `/api/auth/service-status` endpoint |
| `server/routes/profile.ts` | Add private profile error detection (403) |
| `server/routes/trophies.ts` | No auth changes needed (uses `getAuth()` internally) |
| `src/app/context/PsnDataContext.tsx` | Add `serviceAvailable` state, improve error handling for 503/403 |
| `src/app/components/TopBar.tsx` | Always enable search, move auth button to secondary position |
| `src/app/components/AuthSettingsModal.tsx` | Reframe as optional/advanced, update copy |
| `.env.example` | Add `SERVICE_NPSSO` documentation |

## Verification Plan

1. **Without `SERVICE_NPSSO`**: Server starts with warning log, frontend shows "service not configured" when searching
2. **With invalid `SERVICE_NPSSO`**: Server starts, logs auth failure warning, behaves same as no token
3. **With valid `SERVICE_NPSSO`**: Server authenticates on startup (check logs), search works immediately without user auth
4. **Public profile search**: Type a known public PSN ID → trophies load without any user auth
5. **Private profile without user NPSSO**: Search a private profile → clear 403 error message suggesting NPSSO connection
6. **NPSSO connection**: Connect personal NPSSO via settings → search private profile → trophies load
7. **Auth priority**: With both service and user auth active, verify user auth is preferred (check via private profile access)
8. **Disconnect NPSSO**: Logout user auth → search still works via service account for public profiles
9. **Server restart**: Restart server with `SERVICE_NPSSO` set → service auth re-initializes, search works immediately
10. **Token refresh**: Verify service auth auto-refreshes (check server logs near token expiry)
