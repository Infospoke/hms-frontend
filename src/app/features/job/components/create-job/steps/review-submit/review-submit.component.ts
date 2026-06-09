import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

interface ReviewChannel {
  id: string; name: string; iconText: string; iconBg: string; iconColor: string;
  bestFor: string; cost: 'Paid' | 'Free' | 'Internal'; enabled: boolean; referralAmount?: number;
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
  @Input() step5Form!: FormGroup;

  @Output() goToStep = new EventEmitter<number>();

  open = { jobDetails: true, aiJd: true, sourcing: true, recruiter: true, interviewPlan: true };

get allCollapsed(): boolean {
  return !this.open.jobDetails && !this.open.aiJd && !this.open.sourcing
      && !this.open.recruiter && !this.open.interviewPlan;
}

toggleAll(): void {
  const collapse = !this.allCollapsed;
  this.open.jobDetails    = !collapse;
  this.open.aiJd          = !collapse;
  this.open.sourcing      = !collapse;
  this.open.recruiter     = !collapse;
  this.open.interviewPlan = !collapse;
}

  reviewChannels: ReviewChannel[] = [];
  reviewRecruiters: any[] = [];

  ngOnInit(): void {
    this.buildChannels();
    this.buildRecruiters();
  }

private buildChannels(): void {
  const stored: any[] = this.step3Form?.get('selectedChannels')?.value || [];
  this.reviewChannels = stored.map((ch: any) => ({
    id:            ch.channelName?.toLowerCase().replace(/\s+/g, ''),
    name:          ch.channelName,
    iconText:      ch.iconText    ?? ch.channelName?.[0]?.toUpperCase() ?? '?',
    iconBg:        ch.iconBg      ?? '#e2e8f0',
    iconColor:     ch.iconColor   ?? '#1e293b',
    bestFor:       ch.bestFor     ?? '—',
    cost:          ch.cost        ?? 'Free',
    enabled:       !!ch.postJob,
    referralAmount: ch.referralAmount ? Number(ch.referralAmount) : 0,
  }));
}

  private buildRecruiters(): void {
    this.reviewRecruiters = (this.step4Form?.get('selectedRecruiterDetails')?.value || []).map((r: any) => ({
      ...r,
      initials:    this.getInitials(r.userName),
      avatarColor: this.getAvatarColor(r.userName),
    }));
  }

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

  readonly today = new Date();
  get s1(): any { return this.step1Form?.getRawValue() || {}; }

  formatList(arr: string[]): string {
    return Array.isArray(arr) && arr.length ? arr.join(', ') : 'None';
  }

  formatAmount(n: number): string {
    return n ? '₹' + n.toLocaleString('en-IN') : '—';
  }

  getInitials(userName: string): string {
    if (!userName) return '?';
    const parts = userName.trim().split(' ').filter(Boolean);
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAvatarColor(userName: string): string {
    const colors = ['#4f46e5','#0891b2','#16a34a','#d97706','#dc2626','#9333ea','#0284c7','#c2410c'];
    let hash = 0;
    for (let i = 0; i < userName.length; i++) hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  get selectedPlanDetail(): any {
  return this.step5Form?.get('selectedPlanDetail')?.value || null;
}
}