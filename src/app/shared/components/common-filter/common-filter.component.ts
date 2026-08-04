import {
  Component, EventEmitter, Input, OnDestroy, OnInit,
  Output, HostListener, ChangeDetectionStrategy, ChangeDetectorRef,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TabKey } from '../../constants/candidate.modal';


const CUSTOM_VALUE = 'CUSTOM';

@Component({
  selector: 'app-common-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './common-filter.component.html',
  styleUrl: './common-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonFilterComponent implements OnInit, OnDestroy,OnChanges {

  @Input() searchPlaceholder: string = 'Search...';
  @Input() debounceMs: number = 400;
  @Input() dropdowns: any[] = [];
  /** Bigger bordered "card" look (label above value, room for an icon/avatar
   * badge) instead of the default compact "Label: Value" pill — opt-in so
   * existing pages using app-common-filter keep their current style. Each
   * dropdown can also set `icon: 'fa-solid fa-user'` (or any FA class) and
   * `avatar: true` to show it in a small circular badge instead of plain. */
  @Input() cardStyle: boolean = false;

  @Output() filterChange = new EventEmitter<any>();

  @Output() tabChange = new EventEmitter<any>();
  @Input() tabs: { key: string; label: string; count: number,show?:boolean }[] = [];
  @Input() activeTab: string = ''
  searchTerm: string = '';
  selectedFilters: { [key: string]: string } = {};
  openDropdownKey: string | null = null;


  fromDate: string = '';
  toDate: string = '';


  readonly today = new Date().toISOString().split('T')[0];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.initSelectedFilters();
    
    this.searchSubject.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.emitChange());
    console.log(this.tabs);
    
  }
   ngOnChanges(changes: SimpleChanges): void {
    if (changes['dropdowns'] && !changes['dropdowns'].firstChange) {
      // ✅ Re-init when dropdowns input changes (e.g. after loadJobs completes)
      this.initSelectedFilters();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$?.next();
    this.destroy$?.complete();
  }

  private initSelectedFilters(): void {
    this.dropdowns.forEach(d => {
      // ✅ Only set if not already set by user interaction
      if (this.selectedFilters[d.key] === undefined) {
        this.selectedFilters[d.key] = d.selected ?? d.options[0]?.value ?? '';
      }
    });
  }
  get dateDropdown(): any | undefined {
    return this.dropdowns.find(d => d.isDateFilter);
  }

  // A date filter can expand into an extra date-range box once "Custom" is
  // picked. To keep the layout fixed (no resize when that happens), count it
  // as an extra filter up front rather than after the fact — e.g. 3 dropdowns
  // where one is a date filter is treated like 4, so it never qualifies for
  // the "wide" layout in the first place.
  get effectiveFilterCount(): number {
    return this.dropdowns.length + (this.dateDropdown ? 1 : 0);
  }

  get isWideLayout(): boolean {
    return this.effectiveFilterCount <= 3;
  }

  get isCompactLayout(): boolean {
    return this.effectiveFilterCount >= 6;
  }


  get isCustomDate(): boolean {
    const dd = this.dateDropdown;
    return !!dd && this.selectedFilters[dd.key] === CUSTOM_VALUE;
  }


  get minToDate(): string {
    return this.fromDate || '';
  }


  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }


  toggleDropdown(key: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownKey = this.openDropdownKey === key ? null : key;
    this.cdr.markForCheck();
  }

  selectOption(key: string, value: string): void {

    this.selectedFilters[key] = value;
    console.log(key,value,"this is a filter");
    this.openDropdownKey = null;
    if (value !== CUSTOM_VALUE) {

      this.fromDate = '';
      this.toDate = '';

      this.emitChange();
    }

    if (value === CUSTOM_VALUE) {

      this.cdr.markForCheck();
      return;
    }

    this.cdr.markForCheck();
  }

  getSelectedLabel(dropdown: any): string {
    const val = this.selectedFilters[dropdown.key];
    return dropdown.options.find((o: any) => o.value === val)?.label ?? '';
  }

  /** Same as getSelectedLabel, except once a custom date range is actually
   * picked it shows the real "01 Jul 2025 - 31 Jul 2025" span instead of
   * the literal option label ("Custom Range"). */
  displayValue(dropdown: any): string {
    if (dropdown.isDateFilter && this.selectedFilters[dropdown.key] === CUSTOM_VALUE && this.fromDate && this.toDate) {
      return `${this.formatDisplayDate(this.fromDate)} - ${this.formatDisplayDate(this.toDate)}`;
    }
    return this.getSelectedLabel(dropdown);
  }

  /** Card style has room for the full value; the compact pill still
   * truncates hard to keep its fixed narrow width. */
  get valueTruncateLimit(): number {
    return this.cardStyle ? 40 : 5;
  }

  private formatDisplayDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  isOpen(key: string): boolean {
    return this.openDropdownKey === key;
  }


  onFromDateChange(value: string): void {

    this.fromDate = value;

    if (this.toDate && this.toDate < value) {
      this.toDate = '';
    }

    if (this.fromDate && this.toDate) {
      this.emitChange();
    }

    this.cdr.markForCheck();
  }

  onToDateChange(value: string): void {

    this.toDate = value;


    if (this.fromDate && this.toDate) {
      this.emitChange();
    }

    this.cdr.markForCheck();
  }

  clearDateRange(): void {
    this.fromDate = '';
    this.toDate = '';
    const dd = this.dateDropdown;
    if (dd) {

      this.selectedFilters[dd.key] = dd.options[0]?.value ?? '';
    }
    this.emitChange();
    this.cdr.markForCheck();
  }


  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.openDropdownKey !== null) {
      this.openDropdownKey = null;
      this.cdr.markForCheck();
    }
  }


  private emitChange(): void {
    console.log(this.selectedFilters);
    const payload: any = {
      search: this.searchTerm,
      filters: { ...this.selectedFilters },
    };

    if (this.isCustomDate) {
      payload.fromDate = this.fromDate || undefined;
      payload.toDate = this.toDate || undefined;
    }
    console.log(payload);
    this.filterChange.emit(payload);
  }



  setTab(key: any): void {
    // key?.stopPropagation();
    this.activeTab = key;
    this.tabChange.emit( key );
    // this.currentPage = 1;
    // this.loadList();
  }

   truncate(value: string, limit = 10): string {
    if (!value || value === '—') return value;
    return value.length > limit ? value.slice(0, limit) + '..' : value;
  }
}