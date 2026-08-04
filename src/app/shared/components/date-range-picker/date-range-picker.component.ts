import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DateRange {
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent {
  startDate: string = ''; // bound to <input type="date">, native value is yyyy-MM-dd
  endDate: string = '';

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
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.errorMessage = 'Please enter valid dates.';
      return;
    }

    if (start > end) {
      this.errorMessage = 'From date must be before or equal to To date.';
      return;
    }

    // Native date input already returns yyyy-MM-dd, but format explicitly
    // in case the value ever comes from another source (e.g. Date object).
    this.dateRangeChange.emit({
      startDate: this.formatDate(start),
      endDate: this.formatDate(end)
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}