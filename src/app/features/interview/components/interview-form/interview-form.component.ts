import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
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

export interface TimeSlot {
  /** "HH:mm" 24-hour value stored on the form control */
  value: string;
  /** Human friendly label, e.g. "9:30 AM" */
  label: string;
}

/** Interview hours: 9:00 AM - 7:00 PM in 30 minute increments. */
const SLOT_START_MINUTES = 9 * 60;
const SLOT_END_MINUTES = 19 * 60;
const SLOT_STEP_MINUTES = 30;

function buildTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let mins = SLOT_START_MINUTES; mins <= SLOT_END_MINUTES; mins += SLOT_STEP_MINUTES) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const label = `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    slots.push({ value, label });
  }
  return slots;
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

  /** True once this interview has already been rescheduled once — the whole form becomes read-only. */
  @Input() alreadyRescheduled = false;

  /** The schedule it was moved to, shown read-only when alreadyRescheduled is true. */
  @Input() rescheduledInfo?: any;

  @Output() cancelled = new EventEmitter<void>();


  @Output() submitted = new EventEmitter<any>();

  form!: FormGroup;
  private router=inject(Router);

  /** Pre-computed interview-hours slot list (9:00 AM - 7:00 PM, 30 min steps). */
  readonly timeSlots: TimeSlot[] = buildTimeSlots();

  /** Which time-slot dropdown (if any) is currently open. */
  activeTimeField: 'start' | 'end' | null = null;

  toggleTimeDropdown(field: 'start' | 'end'): void {
    if (this.alreadyRescheduled) return;
    this.activeTimeField = this.activeTimeField === field ? null : field;
  }

  /** Closes any open time-slot dropdown when the user clicks elsewhere on the page. */
  @HostListener('document:click')
  closeTimeDropdowns(): void {
    this.activeTimeField = null;
  }

  selectStartTime(slot: string): void {
    if (this.alreadyRescheduled || this.isSlotDisabled(slot)) return;
    const ctrl = this.form.get('startTime');
    ctrl?.setValue(slot);
    ctrl?.markAsTouched();
    this.activeTimeField = null;
  }

  selectEndTime(slot: string): void {
    if (this.alreadyRescheduled || this.isEndSlotDisabled(slot)) return;
    const ctrl = this.form.get('endTime');
    ctrl?.setValue(slot);
    ctrl?.markAsTouched();
    this.activeTimeField = null;
  }

  get startTimeLabel(): string {
    const v = this.form?.get('startTime')?.value;
    return this.timeSlots.find((s) => s.value === v)?.label ?? '';
  }

  get endTimeLabel(): string {
    const v = this.form?.get('endTime')?.value;
    return this.timeSlots.find((s) => s.value === v)?.label ?? '';
  }
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

  /** Drives the "already rescheduled" banner + read-only form in the template. */
  get showAlreadyRescheduledBanner(): boolean {
    return this.isReschedule && this.alreadyRescheduled;
  }

  /**
   * The interview mode is decided by the job/round data (currentSchedule for
   * reschedules, summary.job for new schedules) — not something the user
   * should be able to flip here. Returns null only when neither source has a
   * value yet, in which case the picker stays editable as a fallback.
   */
  get lockedInterviewType(): 'Online' | 'Offline' | null {
    const raw = this.currentSchedule?.interviewType ?? this.summary?.job?.interviewType;
    if (raw === undefined || raw === null || raw === '') {
      return null;
    }
    return this.normalizeInterviewType(raw);
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

  /** Today's date as "yyyy-MM-dd", matching the native date input's value format. */
  get todayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** Used as the date input's [min] so past dates can't be picked at all. */
  get minInterviewDate(): string {
    return this.todayIso;
  }

  get isSelectedDateToday(): boolean {
    const date = this.form?.get('interviewDate')?.value;
    return !!date && date === this.todayIso;
  }

  private get nowHHmm(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  /** A start-time slot is unavailable once its time has already passed today. */
  isSlotDisabled(slot: string): boolean {
    return this.isSelectedDateToday && slot <= this.nowHHmm;
  }

  /** An end-time slot is unavailable if it's already passed today, or isn't after the chosen start time. */
  isEndSlotDisabled(slot: string): boolean {
    if (this.isSlotDisabled(slot)) {
      return true;
    }
    const start = this.form?.get('startTime')?.value;
    return !!start && slot <= start;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    console.log(this.summary,this.currentSchedule)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentSchedule'] && this.form) {
      this.patchNewSchedule();
    }
    if (changes['summary'] && this.form && !changes['currentSchedule']) {
      this.applyInterviewTypeLock();
    }
    if (changes['alreadyRescheduled'] && this.form) {
      this.applyAlreadyRescheduledLock();
    }
  }

  private buildForm(): void {
    const prefill = this.currentSchedule;

    this.form = this.fb.group({
      interviewDate: [this.toDateOnly(prefill?.interviewDate), Validators.required],
      startTime:     [this.toHHmm(prefill?.startTime),     Validators.required],
      endTime:       [this.toHHmm(prefill?.endTime),        Validators.required],
      interviewType: [prefill ? this.normalizeInterviewType(prefill.interviewType) : 'Online', Validators.required],
      meetingLink:   [prefill?.meetingLink ?? '', [meetingLinkValidator]],
      venueDetails:  [prefill?.venueDetails ?? ''],
    });

    this.applyInterviewTypeLock();
    this.applyAlreadyRescheduledLock();

    // If the candidate switches between Online / Offline, clear out whichever
    // field no longer applies so a stale value can't block submission later.
    this.form.get('interviewType')?.valueChanges.subscribe((type) => {
      if (type === 'Online') {
        this.form.get('venueDetails')?.setValue('');
      } else if (type === 'Offline') {
        this.form.get('meetingLink')?.setValue('');
      }
    });

    // If the date changes to today (or was already today), drop any selected
    // start/end slot that has now fallen in the past so it can't be submitted.
    this.form.get('interviewDate')?.valueChanges.subscribe(() => this.clearPastSlotsIfStale());
  }

  private clearPastSlotsIfStale(): void {
    if (!this.isSelectedDateToday) {
      return;
    }
    const startCtrl = this.form.get('startTime');
    const endCtrl = this.form.get('endTime');
    if (startCtrl?.value && this.isSlotDisabled(startCtrl.value)) {
      startCtrl.setValue('');
    }
    if (endCtrl?.value && this.isEndSlotDisabled(endCtrl.value)) {
      endCtrl.setValue('');
    }
  }

  private patchNewSchedule(): void {
    if (!this.currentSchedule) return;
    this.form.patchValue({
      interviewDate: this.toDateOnly(this.currentSchedule.interviewDate),
      startTime:     this.toHHmm(this.currentSchedule.startTime),
      endTime:       this.toHHmm(this.currentSchedule.endTime),
      interviewType: this.normalizeInterviewType(this.currentSchedule.interviewType),
      meetingLink:   this.currentSchedule.meetingLink ?? '',
      venueDetails:  this.currentSchedule.venueDetails ?? '',
    });
    this.applyInterviewTypeLock();
  }

  /**
   * Forces the interviewType control to whatever mode the job/round data
   * dictates and disables it so the user can't switch between Online and
   * Offline here. If neither source has a value (lockedInterviewType is
   * null), the control is left enabled as a fallback.
   */
  private applyInterviewTypeLock(): void {
    const ctrl = this.form.get('interviewType');
    if (!ctrl) return;
    const locked = this.lockedInterviewType;
    if (locked) {
      ctrl.setValue(locked, { emitEvent: false });
      ctrl.disable({ emitEvent: false });
      // The value-change subscription above only fires on emitEvent — since
      // we suppressed it, clear the now-inapplicable field ourselves.
      if (locked === 'Online') {
        this.form.get('venueDetails')?.setValue('');
      } else {
        this.form.get('meetingLink')?.setValue('');
      }
    } else {
      ctrl.enable({ emitEvent: false });
    }
  }

  /**
   * Once an interview has already been rescheduled once, the whole "New
   * Schedule Details" form becomes read-only — a second reschedule isn't
   * allowed, so there's nothing left here for the user to edit or submit.
   */
  private applyAlreadyRescheduledLock(): void {
    if (!this.form) return;
    if (this.alreadyRescheduled) {
      this.form.disable({ emitEvent: false });
    } else if (this.form.disabled) {
      this.form.enable({ emitEvent: false });
      this.applyInterviewTypeLock(); // re-apply the interviewType-specific lock after a blanket enable
    }
  }

  /**
   * Normalizes an ISO datetime (or date-only) string to "yyyy-MM-dd" so it
   * matches what the native date input requires to display a pre-filled value.
   */
  private toDateOnly(value: string | undefined | null): string {
    if (!value) return '';
    // Handles "2026-07-10T00:00:00.000Z" as well as plain "2026-07-10".
    return value.slice(0, 10);
  }

  /**
   * Normalizes a time value (which may include seconds, e.g. "14:30:00") to
   * "HH:mm" so it matches one of the <select> option values in timeSlots.
   */
  private toHHmm(value: string | undefined | null): string {
    if (!value) return '';
    return value.slice(0, 5);
  }

  /**
   * Normalizes interviewType to exactly 'Online' or 'Offline' (case-insensitive
   * match against whatever casing the API returns), since showMeetingLink /
   * showVenueDetails and the radio-card `selected` state do strict '===' checks.
   */
  private normalizeInterviewType(value: string | undefined | null): 'Online' | 'Offline' {
    const v = (value ?? '').trim().toLowerCase();
    return v === 'offline' ? 'Offline' : 'Online';
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (this.alreadyRescheduled) {
      return;
    }
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
    this.router.navigate(["/candidate-management/in-person-interview"],{state:{activeType:type}})
  }
}