import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

export interface DateRange {
  fromDate: string | null;
  toDate: string | null;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss'
})
export class DateRangePickerComponent {
  @Input() startDate: string = ''; // bound to <input type="date">, native value is yyyy-MM-dd
  @Input() endDate: string = '';

  errorMessage: string = '';

  @Output() dateRangeChange = new EventEmitter<DateRange>();

  onStartDateChange(value: string): void {
    this.startDate = value;
    this.validateAndEmit();
  }

  onEndDateChange(value: string): void {
    this.endDate = value;
    this.validateAndEmit();
  }

  private validateAndEmit(): void {
    this.errorMessage = '';

    // Only validate/emit once both dates are provided
    if (!this.startDate || !this.endDate) {
      return;

  @Output()
  dateRangeChange = new EventEmitter<DateRange>();


  maxDate: string = this.formatDate(new Date());

  minDate: string = this.getPrevious30Days();

  fromDate: string = '';

  toDate: string = '';


  // ============================================================
  // OPEN CALENDAR WHEN DATE FIELD IS CLICKED
  // ============================================================

  openCalendar(event: MouseEvent): void {

    const input =
      event.currentTarget as HTMLInputElement;

    if (typeof input.showPicker === 'function') {

      try {
        input.showPicker();
      } catch {
        // Calendar is already open
      }

    }
  }


  // ============================================================
  // FROM DATE
  // ============================================================

  onFromDateChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.fromDate =
      input.value;

    if (
      this.toDate &&
      this.fromDate &&
      this.fromDate > this.toDate
    ) {
      this.toDate = '';
    }

    this.emitDateRange();
  }


  // ============================================================
  // TO DATE
  // ============================================================

  onToDateChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.toDate =
      input.value;

    if (
      this.fromDate &&
      this.toDate &&
      this.toDate < this.fromDate
    ) {

      this.toDate = '';

      input.value = '';

      return;
    }

    this.emitDateRange();
  }


  // ============================================================
  // CLEAR
  // ============================================================

  clearDates(): void {

    this.fromDate = '';

    this.toDate = '';

    this.emitDateRange();
  }


  // ============================================================
  // EMIT
  // ============================================================

  private emitDateRange(): void {

    this.dateRangeChange.emit({
      fromDate: this.fromDate || null,
      toDate: this.toDate || null
    });
  }


  // ============================================================
  // PREVIOUS 30 DAYS
  // ============================================================

  private getPrevious30Days(): string {

    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    date.setDate(
      date.getDate() - 30
    );

    return this.formatDate(date);
  }


  // ============================================================
  // FORMAT DATE
  // ============================================================

  private formatDate(date: Date): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

}