const PRIMARY_AUTH_TOKEN_KEY = "accessToken";
const AUTH_TOKEN_KEYS = [
  PRIMARY_AUTH_TOKEN_KEY,
  "token",
  "authToken",
] as const;

const canUseLocalStorage = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const normalizeToken = (token: string | null): string | null => {
  if (!token) {
    return null;
  }

  const trimmedToken = token.trim();
  return trimmedToken.length > 0 ? trimmedToken : null;
};

export const getStoredAuthToken = (): string | null => {
  if (!canUseLocalStorage()) {
    return null;
  }

  for (const key of AUTH_TOKEN_KEYS) {
    const token = normalizeToken(window.localStorage.getItem(key));
    if (token) {
      return token;
    }
  }

  return null;
};

export const setStoredAuthToken = (token: string): void => {
  if (!canUseLocalStorage()) {
    return;
  }

  const normalizedToken = normalizeToken(token);
  if (!normalizedToken) {
    return;
  }

  window.localStorage.setItem(PRIMARY_AUTH_TOKEN_KEY, normalizedToken);
};

export const clearStoredAuthToken = (): void => {
  if (!canUseLocalStorage()) {
    return;
  }

  AUTH_TOKEN_KEYS.forEach((key) => window.localStorage.removeItem(key));
};
