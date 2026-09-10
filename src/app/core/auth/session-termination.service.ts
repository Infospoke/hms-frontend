import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, firstValueFrom, timeout, catchError, of } from 'rxjs';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { PermissionService } from '../services/permission.service';

/**
 * Terminates the session whenever the user leaves the SPA through the browser
 * chrome instead of through in-app navigation:
 *   - browser back / forward buttons (popstate, or a bfcache restore)
 *   - a URL typed / pasted into the address bar, or opened from a bookmark
 *
 * "Terminate" means: call the logout API so the server-side session is really
 * closed (otherwise the next login fails with 1005 "session active on another
 * device"), then clear local tokens and permissions.
 */

const TERMINATE_ON_RELOAD = false;
const LOGOUT_TIMEOUT_MS = 3000;

@Injectable({ providedIn: 'root' })
export class SessionTerminationService {
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  private terminating = false;

  isTerminating(): boolean {
    return this.terminating;
  }

  private hasSession(): boolean {
    return !!this.tokenService.getAccessToken();
  }

  private isAuthUrl(url: string): boolean {
    return (url || '').split('?')[0].startsWith('/auth');
  }

  private navigationType(): string {
    const entry: any = performance.getEntriesByType('navigation')[0];
    return entry?.type || 'navigate';
  }

  /** Runs from APP_INITIALIZER, before the router boots. */
  async checkOnBootstrap(): Promise<void> {
    if (!this.hasSession() || this.isAuthUrl(location.pathname)) return;

    const type = this.navigationType();
    const isHardNavigation =
      type === 'navigate' ||
      type === 'back_forward' ||
      (TERMINATE_ON_RELOAD && type === 'reload');

    if (isHardNavigation) await this.clearSession();
  }

  /** Runs once from the root component, for in-app browser navigation. */
  watchBrowserNavigation(): void {
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((e) => {
        if (e.navigationTrigger !== 'popstate') return;
        if (!this.hasSession() || this.isAuthUrl(e.url)) return;
        this.terminate();
      });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = (e.urlAfterRedirects || '').split('?')[0];
        if (url.startsWith('/auth/login') && this.hasSession()) this.clearSession();
      });

    window.addEventListener('pageshow', (e: any) => {
      if (e?.persisted && this.hasSession() && !this.isAuthUrl(location.pathname)) {
        this.terminate();
      }
    });
  }

  async terminate(): Promise<void> {
    if (this.terminating) return;
    await this.clearSession();
    await this.router.navigate(['/auth/login'], {
      replaceUrl: true,
      queryParams: { reason: 'session_terminated' },
    });
  }

  private async clearSession(): Promise<void> {
    if (this.terminating) return;
    this.terminating = true;

    if (this.tokenService.getAccessToken()) {
      await firstValueFrom(
        this.authService.logoutRequest().pipe(
          timeout(LOGOUT_TIMEOUT_MS),
          catchError(() => of(null))
        )
      );
    }

    this.authService.stopTokenRefreshTimer();
    this.tokenService.clearTokens();
    this.permissionService.clear();
    this.terminating = false;
  }
}
