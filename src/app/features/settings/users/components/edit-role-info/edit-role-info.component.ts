import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../../servics/user-service';
import { AuthService } from '../../../../../core/auth/auth.service';


export interface PermissionRow {
  moduleId: number;
  moduleName: string;
  description: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean | null;
}

interface ApiSubModule {
  moduleId: number;
  moduleName: string;
  create?: boolean;
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
  export?: boolean | null;
}

interface ApiModule {
  moduleId: number;
  moduleName: string;
  subModules: ApiSubModule[];
}

const SUB_DESC: Record<number, string> = {
  4: 'Manage job requisitions',
  5: 'View kanban pipeline',
  6: 'Hiring overview dashboard',
  7: 'Detailed job postings',
  8: 'Manage system users',
  9: 'Roles & permission settings',
};

export const ICON_PALETTE: Array<{ bg: string; color: string; icon: string }> = [
  /* 00 */ { bg: '#dbeafe', color: '#1d4ed8', icon: 'fa-solid fa-file-lines' },
  /* 01 */ { bg: '#dcfce7', color: '#15803d', icon: 'fa-solid fa-user-tie' },
  /* 02 */ { bg: '#fef9c3', color: '#a16207', icon: 'fa-solid fa-briefcase' },
  /* 03 */ { bg: '#fce7f3', color: '#be185d', icon: 'fa-solid fa-chart-bar' },
  /* 04 */ { bg: '#ede9fe', color: '#6d28d9', icon: 'fa-solid fa-envelope' },
  /* 05 */ { bg: '#ffedd5', color: '#c2410c', icon: 'fa-solid fa-users' },
  /* 06 */ { bg: '#e0f2fe', color: '#0369a1', icon: 'fa-solid fa-gear' },
  /* 07 */ { bg: '#fef3c7', color: '#92400e', icon: 'fa-solid fa-shield-halved' },
  /* 08 */ { bg: '#f0fdf4', color: '#166534', icon: 'fa-solid fa-lock' },
  /* 09 */ { bg: '#fdf2f8', color: '#9d174d', icon: 'fa-solid fa-circle-user' },
  /* 10 */ { bg: '#ecfdf5', color: '#065f46', icon: 'fa-solid fa-gauge' },
  /* 11 */ { bg: '#eff6ff', color: '#1e40af', icon: 'fa-solid fa-diagram-project' },
  /* 12 */ { bg: '#fff7ed', color: '#9a3412', icon: 'fa-solid fa-plug' },
  /* 13 */ { bg: '#f0f9ff', color: '#0c4a6e', icon: 'fa-solid fa-bell' },
  /* 14 */ { bg: '#fafaf9', color: '#57534e', icon: 'fa-solid fa-file-code' },
  /* 15 */ { bg: '#fdf4ff', color: '#7e22ce', icon: 'fa-solid fa-comments' },
  /* 16 */ { bg: '#fff1f2', color: '#be123c', icon: 'fa-solid fa-handshake' },
  /* 17 */ { bg: '#f7fee7', color: '#3f6212', icon: 'fa-solid fa-clipboard-check' },
];


const MODULE_ICON_MAP: Array<{ keywords: string[]; icon: string }> = [
  { keywords: ['staffing', 'requisition'], icon: 'fa-solid fa-file-lines' },
  { keywords: ['candidate'], icon: 'fa-solid fa-user-tie' },
  { keywords: ['recruitment', 'hiring', 'job'], icon: 'fa-solid fa-briefcase' },
  { keywords: ['report', 'analytics', 'metric', 'trend', 'summary', 'performance'], icon: 'fa-solid fa-chart-bar' },
  { keywords: ['communication', 'email', 'chat', 'sms', 'broadcast', 'campaign'], icon: 'fa-solid fa-envelope' },
  { keywords: ['employee', 'staff', 'personnel'], icon: 'fa-solid fa-users' },
  { keywords: ['setting', 'config', 'preference', 'localiz', 'billing', 'security', 'api'], icon: 'fa-solid fa-gear' },
  { keywords: ['audit', 'log', 'activity', 'history', 'compliance', 'archiv'], icon: 'fa-solid fa-shield-halved' },
  { keywords: ['role', 'permission', 'access'], icon: 'fa-solid fa-lock' },
  { keywords: ['user', 'account'], icon: 'fa-solid fa-circle-user' },
  { keywords: ['dashboard', 'overview'], icon: 'fa-solid fa-gauge' },
  { keywords: ['pipeline', 'kanban', 'workflow'], icon: 'fa-solid fa-diagram-project' },
  { keywords: ['integration', 'siem'], icon: 'fa-solid fa-plug' },
  { keywords: ['notification', 'alert'], icon: 'fa-solid fa-bell' },
  { keywords: ['template'], icon: 'fa-solid fa-file-code' },
  { keywords: ['interview'], icon: 'fa-solid fa-comments' },
  { keywords: ['offer'], icon: 'fa-solid fa-handshake' },
  { keywords: ['assessment'], icon: 'fa-solid fa-clipboard-check' },
  { keywords: ['department'], icon: 'fa-solid fa-building' },
  { keywords: ['leave', 'attendance'], icon: 'fa-solid fa-calendar-days' },
  { keywords: ['payroll'], icon: 'fa-solid fa-money-bill-wave' },
  { keywords: ['benefit'], icon: 'fa-solid fa-hand-holding-heart' },
  { keywords: ['training'], icon: 'fa-solid fa-graduation-cap' },
  { keywords: ['data'], icon: 'fa-solid fa-database' },
  { keywords: ['retention'], icon: 'fa-solid fa-clock-rotate-left' },
  { keywords: ['sourcing'], icon: 'fa-solid fa-magnifying-glass' },
  { keywords: ['application'], icon: 'fa-solid fa-file-pen' },
  { keywords: ['profile'], icon: 'fa-solid fa-id-card' },
  { keywords: ['scheduled'], icon: 'fa-solid fa-calendar-check' },
  { keywords: ['custom'], icon: 'fa-solid fa-sliders' },
  { keywords: ['export'], icon: 'fa-solid fa-file-export' },
  { keywords: ['onboard'], icon: 'fa-solid fa-person-walking-arrow-right' },
];

@Component({
  selector: 'app-edit-role-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-role-info.component.html',
  styleUrl: './edit-role-info.component.scss',
})
export class EditRoleInfoComponent implements OnInit {

  private router = inject(Router);
  private svc = inject(UserService);

  private authService=inject(AuthService)
  allModules: ApiModule[] = [];
  selectedModuleId: number | 'all' = 'all';
  permMap = new Map<number, PermissionRow>();
  loading = true;
  saving = false;
  searchQuery = '';
  roleId: any;


  isViewMode = false;

  get pageTitle(): string {
    return this.isViewMode ? 'View Role Information' : 'Edit Role Information';
  }

 
  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state;
    this.roleId = state?.roleId;
    this.isViewMode = state?.type === 'view';
    this.loadData();
  }


  loadData(): void {
    this.loading = true;

    forkJoin({
      modules: from(this.svc.getAllModules()).pipe(
        map((res: any) => res.data as ApiModule[])
      ),
      perms: from(this.svc.getPermissionsByRoleId(this.roleId)).pipe(
        map((res: any) => res.data as ApiModule[])
      ),
    }).subscribe({
      next: ({ modules, perms }) => {
        this.allModules = modules;
        this.buildPermMap(modules, perms);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private buildPermMap(allModules: ApiModule[], permModules: ApiModule[]): void {
    this.permMap.clear();

    const permIndex = new Map<number, ApiSubModule>();
    permModules.forEach(parent =>
      parent.subModules.forEach(sub => permIndex.set(sub.moduleId, sub))
    );

    allModules.forEach(parent => {
      parent.subModules.forEach(sub => {
        const perm = permIndex.get(sub.moduleId);
        this.permMap.set(sub.moduleId, {
          moduleId: sub.moduleId,
          moduleName: sub.moduleName,
          description: SUB_DESC[sub.moduleId] ?? '',
          create: perm?.create ?? false,
          view: perm?.view ?? false,
          edit: perm?.edit ?? false,
          delete: perm?.delete ?? false,
          export: perm !== undefined
            ? (perm.export !== undefined ? perm.export : false)
            : false,
        });
      });
    });
  }


  get filteredModules(): ApiModule[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allModules;
    return this.allModules.filter(
      m => m.moduleName.toLowerCase().includes(q) ||
        m.subModules.some(s => s.moduleName.toLowerCase().includes(q))
    );
  }

  selectModule(id: number | 'all'): void {
    this.selectedModuleId = id;
  }


  getPalette(moduleId: number): { bg: string; color: string; icon: string } {
    return ICON_PALETTE[moduleId % ICON_PALETTE.length];
  }


  getModuleIcon(moduleName: string, moduleId: number): string {
    const lower = moduleName.toLowerCase();
    const match = MODULE_ICON_MAP.find(m => m.keywords.some(k => lower.includes(k)));
    return match ? match.icon : this.getPalette(moduleId).icon;
  }


  getParentModuleId(subModuleId: number): number {
    const parent = this.allModules.find(m =>
      m.subModules.some(s => s.moduleId === subModuleId)
    );
    return parent?.moduleId ?? subModuleId;
  }


  get tableRows(): PermissionRow[] {
    if (this.selectedModuleId === 'all') {
      return Array.from(this.permMap.values());
    }
    const parent = this.allModules.find(m => m.moduleId === this.selectedModuleId);
    if (!parent) return [];
    return parent.subModules
      .map(s => this.permMap.get(s.moduleId))
      .filter((r): r is PermissionRow => !!r);
  }

  get totalSubModules(): number {
    return this.allModules.reduce((sum, m) => sum + m.subModules.length, 0);
  }

  get activePermissions(): number {
    let count = 0;
    this.permMap.forEach(p => {
      if (p.create) count++;
      if (p.view) count++;
      if (p.edit) count++;
      if (p.delete) count++;
      if (p.export) count++;
    });
    return count;
  }


  togglePermission(
    row: PermissionRow,
    key: 'create' | 'view' | 'edit' | 'delete' | 'export',
    value: boolean
  ): void {
    if (this.isViewMode) return;
    const entry = this.permMap.get(row.moduleId);
    if (entry) (entry as any)[key] = value;
  }


  onUpdate(): void {
    if (this.isViewMode) return;
    this.saving = true;

    const modulesPayload = Array.from(this.permMap.values()).map(p => ({
      moduleId: p.moduleId,
      create: p.create,
      view: p.view,
      edit: p.edit,
      delete: p.delete,
      export: p.export,
    }));


    from(this.svc.updatePermission({ roleId: this.roleId, permission: {updatedBy:this.authService.getUserNameByToken() ,modules: modulesPayload } }))
      .subscribe({
        next: () => { this.saving = false;this.loadData(); },
        error: () => { this.saving = false; },
      });
  }

  onCancel(): void {
    history.back();
  }
}