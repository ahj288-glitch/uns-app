import * as SecureStore from "expo-secure-store";

// ── Secure auth-token storage ──────────────────────────────────────────────────
// JWTs are secrets. AsyncStorage persists them as plaintext on disk, which is
// readable on a rooted/jailbroken device or extracted from an unencrypted device
// backup. expo-secure-store keeps them in the iOS Keychain / Android Keystore
// (hardware-backed where available), so a stolen device dump does not leak the
// user's session. All access/refresh token I/O in the app MUST go through here.

const ACCESS_TOKEN_KEY = "uns_access_token";
const REFRESH_TOKEN_KEY = "uns_refresh_token";

export const getAccessToken = (): Promise<string | null> =>
  SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): Promise<string | null> =>
  SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const setAccessToken = (token: string): Promise<void> =>
  SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);

export const setRefreshToken = (token: string): Promise<void> =>
  SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);

export const deleteAccessToken = (): Promise<void> =>
  SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);

export const deleteRefreshToken = (): Promise<void> =>
  SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

/** Remove both tokens — used on logout / account reset. */
export async function clearTokens(): Promise<void> {
  await Promise.all([deleteAccessToken(), deleteRefreshToken()]);
}
