import {
  Component, EventEmitter, Input, OnDestroy, OnInit,
  Output, HostListener, ChangeDetectionStrategy, ChangeDetectorRef
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
export class CommonFilterComponent implements OnInit, OnDestroy {

  @Input() searchPlaceholder: string = 'Search...';
  @Input() debounceMs: number = 400;
  @Input() dropdowns: any[] = [];

  @Output() filterChange = new EventEmitter<any>();

  @Output() tabChange = new EventEmitter<any>();
  @Input() tabs: { key: string; label: string; count: number }[] = [];
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
    this.dropdowns.forEach(d => {
      this.selectedFilters[d.key] = d.selected ?? d.options[0]?.value ?? '';
    });
    
    this.searchSubject.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.emitChange());
    console.log(this.tabs);
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get dateDropdown(): any | undefined {
    return this.dropdowns.find(d => d.isDateFilter);
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

      this.selectedFilters[dd.key] = dd.options[2]?.value ?? '';
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