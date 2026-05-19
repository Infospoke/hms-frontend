import { Component, Input, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-job-details-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzSelectModule,
    NzDatePickerModule,
  ],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss',
})
export class JobDetailsStepComponent implements OnInit {
  @Input() form!: FormGroup;

  // ── Dropdown options ──────────────────────────────────────────────────────
  departments   = ['Engineering', 'Product', 'Design', 'Marketing', 'Finance', 'HR', 'Operations'];
  businessUnits = ['Technology', 'Business', 'Corporate', 'Sales', 'Support'];
  locations     = ['Bengaluru, India', 'Hyderabad, India', 'Mumbai, India', 'Delhi, India', 'Chennai, India', 'Remote'];
  workModes     = ['On-site', 'Remote', 'Hybrid'];
  employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
  experiences   = ['0–1 Years', '1–3 Years', '3–5 Years', '5–10 Years', '10+ Years'];

  // ── Popup state ───────────────────────────────────────────────────────────
  mustPopupOpen  = false;
  nicePopupOpen  = false;
  mustSkillInput = '';
  niceSkillInput = '';

  constructor(private el: ElementRef) {}

  ngOnInit(): void {}

  // ── Popup open/close ──────────────────────────────────────────────────────
  openPopup(type: 'must' | 'nice', event: MouseEvent): void {
    event.stopPropagation();
    if (type === 'must') {
      this.mustPopupOpen = !this.mustPopupOpen;
      this.nicePopupOpen = false;
    } else {
      this.nicePopupOpen = !this.nicePopupOpen;
      this.mustPopupOpen = false;
    }
  }

  closePopups(): void {
    this.mustPopupOpen = false;
    this.nicePopupOpen = false;
    this.mustSkillInput = '';
    this.niceSkillInput = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.closePopups();
    }
  }

  // ── Add / Remove skill ────────────────────────────────────────────────────
  addSkill(type: 'must' | 'nice'): void {
    const raw   = type === 'must' ? this.mustSkillInput : this.niceSkillInput;
    const skill = raw.trim();
    if (!skill) return;

    const ctrl = this.f(type === 'must' ? 'mustHaveSkills' : 'niceToHaveSkills')!;
    const list: string[] = [...(ctrl.value || [])];
    if (!list.includes(skill)) {
      ctrl.setValue([...list, skill]);
      ctrl.markAsDirty();
    }

    if (type === 'must') this.mustSkillInput = '';
    else                  this.niceSkillInput = '';
    // keep popup open so user can add more
  }

  removeSkill(type: 'must' | 'nice', index: number): void {
    const ctrl = this.f(type === 'must' ? 'mustHaveSkills' : 'niceToHaveSkills')!;
    const list: string[] = [...(ctrl.value || [])];
    list.splice(index, 1);
    ctrl.setValue(list);
    ctrl.markAsDirty();
  }

  onSkillKeydown(event: KeyboardEvent, type: 'must' | 'nice'): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill(type);
    }
    if (event.key === 'Escape') {
      this.closePopups();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  f(name: string) { return this.form.get(name); }

  get notesLength(): number {
    return (this.f('notes')?.value || '').length;
  }

  isInvalid(name: string): boolean {
    const c = this.f(name);
    return !!(c?.invalid && c.touched);
  }

  disablePastDates = (date: Date): boolean =>
    date < new Date(new Date().setHours(0, 0, 0, 0));
}
