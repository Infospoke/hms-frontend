import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ReusableTableComponent,
  TableColumn,
} from '../../../../shared/components/reusable-table/reusable-table.component';
import { CanDirective } from "../../../../shared/directives/can.directive";

export interface PayRevisionRequestRow {
  id: string | number;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: 'purple' | 'green' | 'orange' | 'blue' | 'pink';
  jobTitle: string;
  offerReleasedOn: string;
  requestedPackage: string;
  currentPackage: string;
  priority: 'High' | 'Medium' | 'Low';
}

@Component({
  selector: 'app-pay-revision-request-table',
  standalone: true,
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './pay-revision-request-table.component.html',
  styleUrl: './pay-revision-request-table.component.scss',
})
export class PayRevisionRequestTableComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  @Input() data: PayRevisionRequestRow[] = [];
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 3;
  @Input() showPagination: boolean = true;
  @Input() actionLabel: string = 'Review request';
  @Input() emptyMessage: string = 'No pay revision requests found.';

  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() actionClick = new EventEmitter<PayRevisionRequestRow>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ col: string; dir: 'asc' | 'desc' }>();
  @Input() permissionName:any='';
  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', custom: true, width: '22%' },
    { key: 'jobTitle', label: 'Job title', width: '14%' },
    { key: 'offerReleasedOn', label: 'Negotiation On', width: '19%', custom: true },
    { key: 'requestedPackage', label: 'Requested package', width: '19%' },
    { key: 'currentPackage', label: 'Offerd package', width: '16%' },
    { key: 'priority', label: 'Priority', custom: true, width: '16%' },
    { key: 'actions', label: 'Actions', custom: true, width: '16%' },
  ];

  sortableColumns: string[] = ['offerReleasedOn'];

  onAction(row: PayRevisionRequestRow): void {
    this.actionClick.emit(row);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onSortChange(evt: { col: string; dir: 'asc' | 'desc' }): void {
    this.sortChange.emit(evt);
  }
}