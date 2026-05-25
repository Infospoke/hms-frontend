import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-job-details-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzDatePickerModule,
  ],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss',
})
export class JobDetailsStepComponent {
  @Input() form!: FormGroup;
  @Input() submitted = false;

  f(name: string) {
    return this.form.get(name);
  }

  get notesLength(): number {
    return (this.f('notes')?.value || '').length;
  }

  isInvalid(name: string): boolean {
    const c = this.f(name);
    return !!(c?.invalid && this.submitted);
  }

  disablePastDates = (date: Date): boolean =>
    date < new Date(new Date().setHours(0, 0, 0, 0));
}