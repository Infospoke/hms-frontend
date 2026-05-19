import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

interface ReviewChannel {
  id: string; name: string; iconText: string; iconBg: string; iconColor: string;
  bestFor: string; cost: 'Paid' | 'Free' | 'Internal'; enabled: boolean; referralAmount?: number;
}

interface ReviewRecruiter {
  id: number; name: string; initials: string; avatarColor: string;
  email: string; role: string;
}

@Component({
  selector: 'app-review-submit-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './review-submit.component.html',
  styleUrl: './review-submit.component.scss',
})
export class ReviewSubmitStepComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() step1Form!: FormGroup;
  @Input() step2Form!: FormGroup;
  @Input() step3Form!: FormGroup;
  @Input() step4Form!: FormGroup;

  @Output() goToStep = new EventEmitter<number>();

  // ── Accordion open state ──────────────────────────────────────────────────
  open = { jobDetails: true, aiJd: true, sourcing: true, recruiter: true };

  get allCollapsed(): boolean {
    return !this.open.jobDetails && !this.open.aiJd && !this.open.sourcing && !this.open.recruiter;
  }

  toggleAll(): void {
    const collapse = !this.allCollapsed;
    this.open.jobDetails = !collapse;
    this.open.aiJd       = !collapse;
    this.open.sourcing   = !collapse;
    this.open.recruiter  = !collapse;
  }

  // ── Channel master list (mirrors sourcing-strategy) ───────────────────────
  private allChannels: ReviewChannel[] = [
    { id: 'linkedin',  name: 'LinkedIn Jobs',       iconText: 'in', iconBg: '#0a66c2', iconColor: '#fff',    bestFor: 'Professional & experienced candidates',  cost: 'Paid',     enabled: false },
    { id: 'indeed',    name: 'Indeed',               iconText: 'i',  iconBg: '#003a9b', iconColor: '#fff',    bestFor: 'Large volume of active job seekers',      cost: 'Paid',     enabled: false },
    { id: 'naukri',    name: 'Naukri.com',           iconText: 'N',  iconBg: '#ff7555', iconColor: '#fff',    bestFor: 'Active job seekers across India',         cost: 'Paid',     enabled: false },
    { id: 'internal',  name: 'Internal Career Site', iconText: '🏢', iconBg: '#e0f2fe', iconColor: '#0369a1', bestFor: 'Internal & past applicants',              cost: 'Free',     enabled: false },
    { id: 'referral',  name: 'Employee Referral',    iconText: '👥', iconBg: '#dcfce7', iconColor: '#16a34a', bestFor: 'Quality hires through employee network',  cost: 'Internal', enabled: false, referralAmount: 5000 },
    { id: 'monster',   name: 'Monster',              iconText: 'M',  iconBg: '#6d28d9', iconColor: '#fff',    bestFor: 'Diverse talent pool',                    cost: 'Paid',     enabled: false },
    { id: 'shine',     name: 'Shine.com',            iconText: 'S',  iconBg: '#fbbf24', iconColor: '#fff',    bestFor: 'Mid-level professionals',                cost: 'Paid',     enabled: false },
    { id: 'timesjobs', name: 'TimesJobs',            iconText: 'T',  iconBg: '#dc2626', iconColor: '#fff',    bestFor: 'Experienced professionals',              cost: 'Paid',     enabled: false },
    { id: 'apna',      name: 'Apna',                 iconText: 'A',  iconBg: '#0891b2', iconColor: '#fff',    bestFor: 'Blue collar & local candidates',          cost: 'Free',     enabled: false },
  ];

  // ── Recruiter master list (mirrors recruiter-assignment) ──────────────────
  private allRecruiters: ReviewRecruiter[] = [
    { id: 1, name: 'Rahul Sharma', initials: 'RS', avatarColor: '#ef4444', email: 'rahul.sharma@nexushms.com',  role: 'Talent Acquisition Specialist' },
    { id: 2, name: 'Pooja Patel',  initials: 'PP', avatarColor: '#a855f7', email: 'pooja.patel@nexushms.com',   role: 'Senior Recruiter' },
    { id: 3, name: 'Amit Mishra',  initials: 'AM', avatarColor: '#3b82f6', email: 'amit.mishra@nexushms.com',   role: 'Recruiter' },
    { id: 4, name: 'Neha Kapoor',  initials: 'NK', avatarColor: '#f59e0b', email: 'neha.kapoor@nexushms.com',   role: 'Talent Acquisition Specialist' },
    { id: 5, name: 'Vikas Kumar',  initials: 'VK', avatarColor: '#10b981', email: 'vikas.kumar@nexushms.com',   role: 'Technical Recruiter' },
    { id: 6, name: 'Shreya Nair',  initials: 'SN', avatarColor: '#ec4899', email: 'shreya.nair@nexushms.com',   role: 'Senior Recruiter' },
    { id: 7, name: 'Rohan Gupta',  initials: 'RG', avatarColor: '#06b6d4', email: 'rohan.gupta@nexushms.com',   role: 'Recruiter' },
  ];

  // ── Derived display data ──────────────────────────────────────────────────
  reviewChannels: ReviewChannel[] = [];
  reviewRecruiters: ReviewRecruiter[] = [];

  ngOnInit(): void {
    this.buildChannels();
    this.buildRecruiters();
  }

  private buildChannels(): void {
    const selectedIds: string[] = this.step3Form?.get('selectedChannels')?.value || [];
    const referralAmt: number   = this.step3Form?.get('referralAmount')?.value || 5000;

    this.reviewChannels = this.allChannels.map(ch => ({
      ...ch,
      enabled: selectedIds.includes(ch.id),
      referralAmount: ch.id === 'referral' ? referralAmt : ch.referralAmount,
    }));
  }

  private buildRecruiters(): void {
    const assignedIds: number[] = this.step4Form?.get('assignedRecruiters')?.value || [];
    this.reviewRecruiters = this.allRecruiters.filter(r => assignedIds.includes(r.id));
  }

  // ── Getters for sourcing summary ──────────────────────────────────────────
  get enabledChannels(): ReviewChannel[] { return this.reviewChannels.filter(c => c.enabled); }
  get paidCount():     number { return this.enabledChannels.filter(c => c.cost === 'Paid').length; }
  get freeCount():     number { return this.enabledChannels.filter(c => c.cost === 'Free').length; }
  get internalCount(): number { return this.enabledChannels.filter(c => c.cost === 'Internal').length; }
  get referralAmount(): number {
    return this.reviewChannels.find(c => c.id === 'referral' && c.enabled)?.referralAmount || 0;
  }
  get internalPosting(): boolean {
    return this.reviewChannels.some(c => c.id === 'internal' && c.enabled);
  }

  // ── Step 1 helpers ────────────────────────────────────────────────────────
  readonly today = new Date();

  get s1(): any { return this.step1Form?.getRawValue() || {}; }

  formatList(arr: string[]): string {
    return Array.isArray(arr) && arr.length ? arr.join(', ') : 'None';
  }

  formatAmount(n: number): string {
    return n ? '₹' + n.toLocaleString('en-IN') : '—';
  }
}
