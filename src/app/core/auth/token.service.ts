import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private accessToken = signal<string | null>(null);
  isLoggedIn = computed(() => !!this.accessToken());

  constructor() {
    const storedAccessToken = sessionStorage.getItem('accessToken');
    if (storedAccessToken) {
      this.accessToken.set(storedAccessToken);
    }
  }

  setLocalStorage(key : string, value : string): void {
    localStorage.setItem(key, value);
  }

  setSessionStorage(key : string, value : string): void {
    sessionStorage.setItem(key, value);
  }

  setTokens(accessToken: string | null, refreshToken: string | null): void {
    this.accessToken.set(accessToken);
    this.setLocalStorage('refreshToken', refreshToken || '');
    this.setSessionStorage('accessToken', accessToken || '');
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUser(): any {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Decodes the JWT access-token and returns the raw permissions string array
   * stored in the payload (e.g. ["DEMAND_MYJRS_CREATE", ...]).
   * Returns [] when no token exists or the token is malformed.
   *
   * Lives here (not in AuthService) so that PermissionService can inject
   * TokenService without creating a circular dependency.
   */
  getPermissions(): string[] {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Array.isArray(payload?.permissions) ? payload.permissions : [];
    } catch {
      return [];
    }
  }

  clearTokens(): void {
    this.accessToken.set(null);
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
  }

   isAccessTokenExpired(): boolean {
    const token = this.accessToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

}

  