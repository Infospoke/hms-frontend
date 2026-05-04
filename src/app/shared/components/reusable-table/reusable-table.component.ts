import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { PaginationComponent } from '../pagination/pagination.component';
import { CommonModule, NgTemplateOutlet } from '@angular/common';


export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  custom?: boolean;
  hideOnMobile?: boolean;
}
export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}
@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [PaginationComponent,CommonModule,NgTemplateOutlet],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.scss',
})
export class ReusableTableComponent {

   @Input() columns: TableColumn[] = [];

  @Input() data: any[] = [];

  @Input() title = '';

  @Input() emptyMessage = 'No records found.';

  @Input() showHeader = true;
 
 
  @Input() cellTemplate?: TemplateRef<{ $implicit: { row: Record<string, unknown>; col: TableColumn } }>;

  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() maxVisiblePages = 5;
  @Input() showPagination = true;
 

  @Input() sortableColumns: string[] = [];
 

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() rowClick = new EventEmitter<Record<string, unknown>>();
 

  activeSortCol = '';
  activeSortDir: 'asc' | 'desc' = 'asc';
 

  getCellValue(row: Record<string, unknown>, key: string): unknown {
    return key.split('.').reduce<unknown>((obj, k) => {
      if (obj != null && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, row);
  }
 
  isSortable(key: string): boolean {
    return this.sortableColumns.includes(key);
  }
 
  onSort(key: string): void {
    if (!this.isSortable(key)) return;
    if (this.activeSortCol === key) {
      this.activeSortDir = this.activeSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.activeSortCol = key;
      this.activeSortDir = 'asc';
    }
    this.sortChange.emit({ column: this.activeSortCol, direction: this.activeSortDir });
  }
 
  onPageChange(page: any): void {
    this.pageChange.emit(page);
  }
 

  get rangeLabel(): string {
    if (this.totalItems === 0) return 'No records';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} rows`;
  }
}
