import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TableColumn, ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CommonModule } from '@angular/common';
import { OnChangeType } from 'ng-zorro-antd/core/types';
import { InterviewServiceService } from '../../service/interview-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interview-schedule-ai-table',
  imports: [ReusableTableComponent, CommonModule],
  templateUrl: './interview-schedule-ai-table.component.html',
  styleUrl: './interview-schedule-ai-table.component.scss',
})
export class InterviewScheduleAiTableComponent implements OnInit, OnChanges {

  @Input() activeFilters: any;
  tableColumns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', width: '210px', custom: true },
    { key: 'jobTitle', label: 'Job Title', width: '160px' },
    { key: 'interviewPlan', label: 'Interview Plan', width: '220px' },
    { key: 'priority', label: 'Priority', width: '110px', custom: true, align: 'center' },
    { key: 'dueDate', label: 'Due Date', width: '130px', custom: true, align: 'center' },
    { key: 'actions', label: 'Actions', width: '140px', custom: true, align: 'center' },
  ];

  // ── Table rows ─────────────────────────────────────────────────────────────
  tableData: any[] = [];
  pageSize: any = 10;
  currentPage: any = 1;
  totalElements: any;
  totalCandidates = 26;
  private interviewService = inject(InterviewServiceService);
  private router = inject(Router);
  ngOnInit(): void {
    this.loadData();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['activeFilters'] &&
      !changes['activeFilters'].firstChange
    ) {
      this.loadData();
    }
  }

  private async loadData() {
    const obj: any = this.buildRequestBody();
    const res: any = await this.interviewService.getAiInterviewZoneScheduleAIInterview(obj);
    if (res?.responsecode == '00') {
      this.tableData = this.mapResponse(res?.data?.content);
      this.totalElements = res?.data.totalElements;
    }
  }
  private mapResponse(data: any[]) {
    return data.map((item: any) => ({
      applicationId: item.applicationId,

      // Avatar
      initials: this.getInitials(item.candidateName),
      initialsColor: this.getAvatarColor(item.candidateName),

      // Candidate Info
      name: item.candidateName,
      email: item.email,

      // Table Columns
      jobTitle: item.jobTitle || '-',
      interviewPlan: item.interviewPlan || '-',
      priority: item.priority || '-',
      priorityType: item.priority?.toLowerCase(),
      dueDate: item.dueDate,
      lastUpdatedDate: new Date(item.dueDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),

      lastUpdatedTime: new Date(item.dueDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
    }));
  }
  onRowClick(row: any): void {
    console.log('Row clicked:', row);
  }

  

  onSchedule(row: any, event: MouseEvent): void {
    event.stopPropagation();
    console.log('Schedule clicked for:', row.name);
    this.router.navigate([`/supply/ai-interview-zone/schedule-ai-interview/${row?.applicationId}`])
  }

  private getInitials(name: string): string {
    if (!name) return '';

    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  private getAvatarColor(name: string): string {
    const colors = [
      '#6ab0f5',
      '#7c6fcd',
      '#e07b54',
      '#5bbf8a',
      '#d4a017',
      '#4a90d9',
      '#e05c7a',
      '#8e6bbf'
    ];

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  private buildRequestBody(): object {
    const f = this.activeFilters;
    const filters: Record<string, string> = {};

    if (f.chainName?.trim()) {
      filters['search'] = f.chainName.trim();
    }

    const dept = f?.['department'];
    if (dept) {
      filters['departmentId'] = dept;
    }
    const allJobs = f?.['allJobs'];
    if (allJobs) {
      filters['jobTitle'] = allJobs;
    }
    const reqBy = f?.['requestedBy'];
    if (reqBy) {
      filters['requestedBy'] = reqBy;
    }
    const questionStatus = f?.['questionStatus'];
    if (questionStatus) {
      filters['questionStatus'] = questionStatus;
    }


    const dateFilter = f?.['dateFilter'];
    if (dateFilter && dateFilter !== 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
    } else if (dateFilter === 'CUSTOM') {
      filters['dateFilter'] = dateFilter;
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate) filters['toDate'] = f.toDate;
    }



    return {
      page: this.currentPage - 1,   // API is 0-based
      size: this.pageSize,
      sortBy: 'moveToScheduleDateTime',
      direction: 'DESC',
      filters,
    };
  }

  pageChange(data: any) {
    this.currentPage = data;
    this.loadData();
  }
}
