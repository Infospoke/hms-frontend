import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { CanDirective } from "../../../../shared/directives/can.directive";
import { Router } from '@angular/router';

export type Priority = 'High' | 'Medium' | 'Low';

export interface InterviewRequest {
  id: string;
  name: string;
  initials: string;
  jobTitle: string;
  assignmentId:any;
  department: string;
  round: string;
  roundCount: number;
  priority: Priority;
  requestedDate: string;
  requestedTime: string;
  jobId:any;
}

@Component({
  selector: 'app-assigned-interview-requests-table',
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './assigned-interview-requests-table.component.html',
  styleUrl: './assigned-interview-requests-table.component.scss',
})
export class AssignedInterviewRequestsTableComponent implements OnChanges {

  @Input() payload!: any;
  @Output() pageChange = new EventEmitter<number>();
  private router = inject(Router);
  columns: TableColumn[] = [
   
    { key: 'jobTitle', label: 'Job Title', custom: true, width: '200px' },
     { key: 'description', label: 'Department', custom: true, width: '200px' },
    { key: 'round', label: 'Round', custom: true, width: '200px' },
    { key: 'priority', label: 'Priority', custom: true, width: '110px', align: 'center' },
    { key: 'requestedOn', label: 'Requested On', custom: true, width: '160px' },
    { key: 'action', label: 'Action', custom: true, width: '180px', align: 'center' },
  ];

  requests: InterviewRequest[] = [];
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  private interviewService = inject(InterviewServiceService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payload'] && this.payload) {
      this.currentPage = (this.payload.page ?? 0) + 1;
      this.loadData();
    }
  }

  private async loadData(): Promise<void> {
    try {
      const payload={
        ...this.payload,
        sortBy: "createdAt",
      }
      const res: any = await this.interviewService.getInterviewListByAssignment(payload);
      if (res?.responsecode === '00') {
        const d = res.data;
        this.totalItems = d.totalPages;
        this.requests = (d.content as any[]).map(item => this.mapToRow(item));
      }
    } catch (err) {
      console.error('Failed to load assigned interviews', err);
    }
  }

  private mapToRow(item: any): InterviewRequest {
    const dt = item.requestedOn ? new Date(item.requestedOn) : null;
    return {
      id: `NXH-${item.assignmentId}`,
      assignmentId:item?.assignmentId,
      name: item.candidateName ?? '',
      initials: this.toInitials(item.candidateName),
      jobTitle: item.jobTitle ?? '',
      department: item.department ?? '',
      jobId:item?.jobId,
      round: item.round ?? '',
      roundCount: this.parseRoundCount(item.round),
      priority: this.normalizePriority(item.priority),
      requestedDate: dt ? dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      requestedTime: dt ? dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
    };
  }

  private toInitials(name: string = ''): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  private normalizePriority(raw: string = ''): Priority {
    const map: Record<string, Priority> = { high: 'High', medium: 'Medium', low: 'Low' };
    return map[raw.toLowerCase()] ?? 'Medium';
  }

  private parseRoundCount(round: string = ''): number {
    if (/one|1/i.test(round)) return 1;
    if (/two|2/i.test(round)) return 2;
    if (/three|3/i.test(round)) return 3;
    return 1;
  }

  // ── Table events ──────────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onViewDetails(req: InterviewRequest): void {
    this.router.navigate(
      [`/supply/my-interview-requests/job-details/${req?.jobId}`],
      {state:{type:'assignment',assignmentId:req?.assignmentId}}
    );
  }

  onRowClick(row: InterviewRequest): void {
    console.log('Row clicked:', row);
  }


  priorityClass(p: Priority): string {
    return { High: 'ir-badge--high', Medium: 'ir-badge--medium', Low: 'ir-badge--low' }[p] ?? '';
  }

  roundBadgeClass(count: number): string {
    if (count === 1) return 'ir-round--one';
    if (count === 2) return 'ir-round--two';
    return 'ir-round--three';
  }

  roundLabel(count: number): string {
    return count === 1 ? '1 Round' : `${count} Rounds`;
  }
}