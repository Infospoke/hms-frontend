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
  imports: [CommonModule, FormsModule, NzModalModule, NzButtonModule, NzCalendarModule, NzIconModule],
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.scss']
})
export class CandidateDetailComponent implements OnChanges {
  @Input() candidate: any;
  @Input() pipelineStatus: string = 'APPLIED';
  @Output() action = new EventEmitter<{ type: string; candidate: any; reason?: any, payload?: any }>();
  private job = inject(JobService);
  isExporting = false;
  private notification = inject(NotificationService);
  viewMode: 'default' | 'screening' | 'interview' = 'default';
  activeTab: 'default' | 'screened' | 'interview' = 'default';
  expandedQuestion: number | null = null;
  showActionModal = false;
  modalAction: 'hire' | 'reject' | null = null;
  actionComment = '';
  isSubmittingAction = false;
  scheduleVisible = false;
  selectedDate: Date | null = new Date();;
  selectedTime: string | null = null;

  timeSlots: string[] = [];

  constructor() {
    this.generateTimeSlots(this.selectedDate);
    this.onDateSelect(this.selectedDate);
    console.log(this.candidate);
  }

  generateTimeSlots(selectedDate: any): void {
    const slots: string[] = [];

    const now = new Date();


    const isToday =
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();

    let hour = 9;
    let minute = 30;

    while (hour < 18 || (hour === 18 && minute === 0)) {
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, minute, 0, 0);


      if (!isToday || slotTime > now) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }

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
    if (!this.candidate) { this.viewMode = 'default'; this.activeTab = 'default'; return; }
    const s = this.pipelineStatus?.toLowerCase();
    if (s === 'screened') { this.viewMode = 'screening'; this.activeTab = 'screened'; }
    else if (s === 'interview' || s === 'offer' || s === 'hired') { this.viewMode = 'interview'; this.activeTab = 'interview'; }
    else { this.viewMode = 'default'; this.activeTab = 'default'; }
  }

  setTab(tab: 'default' | 'screened' | 'interview'): void {
    this.activeTab = tab;
    if (tab === 'default') this.viewMode = 'default';
    else if (tab === 'screened') this.viewMode = 'screening';
    else this.viewMode = 'interview';
    this.expandedQuestion = null;
  }

  get headerTitle(): string {
    if (this.viewMode === 'screening') return 'Screening Details';
    if (this.viewMode === 'interview') return 'Interview Analysis';
    return 'Candidate Detail';
  }

  onViewResume(): void {
    if (this.candidate) this.action.emit({ type: 'viewResume', candidate: this.candidate });
  }

  handleExport() {
    this.job.exportByCandidateId(this.candidate?.id)
      .then((res: any) => {
        const blob = new Blob([res.body], { type: 'application/pdf' });


        const contentDisposition = res.headers.get('content-disposition');
        let fileName = 'download.pdf';
        console.log(contentDisposition)
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.+?)"?$/);
          console.log(match);
          if (match?.[1]) {
            fileName = match[1];
          }
        }

        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
      }).catch((error: any) => {
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
   
    if (this.candidate) this.action.emit({ type, candidate: this.candidate, reason: this.actionComment });
  }

  onDateSelect(date: Date | null): void {
    this.selectedDate = date;
    this.generateTimeSlots(date);
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
    try {
      const res = await this.job.scheduleInterview(payload);
      this.notification.success('Interview scheduled successfully');
    } catch (err) {
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
    // Guard against null, undefined, or empty object {} — all mean "no data yet"
    const d = this.candidate.interviewData;
    if (d && typeof d === 'object' && Object.keys(d).length > 0) return d;
    return {
      total_score: 0, skills_match: 0, experience_score: 0,
      education_score: 0, keywords_match: 0, growth_score: 0,
      qna_count: 0, proctoring_violations: 0,
      proctoring_logs: [], qna_analysis: [], interview_timeline: []
    };
  }

  openActionModal(event: MouseEvent, action: 'hire' | 'reject'): void {
    event.stopPropagation();

    this.modalAction = action;
    this.actionComment = '';
    this.showActionModal = true;
  }
  closeActionModal(): void {
    this.showActionModal = false;
    this.modalAction = null;

    this.actionComment = '';
  }

  confirmAction(): void {
    if (!this.modalAction || !this.actionComment.trim()) return;

    this.onAction(this.modalAction);
    this.closeActionModal();
  }

  labelMap: Record<string, string> = {
    scheduled_dt: 'Scheduled',
    started_dt: 'Started',
    completed_dt: 'Completed',
    ended_dt: 'Ended'
  };

  get entries(): { key: string; label: string; date: string | null }[] {
    const timeline = this.interviewData?.interview_timeline ?? {};
    return Object.entries(timeline).map(([key, value]) => ({
      key,
      label: this.labelMap[key] ?? this.formatKey(key),
      date: this.fmt(value as string | null)
    }));
  }

  fmt(iso: string | null): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}  ${hh}:${min}`;
  }

  private formatKey(key: string): string {
    return key
      .replace(/_dt$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  isLast(index: number): boolean {
    return index === this.entries.length - 1;
  }


  showMoveToInterview(isStatus: string, currentStatus: string): boolean {
    console.log(isStatus, currentStatus,this.candidate);
    if (
      (isStatus === 'APPLIED' || isStatus === 'SCREENED') &&
      currentStatus !== 'INTERVIEW' &&
      currentStatus !== 'OFFER' &&
      currentStatus !== 'HIRED'
    ) {
      return true;
    }

    return false;
  }


  showReject(isStatus: string, currentStatus: string): boolean {
    console.log(isStatus, currentStatus);
    return (
      (
        ['SCREENED', 'APPLIED'].includes(isStatus) &&
        ['SHORTLISTED', 'NOT SHORTLISTED','SCREENED','Applied','APPLIED','Shortlisted','NotShortlisted','Not Shortlisted'].includes(currentStatus)
      ) ||
      (
        isStatus === 'INTERVIEW' &&
        currentStatus === 'COMPLETED'
      )
    );

  }
}