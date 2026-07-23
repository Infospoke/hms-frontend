import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ReusableTableComponent,
  TableColumn,
} from '../../../../shared/components/reusable-table/reusable-table.component';
@Component({
  selector: 'app-accept-offer-table',
  imports: [CommonModule, ReusableTableComponent],
  templateUrl: './accept-offer-table.component.html',
  styleUrl: './accept-offer-table.component.scss',
})
export class AcceptOfferTableComponent {
 // ── Inputs ────────────────────────────────────────────────────────────────
  @Input() data: any[] = [];
  @Input() permissionName:any='';
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 3;
  @Input() showPagination: boolean = true;
  @Input() emptyMessage: string = 'No accepted letters found.';
 
  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ col: string; dir: 'asc' | 'desc' }>();
 
  columns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', custom: true, width: '220px' },
    { key: 'jobTitle', label: 'Job title' },
    { key: 'package', label: 'Package' },
    { key: 'releasedOn', label: 'Released on', sortable: true },
    { key: 'recruiter', label: 'Recruiter', custom: true },
    { key: 'status', label: 'Status', custom: true },
  ];
 
  sortableColumns: string[] = ['releasedOn'];
 
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
 
  onSortChange(evt: { col: string; dir: 'asc' | 'desc' }): void {
    this.sortChange.emit(evt);
  }
}
