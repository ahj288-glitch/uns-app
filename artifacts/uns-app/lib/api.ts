// EXPO_PUBLIC_API_URL takes precedence (full URL for local dev, e.g. http://localhost:3000).
// EXPO_PUBLIC_DOMAIN is the Replit/production path (hostname-only → https assumed).
const _apiUrl = process.env["EXPO_PUBLIC_API_URL"];
const _domain = process.env["EXPO_PUBLIC_DOMAIN"];

export const API_BASE: string = _apiUrl
  ? `${_apiUrl}/api`
  : _domain
    ? `https://${_domain}/api`
    : "/api";
