import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ReusableTableComponent, TableColumn } from '../../../../../../shared/components/reusable-table/reusable-table.component';
import { CommonFilterComponent } from '../../../../../../shared/components/common-filter/common-filter.component';
import { roles } from '../../../../../../shared/constants/reusbale-filter';
import { HeadingComponent } from '../../../../../../shared/components/heading/heading.component';
import { ApprovalService } from '../../../../../approvals/services/approval-service';
import { JobService } from '../../../../services/job.service';
import { NotificationService } from '../../../../../../core/services/notification.service';
import { Router } from '@angular/router';

// ADD:
export interface Recruiter {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  role: string;
  roleId: number;          // ← added
  activeAssignments: number;
  assigned: boolean;
}
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
  @Input() id: any;
  private router=inject(Router);
  // ── Pagination state ──────────────────────────────────────────────────────
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  // ── Data ──────────────────────────────────────────────────────────────────
  filteredRecruiters: Recruiter[] = [];

  /**
   * Tracks assigned user IDs across ALL pages so selections survive
   * page navigation. Key = userId, Value = true (assigned).
   */
  private assignedIds = new Set<number>();

  /**
   * Holds user IDs that are already assigned to the job (fetched from API).
   * These users are excluded from the recruiter list entirely.
   */
  private preAssignedIds = new Set<number>();

  // ── Filter state (sent to server) ─────────────────────────────────────────
  private searchTerm: string = '';
  private selectedRoleIds: number[] = [];

  // ── Stored IDs from departments API ──────────────────────────────────────
  departmentIds: number[] = [];

  private jobService = inject(JobService);
  private approvalService = inject(ApprovalService);
  private notificationService = inject(NotificationService);
  isAssigning = false;

  columns: TableColumn[] = [
    { key: 'select', label: '', width: '48px', custom: true },
    { key: 'name', label: 'Recruiter', width: '240px', custom: true },
    { key: 'email', label: 'Email ID' },
    { key: 'role', label: 'Role' },
    { key: 'activeAssignments', label: 'Total Active Assignments', align: 'center' },
    { key: 'action', label: 'Action', align: 'center', custom: true },
  ];

  filterDropdowns = roles;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.form && !this.form.get('selectedRecruiterDetails')) {
      this.form.addControl(
        'selectedRecruiterDetails',
        new FormControl([])
      );
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

        Promise.all([
          this.loadRoles(ids),
          this.loadPreAssignedUsers(),
        ]);
      })
      .catch((err: any) => console.error('loadDepartments error:', err));
  }

  /**
   * If an ID is present (edit mode), fetch already-assigned user IDs first.
   * Those users will be excluded from the recruiter table entirely.
   */
  private async loadPreAssignedUsers(): Promise<void> {
    if (this.id) {
      try {
        const res: any = await this.jobService.getAssiendUsers(this.id);

        if (res?.responsecode === '00') {
          const userIds: number[] = res?.data?.userIds ?? [];
          userIds.forEach(uid => this.preAssignedIds.add(uid));
        }
      } catch (err) {
        console.error('loadPreAssignedUsers error:', err);
      }
    }

    // Always load recruiters after — with or without pre-assigned IDs
    this.loadRolesAndUsers();
  }

  private loadRolesAndUsers(): void {
    const body = this.buildRequestBody();

    this.jobService.getRecruiters(body)
      .then((res: any) => {
        if (res?.responsecode === '00') {
          const data = res.data;
          this.totalItems = data?.totalElements ?? 0;
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

          // Skip users who are already assigned to this job
          if (this.preAssignedIds.has(user.userId)) {
            colorIndex++;
            continue;
          }

          recruiters.push({
            id: user.userId,
            name: user.recruiterName,
            initials: this.getInitials(user.recruiterName),
            avatarColor: AVATAR_COLORS[colorIndex % AVATAR_COLORS.length],
            email: user.email,
            role: user.roleName,
            roleId: role.roleId,     // ← from parent role object
            activeAssignments: user.totalAssignments ?? 0,
            assigned: this.assignedIds.has(user.userId),
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
        const d = res?.data ?? [];
        const options = this.mapForDepartment(d);
        this.filterDropdowns = this.filterDropdowns.map((item: any) =>
          item.key === 'roles' ? { ...item, options } : item
        );
      })
      .catch((err: any) => console.error('loadRoles error:', err));
  }

  // ── Request builder ───────────────────────────────────────────────────────

  private buildRequestBody(): object {
    const filters: Record<string, any> = {};

    if (this.departmentIds.length) {
      filters['departmentIds'] = this.departmentIds;
    }

    if (this.selectedRoleIds.length) {
      filters['roleIds'] = this.selectedRoleIds;
    }

    if (this.searchTerm.trim()) {
      filters['search'] = this.searchTerm.trim();
    }

    return {
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: 'id',
      direction: 'DESC',
      filters,
    };
  }

  // ── Filter ────────────────────────────────────────────────────────────────

  onFilterChange(event: any): void {
    this.searchTerm = event.search || '';
    const roleValue = event.filters?.roles;
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

  private updateAssignedSet(recruiter: Recruiter): void {
    if (recruiter.assigned) {
      this.assignedIds.add(recruiter.id);
    } else {
      this.assignedIds.delete(recruiter.id);
    }
  }

  private syncForm(): void {
    // Collect from ALL assigned IDs (cross-page), not just current page
    const allAssigned = this.filteredRecruiters.filter(r => r.assigned);

    const selectedRecruiters = allAssigned.map(r => ({
      userId: r.id,
      email: r.email,
      userName: r.name,
      roleId: String(r.roleId),   // ← actual roleId from API
      roleName: r.role,
    }));

    this.form
      .get('selectedRecruiterDetails')
      ?.setValue(selectedRecruiters);
  }

  get assignedCount(): number {
    return this.assignedIds.size;
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

  /** Called when the "Assign Recruiter" button is clicked (showBackButton mode). */
  async onAssignRecruiters(): Promise<void> {
    if (this.assignedCount === 0 || this.isAssigning) return;

    // Collect currently assigned recruiters from the form
    const selectedRecruiters: any[] =
      this.form?.get('selectedRecruiterDetails')?.value || [];

    if (!selectedRecruiters.length) {
      this.notificationService.error('Please assign at least one recruiter.');
      return;
    }

    // srId and jobId come from the shared signal on JobService
    const signal = this.jobService.jobDetailsBySrIdSignal();
    const srId: string = signal?.srId || '';
    const jobId: number = this.id || signal?.jobId || 0;

    const payload = {
      srId,
      jobId,
      recruiterInfoDtos: selectedRecruiters,
    };

    this.isAssigning = true;
    try {
      const res: any = await this.jobService.updateAssigness(payload);
      if (res?.responsecode === '00') {
        this.notificationService.success('Recruiters assigned successfully.');
        // Clear local selection state after a successful save
        this.assignedIds.clear();
        this.form.get('selectedRecruiterDetails')?.setValue([]);
        this.loadRolesAndUsers();
        this.router.navigateByUrl(`/demand/all-jobs/recruiter-and-response/${this.id}`)
      } else {
        this.notificationService.error(res?.message || 'Failed to assign recruiters.');
      }
    } catch (err: any) {
      console.error('onAssignRecruiters error:', err);
      this.notificationService.error(err?.message || 'Failed to assign recruiters.');
    } finally {
      this.isAssigning = false;
    }
  }
}