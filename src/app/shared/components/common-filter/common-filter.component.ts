import {
  Component, EventEmitter, Input, OnDestroy, OnInit,
  Output, HostListener, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';



export interface FilterChange {
  search: string;
  filters: { [key: string]: string };
}

@Component({
  selector: 'app-common-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './common-filter.component.html',
  styleUrl: './common-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonFilterComponent implements OnInit, OnDestroy {

  @Input() searchPlaceholder: string = 'Search...';
  @Input() debounceMs: number = 400;
  @Input() dropdowns: any[] = [];

  @Output() filterChange = new EventEmitter<FilterChange>();

  searchTerm: string = '';
  selectedFilters: { [key: string]: string } = {};
  openDropdownKey: string | null = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.dropdowns.forEach(d => {
      this.selectedFilters[d.key] = d.selected ?? d.options[0]?.value ?? '';
    });

    this.searchSubject.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.emitChange());
  }

  onSearchInput(value: string) {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  toggleDropdown(key: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdownKey = this.openDropdownKey === key ? null : key;
    this.cdr.markForCheck();
  }

  selectOption(key: string, value: string) {
    this.selectedFilters[key] = value;
    this.openDropdownKey = null;
    this.emitChange();
    this.cdr.markForCheck();
  }

  getSelectedLabel(dropdown:any): string {
    const val = this.selectedFilters[dropdown.key];
    return dropdown.options.find((o:any) => o.value === val)?.label ?? '';
  }

  isOpen(key: string): boolean {
    return this.openDropdownKey === key;
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.openDropdownKey !== null) {
      this.openDropdownKey = null;
      this.cdr.markForCheck();
    }
  }

  private emitChange() {
    this.filterChange.emit({
      search: this.searchTerm,
      filters: { ...this.selectedFilters }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}