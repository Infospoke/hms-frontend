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
      id: 'users',
      label: 'Users',
      icon: 'fa-solid fa-users',

      children: [
        { label: 'Role & Permissions', icon: 'fa-solid fa-key', path: '/users/user-onboard-roles/role-permissions' },
        { label: 'Users', icon: 'fa-solid fa-user-shield', path: '/users/user-onboard-roles' },
      ],
    },
    {
      id: 'demand',
      label: 'Demand',
      icon: 'fa-solid fa-briefcase',
      children: [
        { label: 'My JDs', icon: 'fa-regular fa-file-lines', path: '/demand/my-jds' },
        { label: 'SRs', icon: 'fa-regular fa-clipboard', path: '/demand/create?step=0' },
      ],
    },
    {
      id: 'supply',
      label: 'Supply',
      icon: 'fa-solid fa-boxes-stacked',
      children: [
        { label: 'Dashboard', icon: 'fa-solid fa-suitcase', path: '/supply/jobs/dashboard' },
        { label: 'Jobs', icon: 'fa-solid fa-suitcase', path: '/supply/jobs/job-details' },
        { label: 'Kanban', icon: 'fa-solid fa-table-columns', path: '/supply/kanban' },


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
    return !!path && this.activePath === path;
  }
}