import { Injectable, signal, computed } from '@angular/core';

export interface SuperSubMenu {
  title: string;
  path: string;
  create: boolean;
  edit: boolean;
  delete: boolean;
  view: boolean;
}

export interface SubMenu {
  title: string;
  path: string;
  create: boolean;
  edit: boolean;
  delete: boolean;
  view: boolean;
  supersubmenus: SuperSubMenu[];
}

export interface AppModule {
  title: string;
  image: string | null;
  submenus: SubMenu[];
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private modules = signal<AppModule[]>([]);

  private permissionMap = computed(() => {
    const map: Record<string, SubMenu | SuperSubMenu> = {};
    this.modules().forEach(mod => {
      mod.submenus.forEach(sub => {
        map[sub.path] = sub;
        // Flatten supersubmenus into the same map
        sub.supersubmenus?.forEach(superSub => {
          map[superSub.path] = superSub;
        });
      });
    });
    return map;
  });

  setModules(modules: AppModule[]) {
    this.modules.set(modules);
    localStorage.setItem('modules', JSON.stringify(modules));
  }

  loadFromStorage() {
    const stored = localStorage.getItem('modules');
    if (stored) {
      try { this.modules.set(JSON.parse(stored)); } catch { }
    }
  }

  getModules(): AppModule[] {
    return this.modules();
  }

  canView(path: string): boolean {
    return this.permissionMap()[path]?.view ?? false;
  }

  canCreate(path: string): boolean {
    return this.permissionMap()[path]?.create ?? false;
  }

  canEdit(path: string): boolean {
    return this.permissionMap()[path]?.edit ?? false;
  }

  canDelete(path: string): boolean {
    return this.permissionMap()[path]?.delete ?? false;
  }

  hasAccess(path: string): boolean {
    return !!this.permissionMap()[path];
  }

  hasModule(title: string): boolean {
    return this.modules().some(m => m.title === title);
  }

  getSubmenus(moduleTitle: string): SubMenu[] {
    return this.modules().find(m => m.title === moduleTitle)?.submenus || [];
  }

  getPermissions(path: string): { create: boolean; edit: boolean; delete: boolean; view: boolean } {
    const entry = this.permissionMap()[path];
    return entry
      ? { create: entry.create, edit: entry.edit, delete: entry.delete, view: entry.view }
      : { create: false, edit: false, delete: false, view: false };
  }

  // Check if a submenu has supersubmenus
  hasSuperSubmenus(path: string): boolean {
    for (const mod of this.modules()) {
      const sub = mod.submenus.find(s => s.path === path);
      if (sub) return sub.supersubmenus?.length > 0;
    }
    return false;
  }

  getSuperSubmenus(path: string): SuperSubMenu[] {
    for (const mod of this.modules()) {
      const sub = mod.submenus.find(s => s.path === path);
      if (sub) return sub.supersubmenus || [];
    }
    return [];
  }

  clear() {
    this.modules.set([]);
    localStorage.removeItem('modules');
  }
}