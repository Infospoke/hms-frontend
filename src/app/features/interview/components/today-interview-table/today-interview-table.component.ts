import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';

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
  imports: [CommonModule, ReusableTableComponent],
  templateUrl: './today-interview-table.component.html',
  styleUrl: './today-interview-table.component.scss',
})
export class TodayInterviewTableComponent {
  @Input() payload!: any;
   @Input() date: any = 'May 20, 2025';
  @Input() interviews: TodayInterview[] = DEFAULT_INTERVIEWS;
  showPagination: boolean = true;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
 
  @Output() viewDetails = new EventEmitter<TodayInterview>();
  @Output() rowClick    = new EventEmitter<TodayInterview>();
  @Output() pageChange  = new EventEmitter<number>();
  
  columns: TableColumn[] = [

    { key: 'time',      label: 'Time',      custom: true, width: '120px' },
    { key: 'candidate', label: 'Candidate', custom: true, width: '200px' },
    { key: 'jobTitle',  label: 'Job Title', custom: true, width: '210px' },
    { key: 'round',     label: 'Round',     custom: true, width: '120px' },
    { key: 'type',      label: 'Type',      custom: true, width: '130px' },
    { key: 'action',    label: 'Action',    custom: true, width: '180px', align: 'right' },
  ];
 
  get totalItems(): number {
    return this.interviews.length;
  }
 
  // ── Helpers ───────────────────────────────────────────────────────────────
  typeBadgeClass(type: InterviewType): string {
    return {
      'Technical':    'ti-badge--technical',
      'HR':           'ti-badge--hr',
      'Managerial':   'ti-badge--managerial',
      'Cultural Fit': 'ti-badge--cultural',
    }[type] ?? '';
  }
 
  // ── Actions ───────────────────────────────────────────────────────────────
  onViewDetails(interview: TodayInterview): void {
    this.viewDetails.emit(interview);
  }
 
  onRowClick(row: TodayInterview): void {
    this.rowClick.emit(row);
  }
 
  onPageChange(page: number): void {
    this.currentPage = page;
    this.pageChange.emit(page);
  }
}
 


 
const DEFAULT_INTERVIEWS: TodayInterview[] = [
  {
    id: 'NXH-1023',
    name: 'Rohit Sharma',
    initials: 'RS',
    jobTitle: 'Software Engineer - L2',
    department: 'Engineering',
    time: '10:30 AM',
    round: 'Round 1',
    type: 'Technical',
  },
  {
    id: 'NXH-1024',
    name: 'Ananya Patel',
    initials: 'AP',
    jobTitle: 'Product Analyst',
    department: 'Product',
    time: '02:00 PM',
    round: 'Round 1',
    type: 'Technical',
  },
];
 