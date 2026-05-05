import { Injectable, inject } from '@angular/core';
import { PermissionService } from './permission.service';
import { NAV_ITEMS, NavItem, NavChild } from '../../shared/constants/nav-config';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private ps = inject(PermissionService);

  /**
   * Walks the NAV_ITEMS list (same list the sidebar uses) and returns the
   * first route path the current user actually has access to.
   *
   * Logic (matches what user sees in the sidebar):
   *   1. Skip parents the user has no module-level permission for
   *   2. For an accessible parent with children → find first accessible child
   *        - If that child itself has children → return first grandchild's path
   *        - Otherwise → return the child's path
   *   3. For an accessible parent with no children → return the parent's path
   *   4. If nothing matches → fall back to /auth/login
   */
  getFirstRoute(): string {
    for (const parent of NAV_ITEMS) {
      if (!this.isParentAccessible(parent)) continue;

      if (parent.children?.length) {
        for (const child of parent.children) {
          if (!this.isChildAccessible(parent, child)) continue;

          // Child has grandchildren → go one level deeper
          if (child.children?.length) {
            const grand = child.children.find(g => g.path);
            if (grand?.path) return grand.path;
          }

          if (child.path) return child.path;
        }
      }

      // Parent is a direct route (no children)
      if (parent.path) return parent.path;
    }

    return '/auth/login';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private isParentAccessible(parent: NavItem): boolean {
    // If no permissionName is set, treat the item as always visible
    if (!parent.permissionName) return true;
    return this.ps.hasModule(parent.permissionName);
  }

  private isChildAccessible(parent: NavItem, child: NavChild): boolean {
    if (!child.permissionName || !parent.permissionName) return true;
    return this.ps.hasSubModule(parent.permissionName, child.permissionName);
  }
}
