import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/services/permission.service';

export interface NavChild {
  label: string;
  icon: string;
  path: string;
  permissionName?: string;
  children?: NavChild[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  permissionName?: string;
  children?: NavChild[];
}

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

  navItems: NavItem[] = [
    {
      id: 'demand',
      permissionName: 'DEMAND',
      label: 'Demand',
      icon: 'fa-solid fa-briefcase',
      children: [
        {
          label: "My SR's",
          icon: 'fa-solid fa-file-contract',
          path: '/demand/my-jds',
          permissionName: 'MYJRS',
        },
      ],
    },
    {
      id: 'supply',
      label: 'Supply',
      permissionName: 'SUPPLY',
      icon: 'fa-solid fa-layer-group',
      children: [
        {
          label: 'Hiring Dashboard',
          icon: 'fa-solid fa-chart-pie',
          path: '/supply/jobs/dashboard',
          permissionName: 'HIRINGDASHBOARD',
        },
        {
          label: 'Jobs Details',
          icon: 'fa-solid fa-file-lines',
          path: '/supply/jobs/job-details',
          permissionName: 'JOBDETAILS',
        },
        {
          label: 'Kanban',
          icon: 'fa-solid fa-table-columns',
          path: '/supply/kanban',
          permissionName: 'KANBAN',
        },
      ],
    },
    {
      id: 'System & Admins',
      permissionName: 'SYSTEM&ADMINS',
      label: 'System & Admins',
      icon: 'fa-solid fa-gear',
      children: [
        {
          label: 'Users',
          icon: 'fa-solid fa-users',
          path: '/users/user-onboard-roles',
          permissionName: 'USERS',
        },
        {
          label: 'Role & Permissions',
          icon: 'fa-solid fa-shield-halved',
          path: '/users/role-permissions',
          permissionName: 'ROLES&PERMISSIONS',
        },
      ],
    },
  ];
  
  ngOnInit() {
    // Ensure PermissionService is in sync with the current token before
    // building the sidebar map (guards against race with APP_INITIALIZER)
    this.permissionService.load();

    // BUG FIX: getPermissions() can return null when token is absent;
    // fall back to [] so buildPermissionMap() never crashes on null.forEach
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
      .filter(item => this.permissionMap.has(item.permissionName!))
      .map(item => ({
        ...item,
        children: item.children?.filter(child =>
          this.permissionMap
            .get(item.permissionName!)!
            .has(child.permissionName!)
        ),
      }))
      .filter(item => item.children && item.children.length > 0);
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