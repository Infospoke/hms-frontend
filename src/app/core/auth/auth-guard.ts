import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  if (tokenService.isLoggedIn() && !tokenService.isAccessTokenExpired()) {
    return true;
  }

  if (tokenService.getRefreshToken()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};