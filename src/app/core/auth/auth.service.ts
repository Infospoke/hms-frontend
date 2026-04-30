import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, timer, Subscription, switchMap, catchError, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { PermissionService } from '../services/permission.service';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';
import { API } from '../../shared/constants/api-endpoints';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private permissionService = inject(PermissionService);
  private notification = inject(NotificationService);
  private refreshTimerSub: Subscription | null = null;

  login(credentials: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}${API.AUTH.LOGIN}`, credentials).pipe(
      tap((res: any) => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this.tokenService.setUser(res.user);
        this.permissionService.setModules(res.modules);
        this.startTokenRefreshTimer();
      }),
      catchError((err: any) => {
        const code = err.error?.responseCode;
        const msg = err.error?.responseMessage || err.error?.message;

        switch (code) {
          case '1001': this.notification.error(msg || 'Account locked'); break;
          case '1002': this.notification.error(msg || 'Account not activated'); break;
          case '1003': this.notification.error(msg || 'Password expired'); break;
          case '1004': this.notification.error(msg || 'Too many attempts'); break;
          case '1005': this.notification.error(msg || 'Session active on another device'); break;
          case '1006': this.notification.error(msg || 'User not found'); break;
          case '1007': this.notification.error(msg || 'Invalid credentials'); break;
          default: this.notification.error(msg || 'Login failed');
        }
        return throwError(() => err);
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post(`${environment.apiUrl}${API.AUTH.REFRESH}`, { refreshToken }).pipe(
      catchError((err: any) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout() {

    this.api.hrmspost(`${API.AUTH.LOGOUT}`, null).pipe(
      catchError((err) => {
        this.notification.error('Logout failed, redirecting...');
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    ).subscribe((res: any) => {
      if (res?.responsecode === '00' || res?.responseCode === '00') {
        this.refreshTimerSub?.unsubscribe();
        this.tokenService.clearTokens();
        this.permissionService.clear();
        this.notification.success(res?.message || 'Logged out successfully');
        this.router.navigate(['/auth/login']);
      } else {
        this.notification.error(res?.message || 'Logout failed');
      }
    });
  }

  startTokenRefreshTimer() {
    this.refreshTimerSub?.unsubscribe();
    const interval = environment.tokenRefreshInterval;
    this.refreshTimerSub = timer(interval, interval).pipe(
      switchMap(() => this.refreshToken())
    ).subscribe({
      next: (res: any) => this.tokenService.setTokens(res.accessToken, res.refreshToken),
      error: () => this.logout()
    });
  }

  tryRestoreSession(): Observable<any> | null {
    const rt = this.tokenService.getRefreshToken();
    if (!rt) return null;
    return this.refreshToken().pipe(
      tap((res: any) => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this.tokenService.setUser(res.user);
        this.permissionService.setModules(res.modules);
        this.startTokenRefreshTimer();
      }),
      catchError((err: any) => {
        this.tokenService.clearTokens();
        this.permissionService.clear();
        return throwError(() => err);
      })
    );
  }

  getRole() {
    const t = this.tokenService.getAccessToken();
    if (!t) return null;
    console.log(JSON.parse(atob(t.split('.')[1])))
    return JSON.parse(atob(t.split('.')[1])).role;
  }
  getPermissions() {
    const t = this.tokenService.getAccessToken();
    if (!t) return null;
    return JSON.parse(atob(t.split('.')[1]))?.modules;
  }
  getUserName() {
    const t = this.tokenService.getAccessToken();
    if (!t) return null;
    return JSON.parse(atob(t.split('.')[1]))?.sub;
  }

  getIsFirstTimeUser() {
    const t = this.tokenService.getAccessToken();
    if (!t) return null;
    return JSON.parse(atob(t.split('.')[1]))?.firstTimeLogin;
  }
  isLoggedIn() {
    return !!this.tokenService.getAccessToken();
  }

  forgotPassword(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);

    return this.api.hrmspost(`${API.AUTH.FORGOT_PASSWORD}`, null, { params })
      .pipe(
        tap((res: any) => {
          if (res?.responsecode === '00') {
            this.notification.success(res?.message || 'New credentials sent to your registered email');
          }
        }),
        catchError((err: any) => {
          const errors = err.error?.errors;
          const msg = err.error?.message;
          const errorMap: Record<string, string> = {
            '2001': 'Email not registered',
            '2002': 'Account is not active',
            '2003': 'Too many requests, please try again later'
          };
          const displayMsg =
            (Array.isArray(errors) && errors.length > 0)
              ? errors.join(' • ')
              : msg && msg !== 'Failure'
                ? msg
                : errorMap[err.error?.responsecode] ?? 'Forgot password request failed';
          this.notification.error(displayMsg);
          return throwError(() => err);
        })
      );
  }
  changePassword(payload: { oldPassword: string; newPassword: string }): Observable<any> {
    return this.api.hrmspost(`${API.AUTH.CHANGE_PASSWORD}`, payload).pipe(
      tap((res: any) => {
        if (res?.responsecode == '00') {
          this.notification.success(res?.responsemessage);
          // this.logout();
          this.router.navigate(['/auth/login']);
        }
        else {
          this.notification.error(res?.responsemessage || res?.message);
        }
      }),
      catchError((err: any) => {
        const msg = err.error?.responseMessage || err.error?.message;
        this.notification.error(msg || 'Failed to change password');
        return throwError(() => err);
      })
    );
  }
}
