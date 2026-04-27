import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { JobService } from '../../services/job.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NzModalModule, NzButtonModule, NzCalendarModule,NzIconModule],
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.scss']
})
export class CandidateDetailComponent implements OnChanges {
  @Input() candidate: any = null;
  @Output() action = new EventEmitter<{ type: string; candidate: any; payload?: any }>();
  private job = inject(JobService);
  isExporting = false;
  private notification = inject(NotificationService);
  viewMode: 'default' | 'screening' | 'interview' = 'default';
  expandedQuestion: number | null = null;

  scheduleVisible = false;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  timeSlots: string[] = [];

  constructor() {
    this.generateTimeSlots();
  }

  generateTimeSlots(): void {
    const slots: string[] = [];
    let hour = 9;
    let minute = 30;
    while (hour < 18 || (hour === 18 && minute === 0)) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      minute += 30;
      if (minute >= 60) {
        minute = 0;
        hour++;
      }
    }
    this.timeSlots = slots;
  }

  ngOnChanges(): void {
    this.expandedQuestion = null;
    if (!this.candidate) { this.viewMode = 'default'; return; }
    const s = this.candidate.status?.toLowerCase();
    if (s === 'screened') this.viewMode = 'screening';
    else if (s === 'interview') this.viewMode = 'interview';
    else this.viewMode = 'default';
  }

  onViewResume(): void {
    if (this.candidate) this.action.emit({ type: 'viewResume', candidate: this.candidate });
  }

  handleExport(){
    this.job.exportByCandidateId(this.candidate?.id).then((res:any)=>{

    }).catch((error:any)=>{
      console.log()
    })
  }

  onAction(type: string): void {
    if (type === 'schedule') {
      this.selectedDate = null;
      this.selectedTime = null;
      this.scheduleVisible = true;
      return;
    }
    if (this.candidate) this.action.emit({ type, candidate: this.candidate });
  }

  onDateSelect(date: Date): void {
    this.selectedDate = date;
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  async confirmSchedule() {
    if (!this.selectedDate || !this.selectedTime || !this.candidate) return;
    const payload = {
      application_id: this.candidate.id,
      scheduled_date: this.selectedDate.toISOString().split('T')[0],
      scheduled_time: this.selectedTime
    };
    this.action.emit({ type: 'schedule', candidate: this.candidate, payload });
    this.scheduleVisible = false;
    try{
      const res = await this.job.scheduleInterview(payload);
      this.notification.success('Interview scheduled successfully');
    }catch(err){
      console.error('Error scheduling interview:', err);
      this.notification.error('Failed to schedule interview');
    }
  }

  cancelSchedule(): void {
    this.scheduleVisible = false;
  }

  disabledDate = (current: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current < today;
  };

  formatDisplayTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${m.toString().padStart(2, '0')} ${suffix}`;
  }

  toggleQuestion(index: number): void {
    this.expandedQuestion = this.expandedQuestion === index ? null : index;
  }

  get screeningData(): any {
    if (!this.candidate) return null;
    if (this.candidate.screeningData) return this.candidate.screeningData;
    return {
      finalScore: 0, skillMatch: 0, experience: 0, education: 0, keywords: 0, growth: 0,
      recommendation: { level: 'N/A', action: 'N/A' },
      summary: 'No screening data available.',
      skillsAnalysis: { matchPercentage: '0%', matched: [], missing: 'N/A' },
      educationAnalysis: { level: 'N/A', highlights: '', matched: '' },
      assessment: { strengths: [], weaknesses: [] },
      jobAnalysis: { fresher: 'N/A', firstJobStartYear: 'N/A', lastJobEndYear: 'N/A', totalJobsCount: 0 }
    };
  }

  get interviewData(): any {
    if (!this.candidate) return null;
    if (this.candidate.interviewData) return this.candidate.interviewData;
    return {
      finalScore: 0, skillMatch: 0, experience: 0, education: 0, keywords: 0, growth: 0,
      overallScore: 0, questionsAttempted: '0/0', proctoringViolations: 0,
      proctoringResults: [], questions: []
    };
  }
}