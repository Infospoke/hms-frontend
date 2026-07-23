import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ReusableTableComponent,
  TableColumn,
} from '../../../../shared/components/reusable-table/reusable-table.component';
import { CanDirective } from "../../../../shared/directives/can.directive";

export type ApprovalStepState = 'completed' | 'active' | 'pending';

export interface ApprovalStep {
  label: string;
  state: ApprovalStepState;
}

export interface ApprovalStatusRow {
  id: string | number;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: 'purple' | 'green' | 'orange' | 'blue' | 'pink';
  jobTitle: string;
  department: string;
  approvalSteps: ApprovalStep[];
  requestedOn: string;
  priority: 'High' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-approval-status-table',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './approval-status-table.component.html',
  styleUrl: './approval-status-table.component.scss',
})
export class ApprovalStatusTableComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  @Input() data: ApprovalStatusRow[] = [];
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 6;
  @Input() permissionName:any='';
  @Input() showPagination: boolean = true;
  @Input() actionLabel: string = 'View details';
  @Input() emptyMessage: string = 'No requests found.';

  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() actionClick = new EventEmitter<ApprovalStatusRow>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ col: string; dir: 'asc' | 'desc' }>();

  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', custom: true, width: '18%' },
    { key: 'jobTitle', label: 'Job title', width: '11%' },
    { key: 'department', label: 'Department', width: '11%' },
    { key: 'approvalStatus', label: 'Current approval status', custom: true, width: '28%' },
    { key: 'requestedOn', label: 'Requested on', sortable: true, width: '12%' },
    { key: 'priority', label: 'Priority', custom: true, width: '8%' },
    { key: 'actions', label: 'Actions', custom: true, width: '12%' },
  ];

  sortableColumns: string[] = ['requestedOn'];

  onAction(row: ApprovalStatusRow): void {
    this.actionClick.emit(row);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onSortChange(evt: { col: string; dir: 'asc' | 'desc' }): void {
    this.sortChange.emit(evt);
  }
}