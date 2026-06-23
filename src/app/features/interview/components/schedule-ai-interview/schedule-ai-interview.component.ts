import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";
import { Router } from '@angular/router';

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

// All possible slots in a day (fixed schedule)
const ALL_SLOT_DEFINITIONS = [
  { id: 1, label: '09:00 AM – 10:00 AM', startHour: 9,  startMinute: 0,  endHour: 10, endMinute: 0  },
  { id: 2, label: '10:30 AM – 11:30 AM', startHour: 10, startMinute: 30, endHour: 11, endMinute: 30 },
  { id: 3, label: '12:00 PM – 01:00 PM', startHour: 12, startMinute: 0,  endHour: 13, endMinute: 0  },
  { id: 4, label: '02:00 PM – 03:00 PM', startHour: 14, startMinute: 0,  endHour: 15, endMinute: 0  },
  { id: 5, label: '03:30 PM – 04:30 PM', startHour: 15, startMinute: 30, endHour: 16, endMinute: 30 },
  { id: 6, label: '05:00 PM – 06:00 PM', startHour: 17, startMinute: 0,  endHour: 18, endMinute: 0  },
];

@Component({
  selector: 'app-schedule-ai-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, HeadingComponent],
  templateUrl: './schedule-ai-interview.component.html',
  styleUrl: './schedule-ai-interview.component.scss',
})
export class ScheduleAiInterviewComponent implements OnInit, OnDestroy {
  candidate = {
    initials: 'PS',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    job: 'Backend Developer',
    interviewPlan: 'Backend Developer – Technical Round',
    interviewType: 'AI Video Interview',
    duration: '60 Minutes',
  };
  private router=inject(Router);
  recruiter = {
    initials: 'RK',
    name: 'Riya Kapoor',
    role: 'Recruiter',
    notifications: 6,
  };

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
    this.selectedDate = new Date(this.today); // default: today
  }

  ngOnInit() {
    this.buildCalendar();
    this.buildTimeSlots();

    // Refresh every minute so slots update as time passes
    this.clockInterval = setInterval(() => {
      this.today = new Date();
      this.buildTimeSlots();
      this.buildCalendar();
    }, 60_000);
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
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

  // ── Time Slots ──────────────────────────────────────────────────────────────

  /**
   * Build visible slots for the selected date.
   * Rule: if today is selected, hide slots whose START time has already passed.
   *       For future dates, show all slots.
   */
  buildTimeSlots() {
    const now = this.today;
    const isToday = this.selectedDate
      ? this.selectedDate.toDateString() === now.toDateString()
      : false;

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

  onSchedule() {
    alert(`Interview scheduled!\n${this.proposedSchedule}`);
  }

  onCancel() {
    this.router.navigate(['/interview/ai-interview-zone'],
      {state: { activeType: 'si' }}
    );
  }
}