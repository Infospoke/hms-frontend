import { Component, input, output, signal, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent {
collapsed = input(false);
  toggleCollapse = output();

  private router = inject(Router);
  private ps = inject(PermissionService);
  private moduleLeaveTimer: any = null;
  private subLeaveTimer: any = null;

  modules = computed(() => this.ps.getModules());
  expandedMenus = signal<Set<string>>(new Set());
  expandedSubMenus = signal<Set<string>>(new Set());
  hoveredModule = signal<string | null>(null);
  hoveredSub = signal<string | null>(null);
  flyoutTop = signal<number>(0);

  toggleSubmenu(title: string) {
    if (this.collapsed()) return;
    this.expandedMenus.update(set => {
      const next = new Set(set);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  toggleSuperSubmenu(event: Event, path: string) {
    event.stopPropagation();
    this.expandedSubMenus.update(set => {
      const next = new Set(set);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  isExpanded(title: string): boolean {
    return this.expandedMenus().has(title);
  }

  isSuperExpanded(path: string): boolean {
    return this.expandedSubMenus().has(path);
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  onToggleCollapse() {
    this.toggleCollapse.emit();
    if (!this.collapsed()) {
      this.expandedMenus.set(new Set());
      this.expandedSubMenus.set(new Set());
    }
  }

  onModuleEnter(event: MouseEvent, title: string) {
    if (!this.collapsed()) return;
    clearTimeout(this.moduleLeaveTimer);
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.flyoutTop.set(rect.top);
    this.hoveredModule.set(title);
  }

  onModuleLeave() {
    if (!this.collapsed()) return;
    // Delay so mouse can cross the gap to flyout
    this.moduleLeaveTimer = setTimeout(() => {
      this.hoveredModule.set(null);
      this.hoveredSub.set(null);
    }, 100);
  }

  onFlyoutEnter() {
    // Mouse entered flyout — cancel the leave timer
    clearTimeout(this.moduleLeaveTimer);
  }

  onFlyoutLeave() {
    // Mouse left flyout — close it
    this.hoveredModule.set(null);
    this.hoveredSub.set(null);
  }

  onSubEnter(path: string) {
    clearTimeout(this.subLeaveTimer);
    this.hoveredSub.set(path);
  }

  onSubLeave() {
    // Delay so mouse can cross to nested flyout
    this.subLeaveTimer = setTimeout(() => {
      this.hoveredSub.set(null);
    }, 100);
  }

  onNestedEnter(path: string) {
    clearTimeout(this.subLeaveTimer);
    this.hoveredSub.set(path);
  }

  onNestedLeave() {
    this.hoveredSub.set(null);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.hoveredModule.set(null);
    this.hoveredSub.set(null);
  }

  hasSuperSubs(sub: any): boolean {
    return sub.supersubmenus && sub.supersubmenus.length > 0;
  }

  toggleFlyoutSub(path: string) {
    if (this.hoveredSub() === path) {
      this.hoveredSub.set(null);
    } else {
      this.hoveredSub.set(path);
    }
  }
}