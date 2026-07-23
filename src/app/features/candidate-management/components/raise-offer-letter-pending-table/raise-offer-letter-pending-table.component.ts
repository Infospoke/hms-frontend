import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ReusableTableComponent,
  TableColumn,
} from '../../../../shared/components/reusable-table/reusable-table.component';
import { CanDirective } from "../../../../shared/directives/can.directive";
 
@Component({
  selector: 'app-raise-offer-letter-pending-table',
  imports: [CommonModule, ReusableTableComponent, CanDirective],
  templateUrl: './raise-offer-letter-pending-table.component.html',
  styleUrl: './raise-offer-letter-pending-table.component.scss',
})
export class RaiseOfferLetterPendingTableComponent {

  @Input() data: any[] = [];
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 6;
  @Input() showPagination: boolean = true;
  @Input() actionLabel: string = 'View';
  @Input() emptyMessage: string = 'No requests found.';
  @Input() permissionName:any='';
  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() actionClick = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ col: string; dir: 'asc' | 'desc' }>();
 
  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', custom: true, width: '100px' },
    { key: 'jobTitle', label: 'Job title' },
    { key: 'department', label: 'Department' },
    { key: 'approvalStatus', label: 'Current approval status', custom: true, width: '320px' },
    { key: 'requestedOn', label: 'Requested on', sortable: true,custom:true },
    { key: 'priority', label: 'Priority', custom: true },
    { key: 'actions', label: 'Actions', custom: true },
  ];
 
  sortableColumns: string[] = ['requestedOn'];
 
  onAction(row: any): void {
    this.actionClick.emit(row);
  }
 
  onPageChange(page: any): void {
    this.pageChange.emit(page);
  }
 
  onSortChange(evt: { col: string; dir: 'asc' | 'desc' }): void {
    this.sortChange.emit(evt);
  }
}
