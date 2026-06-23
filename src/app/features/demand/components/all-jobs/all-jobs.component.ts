
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { ApprovalLayoutComponent } from "../../../approvals/components/approval-layout/approval-layout.component";
import { statusOptionsForDepartment } from '../../../../shared/constants/reusbale-filter';
import { ReusableTableComponent } from "../../../../shared/components/reusable-table/reusable-table.component";
import { CommonModule } from '@angular/common';
import { ApprovalService } from '../../../approvals/services/approval-service';
import { StaffingServiceService } from '../../services/staffing-service.service';
import { CanDirective } from "../../../../shared/directives/can.directive";
import { Router } from '@angular/router';
import { filter } from 'rxjs';

const JOB_ICON_MAP: Array<{
  keywords: string[];
  icon: string;
  iconBg: string;
  iconColor: string;
}> = [

    { keywords: ['java', 'backend', 'spring', 'node', 'api'], icon: 'code', iconBg: '#e8f0fe', iconColor: '#1a73e8' },
    { keywords: ['frontend', 'react', 'angular', 'vue', 'ui dev'], icon: 'web', iconBg: '#e8f0fe', iconColor: '#1a73e8' },
    { keywords: ['fullstack', 'full stack', 'full-stack'], icon: 'integration_instructions', iconBg: '#e8f0fe', iconColor: '#1a73e8' },
    { keywords: ['devops', 'cloud', 'infra', 'sre', 'platform'], icon: 'cloud', iconBg: '#e6f4ea', iconColor: '#34a853' },
    { keywords: ['mobile', 'ios', 'android', 'flutter', 'react native'], icon: 'smartphone', iconBg: '#e8f0fe', iconColor: '#1a73e8' },
    { keywords: ['security', 'cyber', 'soc', 'pentest'], icon: 'security', iconBg: '#e6f4ea', iconColor: '#34a853' },
    { keywords: ['ml', 'machine learning', 'ai ', 'nlp', 'deep learning'], icon: 'psychology', iconBg: '#f3e8fd', iconColor: '#9c27b0' },
    { keywords: ['data engineer', 'etl', 'pipeline', 'spark'], icon: 'hub', iconBg: '#f3e8fd', iconColor: '#9c27b0' },
    { keywords: ['data analyst', 'analytics', 'bi ', 'tableau', 'power bi'], icon: 'bar_chart', iconBg: '#f3e8fd', iconColor: '#9c27b0' },
    { keywords: ['data scientist', 'data science'], icon: 'insights', iconBg: '#f3e8fd', iconColor: '#9c27b0' },
    { keywords: ['database', 'dba', 'sql', 'postgres', 'oracle'], icon: 'storage', iconBg: '#e6f4ea', iconColor: '#34a853' },
    { keywords: ['qa', 'quality', 'test', 'sdet', 'automation'], icon: 'bug_report', iconBg: '#fce8e6', iconColor: '#ea4335' },
    { keywords: ['architect', 'solution'], icon: 'architecture', iconBg: '#e8f0fe', iconColor: '#1a73e8' },
    { keywords: ['embedded', 'firmware', 'hardware', 'iot'], icon: 'memory', iconBg: '#e6f4ea', iconColor: '#34a853' },
    { keywords: ['network', 'cisco', 'telecom'], icon: 'router', iconBg: '#e6f4ea', iconColor: '#34a853' },

    { keywords: ['ui/ux', 'ux', 'designer', 'figma', 'design'], icon: 'palette', iconBg: '#fef3e2', iconColor: '#f9ab00' },
    { keywords: ['content', 'copywriter', 'writer', 'editor'], icon: 'edit_note', iconBg: '#fef3e2', iconColor: '#f9ab00' },
    { keywords: ['brand', 'graphic', 'creative'], icon: 'brush', iconBg: '#fef3e2', iconColor: '#f9ab00' },
    { keywords: ['video', 'motion', 'animator'], icon: 'videocam', iconBg: '#fef3e2', iconColor: '#f9ab00' },

    { keywords: ['product manager', 'product owner', 'po '], icon: 'manage_accounts', iconBg: '#e6f4ea', iconColor: '#34a853' },
    { keywords: ['business analyst', 'business analysis'], icon: 'analytics', iconBg: '#e8f0fe', iconColor: '#1a73e8' },
    { keywords: ['scrum', 'agile', 'project manager', 'pmo'], icon: 'view_kanban', iconBg: '#e8f0fe', iconColor: '#1a73e8' },
    { keywords: ['strategy', 'consultant', 'consulting'], icon: 'lightbulb', iconBg: '#fef3e2', iconColor: '#f9ab00' },
    { keywords: ['operations', 'ops', 'recruiting operations'], icon: 'settings', iconBg: '#e6f4ea', iconColor: '#34a853' },

    { keywords: ['finance', 'accountant', 'accounting', 'cfo'], icon: 'account_balance', iconBg: '#e8f0fe', iconColor: '#1a73e8' },
    { keywords: ['legal', 'lawyer', 'compliance', 'counsel'], icon: 'gavel', iconBg: '#fce8e6', iconColor: '#ea4335' },
    { keywords: ['audit', 'risk', 'governance'], icon: 'policy', iconBg: '#fce8e6', iconColor: '#ea4335' },


    { keywords: ['hr', 'human resource', 'recruiter', 'talent', 'people ops'], icon: 'people', iconBg: '#fce8e6', iconColor: '#ea4335' },
    { keywords: ['payroll', 'compensation', 'benefits'], icon: 'payments', iconBg: '#fce8e6', iconColor: '#ea4335' },
    { keywords: ['learning', 'training', 'l&d', 'enablement'], icon: 'school', iconBg: '#fef3e2', iconColor: '#f9ab00' },

    // Sales / Marketing / Support
    { keywords: ['sales', 'account executive', 'ae ', 'bdr', 'sdr'], icon: 'trending_up', iconBg: '#e6f4ea', iconColor: '#34a853' },
    { keywords: ['marketing', 'seo', 'growth', 'demand gen'], icon: 'campaign', iconBg: '#fef3e2', iconColor: '#f9ab00' },
    { keywords: ['customer success', 'csm', 'support', 'service desk'], icon: 'support_agent', iconBg: '#e8f0fe', iconColor: '#1a73e8' },

    // Default fallback
    { keywords: [''], icon: 'work', iconBg: '#f1f3f4', iconColor: '#5f6368' },
  ];

/** Pick the best icon config for a given job title + department string */
export function resolveJobIcon(jobTitle: string, departmentName: string): { icon: string; iconBg: string; iconColor: string } {
  const haystack = `${jobTitle} ${departmentName}`.toLowerCase();
  for (const entry of JOB_ICON_MAP) {
    if (entry.keywords.some(kw => kw && haystack.includes(kw.toLowerCase()))) {
      return { icon: entry.icon, iconBg: entry.iconBg, iconColor: entry.iconColor };
    }
  }

  return { icon: 'work', iconBg: '#f1f3f4', iconColor: '#5f6368' };
}

@Component({
  selector: 'app-all-jobs',
  imports: [ApprovalLayoutComponent, ReusableTableComponent, CommonModule, CanDirective],
  templateUrl: './all-jobs.component.html',
  styleUrl: './all-jobs.component.scss',
})
export class AllJobsComponent implements OnInit {

  cards: any[] = [];
  dropDownData = statusOptionsForDepartment;
  currentPage = 1;
  activeFilters: any = { chainName: '', filters: {}, dateFilter: 'thisMonth' };
  columnGroups: any[] = [
    { label: '', colspan: 4, blankGroup: true },
    { label: 'Assignee Responses', colspan: 3 }, 
    { label: '', colspan: 1, blankGroup: true },
  ];
  ableColumns: any[] = [
    { key: 'jobDetails', label: 'Job Details', custom: true, width: '200px' },
    { key: 'department', label: 'Department', custom: true, width: '140px' },
    { key: 'targetStartDate', label: 'Target Start Date', width: '150px' },
    { key: 'assignees', label: 'Assignees', custom: true, width: '120px', align: 'center' },
    { key: 'accepted', label: 'Accepted', custom: true, width: '50px', align: 'center', group: 'Assignee Responses' },
    { key: 'pending', label: 'Pending', custom: true, width: '50px', align: 'center', group: 'Assignee Responses' },
    { key: 'declined', label: 'Declined', custom: true, width: '50px', align: 'center', group: 'Assignee Responses' },
    { key: 'action', label: 'Action', custom: true, width: '120px', align: 'center' ,},
  ];

  filteredData: any[] = [];
  pagedData: any[] = [];
  totalItems = 0;
  pageSize = 10;
  isLoading = false;
  private router = inject(Router);
  private approvalService = inject(ApprovalService);
  private staffingService = inject(StaffingServiceService);

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    Promise.all([this.loadCards(), this.loadList(), this.loadDepartments()]);
  }

  private loadDepartments(): void {
    this.approvalService.departments()
      .then((res: any) => {
        const d = res?.data ?? [];
        this.dropDownData = this.dropDownData.map((item: any) =>
          item.key === 'department'
            ? { ...item, options: this.mapForDepartment(d) }
            : item
        );
      })
      .catch((err: any) => console.error('departments error', err));
  }

  private loadCards(): void {
    this.staffingService.getRecruiterCount()
      .then((res: any) => {
        if (res?.responsecode !== '00') return;
        const c = res.data;
        this.cards = [
          { label: 'Total Jobs', subLabel: 'All time', value: c?.totalJobs, iconClass: 'fa-solid fa-briefcase', iconBgColor: '#eaf2ff', iconColor: '#2563eb' },
          { label: 'Total Assignees', subLabel: 'Across all jobs', value: c?.totalAssignees, iconClass: 'fa-solid fa-users', iconBgColor: '#f3e8ff', iconColor: '#9333ea' },
          { label: 'Accepted', subLabel: 'Assignee', value: c?.acceptedCount, iconClass: 'fa-regular fa-circle-check', iconBgColor: '#ecfdf5', iconColor: '#22c55e' },
          { label: 'Declined', subLabel: 'Assignee', value: c?.declinedCount, iconClass: 'fa-regular fa-circle-xmark', iconBgColor: '#fef2f2', iconColor: '#ef4444' },
          { label: 'Pending Response', subLabel: 'Assignee', value: c?.pendingCount, iconClass: 'fa-regular fa-clock', iconBgColor: '#fff7ed', iconColor: '#f59e0b' },
        ];
        this.cdr.markForCheck();
      })
      .catch((err: any) => console.error('cards error', err));
  }

  private loadList(): void {
    this.isLoading = true;
    const body = this.buildRequestBody();

    this.staffingService.getRecruiterList(body)
      .then((res: any) => {
        if (res?.responsecode !== '00') return;

        const payload = res.data;                        // { content, currentPage, totalPages, totalElements }
        this.totalItems = payload?.totalElements ?? 0;

        // ── Map API rows → table rows ──────────────────────────────────────
        this.filteredData = (payload?.content ?? []).map((item: any) => {
          const iconCfg = resolveJobIcon(item.jobTitle ?? '', item.departmentName ?? '');
          return {
            // identity
            id: item.jobId,
            srId: item?.srId,
            // jobDetails column (custom cell uses these)
            title: item.jobTitle,
            code: item.jobCode,
            workMode: item.workMode,
            employmentType: item.employmentType,
            location: item.location,
            ...iconCfg,                   // icon, iconBg, iconColor

            // plain columns
            department: item.departmentName,
            targetStartDate: this.formatDate(item.targetStartDate),

            // numeric badge columns
            assignees: item.assignees ?? 0,
            accepted: item.acceptedCount ?? 0,
            pending: item.pendingCount ?? 0,
            declined: item.declinedCount ?? 0,
          };
        });

        this.cdr.markForCheck();
      })
      .catch((err: any) => console.error('list error', err))
      .finally(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadList();          // re-fetch for the new page
    this.cdr.markForCheck();
  }

  onFilterChange(filters: any): void {
    console.log("filter", filter);
    this.activeFilters = filters;
    this.currentPage = 1;   // reset to page 1 on filter change
    this.loadList();
  }
  private formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private buildRequestBody(): object {
    const f = this.activeFilters;
    const filters: Record<string, string> = {};

    if (f?.chainName?.trim()) filters['search'] = f.chainName.trim();
    if (f?.['department']) filters['departmentId'] = f['department'];
    if (f?.['requestedBy']) filters['requestedBy'] = f['requestedBy'];

    const dateFilter = f?.['dateFilter'];
    if (dateFilter && dateFilter !== 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
    } else if (dateFilter === 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate) filters['toDate'] = f.toDate;
    }

    return {
      page: this.currentPage - 1,   // API is 0-indexed
      size: this.pageSize,
      sortBy: 'jobId',
      direction: 'DESC',
      filters,
    };
  }

  private mapForDepartment(data: any[]): any[] {
    return [
      { value: '', label: 'All' },
      ...data.map((item: any) => ({ value: item.id, label: item.name })),
    ];
  }

  viewDetails(row: any) {
    console.log(row);
    this.router.navigateByUrl(`/demand/recruiter-assignment-management/recruiter-and-response/${row?.id}/${row?.srId}`, {
      state: { id: row?.id, srId: row?.srId }
    })
  }

  viewUsersList(row: any) {
    this.router.navigateByUrl(`/demand/recruiter-assignment-management/view-assignes`, { state: { id: row?.id, } })
  }
}