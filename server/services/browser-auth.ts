// Browser-auth is no longer used — Sony's Akamai anti-bot protection
// blocks all automated login attempts (headless and non-headless).
// Authentication is now handled via manual NPSSO token submission.
//
// These exports are kept as no-ops so existing imports don't break.

export type LoginResult =
  | { npsso: string; requiresTwoFactor?: never; sessionId?: never }
  | { requiresTwoFactor: true; sessionId: string; npsso?: never };

export async function loginWithCredentials(
  _email: string,
  _password: string
): Promise<LoginResult> {
  throw new Error(
    "Direct login is not supported. Sony's anti-bot protection blocks automated browsers. Please use the NPSSO token method instead."
  );
}

export async function submitTwoFactorCode(
  _sessionId: string,
  _code: string
): Promise<string> {
  throw new Error("Direct login is not supported. Please use the NPSSO token method.");
}

export function cleanupSession(_sessionId: string): void {
  // no-op
}
