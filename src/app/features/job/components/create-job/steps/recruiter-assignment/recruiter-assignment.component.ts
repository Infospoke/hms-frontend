import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ReusableTableComponent, TableColumn } from '../../../../../../shared/components/reusable-table/reusable-table.component';
import { CommonFilterComponent } from '../../../../../../shared/components/common-filter/common-filter.component';
import { roles } from '../../../../../../shared/constants/reusbale-filter';
import { HeadingComponent } from '../../../../../../shared/components/heading/heading.component';
import { ApprovalService } from '../../../../../approvals/services/approval-service';
import { JobService } from '../../../../services/job.service';

export interface Recruiter {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  role: string;
  activeAssignments: number;
  assigned: boolean;
}

/** Cycles through these colours for avatars */
const AVATAR_COLORS = [
  '#4F46E5', '#0891B2', '#059669', '#D97706',
  '#DC2626', '#7C3AED', '#DB2777', '#EA580C',
];

@Component({
  selector: 'app-recruiter-assignment-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReusableTableComponent, CommonFilterComponent, HeadingComponent],
  templateUrl: './recruiter-assignment.component.html',
  styleUrl: './recruiter-assignment.component.scss',
})
export class RecruiterAssignmentStepComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() showInfo: any;
  @Input() infoTooltip: any;
  @Input() showBackButton: boolean = false;
  @Input() buttonText: any;
  @Input() buttonUrl: any;

  // ── Pagination state ──────────────────────────────────────────────────────
  currentPage: number = 1;
  pageSize:    number = 10;       // Fixed: was incorrectly set to 1
  totalItems:  number = 0;

  // ── Data ──────────────────────────────────────────────────────────────────
  filteredRecruiters: Recruiter[] = [];

  /**
   * Tracks assigned user IDs across ALL pages so selections survive
   * page navigation. Key = userId, Value = true (assigned).
   */
  private assignedIds = new Set<number>();

  // ── Filter state (sent to server) ─────────────────────────────────────────
  private searchTerm:      string   = '';
  private selectedRoleIds: number[] = [];

  // ── Stored IDs from departments API ──────────────────────────────────────
  departmentIds: number[] = [];

  private jobService      = inject(JobService);
  private approvalService = inject(ApprovalService);

  columns: TableColumn[] = [
    { key: 'select',            label: '',                         width: '48px',  custom: true },
    { key: 'name',              label: 'Recruiter',                width: '240px', custom: true },
    { key: 'email',             label: 'Email ID' },
    { key: 'role',              label: 'Role' },
    { key: 'activeAssignments', label: 'Total Active Assignments', align: 'center' },
    { key: 'action',            label: 'Action',                   align: 'center', custom: true },
  ];

  filterDropdowns = roles;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.form && !this.form.get('assignedRecruiters')) {
      this.form.addControl('assignedRecruiters', new FormControl<number[]>([]));
    }
    this.loadDepartments();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  private loadDepartments(): void {
    this.approvalService.departments()
      .then((res: any) => {
        const data: any[] = res?.data ?? [];
        const allowedNames = ['Recruiting Operations', 'Talent Acquisition'];

        const ids: number[] = data
          .filter((item: any) => allowedNames.includes(item.name))
          .map((item: any) => item.id);

        this.departmentIds = ids;

        // Load role-dropdown options and first page of recruiters in parallel
        Promise.all([
          this.loadRoles(ids),
          this.loadRolesAndUsers(),
        ]);
      })
      .catch((err: any) => console.error('loadDepartments error:', err));
  }

 
  private loadRolesAndUsers(): void {
    const body = this.buildRequestBody();

    this.jobService.getRecruiters(body)
      .then((res: any) => {
        if (res?.responsecode === '00') {
          const data = res.data;
          // Use totalElements from API response for pagination
          this.totalItems         = data?.totalElements ?? 0;
          this.filteredRecruiters = this.mapApiResponseToRecruiters(data);
        }
      })
      .catch((err: any) => console.error('loadRolesAndUsers error:', err));
  }

 
  private mapApiResponseToRecruiters(data: any): Recruiter[] {
    const departments: any[] = data?.departments ?? [];
    const recruiters: Recruiter[] = [];
    let colorIndex = 0;

    for (const dept of departments) {
      for (const role of (dept.roles ?? [])) {
        for (const user of (role.users ?? [])) {
          recruiters.push({
            id:                user.userId,
            name:              user.recruiterName,
            initials:          this.getInitials(user.recruiterName),
            avatarColor:       AVATAR_COLORS[colorIndex % AVATAR_COLORS.length],
            email:             user.email,
            role:              user.roleName,
            activeAssignments: user.totalAssignments ?? 0,
            // Restore assigned state from the persistent Set
            assigned:          this.assignedIds.has(user.userId),
          });
          colorIndex++;
        }
      }
    }

    return recruiters;
  }

  private loadRoles(ids: number[]): void {
    this.jobService.fetchRoles({ departmentsIds: ids })
      .then((res: any) => {
        const d       = res?.data ?? [];
        const options = this.mapForDepartment(d);
        this.filterDropdowns = this.filterDropdowns.map((item: any) =>
          item.key === 'roles' ? { ...item, options } : item
        );
      })
      .catch((err: any) => console.error('loadRoles error:', err));
  }

  // ── Request builder ───────────────────────────────────────────────────────

  /**
   * Builds the server request body matching the required shape:
   * {
   *   page, size, sortBy, direction,
   *   filters: { departmentIds, roleIds, search }
   * }
   */
  private buildRequestBody(): object {
    const filters: Record<string, any> = {};

    // Always send department IDs
    if (this.departmentIds.length) {
      filters['departmentIds'] = this.departmentIds;
    }

    // Send selected roleIds to server
    if (this.selectedRoleIds.length) {
      filters['roleIds'] = this.selectedRoleIds;
    }

    // Send search string to server
    if (this.searchTerm.trim()) {
      filters['search'] = this.searchTerm.trim();
    }

    return {
      page:      this.currentPage - 1,   // API is 0-indexed
      size:      this.pageSize,
      sortBy:    'id',
      direction: 'DESC',
      filters,
    };
  }

 
  onFilterChange(event: any): void {
    this.searchTerm = (event.search || '');
    console.log(event);
    const roleValue      = event.filters?.roles;
    this.selectedRoleIds = roleValue ? [Number(roleValue)] : [];
    this.currentPage = 1;
    this.loadRolesAndUsers();
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRolesAndUsers();
  }

  // ── Selection helpers ─────────────────────────────────────────────────────

  get allSelected(): boolean {
    return this.filteredRecruiters.length > 0 &&
           this.filteredRecruiters.every(r => r.assigned);
  }

  get someSelected(): boolean {
    return this.filteredRecruiters.some(r => r.assigned) && !this.allSelected;
  }

  toggleAll(checked: boolean): void {
    this.filteredRecruiters.forEach(r => {
      r.assigned = checked;
      this.updateAssignedSet(r);
    });
    this.syncForm();
  }

  toggleRow(recruiter: Recruiter): void {
    recruiter.assigned = !recruiter.assigned;
    this.updateAssignedSet(recruiter);
    this.syncForm();
  }

  toggleAssign(recruiter: Recruiter): void {
    recruiter.assigned = !recruiter.assigned;
    this.updateAssignedSet(recruiter);
    this.syncForm();
  }

  /**
   * Keeps the cross-page Set in sync after every toggle so that navigating
   * away and back to a page restores the correct checkbox state.
   */
  private updateAssignedSet(recruiter: Recruiter): void {
    if (recruiter.assigned) {
      this.assignedIds.add(recruiter.id);
    } else {
      this.assignedIds.delete(recruiter.id);
    }
  }

  /** Writes the full list of assigned IDs (all pages) into the form control */
  private syncForm(): void {
    this.form.get('assignedRecruiters')?.setValue([...this.assignedIds]);
  }

  get assignedCount(): number {
    return this.assignedIds.size;    // Counts across all pages
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  private getInitials(name: string): string {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private mapForDepartment(data: any[]): any[] {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({ value: item.id, label: item.name })),
    ];
  }
}