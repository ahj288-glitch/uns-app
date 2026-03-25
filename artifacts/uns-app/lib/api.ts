const domain = process.env["EXPO_PUBLIC_DOMAIN"] ?? process.env.EXPO_PUBLIC_DOMAIN;

export const API_BASE: string = domain
  ? `https://${domain}/api`
  : "/api";
