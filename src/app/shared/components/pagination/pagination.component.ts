import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems = 0;

  @Input() pageSize = 10;


  @Input() currentPage = 0;

  @Input() maxVisiblePages = 5;

  @Output() pageChange = new EventEmitter<number>();

  totalPages = 0;
  pages: (number | '...')[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    this.buildPages();
  }

  private buildPages(): void {
    const total = this.totalPages;
    const current = this.currentPage;
    const max = this.maxVisiblePages;

    if (total <= max) {
      this.pages = Array.from({ length: total }, (_, i) => i + 1);
      return;
    }

    const half = Math.floor(max / 2);
    let start = Math.max(2, current - half);
    let end = Math.min(total - 1, start + max - 3);

    if (end - start < max - 3) {
      start = Math.max(2, end - (max - 3));
    }

    const result: (number | '...')[] = [1];

    if (start > 2) result.push('...');
    for (let i = start; i <= end; i++) result.push(i);
    if (end < total - 1) result.push('...');
    result.push(total);

    this.pages = result;
  }

  goTo(page: number | '...'): void {
    if (page === '...' || page === this.currentPage) return;
    this.pageChange.emit(page as number);
  }

  prev(): void {
    if (this.currentPage > 1) this.pageChange.emit(this.currentPage - 1);
  }

  next(): void {
    if (this.currentPage < this.totalPages) this.pageChange.emit(this.currentPage + 1);
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  isEllipsis(page: number | '...'): boolean {
    return page === '...';
  }
}