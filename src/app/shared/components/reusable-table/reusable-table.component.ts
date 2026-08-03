import {
  Component, Input, Output, EventEmitter,
  ContentChild, TemplateRef, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  hideOnMobile?: boolean;
  custom?: boolean;
  group?: string;
}

interface ColumnGroup {
  label: string;
  colspan: number;
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.scss',
})
export class ReusableTableComponent implements OnChanges {

  // ── Inputs ────────────────────────────────────────────────────────────────
  @Input() title?: string;
  @Input() subTitle?:any;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showHeader: boolean = true;
  @Input() emptyMessage: string = 'No records found.';
  @Input() sortableColumns: string[] = [];

  
  @Input() tableLayout: 'auto' | 'fixed' = 'auto';

  // ── Pagination ────────────────────────────────────────────────────────────
  @Input() showPagination: boolean = false;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() maxVisiblePages: number = 5;

  // ── Templates ─────────────────────────────────────────────────────────────
  @Input() cellTemplate?: TemplateRef<any>;

  /** Optional header template — rendered for any column whose key === 'select' */
  @Input() headerTemplate?: TemplateRef<any>;

  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() rowClick = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<{ col: string; dir: 'asc' | 'desc' }>();
  @Output() pageChange = new EventEmitter<number>();

  // ── Sort state ────────────────────────────────────────────────────────────
  activeSortCol: string = '';
  activeSortDir: 'asc' | 'desc' = 'asc';

  // ── Group state ───────────────────────────────────────────────────────────
  hasGroups: boolean = false;
  columnGroups: ColumnGroup[] = [];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.buildColumnGroups();
    }
  }

  // ── Group builder ─────────────────────────────────────────────────────────
  private buildColumnGroups(): void {
    this.hasGroups = this.columns.some(c => !!c.group);
    if (!this.hasGroups) {
      this.columnGroups = [];
      return;
    }

    const groups: ColumnGroup[] = [];
    let i = 0;

    while (i < this.columns.length) {
      const col = this.columns[i];
      if (!col.group) {
        groups.push({ label: '', colspan: 1 });
        i++;
      } else {
        const groupName = col.group;
        let colspan = 0;
        while (i < this.columns.length && this.columns[i].group === groupName) {
          colspan++;
          i++;
        }
        groups.push({ label: groupName, colspan });
      }
    }

    this.columnGroups = groups;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getColumnKey(index: number): string {
    return this.columns[index]?.key ?? '';
  }

  getCellValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row) ?? '—';
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
    this.sortChange.emit({ col: this.activeSortCol, dir: this.activeSortDir });
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}