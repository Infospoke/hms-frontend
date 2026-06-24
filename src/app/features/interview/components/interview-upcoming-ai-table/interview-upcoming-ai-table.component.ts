import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { CommonModule } from '@angular/common';
import { InterviewServiceService } from '../../service/interview-service.service';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interview-upcoming-ai-table',
  standalone: true,
  imports: [ReusableTableComponent, CommonModule],
  templateUrl: './interview-upcoming-ai-table.component.html',
  styleUrl: './interview-upcoming-ai-table.component.scss',
})
export class InterviewUpcomingAiTableComponent implements OnChanges, OnInit {

  @Input() activeFilters: any = {};

  private interviewService = inject(InterviewServiceService);

  tableColumns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', width: '210px', custom: true },
    { key: 'jobTitle', label: 'Job Title', width: '170px' },
    { key: 'scheduledAt', label: 'Scheduled At', width: '160px', custom: true },
    { key: 'scheduledBy', label: 'Scheduled By', width: '220px', custom: true },
    { key: 'status', label: 'Status', width: '130px', custom: true },
    { key: 'actions', label: 'Actions', width: '130px', custom: true, align: 'center' },
  ];

  tableData: any[] = [];
  currentPage: any = 1;
  pageSize: any = 10;
  totalElements: any = 0;
  isLoading = false;
  private router = inject(Router);
  sortableColumns: string[] = ['candidateName', 'jobTitle', 'scheduledAt'];

  ngOnInit(): void {
    // this.loadData();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeFilters']) {
      this.currentPage = 1;
      this.loadData();
    }
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      const res: any = await this.interviewService.getUpcommingAIInterviewList(this.buildRequestBody());
      if (res?.responsecode === '00') {
        const content = res.data?.content ?? [];
        this.tableData = content.map((item: any) => {
          const { date, time } = this.parseScheduledAt(item.scheduledAt);
          const scheduledByType = item.scheduledBy ? 'recruiter' : 'self';
          const scheduledByLabel = item.scheduledBy ?? 'Self Scheduled';
          return {
            sessionId: item.sessionId,
            jobId: item.jobId,
            applicationId: item?.applicationId,
            // candidate cell
            name: item.candidateName,
            email: item.email,
            initials: this.getInitials(item.candidateName),
            initialsColor: this.getAvatarColor(item.candidateName),
            // rest
            jobTitle: item.jobTitle ?? '—',
            scheduledAt: item.scheduledAt,
            scheduledDate: date,
            scheduledTime: time,
            scheduledByType,
            scheduledByLabel,
            status: item.status,
            statusLabel: this.formatStatus(item.status),
          };
        });
        this.totalElements = res.data?.totalElements ?? 0;
      }
    } catch (err) {
      console.error('Failed to load upcoming interviews', err);
    } finally {
      this.isLoading = false;
    }
  }

  private buildRequestBody(): object {
    console.log(this.activeFilters);
    const f = this.activeFilters;
    const filters: Record<string, string> = {};

    if (f?.search?.trim()) filters['search'] = f.search.trim();
    if (f?.chainName?.trim()) filters['search'] = f.chainName.trim();
    if (f?.allJobs) filters['jobTitle'] = f.allJobs;

    const dateFilter = f?.filters?.['dateFilter'] || f?.dateFilter;
    if (dateFilter && dateFilter !== 'custom') {
      filters['dateFilter'] = dateFilter.toUpperCase(); // ✅ API expects THISMONTH, TODAY etc
    } else if (dateFilter === 'custom') {
      filters['dateFilter'] = 'CUSTOM';
      if (f.fromDate) filters['fromDate'] = f.fromDate;
      if (f.toDate) filters['toDate'] = f.toDate;
    }

    const allJobs = f?.['allJobs'];
    if (allJobs) {
      filters['jobTitle'] = allJobs;
    }

    const questionStatus = f?.['questionStatus'];
    if (questionStatus) {
      filters['questionStatus'] = questionStatus;
    }

    return {
      page: this.currentPage - 1,  // ✅ API is 0-based
      size: this.pageSize,
      sortBy: 'createdDate',
      direction: 'DESC',
      filters,
    };
  }

  pageChange(page: any): void {
    this.currentPage = page;
    this.loadData();
  }

  onRowClick(row: any): void {
    console.log('Row clicked:', row);
  }

  onSortChange(event: { col: string; dir: 'asc' | 'desc' }): void {
    console.log('Sort changed:', event);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private parseScheduledAt(raw: string): { date: string; time: string } {
    if (!raw) return { date: '—', time: '' };
    const d = new Date(raw);
    if (isNaN(d.getTime())) return { date: raw, time: '' };
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  }

  private formatStatus(status: string): string {
    const map: Record<string, string> = {
      completed: 'Completed',
      did_not_attend: 'Did Not Attend',
      upcoming: 'Upcoming',
      in_progress: 'In Progress',
    };
    return map[status] ?? status;
  }

  private getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
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
  onViewDetails(row: any, data: any) {
    console.log(row, data);
    // this.router.navigateByUrl(`/interview/ai-interview-zone/ai-interview-details/`)
    this.router.navigate([`/supply/ai-interview-zone/ai-interview-details/${row?.applicationId}`], {
    })
  }
}