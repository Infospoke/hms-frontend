import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { Router } from '@angular/router';
import { CanDirective } from "../../../../shared/directives/can.directive";

export type Priority = 'High' | 'Medium' | 'Low';

export interface InterviewRequest {
  id: string;
  candidate: {
    initials: string;
    name: string;
    code: string;
    avatarClass: string;
  };
  job: {
    title: string;
    department: string;
  };
  round: {
    interviewType: string;
    roundLabel: string;
    roundCount: number;
  };
  priority: Priority;
  requestedOn: {
    date: string;
    time: string;
  };
}
@Component({
  selector: 'app-scheduled-table',
  imports: [
    CommonModule, ReusableTableComponent,
    CanDirective
],
  templateUrl: './interview-scheduled-table.component.html',
  styleUrl: './interview-scheduled-table.component.scss',
})
export class InterviewscheduledTableComponent {

  @Input() payload!: any;
  @Output() pageChange = new EventEmitter<number>();
  private router = inject(Router);
  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', custom: true, width: '180px' },
    { key: 'jobTitle', label: 'Job Title', custom: true, width: '200px' },
    { key: 'round', label: 'Round', custom: true, width: '175px' },
    { key: 'priority', label: 'Priority', custom: true, width: '100px' },
    { key: 'requestedOn', label: 'Requested On', custom: true, width: '140px' },
    { key: 'action', label: 'Action', custom: true, width: '160px', align: 'center' },
  ];

  sortableColumns: string[] = ['candidate', 'jobTitle', 'priority', 'requestedOn'];

  // ── Data ──────────────────────────────────────────────────────────────────
  requests: InterviewRequest[] = [
    {
      id: '1',
      candidate: { initials: 'SP', name: 'Sneha Priya', code: 'NXH-1026', avatarClass: 'av-purple' },
      job: { title: 'Quality Assurance Engineer – L2', department: 'Quality Assurance' },
      round: { interviewType: 'Technical Interview', roundLabel: '1 Round', roundCount: 1 },
      priority: 'High',
      requestedOn: { date: 'May 20, 2025', time: '11:30 AM' },
    },
    {
      id: '2',
      candidate: { initials: 'MT', name: 'Mohit Tiwari', code: 'NXH-1027', avatarClass: 'av-blue' },
      job: { title: 'Backend Developer – L3', department: 'Engineering' },
      round: { interviewType: 'Two Round Interview', roundLabel: '2 Rounds', roundCount: 2 },
      priority: 'High',
      requestedOn: { date: 'May 20, 2025', time: '10:15 AM' },
    },
    {
      id: '3',
      candidate: { initials: 'KB', name: 'Kavya Bansal', code: 'NXH-1028', avatarClass: 'av-green' },
      job: { title: 'Business Analyst – L2', department: 'Product' },
      round: { interviewType: 'One Round Interview', roundLabel: '1 Round', roundCount: 1 },
      priority: 'Medium',
      requestedOn: { date: 'May 19, 2025', time: '04:20 PM' },
    },
    {
      id: '4',
      candidate: { initials: 'AD', name: 'Arjun Desai', code: 'NXH-1029', avatarClass: 'av-amber' },
      job: { title: 'DevOps Engineer – L2', department: 'Engineering' },
      round: { interviewType: 'Technical Interview', roundLabel: '1 Round', roundCount: 1 },
      priority: 'Medium',
      requestedOn: { date: 'May 19, 2025', time: '03:05 PM' },
    },
    {
      id: '5',
      candidate: { initials: 'NR', name: 'Neha Reddy', code: 'NXH-1030', avatarClass: 'av-pink' },
      job: { title: 'UI/UX Designer – L2', department: 'Design' },
      round: { interviewType: 'Two Round Interview', roundLabel: '2 Rounds', roundCount: 2 },
      priority: 'Low',
      requestedOn: { date: 'May 18, 2025', time: '02:45 PM' },
    },
    {
      id: '6',
      candidate: { initials: 'PG', name: 'Prateek Gupta', code: 'NXH-1031', avatarClass: 'av-teal' },
      job: { title: 'Data Analyst – L2', department: 'Analytics' },
      round: { interviewType: 'One Round Interview', roundLabel: '1 Round', roundCount: 1 },
      priority: 'Low',
      requestedOn: { date: 'May 18, 2025', time: '01:15 PM' },
    },
    {
      id: '7',
      candidate: { initials: 'ZS', name: 'Zoya Shaikh', code: 'NXH-1032', avatarClass: 'av-coral' },
      job: { title: 'Technical Writer – L2', department: 'Content' },
      round: { interviewType: 'Technical Interview', roundLabel: '1 Round', roundCount: 1 },
      priority: 'Low',
      requestedOn: { date: 'May 17, 2025', time: '11:50 AM' },
    },
  ];

  // ── Pagination state ───────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  pagedData: InterviewRequest[] = [];

  ngOnInit(): void {
    this.totalItems = this.requests.length;
    this.updatePagedData();
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagedData();
  }

  private updatePagedData(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedData = this.requests.slice(start, start + this.pageSize);
  }

  // ── Sort ───────────────────────────────────────────────────────────────────
  onSortChange(event: { col: string; dir: 'asc' | 'desc' }): void {
    const dir = event.dir === 'asc' ? 1 : -1;
    const priorityOrder: Record<Priority, number> = { High: 1, Medium: 2, Low: 3 };

    this.requests = [...this.requests].sort((a, b) => {
      switch (event.col) {
        case 'candidate': return dir * a.candidate.name.localeCompare(b.candidate.name);
        case 'jobTitle': return dir * a.job.title.localeCompare(b.job.title);
        case 'priority': return dir * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'requestedOn': return dir * a.requestedOn.date.localeCompare(b.requestedOn.date);
        default: return 0;
      }
    });

    this.currentPage = 1;
    this.updatePagedData();
  }

  // ── Row click ──────────────────────────────────────────────────────────────
  onRowClick(row: InterviewRequest): void {
    console.log('Row clicked:', row);
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  scheduleInterview(event: MouseEvent, row: InterviewRequest): void {
    event.stopPropagation();
    console.log('Schedule interview for:', row.candidate.name);
    // e.g. this.router.navigate(['/interviews/schedule'], { queryParams: { candidateId: row.id } });
    this.router.navigateByUrl('/supply/my-interview-requests/schedule-interview')
  }

  toggleExpand(event: MouseEvent, row: InterviewRequest): void {
    event.stopPropagation();
    console.log('Expand row:', row);
  }

  // ── Type cast helper ───────────────────────────────────────────────────────
  asRequest(row: any): InterviewRequest {
    return row as InterviewRequest;
  }
}
