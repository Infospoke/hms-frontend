import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReusableTableComponent, TableColumn } from '../reusable-table/reusable-table.component';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';

export interface JobAssignmentRow {
  jobTitle: string;
  assignmentStatus: 'Accepted' | 'Rejected' | 'Pending';
  acceptedOn: string;
  priority: 'High' | 'Medium' | 'Low';
  requestedOpenings: number;
  filled: number;
  remaining: number;
  targetDate: string;
  /** Negative = overdue by N days, 0 = due today, positive = days left. */
  daysDue: number;
  slaStatus: 'On Track' | 'Completed' | 'At Risk' | 'Overdue';
}


@Component({
  selector: 'app-job-assignments-table',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent,DateRangePickerComponent],
  templateUrl: './job-assignments-table.component.html',
  styleUrl: './job-assignments-table.component.scss',
})
export class JobAssignmentsTableComponent implements OnChanges {
  @Input() title: string = 'Job Assignments';
  @Input() subTitle: string = '';
  @Input() rows: JobAssignmentRow[] = [];
  @Input() showLegend: boolean = true;
  @Output() dateRangeChange=new EventEmitter<{ startDate: string; endDate: string }>();
  @ViewChild('cellTpl', { static: true }) cellTpl!: TemplateRef<any>;


  columns: TableColumn[] = [
    { key: 'jobTitle', label: 'Job Title', width: '15%' },
    { key: 'assignmentStatus', label: 'Assignment Status', custom: true, width: '11%' },
    { key: 'acceptedOn', label: 'Accepted On', width: '10%' },
    { key: 'priority', label: 'Priority', custom: true, align: 'center', width: '9%' },
    { key: 'requestedOpenings', label: 'Requested Openings', custom: true, align: 'center', width: '10%' },
    { key: 'filled', label: 'Filled', align: 'center', width: '6%' },
    { key: 'remaining', label: 'Remaining', align: 'center', width: '8%' },
    { key: 'targetDate', label: 'Target Date', width: '10%' },
    { key: 'daysDue', label: 'Days Due', custom: true, align: 'center', width: '9%' },
    { key: 'slaStatus', label: 'SLA Status', custom: true, width: '12%' },
  ];

  maxOpenings = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.maxOpenings = Math.max(1, ...this.rows.map(r => r.requestedOpenings ?? 0));
    }
  }

  openingsBarWidth(value: number): number {
    if (!value) return 0;
    return Math.max(28, Math.round((value / this.maxOpenings) * 100));
  }

  statusClass(status: string): string {
    return 'ja-status-pill ja-status-pill--' + (status ?? '').toLowerCase().replace(/\s+/g, '-');
  }

  priorityDotClass(priority: string): string {
    return 'ja-priority-dot ja-priority-dot--' + (priority ?? '').toLowerCase();
  }

  slaClass(status: string): string {
    return 'ja-sla-pill ja-sla-pill--' + (status ?? '').toLowerCase().replace(/\s+/g, '-');
  }

  daysDueClass(days: number): string {
    if (days <= 0) return 'ja-days ja-days--overdue';
    if (days <= 3) return 'ja-days ja-days--soon';
    return 'ja-days';
  }

  daysDueLabel(days: number): string {
    if (days < 0) return `${Math.abs(days)} Days`;
    if (days === 0) return '0 Days';
    return `${days} Days`;
  }
   onDateRangeChange(range:any): void {
    this.dateRangeChange.emit(range);
  }
}
