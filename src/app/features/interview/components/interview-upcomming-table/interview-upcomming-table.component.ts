import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { Router } from '@angular/router';
import { CanDirective } from "../../../../shared/directives/can.directive";
import { InterviewServiceService } from '../../service/interview-service.service';

export interface Interview {
  id: string;
  interviewId: string;
  round: string;
  roundNumber: number;
  totalRounds: number;
  candidateName: string;
  candidateInitials: string;
  candidateId: string;
  jobTitle: string;
  jobLevel: string;
  department: string;
  roundLabel: string;
  scheduleDate: string;
  scheduleTime: string;
  type: 'Online' | 'Office';
  location: string;
  meetLink?: string;
}

@Component({
  selector: 'app-interview-upcomming-table',
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './interview-upcomming-table.component.html',
  styleUrl: './interview-upcomming-table.component.scss',
})
export class InterviewUpcommingTableComponent implements OnInit {
  @Input() payload!: any;
  @Output() pageChange = new EventEmitter<number>();
  @ViewChild('cellTpl', { static: true }) cellTpl!: TemplateRef<any>;
  private router = inject(Router);
  columns: TableColumn[] = [
    { key: 'interview', label: 'Interview Detail', custom: true, width: '100px' },
    { key: 'candidate', label: 'Candidate', custom: true, width: '160px' },
    { key: 'job', label: 'Job & Round', custom: true, width: '190px' },
    { key: 'schedule', label: 'Schedule', custom: true, width: '170px' },
    { key: 'typeLocation', label: 'Type & Location', custom: true, width: '200px' },
    { key: 'action', label: 'Action', custom: true, align: 'center', width: '130px' }
  ];

  interviews: any[] = [];

  totalItems = 5;
  currentPage = 1;
  pageSize = 10;
  showPagination = true;
  private interviewService = inject(InterviewServiceService)
  expandedRow: string | null = null;

  ngOnInit(): void {
    Promise.any([this.loadList()])
  }

  private async loadList() {
    const payload = {...this.payload,sortBy:'interview_date'};
    const res: any = await this.interviewService.getUpcommingAIInterviewInAssignedInterview(payload);

    if (res?.responsecode == '00') {
      this.interviews = this.mapResponse(res?.data);
      this.totalItems=this.pageSize * res?.totalRecords
    }
  }
  private mapResponse(data: any[]) {
    return data?.map((item: any) => {
      const initials = item.candidateName
        ?.split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase();

      const interviewDate = new Date(item.interviewDate);

      const scheduleDate = interviewDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);

        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      };

      const roundMatch = item.round?.match(/\d+/);
      const roundNumber = roundMatch ? Number(roundMatch[0]) : 1;

      const totalRoundsMatch = item.roundProgress?.match(/of\s+(\d+)/i);
      const totalRounds = totalRoundsMatch
        ? Number(totalRoundsMatch[1])
        : 1;

      return {
        id: item.scheduleId?.toString(),
        interviewId: `INT-${item.scheduleId}`,
        round: item.round,
        roundNumber,
        totalRounds,
        candidateName: item.candidateName,
        candidateInitials: initials,
        candidateId: `NXH-${item.applicantId}`,
        jobTitle: item.jobTitle,
        jobLevel: item.department,
        department: item.department,
        roundLabel: item.roundProgress,
        scheduleDate,
        scheduleTime: `${formatTime(item.startTime)} – ${formatTime(item.endTime)}`,
        type: item.interviewMode,
        location:
          item.interviewMode === 'Online'
            ? 'Google Meet'
            : item.venueDetails || '',
        meetLink: item.meetingLink,
      };
    });
  }
  getRoundColor(round: string): string {
    if (round.includes('1st')) return 'badge--first';
    if (round.includes('2nd')) return 'badge--second';
    if (round.includes('3rd')) return 'badge--third';
    return 'badge--default';
  }

  toggleExpand(id: string): void {
    this.expandedRow = this.expandedRow === id ? null : id;
  }

  onRowClick(row: Interview): void {
    // handle row click
  }
  handleview(row: any) {
    this.router.navigateByUrl(`/supply/my-interview-requests/reschedule-interview/${row.id}`)
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }
}
