import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const ps = inject(PermissionService);
  const router = inject(Router);
  const path = route.data['permissionPath'] as string;

  if (!path || ps.canView(path)) return true;
  return router.createUrlTree(['/dashboard']);
};
