import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { CanDirective } from '../../../../shared/directives/can.directive';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { ApprovalLayoutComponent } from '../../../approvals/components/approval-layout/approval-layout.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { StaffingServiceService } from '../../services/staffing-service.service';
import { approvedSrs } from '../../../../shared/constants/reusbale-filter';
import { ApprovalService } from '../../../approvals/services/approval-service';
import { PermissionService } from '../../../../core/services/permission.service';
import { CommonTableActionsComponent } from '../../../../shared/components/common-table-actions/common-table-actions.component';

// ─── API ───────────────────────────────────────────────────────────────────────
const SR_LIST_URL = 'http://localhost:5005/hms/staffing-requisition/sr-list';

// ─── Step state for the approval stepper ──────────────────────────────────────
export type StepState = 'done' | 'active' | 'submitted' | 'pending' | 'rejected';

export interface ApprovalStep {
  label: string;
  state: StepState;
}

// ─── Row shape ────────────────────────────────────────────────────────────────
export interface SrRow {
  id?: number;
  srId: string | null;
  jobTitle: string;
  department: string;
  requestedBy: string;
  requestedOn: string;
  status: string;
  currentStatus: string;
  pipeline?: string[];
  currentStage?: string;
  [key: string]: unknown;
}



@Component({
  selector: 'app-staffing-requisitions',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    CanDirective,
    HeadingComponent,
    ApprovalLayoutComponent,
    ReusableTableComponent,
    CommonTableActionsComponent
  ],
  templateUrl: './staffing-requisitions.component.html',
  styleUrl: './staffing-requisitions.component.scss',
})
export class StaffingRequisitionsComponent implements OnInit {

  private router = inject(Router);
  private http = inject(HttpClient);
  private staffingService = inject(StaffingServiceService);
  private approvalService = inject(ApprovalService);
  private permissionService = inject(PermissionService);
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  isLoading = false;

 
  private lastFilterPayload: any = { chainName: '', filters: {},dateFilter: '' };

  // ── Column definitions ──────────────────────────────────────────────────────
  columns: TableColumn[] = [
    { key: 'srId', label: 'SR ID', width: '80px', custom: true },
    { key: 'department', label: 'Department', width: '80px', custom: true },
    { key: 'requestedBy', label: 'Requested By', width: '80px', custom: true },
    { key: 'requestedOn', label: 'Requested On', width: '90px', custom: true },
    { key: 'currentStatus', label: 'Pipeline', width: '240px', custom: true, align: 'center' },
    { key: 'status', label: 'Status', width: '90px', custom: true, align: 'center' },
    { key: 'actions', label: 'Actions', width: '70px', align: 'center', custom: true },
  ];

  requisitions: SrRow[] = [];


  activeTab = 'all';

  cards = [
    { label: 'All Requisitions', value: 0, percentage: '', iconClass: 'fa-regular fa-file-lines', iconBgColor: '#eaf2ff', iconColor: '#2563eb' },
    { label: 'Draft', value: 0, percentage: '', iconClass: 'fa-regular fa-file-lines', iconBgColor: '#eaf2ff', iconColor: '#2563eb' },
    { label: 'Pending', value: 0, percentage: '', iconClass: 'fa-regular fa-clock', iconBgColor: '#fff7ed', iconColor: '#f59e0b' },
    { label: 'Approved', value: 0, percentage: '', iconClass: 'fa-solid fa-check', iconBgColor: '#ecfdf5', iconColor: '#22c55e' },
    { label: 'Rejected', value: 0, percentage: '', iconClass: 'fa-solid fa-xmark', iconBgColor: '#fef2f2', iconColor: '#ef4444' },
  ];

  tabs: { key: string; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'draft', label: 'Draft', count: 0 },
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'approved', label: 'Approved', count: 0 },
    { key: 'rejected', label: 'Rejected', count: 0 },
  ];

  dropDownData: any[] = [...approvedSrs.map((d: any) => ({ ...d, options: [...d.options] }))]
  isCreator: boolean = false;

  ngOnInit(): void {
    this.isCreator = this.permissionService.can('DEMAND', "MYJRS", "CREATE");
    if (this.isCreator) {
      this.dropDownData = this.dropDownData.filter(d => d.key !== 'requestedBy');
    }
    Promise.all([this.loadList(), this.loadCounts(), this.loadDepartments(), this.loadRequestedBy()]);
  }
  private loadRequestedBy(): void {
    if (this.isCreator) return;
    this.staffingService.getRequestedBy()
      .then((res: any) => {
        const d = res?.data ?? {};
        const fun = this.map(d);
        this.dropDownData = this.dropDownData.map((item: any) =>
          item.key === 'requestedBy'
            ? { ...item, options: fun ?? [] }
            : item
        );
      })
      .catch((error: any) => {
        console.log("error for a getting the requested By");
      })
  }
  private loadDepartments(): void {
    const payload={
      "srDepartments": true,
    }
    this.approvalService.getDepartmentsByType(payload).then
      ((res: any) => {
        const d = res?.data ?? {};
        const fun = this.mapForDepartment(d);
        this.dropDownData = this.dropDownData.map((item: any) =>
          item.key === 'department'
            ? { ...item, options: fun ?? [] }
            : item
        );
      }).catch((error: any) => {
        console.log(error, "while calling the departments");
      })
  }
  private loadCounts(): void {
    this.staffingService.getMySrsCount()
      .then((res: any) => {
        const d = res?.data;
        const all = d.allRequisitions ?? 0;
        const draft = d.draftCount ?? 0;
        const pending = d.pendingCount ?? 0;
        const approved = d.approvedCount ?? 0;
        const rejected = d.rejectedCount ?? 0;

        this.cards = [
          { label: 'All Requisitions', value: all, percentage: '', iconClass: 'fa-regular fa-file-lines', iconBgColor: '#eaf2ff', iconColor: '#2563eb' },
          { label: 'Draft', value: draft, percentage: all ? ((draft / all) * 100).toFixed(1) + '%' : '', iconClass: 'fa-regular fa-file-lines', iconBgColor: '#eaf2ff', iconColor: '#2563eb' },
          { label: 'Pending', value: pending, percentage: all ? ((pending / all) * 100).toFixed(1) + '%' : '', iconClass: 'fa-regular fa-clock', iconBgColor: '#fff7ed', iconColor: '#f59e0b' },
          { label: 'Approved', value: approved, percentage: all ? ((approved / all) * 100).toFixed(1) + '%' : '', iconClass: 'fa-solid fa-check', iconBgColor: '#ecfdf5', iconColor: '#22c55e' },
          { label: 'Rejected', value: rejected, percentage: all ? ((rejected / all) * 100).toFixed(1) + '%' : '', iconClass: 'fa-solid fa-xmark', iconBgColor: '#fef2f2', iconColor: '#ef4444' },
        ];
      })
      .catch((error: any) => {
        console.log("error for a srs count", error);
      })
  }
  // ── API call ─────────────────────────────────────────────────────────────────
  private loadList(): void {
    this.isLoading = true;
    const body = this.buildRequestBody();
    this.staffingService.getAllSRS(body).then((res: any) => {
      const data = res?.data;
      if (!data) { this.isLoading = false; return; }

      // Map response rows → SrRow
      this.requisitions = (data.content ?? []).map((item: any): SrRow => ({
        id: item.id,
        srId: item.srId,
        jobTitle: item.jobTitle,
        department: item.departmentName,
        requestedBy: item.requestedBy,
        requestedOn: item.requestedOn,
        status: item.status,
        currentStatus: item.status,
        pipeline: item.pipeline ?? [],
        currentStage: item.currentStage,
      }));

      this.totalElements = data.totalElements ?? 0;

      // Update summary cards
      const all = data.allRequisitions ?? 0;
      const approved = data.approvedCount ?? 0;
      const rejected = data.rejectedCount ?? 0;
      const pending = data.pendingCount ?? 0;
      const draft = data.draftCount ?? 0;



      this.tabs = [
        { key: 'all', label: 'All', count: all },
        { key: 'draft', label: 'Draft', count: draft },
        { key: 'pending', label: 'Pending', count: pending },
        { key: 'approved', label: 'Approved', count: approved },
        { key: 'rejected', label: 'Rejected', count: rejected },
      ];

      this.isLoading = false;
    })
      .catch((error: any) => {
        console.error('Failed to load SR list:', error);
        this.isLoading = false;
      })

  }


  private buildRequestBody(): object {
    const f = this.lastFilterPayload;
    console.log(f);
    const filters: Record<string, string> = {};

    // ── Search → jobTitle ───────────────────────────────────────────────────
    if (f.chainName?.trim()) {
      filters['jobTitle'] = f.chainName.trim();
    }

    // ── Dropdown: department → departmentId ─────────────────────────────────
    const dept = f?.['department'];
    if (dept) {
      filters['departmentId'] = dept;
    }

    // ── Dropdown: requestedBy → requestedBy ─────────────────────────────────
    const reqBy = f?.['requestedBy'];
    if (reqBy) {
      filters['requestedBy'] = reqBy;
    }


    const dateFilter = f?.['dateFilter'];
    if (dateFilter && dateFilter !== 'CUSTOM') {
      // const { from, to } = this.resolveDatePreset(dateFilter);
      // if (from) filters['fromDate'] = from;
      // if (to) filters['toDate'] = to;
      filters['dateFilter'] = dateFilter;
    } else if (dateFilter === 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate) filters['toDate'] = f.toDate;
    }

    // ── Active tab → status filter ──────────────────────────────────────────
    // if (this.activeTab && this.activeTab !== 'all') {
    //   filters['status'] = this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1);
    // }

    return {
      page: this.currentPage - 1,   // API is 0-based
      size: this.pageSize,
      sortBy: 'createdOn',
      status:this.activeTab !== 'all'? this.activeTab : '',
      direction: 'DESC',
      filters,
    };
  }





  // ── Pagination ───────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadList();
  }


  filtersResponse(event: any): void {
    this.lastFilterPayload = event;
    this.currentPage = 1;
    this.loadList();
  }

  // ── Tab handler ──────────────────────────────────────────────────────────────
  setTab(key: string): void {
    this.activeTab = key;
    this.currentPage = 1;
    this.loadList();
  }
  private mapForDepartment(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.id,
        label: item.departmentName,
      }))
    ];
  }
  private map(data: any) {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({
        value: item.name,
        label: item.name,
      }))
    ];
  }
  // ── Row actions ──────────────────────────────────────────────────────────────
  viewSR(row: unknown): void {
    const sr = row as SrRow;
    if (!sr?.srId || sr.srId === 'Draft') return;
    this.router.navigateByUrl(`/demand/my-jds/view-sr/${sr?.srId}`, {
      state: { srId: sr.srId, url: '/demand/my-jds', type: 'view' },
    })
  }

  editSR(row: unknown): void {
    const sr = row as SrRow;
    if (!sr?.srId) return;
    this.router.navigate(['/demand/my-jds/create'], { queryParams: { id: sr.srId, type: 'edit' } });
  }

  newSR(): void {
    this.router.navigateByUrl('/demand/my-jds/create?step=0');
  }

  // ── Stepper helper ────────────────────────────────────────────────────────────
  /**
   * Builds approval steps from the row's `pipeline` array + `status`.
   * Falls back to the 4-step hardcoded flow when `pipeline` is absent.
   */
  getSteps(row: SrRow): ApprovalStep[] {
    const status = (row.currentStatus ?? '').toLowerCase();
    const pipeline = row.pipeline?.length ? row.pipeline : ['Draft', 'HR Review', 'Finance Review', 'Final Approval'];

    // Build step states based on currentStage + status
    const currentStage = row.currentStage ?? '';
    let reachedCurrent = false;

    return pipeline.map((label, i) => {
      let state: StepState;

      if (status === 'approved') {
        state = 'done';
      } else if (status === 'rejected') {
        // Everything up to currentStage is done; currentStage is rejected; rest pending
        if (label === currentStage) {
          state = 'rejected';
          reachedCurrent = true;
        } else if (!reachedCurrent) {
          state = i === 0 ? 'done' : 'done';
        } else {
          state = 'pending';
        }
      } else if (status === 'draft') {
        state = i === 0 ? 'done' : 'pending';
      } else if (status === 'submitted') {
        state = i < pipeline.length - 1 ? 'done' : 'submitted';
      } else {
        // pending / active
        if (label === currentStage) {
          state = 'active';
          reachedCurrent = true;
        } else if (!reachedCurrent) {
          state = 'done';
        } else {
          state = 'pending';
        }
      }

      return { label, state };
    });
  }

  // ── Status badge class ────────────────────────────────────────────────────────
  badgeClass(status: string): string {
    const map: Record<string, string> = {
      approved: 'rt-badge--approved',
      pending: 'rt-badge--pending',
      submitted: 'rt-badge--submitted',
      draft: 'rt-badge--draft',
      rejected: 'rt-badge--rejected',
    };
    return map[(status ?? '').toLowerCase()] ?? 'rt-badge--draft';
  }

  // ── Avatar helpers ─────────────────────────────────────────────────────────
  initials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0]?.toUpperCase() ?? '')
      .join('');
  }

  avatarColor(name: string): string {
    const palette = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
    if (!name) return palette[0];
    const idx = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % palette.length;
    return palette[idx];
  }

  // ── Date / time formatters ────────────────────────────────────────────────
  formatDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  truncate(value: string, limit = 10): string {
    if (!value || value === '—') return value;
    return value.length > limit ? value.slice(0, limit) + '..' : value;
  }
}