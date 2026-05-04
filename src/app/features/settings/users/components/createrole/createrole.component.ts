import { Component, inject, OnInit }                              from '@angular/core';
import { CommonModule }                                            from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { from }                                                    from 'rxjs';
import { map }                                                     from 'rxjs/operators';

import { UserService }  from '../../servics/user-service';
import { AuthService }  from '../../../../../core/auth/auth.service';

import { PermissionsPanelComponent }           from '../permissions-panel/permissions-panel.component';
import { PermissionRow, ApiModule, ApiSubModule } from '../permissions-panel/permissions-panel.component';

const SUB_DESC: Record<string, string> = {
  'My Jrs':              'Manage job requisitions',
  'Kanban':              'View kanban pipeline',
  'Hiring Dashboard':    'Hiring overview dashboard',
  'Job Details':         'Detailed job postings',
  'Users':               'Manage system users',
  'Roles & Permissions': 'Roles & permission settings',
};

@Component({
  selector:    'app-create-role',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, PermissionsPanelComponent],
  templateUrl: './createrole.component.html',
  styleUrls:   ['./createrole.component.scss'],
})
export class CreateRoleComponent implements OnInit {

  private fb          = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  form!:         FormGroup;
  isSubmitting = false;

  businessUnits: any[] = [];
  departments:   any[] = [];

  allModules:  ApiModule[]               = [];
  permMap    = new Map<number, PermissionRow>();
  loading    = true;
  permTouched = false;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();
    this.loadModules();
    this.loadBusinessUnits();

    this.form.get('businessUnit')!.valueChanges.subscribe(unitId => {
      this.departments = [];
      this.form.patchValue({ department: '' }, { emitEvent: false });
      if (unitId) this.loadDepartments(unitId);
    });
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      businessUnit: ['', Validators.required],
      department:   ['', Validators.required],
      roleName:     ['', Validators.required],
      description:  ['', Validators.required],
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ── Data loading ────────────────────────────────────────────────────────────

  loadModules(): void {
    this.loading = true;
    from(this.userService.getAllModules())
      .pipe(map((res: any) => res.data as ApiModule[]))
      .subscribe({
        next: modules => {
          this.allModules = modules;
          this.buildPermMap(modules);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  private buildPermMap(modules: ApiModule[]): void {
    this.permMap.clear();
    modules.forEach(parent =>
      parent.subModules.forEach((sub: ApiSubModule) => {
        this.permMap.set(sub.moduleId, {
          moduleId:    sub.moduleId,
          moduleName:  sub.moduleName,
          description: SUB_DESC[sub.moduleName] ?? '',
          create: false,
          view:   false,
          edit:   false,
          delete: false,
          export: false,
        });
      }),
    );
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

  onPermChange(updated: Map<number, PermissionRow>): void {
    this.permMap = updated;
  }

  /** Convenience getter so the template can pass the flag down */
  get permTouchedFlag(): boolean { return this.permTouched; }

  // ── Submit / Cancel ─────────────────────────────────────────────────────────

  submit(): void {
    this.form.markAllAsTouched();
    this.permTouched = true;

    const hasPerms = Array.from(this.permMap.values()).some(
      p => p.create || p.view || p.edit || p.delete || !!p.export,
    );

    if (this.form.invalid || !hasPerms || this.isSubmitting) return;

    this.isSubmitting = true;
    const { businessUnit, department, roleName, description } = this.form.value;

    const payload = {
      roleName:       roleName.trim(),
      businessUnitId: businessUnit,
      departmentId:   department,
      description:    description ?? '',
      permission: {
        createdBy: this.authService.getUserNameByToken(),
        modules: Array.from(this.permMap.values()).map(p => ({
          moduleId: p.moduleId,
          create:   p.create,
          view:     p.view,
          edit:     p.edit,
          delete:   p.delete,
          export:   p.export,
        })),
      },
    };

    this.userService.addRole(payload)
      .then(() => { this.isSubmitting = false; })
      .catch((err: any) => {
        console.error('Create role error:', err);
        this.isSubmitting = false;
      });
  }

  cancel(): void { history.back(); }
}