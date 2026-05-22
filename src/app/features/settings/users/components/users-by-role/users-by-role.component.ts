import {
  Component,
  inject,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../../shared/components/reusable-table/reusable-table.component';
import { UserService } from '../../servics/user-service';

import { getInitials } from '../../../../../shared/validations/validators';
import { Router } from '@angular/router';
import { HeadingComponent } from '../../../../../shared/components/heading/heading.component';
import { StaffingServiceService } from '../../../../demand/services/staffing-service.service';

export interface UserRow {
  initials: string;
  avatarColor: string;
  name: string;
  email: string;
  role?: string; // only populated in assignment-list mode
}

const AVATAR_COLORS = ['blue', 'green', 'teal', 'yellow', 'pink', 'orange', 'purple', 'red'];
const ROLE_PAGE: any = {
  heading:      'Users for Role',
  subHeading:   'View all users assigned to this specific role in the system.',
  backButtonUrl: '/users/role-permissions',
  backText:      'Back to Roles',
};
 
const ASSIGNEE_PAGE: any = {
  heading:      'View Assignees',
  subHeading:   'View all assignees linked to this record.',
  backButtonUrl: '/staffing/assignments',   // ← adjust to your actual route
  backText:      'Back to Assignments',
};

function splitDateTime(dateTimeStr: string | null | undefined): { date: string; time: string } {
  if (!dateTimeStr) return { date: '—', time: '—' };
  const [date = '—', time = '—'] = dateTimeStr.split('T');
  return { date, time };
}

function normaliseStatus(raw: string | null | undefined): string {
  if (!raw) return '—';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

// ──────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-users-by-role',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, HeadingComponent],
  templateUrl: './users-by-role.component.html',
  styleUrls: ['./users-by-role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersByRoleComponent implements OnInit, OnChanges {

  // ── state passed via router navigation ──────────────────────────────────────
  roleId: any;  // present  → role-based API,  hide Role Name column
  id: any;      // present  → assignment-list API, show Role Name column

  // ── services ────────────────────────────────────────────────────────────────
  private roleService = inject(UserService);
  private staffingService = inject(StaffingServiceService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private location = inject(Location);
  // ── table / pagination ──────────────────────────────────────────────────────
  isLoading = false;
  allRows: UserRow[] = [];
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;

  // ── heading ─────────────────────────────────────────────────────────────────
  backButtonUrl = '/users/role-permissions';
  backText = 'Back to Roles';
  heading       = '';
  subHeading    = '';
  // ── columns (role column toggled at runtime) ─────────────────────────────────
  private readonly BASE_COLUMNS: TableColumn[] = [
    { key: 'name', label: 'User Name', width: 'auto', custom: true },
    { key: 'email', label: 'Email Id', width: '300px', custom: true, hideOnMobile: true },
  ];

  private readonly ROLE_COLUMN: TableColumn =
    { key: 'role', label: 'Role Name', width: '300px', custom: true, hideOnMobile: true };

  columns: TableColumn[] = [...this.BASE_COLUMNS];

  // ── lifecycle ────────────────────────────────────────────────────────────────

   ngOnInit(): void {
    const nav   = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state;
 
    this.roleId = state?.roleId;
    this.id     = state?.id;
 
    this.applyPageConfig();
    this.applyColumns();
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['roleId'] && !changes['roleId'].firstChange) ||
      (changes['id']     && !changes['id'].firstChange)
    ) {
      this.currentPage = 1;
      this.applyPageConfig();
      this.applyColumns();
      this.load();
    }
  }
 private applyPageConfig(): void {
    const cfg = this.roleId ? ROLE_PAGE : ASSIGNEE_PAGE;
    this.heading       = cfg.heading;
    this.subHeading    = cfg.subHeading;
    this.backButtonUrl = cfg.backButtonUrl;
    this.backText      = cfg.backText;
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.load();
  }

  // ── private helpers ──────────────────────────────────────────────────────────

  /** Show Role Name column only when using the assignment-list path (no roleId). */
  private applyColumns(): void {
    this.columns = this.roleId
      ? [...this.BASE_COLUMNS]
      : [...this.BASE_COLUMNS, this.ROLE_COLUMN];
  }

  private load(): void {
    this.roleId ? this.loadUsersByRole() : this.loadUsersByAssignment();
  }

  // ── path 1: roleId present → getUsersByRoleId ────────────────────────────────
  private async loadUsersByRole(): Promise<void> {
    if (!this.roleId) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const payload = {
        page: this.currentPage - 1,
        size: this.pageSize,
        sortBy: 'userId',
        direction: 'ASC',
      };

      const res: any = await this.roleService.getUsersByRoleId(this.roleId, payload);

      if (res?.responsecode === '00') {
        const content: any[] = res?.data?.content ?? [];
        this.totalItems = res?.data?.totalItems ?? 0;

        this.allRows = content.map((u: any, idx: number) => ({
          initials: getInitials(u.username ?? u.name ?? '?'),
          avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          name: u.username ?? u.name ?? '—',
          email: u.email ?? '—',
        }));
      }
    } catch (err) {
      console.error('loadUsersByRole error:', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  // ── path 2: no roleId → getAssignmentListById ────────────────────────────────
  private loadUsersByAssignment(): void {
    if (!this.id) return;

    this.isLoading = true;
    this.cdr.markForCheck();
    const payload = {
        page: this.currentPage - 1,
        size: this.pageSize,
        sortBy: 'id',
        direction: 'ASC',
      };
    this.staffingService
      .getAssignmentListById(this.id,payload)
      .then((res: any) => {
        if (res?.responsecode !== '00') return;

        const data = res.data;
        const recruiters: any[] = data?.content ?? [];

        this.allRows = recruiters.map((r: any, idx: number) => {
          const assigned = splitDateTime(r.assignedOn);
          const responded = splitDateTime(r.respondedOn);

          return {
            initials: getInitials(r.recruiterName ?? '?'),
            avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
            name: r.recruiterName ?? '—',
            email: r.email ?? '—',
            role: r.role ?? '—',
            // extra fields retained on the row if needed by other templates
            assignedDate: assigned.date,
            assignedTime: assigned.time,
            status: normaliseStatus(r.status),
            respondedDate: responded.date,
            respondedTime: responded.time,
            comments: r.comments ?? '',
          } as UserRow & Record<string, any>;
        });

        this.totalItems =data?.totalElements;
      })
      .catch((err: any) => console.error('loadUsersByAssignment error:', err))
      .finally(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }
  goToBack(){
    this.location.back();
  }
}