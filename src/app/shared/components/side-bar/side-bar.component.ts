import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

export interface NavChild {
  label: string;
  icon: string;
  path: string;
  children?: NavChild[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path?: string;          // if set → direct navigate, no accordion
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

  openMenu: string | null = null;     // only ONE top-level open at a time
  openNested: string | null = null;   // only ONE nested group open at a time
  activePath: string = '';

  navItems: NavItem[] = [

    {
      id: 'demand',
      label: 'Demand',
      icon: 'fa-solid fa-briefcase',
      children: [
        { label: "My SR's", icon: 'fa-solid fa-file-contract', path: '/demand/my-jds' },
      ],
    },
    {
      id: 'supply',
      label: 'Supply',
      icon: 'fa-solid fa-layer-group',
      children: [
        { label: 'Hiring Dashboard', icon: 'fa-solid fa-chart-pie', path: '/supply/jobs/dashboard' },
        { label: 'Jobs Details',     icon: 'fa-solid fa-file-lines',    path: '/supply/jobs/job-details' },
        { label: 'Kanban',           icon: 'fa-solid fa-table-columns', path: '/supply/kanban' },
      ],
    },
    {
      id: 'Setting & Admin',
      label: 'Setting & Admin',
      icon: 'fa-solid fa-gear',
      children: [
        { label: 'Users',             icon: 'fa-solid fa-users',    path: '/users/user-onboard-roles' },
        { label: 'Role & Permissions', icon: 'fa-solid fa-shield-halved', path: '/users/role-permissions' },
      ],
    },

  ];

  ngOnInit() {
    // Sync active path with router on every navigation
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.activePath = e.urlAfterRedirects;
        this.syncOpenMenu();
      });

    this.activePath = this.router.url;
    this.syncOpenMenu();
  }

  /** Auto-expand the section that owns the current URL */
  private syncOpenMenu() {
    for (const item of this.navItems) {
      if (item.children && this.isChildActive(item.children)) {
        this.openMenu = item.id;
        // check nested
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
    if(path==='/demand/my-jds' && this.activePath==='/demand/create?step=0')return true;
    return !!path && this.activePath.startsWith(path);
  }
}