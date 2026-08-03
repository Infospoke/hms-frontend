import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ReusableTableComponent,
  TableColumn,
} from '../../../../shared/components/reusable-table/reusable-table.component';
import { CanDirective } from "../../../../shared/directives/can.directive";

// 'awaiting' = Pending (letter sent, awaiting candidate's decision)
// 'accepted' / 'rejected' / 'expired' are terminal states
export type ApprovalStatusState = 'awaiting' | 'accepted' | 'rejected' | 'expired';

export interface ApprovalStatusRow {
  id: string | number;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: 'purple' | 'green' | 'orange' | 'blue' | 'pink';
  jobTitle: string;
  package: string;
  releasedOn: string;
  recruiter: string;
  status: ApprovalStatusState;
  statusLabel?: string;
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
  @Input() heading?: any;
  @Input() subHeading?: any;
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 6;
  @Input() permissionName: any = '';
  @Input() showPagination: boolean = true;
  // Actions column only applies to terminal/actionable states (e.g. Expired → "Raise new request").
  // Pending / Accepted / Rejected have no action, so leave this false for those tabs.
  @Input() showActions: boolean = false;
  @Input() actionLabel: string = 'Raise new request';
  @Input() emptyMessage: string = 'No requests found.';

  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() actionClick = new EventEmitter<ApprovalStatusRow>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ col: string; dir: 'asc' | 'desc' }>();

  get columns(): TableColumn[] {
    const cols: TableColumn[] = [
      { key: 'candidate', label: 'Candidate', custom: true, width: '20%' },
      { key: 'jobTitle', label: 'Job title', width: '14%' },
      { key: 'package', label: 'Package', width: '14%' },
      { key: 'releasedOn', label: 'Released on', sortable: true, width: '14%' },
      { key: 'recruiter', label: 'Recruiter', custom: true, width: '14%' },
      { key: 'status', label: 'Status', custom: true, width: '14%' },
    ];

    if (this.showActions) {
      cols.push({ key: 'actions', label: 'Actions', custom: true, width: '10%' });
    }

    return cols;
  }

  sortableColumns: string[] = ['releasedOn'];

  statusLabels: Record<ApprovalStatusState, string> = {
    awaiting: 'Awaiting response',
    accepted: 'Accepted',
    rejected: 'Rejected',
    expired: 'Expired',
  };

  getStatusLabel(row: ApprovalStatusRow): string {
    return row.statusLabel ?? this.statusLabels[row.status] ?? row.status;
  }

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