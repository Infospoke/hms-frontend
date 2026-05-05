import { Injectable, inject, signal, computed } from '@angular/core';
import { TokenService } from '../auth/token.service';

const ACTIONS = new Set(['CREATE', 'VIEW', 'EDIT', 'DELETE', 'EXPORT']);
const SELF = '__SELF__';


@Injectable({ providedIn: 'root' })
export class PermissionService {
  private tokenService = inject(TokenService);

  private _rawPerms = signal<string[]>([]);

  private _map = computed<Map<string, Map<string, Set<string>>>>(() => {
    const map = new Map<string, Map<string, Set<string>>>();

    for (const perm of this._rawPerms()) {
      const parts  = perm.split('_');
      const action = parts[parts.length - 1].toUpperCase();
      if (!ACTIONS.has(action)) continue;      
      const module    = parts[0].toUpperCase();
      const subModule = parts.length >= 3
        ? parts.slice(1, -1).join('_').toUpperCase()
        : SELF;

      if (!map.has(module)) map.set(module, new Map());
      const modMap = map.get(module)!;
      if (!modMap.has(subModule)) modMap.set(subModule, new Set());
      modMap.get(subModule)!.add(action);
    }

    return map;
  });

  constructor() {
    this.load();
  }

  load(): void {
    this._rawPerms.set(this.tokenService.getPermissions());
  }


  loadFromStorage(): void {
    this.load();
  }

  clear(): void {
    this._rawPerms.set([]);
  }


  can(module: string, subModule: string, action: string): boolean {
    return (
      this._map()
        .get(module.toUpperCase())
        ?.get(subModule.toUpperCase())
        ?.has(action.toUpperCase()) ?? false
    );
  }

 
  canModule(module: string, action: string): boolean {
    return this.can(module, SELF, action);
  }

  hasModule(module: string): boolean {
    return this._map().has(module.toUpperCase());
  }

  hasSubModule(module: string, subModule: string): boolean {
    return (
      this._map().get(module.toUpperCase())?.has(subModule.toUpperCase()) ?? false
    );
  }
}
