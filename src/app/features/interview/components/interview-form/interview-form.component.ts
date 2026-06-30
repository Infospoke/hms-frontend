import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import {
  InterviewCandidateInfoComponent,
  CandidateData,
} from '../interview-candidate-info/interview-candidate-info.component';
import { Router } from '@angular/router';

/**
 * Only allows links from recognized video-meeting platforms.
 * Extend this list of patterns if other providers need to be supported.
 */
const MEETING_LINK_PATTERNS: RegExp[] = [
  /^https?:\/\/(www\.)?meet\.google\.com\/[a-z0-9-]+/i, // Google Meet
  /^https?:\/\/([\w-]+\.)?zoom\.us\/(j|my)\/[\w?=&%-]+/i, // Zoom
  /^https?:\/\/teams\.(microsoft|live)\.com\/[\w/?=&%.-]+/i, // Microsoft Teams
  /^https?:\/\/([\w-]+\.)?webex\.com\/[\w/?=&%.-]+/i, // Cisco Webex
  /^https?:\/\/join\.skype\.com\/[\w-]+/i, // Skype
];

export function meetingLinkValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = (control.value ?? '').trim();
  if (!value) {
    return null; // Empty is fine here - pair with Validators.required separately if it must be mandatory.
  }
  const isRecognized = MEETING_LINK_PATTERNS.some((pattern) => pattern.test(value));
  return isRecognized ? null : { invalidMeetingLink: true };
}

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
  private router=inject(Router);
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
      meetingLink:   [prefill?.meetingLink ?? '', [meetingLinkValidator]],
      venueDetails:  [prefill?.venueDetails ?? ''],
    });

    // If the candidate switches between Online / Offline, clear out whichever
    // field no longer applies so a stale value can't block submission later.
    this.form.get('interviewType')?.valueChanges.subscribe((type) => {
      if (type === 'Online') {
        this.form.get('venueDetails')?.setValue('');
      } else if (type === 'Offline') {
        this.form.get('meetingLink')?.setValue('');
      }
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

    const raw = this.form.getRawValue();

    const payload: any = {
      roundId: this.getRoundId(),
      interviewDate: raw.interviewDate,
      startTime: this.toTimeWithSeconds(raw.startTime),
      endTime: this.toTimeWithSeconds(raw.endTime),
    };

    if (raw.interviewType === 'Online') {
      payload.meetingLink = raw.meetingLink;
    } else {
      payload.venueDetails = raw.venueDetails;
    }

    this.submitted.emit(payload);
  }

 
  private getRoundId(): string {
    const explicit = this.summary?.roundId ?? this.currentSchedule?.roundId;
    if (explicit !== undefined && explicit !== null && explicit !== '') {
      return String(explicit);
    }
    const roundText = this.summary?.job?.round;
    const match = roundText ? String(roundText).match(/\d+/) : null;
    return match ? match[0] : '';
  }

  /** Normalizes a time control's value ("HH:mm") to "HH:mm:ss". */
  private toTimeWithSeconds(value: string): string {
    if (!value) return '';
    return value.length === 5 ? `${value}:00` : value;
  }

  /** Helper: is a control invalid and touched */
  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!(c?.invalid && c?.touched);
  }

  handleBack(){
    const type=this.mode==='schedule'?'ts':'ui'
    this.router.navigate(["/supply/my-interview-requests"],{state:{activeType:type}})
  }
}