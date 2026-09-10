import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token.service';
import { SessionTerminationService } from './session-termination.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const sessionTermination = inject(SessionTerminationService);
  const router = inject(Router);

  if (sessionTermination.isTerminating()) return router.createUrlTree(['/auth/login']);

  if (tokenService.isLoggedIn() && !tokenService.isAccessTokenExpired()) return true;

  return router.createUrlTree(['/auth/login']);
};
