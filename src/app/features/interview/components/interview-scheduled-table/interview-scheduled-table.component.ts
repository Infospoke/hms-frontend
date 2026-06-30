import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { Router } from '@angular/router';
import { CanDirective } from "../../../../shared/directives/can.directive";
import { InterviewServiceService } from '../../service/interview-service.service';

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
export class InterviewscheduledTableComponent implements OnInit, OnChanges {

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
  requests: any[] = [];
  private interviewService = inject(InterviewServiceService)
  // ── Pagination state ───────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  pagedData: InterviewRequest[] = [];

  ngOnInit(): void {
    // this.loadDataOfInterviewList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payload']) {
      this.loadDataOfInterviewList();
    }
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

  scheduleInterview(event: MouseEvent, row: InterviewRequest): void {
    event.stopPropagation();
    console.log('Schedule interview for:', row.candidate.name);
    // e.g. this.router.navigate(['/interviews/schedule'], { queryParams: { candidateId: row.id } });
    this.router.navigateByUrl(`/supply/my-interview-requests/schedule-interview/${row.id}`)
  }

  toggleExpand(event: MouseEvent, row: InterviewRequest): void {
    event.stopPropagation();
    console.log('Expand row:', row);
  }

  // ── Type cast helper ───────────────────────────────────────────────────────
  asRequest(row: any): InterviewRequest {
    return row as InterviewRequest;
  }

  private async loadDataOfInterviewList() {
    const payload = {
      ...this.payload,
      sortBy:'moveToScheduleDateTime'
    };
    const res: any = await this.interviewService.getScheduleList(payload);
    if (res?.responsecode == '00') {
      this.requests = this.mapInterviews(res?.data?.content);
      this.totalItems = res?.data?.totalElements;
    }
  }
  private mapInterviews(data: any[]): any[] {
    return data.map((item: any) => ({
      id: item.applicationId?.toString(),

      candidate: {
        initials: this.getInitials(item.candidateName),
        name: item.candidateName,
        code: `APP-${item.applicationId}`,
        avatarClass: this.getAvatarClass(item.priority)
      },

      job: {
        title: item.jobTitle,
        department: ''
      },

      round: {
        interviewType: item.round,
        roundLabel: `${item.roundId} Round`,
        roundCount: item.roundId
      },

      priority: item.priority,

      requestedOn: {
        date: new Date(item.requestedOn).toLocaleDateString(),
        time: new Date(item.requestedOn).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }));
  }
  private getInitials(name: string): string {
    if (!name) return '';

    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
  private getAvatarClass(priority: string): string {
    switch (priority) {
      case 'High':
        return 'av-coral';
      case 'Medium':
        return 'av-blue';
      case 'Low':
        return 'av-green';
      default:
        return 'av-gray';
    }
  }
}
