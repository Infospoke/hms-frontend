import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionCell, PermissionModule, RolePermission } from '../../../../../shared/constants/permissions.modal';
import { PermissionCellComponent } from '../../../../../shared/components/permission-cell/permission-cell.component';
import { CreateRoleComponent } from '../createrole/createrole.component';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../servics/user-service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-role-permissions',
  imports: [CommonModule, PermissionCellComponent, NzModalModule],
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss'],
})
export class RolePermissionsComponent implements OnInit {

  isSaving = false;
  isLoading = false;
  editingRowIndex = -1;
  private modal = inject(NzModalService);
  private roleService = inject(UserService);
  private _rowSnapshot: RolePermission | null = null;
  private notificationService=inject(NotificationService);
  modules: PermissionModule[] = [];
  roles: RolePermission[] = [];

  ngOnInit(): void {
    this.loadModulesAndPermissions();
  }

  
  private loadModulesAndPermissions(): void {
    this.isLoading = true;

    this.roleService.getAllModules()
      .then((modRes: any) => {
      
        const allModules: PermissionModule[] = [];
        (modRes?.data ?? []).forEach((parent: any) => {
          (parent.subModules ?? []).forEach((sub: any) => {
            allModules.push({ key: String(sub.moduleId), label: sub.moduleName, moduleId: sub.moduleId });
          });
 
          if (!parent.subModules?.length) {
            allModules.push({ key: String(parent.moduleId), label: parent.moduleName, moduleId: parent.moduleId });
          }
        });
        this.modules = allModules;
        return this.roleService.getAllRolesAndPermissions();
      })
      .then((res: any) => {
        this.roles = this.mapApiRolesToLocal(res?.data ?? []);
      })
      .catch((err) => console.error('Load error:', err))
      .finally(() => { this.isLoading = false; });
  }

  
  private mapApiRolesToLocal(apiRoles: any[]): RolePermission[] {
    return apiRoles.map((r: any) => {
      const permissions: Record<string, PermissionCell> = {};

      this.modules.forEach(m => {
        permissions[m.key] = { create: false, view: false, edit: false, delete: false };
      });

      (r.modules ?? []).forEach((mod: any) => {
        const key = String(mod.moduleId);
        permissions[key] = {
          create: mod.create ?? false,
          view:   mod.view   ?? false,
          edit:   mod.edit   ?? false,
          delete: mod.delete ?? false,
        };
      });

      return { roleId: r.roleId, roleName: r.roleName, permissions };
    });
  }


  openCreateRole(type: 'create' | 'assign'): void {
    const ref = this.modal.create({
      nzTitle: type === 'create' ? 'Create Role' : 'Assign Permissions',
      nzContent: CreateRoleComponent,
      nzWidth: '80%',
      nzCentered: true,
      nzBodyStyle: { 'max-height': '81vh', 'overflow-y': 'auto', 'padding': '10px' },
      nzFooter: null,
    });

    const instance = ref.getContentComponent();
    instance.type = type;
    instance.modules = this.modules;       

    ref.afterClose.subscribe((payload: any) => {
      if (payload) {
        this.loadModulesAndPermissions();    
      }
    });
  }

  isRowEditing(index: number): boolean { return this.editingRowIndex === index; }

  startRowEdit(index: number): void {
    const r = this.roles[index];
    this._rowSnapshot = {
      ...r,
      permissions: Object.fromEntries(
        Object.entries(r.permissions).map(([k, v]) => [k, { ...v }])
      ),
    };
    this.editingRowIndex = index;
  }

  cancelRowEdit(): void {
    if (this._rowSnapshot !== null) {
      this.roles = this.roles.map((r, i) =>
        i === this.editingRowIndex ? this._rowSnapshot! : r
      );
    }
    this.editingRowIndex = -1;
    this._rowSnapshot = null;
  }

  saveRowEdit(): void {
    this.isSaving = true;
    const role = this.roles[this.editingRowIndex];

    const modulesPayload = this.modules.map(m => ({
      moduleId: m.moduleId,
      ...role.permissions[m.key],
    }));

    const payload = {
      roleId: role.roleId,
      permission: {
        updatedBy: 'admin',
        modules: modulesPayload,
      },
    };

    this.roleService.updatePermission(payload)
      .then((res:any) => {
        if(res?.responsecode=='00'){
        this.editingRowIndex = -1;
        this._rowSnapshot = null;
        this.loadModulesAndPermissions();}
        else{
          this.notificationService.error(res?.message || res?.responsemessage || res?.error[0])
        }
      })
      .catch((err) => {
        console.error('Save error:', err);
        this.cancelRowEdit();             
      })
      .finally(() => { this.isSaving = false; });
  }

  onCellChange(roleIndex: number, moduleKey: string, updated: PermissionCell): void {
    this.roles = this.roles.map((r, i) =>
      i === roleIndex
        ? { ...r, permissions: { ...r.permissions, [moduleKey]: updated } }
        : r
    );
  }

  deleteRole(roleId: number, index: number): void {
    if (this.editingRowIndex !== index) return;
    this.roles = this.roles.filter(r => r.roleId !== roleId);
    this.editingRowIndex = -1;
    this._rowSnapshot = null;
  }
}