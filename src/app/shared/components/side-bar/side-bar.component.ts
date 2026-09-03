import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { NAV_ITEMS, NavItem, NavChild } from '../../constants/nav-config';

// Re-export so any component that imported these from the sidebar still works
export type { NavItem, NavChild };

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  openMenu: string | null = null;
  openNested: string | null = null;
  activePath: string = '';

  private permissions: string[] = [];
  private permissionMap = new Map<string, Set<string>>();

  // Seeded from the shared nav config; filterNavItems() will trim it down
  navItems: NavItem[] = NAV_ITEMS.map(item => ({ ...item }));

  ngOnInit() {

    this.permissionService.load();
    this.permissions = this.authService.getPermissions() ?? [];
    this.buildPermissionMap();
    this.filterNavItems();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.activePath = e.urlAfterRedirects;
        this.syncOpenMenu();
      });

    this.activePath = this.router.url;
    this.syncOpenMenu();
  }

  private buildPermissionMap() {
    this.permissionMap.clear();
    this.permissions.forEach(p => {
      const [parent, child] = p.split('_');
      if (!this.permissionMap.has(parent)) {
        this.permissionMap.set(parent, new Set());
      }
      if (child) {
        this.permissionMap.get(parent)!.add(child);
      }
    });
  }

  private filterNavItems() {
    this.navItems = this.navItems
      // An item with no permissionName is always shown (used for flat/leaf
      // nav entries that aren't gated behind a backend permission yet).
      .filter(item => !item.permissionName || this.permissionMap.has(item.permissionName))
      .map(item => ({
        ...item,
        children: item.children?.filter(child =>
          !child.permissionName ||
          this.permissionMap.get(item.permissionName!)?.has(child.permissionName)
        ),
      }))
      // A leaf item (its own path, no children -- e.g. Client Management)
      // survives even with an empty/undefined children array.
      .filter(item => !!item.path || (item.children && item.children.length > 0));

  }

  private syncOpenMenu() {
    for (const item of this.navItems) {
      if (item.children && this.isChildActive(item.children)) {
        this.openMenu = item.id;
        for (const child of item.children) {
          if (child.children && this.isChildActive(child.children)) {
            this.openNested = child.label;
          }
        }
        return;
      }
    }
  }

  private isChildActive(children: NavChild[]): boolean {
    return children.some(c =>
      (c.path && this.activePath.startsWith(c.path)) ||
      (c.children && this.isChildActive(c.children))
    );
  }

  toggleMenu(item: NavItem) {
    if (item.path) {
      this.navigate(item.path);
      return;
    }
    this.openMenu = this.openMenu === item.id ? null : item.id;
    this.openNested = null;
  }

  toggleNested(child: NavChild) {
    if (!child.children?.length) {
      this.navigate(child.path!);
      return;
    }
    this.openNested = this.openNested === child.label ? null : child.label;
  }

  navigate(path: string) {
    if (!path) return;
    this.activePath = path;
    this.router.navigateByUrl(path);
  }

  isActive(path: string): boolean {
    if (path === '/demand/my-jds' && this.activePath === '/demand/create?step=0') return true;
    return !!path && this.activePath.startsWith(path);
  }
}
