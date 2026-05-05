import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

/**
 * permissionGuard — protects routes based on the flat JWT permission array.
 *
 * ── How to attach to a route ─────────────────────────────────────────────────
 *
 *   {
 *     path: 'kanban',
 *     canActivate: [permissionGuard],
 *     data: {
 *       permission: { module: 'SUPPLY', subModule: 'KANBAN', action: 'VIEW' }
 *     },
 *     loadComponent: () => import(...).then(...)
 *   }
 *
 * ── Fields ────────────────────────────────────────────────────────────────────
 *   module     (required) — top-level key, e.g. 'DEMAND', 'SYSTEM&ADMINS'
 *   subModule  (optional) — child key, e.g. 'MYJRS', 'ROLES&PERMISSIONS'
 *                           omit when the route maps to a module-level permission
 *   action     (optional) — defaults to 'VIEW' when not specified
 *
 * ── Behaviour ─────────────────────────────────────────────────────────────────
 *   • No `data.permission` on the route → always allow (opt-in guard)
 *   • Permission check passes → allow navigation
 *   • Permission check fails  → redirect to /users/user-onboard-roles
 *     (change FALLBACK_ROUTE below if you add a dedicated "not authorised" page)
 */

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
