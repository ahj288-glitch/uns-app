const TOKEN_KEY = "uns_admin_token";

type LogoutCallback = () => void;

let _onUnauthorized: LogoutCallback | null = null;

export function registerUnauthorizedHandler(cb: LogoutCallback): void {
  _onUnauthorized = cb;
}

export function clearUnauthorizedHandler(): void {
  _onUnauthorized = null;
}

export function triggerUnauthorized(): void {
  if (_onUnauthorized) {
    _onUnauthorized();
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export { TOKEN_KEY };
