import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

export interface PermissionRow {
  moduleId: number;
  moduleName: string;
  description: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean | null;   // null → N/A badge
}

export interface ApiSubModule {
  moduleId: number;
  moduleName: string;
  create?: boolean;
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
  export?: boolean | null;
}

export interface ApiModule {
  moduleId: number;
  moduleName: string;
  subModules: ApiSubModule[];
}

// ─── Icon palette ────────────────────────────────────────────────────────────

export const ICON_PALETTE: Array<{ bg: string; color: string; icon: string }> = [
  { bg: '#dbeafe', color: '#1d4ed8', icon: 'fa-solid fa-file-lines' },
  { bg: '#dcfce7', color: '#15803d', icon: 'fa-solid fa-user-tie' },
  { bg: '#fef9c3', color: '#a16207', icon: 'fa-solid fa-briefcase' },
  { bg: '#fce7f3', color: '#be185d', icon: 'fa-solid fa-chart-bar' },
  { bg: '#ede9fe', color: '#6d28d9', icon: 'fa-solid fa-envelope' },
  { bg: '#ffedd5', color: '#c2410c', icon: 'fa-solid fa-users' },
  { bg: '#e0f2fe', color: '#0369a1', icon: 'fa-solid fa-gear' },
  { bg: '#fef3c7', color: '#92400e', icon: 'fa-solid fa-shield-halved' },
  { bg: '#f0fdf4', color: '#166534', icon: 'fa-solid fa-lock' },
  { bg: '#fdf2f8', color: '#9d174d', icon: 'fa-solid fa-circle-user' },
  { bg: '#ecfdf5', color: '#065f46', icon: 'fa-solid fa-gauge' },
  { bg: '#eff6ff', color: '#1e40af', icon: 'fa-solid fa-diagram-project' },
  { bg: '#fff7ed', color: '#9a3412', icon: 'fa-solid fa-plug' },
  { bg: '#f0f9ff', color: '#0c4a6e', icon: 'fa-solid fa-bell' },
  { bg: '#fafaf9', color: '#57534e', icon: 'fa-solid fa-file-code' },
  { bg: '#fdf4ff', color: '#7e22ce', icon: 'fa-solid fa-comments' },
  { bg: '#fff1f2', color: '#be123c', icon: 'fa-solid fa-handshake' },
  { bg: '#f7fee7', color: '#3f6212', icon: 'fa-solid fa-clipboard-check' },
];

const MODULE_ICON_MAP: Array<{ keywords: string[]; icon: string }> = [
  { keywords: ['staffing', 'requisition'], icon: 'fa-solid fa-file-lines' },
  { keywords: ['candidate'], icon: 'fa-solid fa-user-tie' },
  { keywords: ['recruitment', 'hiring', 'job'], icon: 'fa-solid fa-briefcase' },
  { keywords: ['report', 'analytics', 'metric', 'performance'], icon: 'fa-solid fa-chart-bar' },
  { keywords: ['communication', 'email', 'chat', 'broadcast'], icon: 'fa-solid fa-envelope' },
  { keywords: ['employee', 'staff', 'personnel'], icon: 'fa-solid fa-users' },
  { keywords: ['setting', 'config', 'preference', 'billing', 'api'], icon: 'fa-solid fa-gear' },
  { keywords: ['audit', 'log', 'activity', 'compliance'], icon: 'fa-solid fa-shield-halved' },
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
  { keywords: ['training'], icon: 'fa-solid fa-graduation-cap' },
  { keywords: ['onboard'], icon: 'fa-solid fa-person-walking-arrow-right' },
  { keywords: ['sourcing'], icon: 'fa-solid fa-magnifying-glass' },
];

@Component({
  selector: 'app-permissions-panel',
  imports: [CommonModule],
  templateUrl: './permissions-panel.component.html',
  styleUrl: './permissions-panel.component.scss',
})
export class PermissionsPanelComponent implements OnChanges {

  @Input() allModules: ApiModule[] = [];
  @Input() permMap = new Map<number, PermissionRow>();
  @Input() loading = false;
  @Input() viewMode = false;
  @Input() touched = false;
  @Input() showTitle=true;
  @Output() permChange = new EventEmitter<Map<number, PermissionRow>>();

  selectedModuleId: number | 'all' = 'all';

 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allModules']) {
      this.selectedModuleId = 'all';
    }
  }


  selectModule(id: number | 'all'): void {
    this.selectedModuleId = id;
  }

  get totalSubModules(): number {
    return this.allModules.reduce((sum, m) => sum + m.subModules.length, 0);
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

  // ── Permission validation ─────────────────────────────────────────────────

  hasAtLeastOnePermission(): boolean {
    return Array.from(this.permMap.values()).some(
      p => p.create || p.view || p.edit || p.delete || !!p.export,
    );
  }

  get showPermError(): boolean {
    return this.touched && !this.hasAtLeastOnePermission();
  }


  togglePermission(
    row: PermissionRow,
    key: 'create' | 'view' | 'edit' | 'delete' | 'export',
    value: boolean,
  ): void {
    if (this.viewMode) return;
    const entry = this.permMap.get(row.moduleId);
    if (entry) {
      (entry as any)[key] = value;
      this.permChange.emit(new Map(this.permMap));
    }
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
      m.subModules.some(s => s.moduleId === subModuleId),
    );
    return parent?.moduleId ?? subModuleId;
  }


  get skeletonRows(): number[] {
    return Array.from({ length: 6 }, (_, i) => i);
  }
}
