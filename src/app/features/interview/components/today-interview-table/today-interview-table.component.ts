import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { Router } from '@angular/router';
import { CanDirective } from "../../../../shared/directives/can.directive";
import { InterviewServiceService } from '../../service/interview-service.service';

export type InterviewType = 'Technical' | 'HR' | 'Managerial' | 'Cultural Fit';

export interface TodayInterview {
  id: string;           // e.g. "NXH-1023"
  name: string;         // e.g. "Rohit Sharma"
  initials: string;     // e.g. "RS"
  jobTitle: string;     // e.g. "Software Engineer - L2"
  department: string;   // e.g. "Engineering"
  time: string;         // e.g. "10:30 AM"
  round: string;        // e.g. "Round 1"
  type: InterviewType;
}

@Component({
  selector: 'app-today-interview-table',
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './today-interview-table.component.html',
  styleUrl: './today-interview-table.component.scss',
})
export class TodayInterviewTableComponent implements OnInit, OnChanges {
  @Input() payload!: any;
  @Input() date: any = 'May 20, 2025';
  @Input() interviews: any[] = [];
  showPagination: boolean = true;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  private interviewService = inject(InterviewServiceService);
  @Output() viewDetails = new EventEmitter<TodayInterview>();
  @Output() rowClick = new EventEmitter<TodayInterview>();
  @Output() pageChange = new EventEmitter<number>();
  private router = inject(Router);
  columns: TableColumn[] = [

    { key: 'time', label: 'Time', custom: true, width: '120px' },
    { key: 'candidate', label: 'Candidate', custom: true, width: '140px' },
    { key: 'jobTitle', label: 'Job Title', custom: true, width: '160px' },
    { key: 'round', label: 'Round', custom: true, width: '120px' },
    { key: 'type', label: 'Type', custom: true, width: '100px' },
    { key: 'action', label: 'Action', custom: true, width: '140px', align: 'right' },
  ];

  totalItems: any;
  ngOnInit(): void {
    // console.log(this.payload)
    // this.loadDataOfInterviewList();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payload']) {

      this.loadDataOfInterviewList();
    }
  }
  typeBadgeClass(type: InterviewType): string {
    return {
      'Technical': 'ti-badge--technical',
      'HR': 'ti-badge--hr',
      'Managerial': 'ti-badge--managerial',
      'Cultural Fit': 'ti-badge--cultural',
    }[type] ?? '';
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  onViewDetails(interview: any): void {
    this.router.navigate([`/candidate-management/in-person-interview/today-interview-details/${interview.id}`], {
      queryParams: {
        currentStageType: interview.currentStageType
      }
    })
  }

  onRowClick(row: TodayInterview): void {
    this.rowClick.emit(row);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.pageChange.emit(page);
  }


  private async loadDataOfInterviewList() {
    const payload = {
      ...this.payload,
      sortBy: 'createdOn'
    };
    const res: any = await this.interviewService.getTodayInterviewList(payload);
    if (res?.responsecode == '00') {
      this.interviews = this.mapInterviews(res?.data?.content);
      this.totalItems = res?.data?.numberOfElements;
    }
  }
  private mapInterviews(data: any[]): TodayInterview[] {
    return data.map((item: any) => ({
      id: item.applicationId || item.id,
      name: item.applicantName,
      initials: this.getInitials(item.applicantName),
      jobTitle: item.jobTitle,
      jobCode: item.jobCode,
      department: item.departmentName || '',
      time: item.startTime,
      currentStageType: item?.currentStageType,
      round: 'Round ' + item.currentStageType,
      type: item.stageName,
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

}


