import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';

import { ApprovalService } from '../../../approvals/services/approval-service';
import { UserService } from '../../../settings/users/servics/user-service';
import { SupplyService } from '../../services/supply-service';

@Component({
  selector: 'app-job-approval-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-approval-detail.component.html',
  styleUrl: './job-approval-detail.component.scss',
})
export class JobApprovalDetailComponent implements OnInit {
  jobId: any;

  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private jobService = inject(SupplyService);
  private approvalService = inject(ApprovalService);
  private userService = inject(UserService);

  // ── State
  isLoading = true;
  jobData: any = null;
  departments: any[] = [];
  businessUnits: any[] = [];

  // ── Derived display data
  overview: any = null;
  jobDescription = '';
  sourcingChannels: ChannelDisplay[] = [];
  recruiters: RecruiterDisplay[] = [];
  referralEnabled = false;
  referralAmount: number | null = null;
  departmentName = '';
  businessUnitName = '';
  private route = inject(ActivatedRoute);
  // ── Decision form
  decision: 'accept' | 'decline' | null = null;
  comment = '';
  isSubmitting = false;

  readonly MAX_COMMENT = 500;

  get charCount(): number {
    return this.comment.length;
  }

  get canSubmit(): boolean {
    return this.decision !== null && this.comment.trim().length > 0 && !this.isSubmitting;
  }

  get experienceLabel(): string {
    if (!this.overview) return '—';
    const min = this.overview.minExperience;
    const max = this.overview.maxExperience;
    if (min != null && max != null) return `${min} – ${max} Years`;
    if (min != null) return `${min}+ Years`;
    if (max != null) return `Up to ${max} Years`;
    return '—';
  }

  get mustHaveSkills(): string[] {
    return this.overview?.skillsMustHave ?? [];
  }

  get niceToHaveSkills(): string[] {
    return this.overview?.niceToHaveSkills ?? [];
  }

  get targetStartDate(): string {
    const d = this.overview?.targetStartDate;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  get enabledChannelCount(): number {
    return this.sourcingChannels.filter(c => c.enabled).length;
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'];
    Promise.all([
      this.loadDepartments(),
      this.loadBusinessUnits(),
    ]).then(() => this.loadJobDetail());
  }

  // ── Data loaders

  private loadDepartments(): Promise<void> {
    return this.approvalService.departments()
      .then((res: any) => {
        if (res?.data) this.departments = res.data;
      })
      .catch(() => { });
  }

  private loadBusinessUnits(): Promise<void> {
    return this.userService.getBussinessUnits()
      .then((res: any) => {
        if (res?.data) this.businessUnits = res.data;
      })
      .catch(() => { });
  }

  private loadJobDetail(): void {
    this.isLoading = true;
    this.jobService.getJobDetailsByID(this.jobId)
      .then((res: any) => {
        if (res?.responsecode === '00') {
          this.jobData = res.data;
          this.buildDisplayData(res.data);
        } else {
          this.notificationService.error(res?.message ?? 'Failed to load job details');
        }
      })
      .catch((err: any) => {
        this.notificationService.error(err?.message ?? 'Failed to load job details');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private buildDisplayData(data: any): void {
    this.overview = data.jobOverview;

    // Resolve names from lookup arrays
    this.departmentName = this.departments
      .find(d => d.id === this.overview?.departmentId)?.name ?? '—';
    this.businessUnitName = this.businessUnits
      .find(b => b.id === this.overview?.businessUnitId)?.name ?? '—';

    // Job description
    this.jobDescription = data.jobDescription?.description ?? '';

    // Sourcing channels
    const channelMeta: Record<string, { icon: string; iconBg: string; type: string }> = {
      LinkedIn: { icon: 'in', iconBg: '#0A66C2', type: 'Paid' },
      Naukri: { icon: 'N', iconBg: '#FF6633', type: 'Paid' },
      Indeed: { icon: 'In', iconBg: '#6366F1', type: 'Paid' },
      Referral: { icon: 'R', iconBg: '#16A34A', type: 'Internal' },
    };

    const rawChannels: Record<string, boolean> = data.sourcingStrategy?.sourcingChannels ?? {};
    this.sourcingChannels = Object.entries(rawChannels).map(([name, enabled]) => ({
      name,
      enabled,
      icon: channelMeta[name]?.icon ?? name[0],
      iconBg: channelMeta[name]?.iconBg ?? '#64748B',
      type: channelMeta[name]?.type ?? 'Paid',
    }));

    this.referralEnabled = data.sourcingStrategy?.referral ?? false;
    this.referralAmount = data.sourcingStrategy?.referralAmount ?? null;

    if (this.referralEnabled) {
      this.sourcingChannels.push({
        name: 'Employee Referral',
        enabled: true,
        icon: 'ER',
        iconBg: '#16A34A',
        type: 'Internal',
      });
    }

    // Recruiters
    this.recruiters = (data.recruiters?.recruiters ?? []).map((r: any) => ({
      ...r,
      initials: this.getInitials(r.userName),
      avatarBg: this.getAvatarColor(r.userName),
      assignedAtFormatted: this.formatDateTime(r.assignedAt),
    }));
  }

  // ── Decision

  setDecision(d: 'accept' | 'decline'): void {
    this.decision = this.decision === d ? null : d;
  }

  onSubmit(): void {
    if (!this.canSubmit) return;
    this.isSubmitting = true;

    const payload = {
      jobId: this.jobId,
      status: this.decision,
      comments: this.comment.trim() || null,
    };

    this.jobService.submitJobDecision(payload)
      .then((res: any) => {
        if (res?.responsecode === '00') {
          this.notificationService.success(
            this.decision === 'accept'
              ? 'Job accepted successfully'
              : 'Job declined successfully'
          );
          this.router.navigateByUrl('/demand/my-job-assignments');
        } else {
          this.notificationService.error(res?.message ?? 'Failed to submit decision');
        }
      })
      .catch((err: any) => {
        this.notificationService.error(err?.message ?? 'Failed to submit decision');
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  onCancel(): void {
    this.router.navigateByUrl('/supply/my-assignend-jobs');
  }

  // ── Utilities

  formatReferralAmount(amount: number): string {
    if (amount >= 1_000_000_000) return `₹${(amount / 1_000_000_000).toFixed(2)}B`;
    if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(2)}K`;
    return `₹${amount}`;
  }

  private getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private getAvatarColor(name: string): string {
    const colors = [
      { bg: '#EFF6FF', fg: '#1D4ED8' },
      { bg: '#F0FDF4', fg: '#166534' },
      { bg: '#FEF3C7', fg: '#92400E' },
      { bg: '#FDF4FF', fg: '#7E22CE' },
      { bg: '#FFF7ED', fg: '#9A3412' },
      { bg: '#F0F9FF', fg: '#0369A1' },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return JSON.stringify(colors[Math.abs(hash) % colors.length]);
  }

  getAvatarBg(colorJson: string): string {
    try { return JSON.parse(colorJson).bg; } catch { return '#EFF6FF'; }
  }

  getAvatarFg(colorJson: string): string {
    try { return JSON.parse(colorJson).fg; } catch { return '#1D4ED8'; }
  }

  private formatDateTime(isoString: string): string {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }) + ', ' + d.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit',
    });
  }
}

export interface ChannelDisplay {
  name: string;
  enabled: boolean;
  icon: string;
  iconBg: string;
  type: string;
}

export interface RecruiterDisplay {
  userName: string;
  email: string;
  assignedAt: string;
  assignedAtFormatted: string;
  initials: string;
  avatarBg: string;
}