import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { UserService } from '../../servics/user-service';
import { PermissionCell, PermissionModule } from '../../../../../shared/constants/permissions.modal';

export interface CreateRolePayload {
  roleName: string;
  businessUnitId: string;
  departmentId: string;
  description: string;
  permission: {
    createdBy: string;
    modules: { moduleId: number; create: boolean; view: boolean; edit: boolean; delete: boolean }[];
  };
}

@Component({
  selector: 'app-create-role',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './createrole.component.html',
  styleUrls: ['./createrole.component.scss'],
})
export class CreateRoleComponent implements OnInit {

  @Input() type: 'create' | 'assign' = 'create';
  @Input() modules: PermissionModule[] = [];

  private fb = inject(FormBuilder);
  private userService = inject(UserService);


  form!: FormGroup;
  isSubmitting = false;
  permTouched = false;

  businessUnits: any[] = [];
  departments: any[] = [];
  roles: any[] = [];

  permColumns: { key: keyof PermissionCell; label: string }[] = [
    { key: 'create', label: 'Create' },
    { key: 'view', label: 'View' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
  ];

  permissions: Record<string, PermissionCell> = {};


  ngOnInit(): void {
    this.buildForm();
    this.buildPermissions();
    this.loadBusinessUnits();

    this.form.get('businessUnit')!.valueChanges.subscribe(unitId => {
      this.departments = [];
      this.roles = [];
      this.form.patchValue({ department: '', roleName: '' }, { emitEvent: false });
      if (unitId) this.loadDepartments(unitId);
    });

    this.form.get('department')!.valueChanges.subscribe(deptId => {
      this.roles = [];
      this.form.patchValue({ roleName: '' }, { emitEvent: false });
      if (deptId && this.type === 'assign') this.loadRoles(deptId);
    });
  }


  private buildForm(): void {
    this.form = this.fb.group({
      businessUnit: ['', Validators.required],
      department: ['', Validators.required],
      roleName: ['', Validators.required],
      description: [
        '',
      Validators.required
      ],
    });
  }


  private buildPermissions(): void {
    const result: Record<string, PermissionCell> = {};
    this.modules?.forEach(m => {
      result[m.key] = { create: false, view: false, edit: false, delete: false };
    });
    this.permissions = result;
  }

  private loadBusinessUnits(): void {
    this.userService.getBussinessUnits()
      .then((res: any) => { this.businessUnits = res?.data ?? []; })
      .catch(console.error);
  }

  private loadDepartments(unitId: string): void {
    this.userService.getDepartments(unitId)
      .then((res: any) => { this.departments = res?.data ?? []; })
      .catch(console.error);
  }

  private loadRoles(deptId: string): void {
    this.userService.getRoles(deptId)
      .then((res: any) => { this.roles = res?.data ?? []; })
      .catch(console.error);
  }

  hasAtLeastOnePermission(): boolean {
    return this.modules?.some(m =>
      Object.values(this.permissions[m.key] ?? {}).some(v => v === true)
    );
  }

  togglePerm(moduleKey: string, permKey: keyof PermissionCell): void {
    this.permissions = {
      ...this.permissions,
      [moduleKey]: {
        ...this.permissions[moduleKey],
        [permKey]: !this.permissions[moduleKey][permKey],
      },
    };
  }

  isColumnAllChecked(permKey: keyof PermissionCell): boolean {
    return this.modules?.every(m => this.permissions[m.key]?.[permKey]);
  }




  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }


  submit(): void {
    this.form.markAllAsTouched();
    this.permTouched = true;

    if (this.form.invalid) return;
    if (!this.hasAtLeastOnePermission()) return;
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const { businessUnit, department, roleName, description } = this.form.value;

    if (this.type === 'assign') {

      const matched = this.roles?.find(
        r => String(r.roleId ?? r.id) === String(roleName)
      );

      const updatePayload = {
        roleId: matched?.roleId ?? matched?.id,
        permission: {
          updatedBy: 'admin',
          modules: this.modules.map(m => ({
            moduleId: m.moduleId!,
            create: this.permissions[m.key]?.create ?? false,
            view: this.permissions[m.key]?.view ?? false,
            edit: this.permissions[m.key]?.edit ?? false,
            delete: this.permissions[m.key]?.delete ?? false,
          })),
        },
      };

      this.userService.updatePermission(updatePayload)
        .then(() => {  })
        .catch((err: any) => console.error('Assign permissions error:', err))
        .finally(() => { this.isSubmitting = false; });

    } else {
      const createPayload: CreateRolePayload = {
        roleName: roleName.trim(),
        businessUnitId: businessUnit,
        departmentId: department,
        description: description ?? '',
        permission: {
          createdBy: 'admin',
          modules: this.modules.map(m => ({
            moduleId: m.moduleId!,
            create: this.permissions[m.key]?.create ?? false,
            view: this.permissions[m.key]?.view ?? false,
            edit: this.permissions[m.key]?.edit ?? false,
            delete: this.permissions[m.key]?.delete ?? false,
          })),
        },
      };

      this.userService.addRole(createPayload)
        .then(() => { })
        .catch((err: any) => console.error('Create role error:', err))
        .finally(() => { this.isSubmitting = false; });
    }
  }

  cancel(): void {
  
  }
}