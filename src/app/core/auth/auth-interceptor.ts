import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { API } from '../../shared/constants/api-endpoints';
let isRefreshing = false;
const refreshSubject$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes(API.AUTH.LOGIN) || req.url.includes(API.AUTH.REFRESH)) {
    return next(req.clone({
      setHeaders: {
        'X-Channel': 'web'
      }
    }));
  }

  const token = tokenService.getAccessToken();
  const authReq = req.clone({
    setHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
      'X-Channel': 'web'
    }
  });
  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);

      if (!isRefreshing) {
        isRefreshing = true;
        refreshSubject$.next(null);

        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            isRefreshing = false;
            tokenService.setTokens(res.accessToken, res.refreshToken);
            refreshSubject$.next(res.accessToken);
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } }));
          }),
          catchError(refreshErr => {
            isRefreshing = false;
            tokenService.clearTokens();
            router.navigate(['/auth/login']);
            return throwError(() => refreshErr);
          })
        );
      }

      return refreshSubject$.pipe(
        filter(t => t !== null),
        take(1),
        switchMap(t => next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } })))
      );
    })
  );
};
