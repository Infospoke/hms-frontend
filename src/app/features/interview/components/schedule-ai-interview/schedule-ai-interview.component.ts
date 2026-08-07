import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Subscription } from 'rxjs';
import { InterviewServiceService } from '../../service/interview-service.service';

interface CalendarDay {
  date: number | null;
  fullDate: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  isPast: boolean;
}

interface TimeSlot {
  id: number;
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  available: boolean;
  selected: boolean;
  isPast: boolean;
}

interface CandidateOverview {
  initials: string;
  name: string;
  email: string;
  job: string;
  interviewPlan: string;
  interviewType: string;
  duration: string;
}

// ── Slot generation config ───────────────────────────────────────────────────
// Slots are generated on the fly (rather than hardcoded) so changing the
// duration or working-day window only requires touching these constants.
const SLOT_DURATION_MINUTES = 30;
const WORK_DAY_START = { hour: 9, minute: 0 };   // 09:00 AM
const WORK_DAY_END = { hour: 18, minute: 0 };    // 06:00 PM

/** Formats an hour/minute pair as a 12-hour clock string, e.g. "09:00 AM". */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

/** Builds fixed-length slot definitions across the working day. */
function generateSlotDefinitions(): Array<{
  id: number;
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}> {
  const slots: Array<{
    id: number;
    label: string;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  }> = [];

  let id = 1;
  let cursor = WORK_DAY_START.hour * 60 + WORK_DAY_START.minute;
  const end = WORK_DAY_END.hour * 60 + WORK_DAY_END.minute;

  while (cursor + SLOT_DURATION_MINUTES <= end) {
    const startHour = Math.floor(cursor / 60);
    const startMinute = cursor % 60;
    const next = cursor + SLOT_DURATION_MINUTES;
    const endHour = Math.floor(next / 60);
    const endMinute = next % 60;

    slots.push({
      id: id++,
      label: `${formatTime(startHour, startMinute)} – ${formatTime(endHour, endMinute)}`,
      startHour,
      startMinute,
      endHour,
      endMinute,
    });

    cursor = next;
  }

  return slots;
}

const ALL_SLOT_DEFINITIONS = generateSlotDefinitions();

// Fallback values used only when the API doesn't return interviewType/duration
const DEFAULT_INTERVIEW_TYPE = 'AI Video Interview';
const DEFAULT_DURATION = '60 Minutes';

@Component({
  selector: 'app-schedule-ai-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, HeadingComponent],
  templateUrl: './schedule-ai-interview.component.html',
  styleUrl: './schedule-ai-interview.component.scss',
})
export class ScheduleAiInterviewComponent implements OnInit, OnDestroy {
  candidate: CandidateOverview = {
    initials: '',
    name: '',
    email: '',
    job: '',
    interviewPlan: '',
    interviewType: DEFAULT_INTERVIEW_TYPE,
    duration: DEFAULT_DURATION,
  };

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private interviewService = inject(InterviewServiceService); // 👈 service exposing scheduleInterviewTime() + getCandidateOverview()

  recruiter = {
    initials: 'RK',
    name: 'Riya Kapoor',
    role: 'Recruiter',
    notifications: 6,
  };

  // ── Application context ──────────────────────────────────────────────────
  applicationId!: number;
  isScheduling = false;
  scheduleError: string | null = null;

  isLoadingCandidate = false;
  candidateError: string | null = null;

  private paramSub?: Subscription;

  selectedTimezone = '(GMT +05:30) Asia/Kolkata';
  timezones = [
    '(GMT +05:30) Asia/Kolkata',
    '(GMT +00:00) UTC',
    '(GMT -05:00) America/New_York',
    '(GMT +01:00) Europe/London',
    '(GMT +08:00) Asia/Singapore',
  ];

  timeSlots: TimeSlot[] = [];
  noSlotsAvailable = false;

  // Calendar state
  today = new Date();
  currentYear: number;
  currentMonth: number;
  selectedDate: Date | null;
  calendarDays: CalendarDay[] = [];
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  private clockInterval: any;

  constructor() {
    this.today = new Date();
    this.currentYear = this.today.getFullYear();
    this.currentMonth = this.today.getMonth();
    this.selectedDate = new Date(this.today);

    // Read the id straight off the URL: /ai-interview-zone/schedule-ai-interview/:applicantionId
    // (param name matches the route config exactly — note the typo "applicantionId")
    this.applicationId = this.readApplicationIdFromRoute();
  }

  ngOnInit() {
    this.buildCalendar();
    this.buildTimeSlots();
    this.fetchCandidateOverview();

    // Refresh every minute so slots update as time passes
    this.clockInterval = setInterval(() => {
      this.today = new Date();
      this.buildTimeSlots();
      this.buildCalendar();
    }, 60_000);

    
    this.paramSub = this.route.paramMap.subscribe(() => {
      const next = this.readApplicationIdFromRoute();
      if (next !== this.applicationId) {
        this.applicationId = next;
        this.fetchCandidateOverview();
      }
    });
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.paramSub?.unsubscribe();
  }

  private readApplicationIdFromRoute(): number {
    const raw =
      this.route.snapshot.paramMap.get('applicantionId') ??
      this.route.snapshot.paramMap.get('applicationId');

    if (raw != null && !isNaN(Number(raw))) {
      return Number(raw);
    }

    const navState = this.router.getCurrentNavigation()?.extras?.state as
      | { applicationId?: number }
      | undefined;
    return navState?.applicationId ?? (history.state?.applicationId ?? 0);
  }

  // ── Candidate Overview ───────────────────────────────────────────────────

  async fetchCandidateOverview() {
    if (!this.applicationId) {
      this.candidateError = 'Missing application id; cannot load candidate details.';
      return;
    }

    this.isLoadingCandidate = true;
    this.candidateError = null;

    try {
      const res = await this.interviewService.getCandidateOverview(this.applicationId);
      const data = res?.data;

      if (!data) {
        this.candidateError = 'Candidate details not found.';
        return;
      }

      this.candidate = {
        initials: this.getInitials(data.candidateName),
        name: data.candidateName ?? '',
        email: data.email ?? '',
        job: data.jobTitle ?? '',
        interviewPlan: data.planName ?? '',
        interviewType: data.interviewType ?? DEFAULT_INTERVIEW_TYPE,
        duration: data.duration ?? DEFAULT_DURATION,
      };
    } catch (err) {
      console.error('Failed to load candidate overview', err);
      this.candidateError = 'Failed to load candidate details. Please try again.';
    } finally {
      this.isLoadingCandidate = false;
    }
  }

  private getInitials(name?: string | null): string {
    if (!name) return '';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  get currentMonthLabel(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  // ── Calendar ────────────────────────────────────────────────────────────────

  buildCalendar() {
    const days: CalendarDay[] = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay  = new Date(this.currentYear, this.currentMonth + 1, 0);
    const todayStr = this.today.toDateString();

    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1; // Mon-based

    // Leading filler days (prev month)
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i, fullDate: null,
        isCurrentMonth: false, isToday: false, isSelected: false,
        isWeekend: false, isPast: true
      });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const fullDate = new Date(this.currentYear, this.currentMonth, d);
      const dow = fullDate.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const isToday = fullDate.toDateString() === todayStr;
      const isSelected = this.selectedDate
        ? fullDate.toDateString() === this.selectedDate.toDateString()
        : false;

      // Mark as past if before today (date only comparison)
      const isPast = fullDate < new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());

      days.push({ date: d, fullDate, isCurrentMonth: true, isToday, isSelected, isWeekend, isPast });
    }

    // Trailing filler
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: d, fullDate: null,
        isCurrentMonth: false, isToday: false, isSelected: false,
        isWeekend: false, isPast: true
      });
    }

    this.calendarDays = days;
  }

  prevMonth() {
    if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear--; }
    else { this.currentMonth--; }
    this.buildCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++; }
    else { this.currentMonth++; }
    this.buildCalendar();
  }

  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth || !day.fullDate || day.isPast) return;
    this.selectedDate = day.fullDate;
    this.buildCalendar();
    this.buildTimeSlots();
  }

  // ── Time slots ────────────────────────────────────────────────────────────

  buildTimeSlots() {
    const now = this.today;
    const isToday = this.selectedDate
      ? this.selectedDate.toDateString() === now.toDateString()
      : false;

    // Minutes-since-midnight for "now" (bug fix: was previously `getHours() * 30`,
    // which under-counted elapsed time and let already-passed slots stay visible).
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Previous selected slot label (to re-select if still available)
    const prevSelectedLabel = this.timeSlots.find(s => s.selected)?.label ?? null;

    const built: TimeSlot[] = ALL_SLOT_DEFINITIONS.map(def => {
      const slotStartMinutes = def.startHour * 60 + def.startMinute;
      // For today: slot is past if its start time <= current time
      const isPast = isToday ? slotStartMinutes <= nowMinutes : false;

      return {
        ...def,
        available: !isPast,
        selected: false,
        isPast,
      };
    }).filter(s => !s.isPast); // Remove past slots entirely

    this.timeSlots = built;
    this.noSlotsAvailable = built.length === 0;

    // Re-select the same slot if it still exists, otherwise select first available
    if (prevSelectedLabel) {
      const match = built.find(s => s.label === prevSelectedLabel);
      if (match) { match.selected = true; return; }
    }
    if (built.length > 0) built[0].selected = true;
  }

  selectTimeSlot(slot: TimeSlot) {
    this.timeSlots.forEach(s => s.selected = false);
    slot.selected = true;
  }

  get selectedSlot(): TimeSlot | null {
    return this.timeSlots.find(s => s.selected) || null;
  }

  // ── Proposed Schedule ───────────────────────────────────────────────────────

  get proposedSchedule(): string {
    if (!this.selectedDate || !this.selectedSlot) return '';
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dayName = days[this.selectedDate.getDay()];
    const d = this.selectedDate.getDate();
    const m = months[this.selectedDate.getMonth()];
    const y = this.selectedDate.getFullYear();
    return `${dayName}, ${d} ${m} ${y} at ${this.selectedSlot.label} (IST)`;
  }

  // ── Schedule / Cancel actions ────────────────────────────────────────────

  async onSchedule() {
    if (!this.selectedDate || !this.selectedSlot) return;

    if (!this.applicationId) {
      this.scheduleError = 'Missing application reference. Cannot schedule interview.';
      console.error(this.scheduleError);
      return;
    }

    const payload = {
      application_id: this.applicationId,
      scheduled_date: this.formatDateForApi(this.selectedDate),
      scheduled_time: this.formatTimeForApi(this.selectedSlot),
      question_type: 'AI',
    };

    this.isScheduling = true;
    this.scheduleError = null;

    try {
      await this.interviewService.scheduleInterviewTime(payload);

      this.router.navigate(['/candidate-management/ai-interview-zone'], { state: { activeType: 'is' } });
    } catch (err) {
      console.error('Failed to schedule interview', err);
      this.scheduleError = 'Something went wrong while scheduling the interview. Please try again.';
    } finally {
      this.isScheduling = false;
    }
  }

  onCancel() {
    console.log("clicked");
    this.router.navigate(['/candidate-management/ai-interview-zone'],
      { state: { activeType: 'is' } }
    );
  }

  // ── Formatters for API payload ───────────────────────────────────────────

  private formatDateForApi(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatTimeForApi(slot: TimeSlot): string {
    const h = `${slot.startHour}`.padStart(2, '0');
    const min = `${slot.startMinute}`.padStart(2, '0');
    return `${h}:${min}`;
  }
}