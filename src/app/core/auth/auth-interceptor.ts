import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { API } from '../../shared/constants/api-endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Pass through auth routes with only the X-Channel header
  if (
    req.url.includes(API.AUTH.LOGIN) ||
    req.url.includes(API.AUTH.REFRESH) ||
    req.url.includes(API.AUTH.FORGOT_PASSWORD)
  ) {
    return next(req.clone({ setHeaders: { 'X-Channel': 'web' } }));
  }

  // Attach Bearer token to every other request
  const token = tokenService.getAccessToken();
  const authReq = req.clone({
    setHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
      'X-Channel': 'web',
    },
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        tokenService.clearTokens();
        router.navigate(['/auth/login'], {
          queryParams: { reason: 'session_expired' },
        });
      }
      return throwError(() => err);
    })
  );
};