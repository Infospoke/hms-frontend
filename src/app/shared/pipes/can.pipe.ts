import { Pipe, inject } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

@Pipe({ name: 'can', standalone: true })
export class CanPipe {
  private ps = inject(PermissionService);

  transform(path: string, action: 'create' | 'edit' | 'delete' | 'view' = 'view'): boolean {
    switch (action) {
      case 'create': return this.ps.canCreate(path);
      case 'edit':   return this.ps.canEdit(path);
      case 'delete': return this.ps.canDelete(path);
      case 'view':   return this.ps.canView(path);
      default:       return false;
    }
  }
}