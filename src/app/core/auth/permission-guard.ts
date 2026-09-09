import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';


const FALLBACK_ROUTE = '/users/user-onboard-roles';

export interface RoutePermission {
  module: string;
  subModule?: string;
  action?: string;
}

export const permissionGuard: CanActivateFn = (route) => {
  const ps     = inject(PermissionService);
  const router = inject(Router);

  const permission = route.data['permission'] as RoutePermission | undefined;

  // Guard is opt-in: routes without data.permission are always allowed
  if (!permission) return true;

  const { module, subModule, action = 'VIEW' } = permission;

  const allowed = subModule
    ? ps.can(module, subModule, action)
    : ps.canModule(module, action);

  return allowed ? true : router.createUrlTree([FALLBACK_ROUTE]);
};
