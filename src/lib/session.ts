import { User } from '@/types';

const TOKEN_KEY = 'cc_token';
const USER_KEY = 'cc_user';

export function saveSession(token: string, user: User): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSession(): { token: string; user: User } | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const userRaw = sessionStorage.getItem(USER_KEY);
  if (!token || !userRaw) return null;
  try {
    const user = JSON.parse(userRaw) as User;
    return { token, user };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
