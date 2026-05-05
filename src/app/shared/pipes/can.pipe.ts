import { Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

/**
 * CanPipe — template helper for permission-based show/hide.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 *
 * 1. Sub-module level  (most common)
 *    *ngIf="'DEMAND' | can:'MYJRS':'CREATE'"
 *    *ngIf="'SUPPLY' | can:'KANBAN':'VIEW'"
 *    *ngIf="'SYSTEM&ADMINS' | can:'USERS':'EDIT'"
 *
 * 2. Module level  (no sub-module in the permission string)
 *    *ngIf="'DEMAND' | can:'CREATE'"
 *
 * ── Arguments ────────────────────────────────────────────────────────────────
 *   value     — the MODULE key  (matches first segment of the permission string)
 *   arg1      — SUBMODULE key  OR  ACTION when no submodule is needed
 *   arg2?     — ACTION  (only when arg1 is a sub-module)
 *
 * Action values (case-insensitive): CREATE | VIEW | EDIT | DELETE | EXPORT
 */
@Pipe({ name: 'can', standalone: true, pure: false })
export class CanPipe implements PipeTransform {
  private ps = inject(PermissionService);

  transform(module: string, arg1: string, arg2?: string): boolean {
    if (!module || !arg1) return false;

    if (arg2) {
      // 3-argument form:  module | can : subModule : action
      return this.ps.can(module, arg1, arg2);
    }

    // 2-argument form:  module | can : action  (module-level permission)
    return this.ps.canModule(module, arg1);
  }
}
