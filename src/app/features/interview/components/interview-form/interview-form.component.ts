import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import {
  InterviewCandidateInfoComponent,
  CandidateData,
} from '../interview-candidate-info/interview-candidate-info.component';

@Component({
  selector: 'app-interview-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeadingComponent, InterviewCandidateInfoComponent],
  templateUrl: './interview-form.component.html',
  styleUrl: './interview-form.component.scss',
})
export class InterviewFormComponent implements OnInit, OnChanges {
  @Input() mode: any = 'schedule';

  @Input() summary!: any;

  @Input() currentSchedule?: any;

  @Output() cancelled = new EventEmitter<void>();


  @Output() submitted = new EventEmitter<any>();

  form!: FormGroup;

  /**
   * Maps summary.candidate (the shape used by interview-form) to the
   * CandidateData interface expected by InterviewCandidateInfoComponent.
   */
  get candidateData(): CandidateData {
    const c = this.summary?.candidate ?? {};
    // Split the full name into first / last if the parent passes a single
    // `name` string, or pass through firstName / lastName directly.
    const firstName: string =
      c.firstName ?? (c.name ? c.name.split(' ')[0] : '');
    const lastName: string =
      c.lastName ?? (c.name ? c.name.split(' ').slice(1).join(' ') : '');

    return {
      firstName,
      lastName,
      currentRole: c.role ?? c.currentRole,
      candidateId: c.candidateId,
      email: c.email,
      phone: c.phone,
      currentLocation: c.currentLocation,
      noticePeriod: c.noticePeriod,
      currentCompany: c.currentOrganization ?? c.currentCompany,
      totalExperience: c.totalExperience,
      stage: c.badge ?? c.stage,
      profileUrl: c.profileUrl,
      // Personal
      dateOfBirth: c.dateOfBirth,
      age: c.age,
      gender: c.gender,
      nationality: c.nationality,
      languages: c.languages,
      address: c.address,
      // Education
      degree: c.degree,
      university: c.university,
      yearOfPassing: c.yearOfPassing,
      cgpa: c.cgpa,
      // Experience
      currentCtc: c.currentCtc,
      expectedCtc: c.expectedCtc,
      // Projects & Certifications
      projects: c.projects,
      certifications: c.certifications,
    };
  }

 


  get isReschedule(): boolean {
    return this.mode === 'reschedule';
  }

  get pageTitle(): string {
    return this.isReschedule ? 'Reschedule Interview' : 'Schedule Interview';
  }

  get pageBackTitle(): string {
    return this.isReschedule
      ? 'Back to Upcoming Interviews'
      : 'Back to Schedule';
  }

  get pageSubtitle(): string {
    return this.isReschedule
      ? 'Update the interview date and time for the candidate.'
      : 'Schedule an interview for the candidate';
  }

  get submitLabel(): string {
    return this.isReschedule ? 'Reschedule Interview' : 'Schedule Interview';
  }

  get showMeetingLink(): boolean {
    return this.form?.get('interviewType')?.value === 'Online';
  }

  get showVenueDetails(): boolean {
    return this.form?.get('interviewType')?.value === 'Offline';
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentSchedule'] && this.form) {
      this.patchNewSchedule();
    }
  }

  private buildForm(): void {
    const prefill = this.currentSchedule;

    this.form = this.fb.group({
      interviewDate: [prefill?.interviewDate ?? '', Validators.required],
      startTime:     [prefill?.startTime ?? '',     Validators.required],
      endTime:       [prefill?.endTime ?? '',        Validators.required],
      interviewType: [prefill?.interviewType ?? 'Online', Validators.required],
      meetingLink:   [prefill?.meetingLink ?? ''],
      venueDetails:  [prefill?.venueDetails ?? ''],
    });
  }

  private patchNewSchedule(): void {
    if (!this.currentSchedule) return;
    this.form.patchValue({
      interviewDate: this.currentSchedule.interviewDate,
      startTime:     this.currentSchedule.startTime,
      endTime:       this.currentSchedule.endTime,
      interviewType: this.currentSchedule.interviewType,
      meetingLink:   this.currentSchedule.meetingLink ?? '',
      venueDetails:  this.currentSchedule.venueDetails ?? '',
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }

  /** Helper: is a control invalid and touched */
  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!(c?.invalid && c?.touched);
  }
}