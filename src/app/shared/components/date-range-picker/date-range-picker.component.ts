import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit
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
export class DateRangePickerComponent implements OnInit {

  @Output()
  dateRangeChange =
    new EventEmitter<DateRange>();

  @Input()
  startDate: string = '';

  @Input()
  endDate: string = '';
  @Input() showClear:boolean=false

 
  maxDate: string =
    this.formatDate(new Date());

  minDate: string = '';


  fromDate: string = '';

  toDate: string = '';


  ngOnInit(): void {
    this.fromDate = this.startDate;
    this.toDate = this.endDate;
  }
  openCalendar(event: Event): void {

    event.stopPropagation();

    const input =
      event.currentTarget as HTMLInputElement;

    input.focus();

    if ('showPicker' in input) {
      (
        input as HTMLInputElement & {
          showPicker: () => void;
        }
      ).showPicker();

    }

  }


  
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


 
  clearDates(): void {

    this.fromDate = '';

    this.toDate = '';

    this.emitDateRange();

  }


  
  private emitDateRange(): void {
    if(this.fromDate && this.toDate){
    this.dateRangeChange.emit({

      fromDate:
        this.fromDate || null,

      toDate:
        this.toDate || null

    });
  }

  }


  
  private formatDate(
    date: Date
  ): string {

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
  isShow(){
    return (this.fromDate || this.toDate) && !this.showClear
  }

}