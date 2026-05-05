import { Injectable, inject } from '@angular/core';
import { PermissionService } from './permission.service';
import { NAV_ITEMS, NavItem, NavChild } from '../../shared/constants/nav-config';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private ps = inject(PermissionService);

 
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
