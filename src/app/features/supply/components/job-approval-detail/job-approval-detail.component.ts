import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';

import { ApprovalService } from '../../../approvals/services/approval-service';
import { UserService } from '../../../settings/users/servics/user-service';
import { SupplyService } from '../../services/supply-service';
import { InterviewServiceService } from '../../../interview/service/interview-service.service';
// NOTE: adjust this path to match where the shared modal actually lives in your project
import {
  CommonModalComponent,
  CommentModalAction,
  CommentModalResult,
} from '../../../../shared/components/common-modal/common-modal.component';

@Component({
  selector: 'app-job-approval-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonModalComponent],
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
  private interviewService = inject(InterviewServiceService);

  // ── Mode (job approval vs. interview-assignment acceptance)
  // 'type' is read from router navigation state, e.g.
  //   this.router.navigate([...], { state: { type: 'assignment' } })
  type: string | null = null;
  assignmentId: any = null;

  get isAssignmentMode(): boolean {
    return this.type === 'assignment';
  }

  // ── State
  isLoading = true;
  jobData: any = null;
  departments: any[] = [];
  businessUnits: any[] = [];

  // ── Derived display data
  overview: any = null;
  jobDescription: JobDescriptionDisplay | null = null;
  sourcingChannels: ChannelDisplay[] = [];
  recruiters: RecruiterDisplay[] = [];
  referralEnabled = false;
  referralAmount: number | null = null;
  departmentName = '';
  businessUnitName = '';

  // ── Existing response (read-only mode when already submitted)
  existingResponse: { status: string; comments: string } | null = null;

 get hasExistingResponse(): boolean {
  return this.existingResponse !== null && this.existingResponse.status !== 'PENDING';
}

  private route = inject(ActivatedRoute);

  // ── Decision modal (shared app-common-modal) ────────────────────────────
  isSubmitting = false;
  isDecisionModalOpen = false;
  decisionModalAction: CommentModalAction | null = null;

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

  get enabledSourcingChannels(): ChannelDisplay[] {
    return this.sourcingChannels.filter(c => c.enabled);
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'];

    // 'type' is passed via router navigation state when coming from
    // the interview-assignment list (e.g. { state: { type: 'assignment' } }).
    const navState = (history.state ?? {}) as { type?: string,assignmentId:string };
    this.type = navState?.type ?? null;
    this.assignmentId=navState?.assignmentId ??null;
   

    this.loadJobDetail();
  }

  // ── Data loaders

 

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
    this.departmentName =this.overview?.department ?? '-';
    this.businessUnitName = this.overview.businessUnit??'-';

    // Job description – API returns an array of JD objects; take the first
    const descArr = data.jobDescription?.description;
    const raw = Array.isArray(descArr) && descArr.length > 0 ? descArr[0] : null;
    if (raw) {
      this.jobDescription = {
        jobSummary:              raw.jobSummary ?? '',
        keyResponsibilities:     raw.keyResponsibilities ?? [],
        basicQualifications:     raw.basicQaulifications ?? [],
        preferredQualifications: raw.preferredQualifications ?? [],
        certificationsRequired:  raw.certificationsRequired ?? [],
        languagesRequired:       raw.languagesRequired ?? [],
        educationRequirements:   raw.educationRequirements ?? '',
        experienceRequirements:  raw.experienceRequirements ?? '',
        aboutCompany:            raw.aboutCompany ?? '',
      };
    } else {
      this.jobDescription = null;
    }
    const channelMeta: Record<string, { icon: string; iconBg: string }> = {
      LinkedIn: { icon: 'in', iconBg: '#0A66C2', },
      Naukri: { icon: 'N', iconBg: '#FF6633', },
      Indeed: { icon: 'In', iconBg: '#6366F1' },
      Referral: { icon: 'R', iconBg: '#16A34A' },
    };

    const rawChannels: Record<string, boolean> = data.sourcingStrategy?.sourcingChannels ?? {};
    this.sourcingChannels = Object.entries(rawChannels).map(([name, enabled]) => ({
      name,
      enabled,
      icon: channelMeta[name]?.icon ?? name[0],
      iconBg: channelMeta[name]?.iconBg ?? '#64748B',

    }));

    this.referralEnabled = data.sourcingStrategy?.referral ?? false;
    this.referralAmount = data.sourcingStrategy?.referralAmount ?? null;

    if (this.referralEnabled) {
      this.sourcingChannels.push({
        name: 'Employee Referral',
        enabled: true,
        icon: 'ER',
        iconBg: '#16A34A',
        // type: 'Internal',
      });
    }

    // Existing response (already-submitted decision)
    const myResponse = data.recruiters?.myResponse;
    if (Array.isArray(myResponse) && myResponse.length > 0) {
      const latest = myResponse[myResponse.length - 1];
      if (latest?.status && latest.status !== 'PENDING') {
        this.existingResponse = {
          status: latest.status,
          comments: latest.comments ?? '',
        };
      }
    }

    // Recruiters
    this.recruiters = (data.recruiters?.recruiters ?? []).map((r: any) => ({
      ...r,
      initials: this.getInitials(r.userName),
      avatarBg: this.getAvatarColor(r.userName),
      assignedAtFormatted: this.formatDateTime(r.assignedAt),
    }));
  }

  // ── Decision (opens the shared comment modal; API call happens on confirm)

  openDecisionModal(action: CommentModalAction): void {
    this.decisionModalAction = action;
    this.isDecisionModalOpen = true;
  }

  closeDecisionModal(): void {
    this.isDecisionModalOpen = false;
    this.decisionModalAction = null;
  }

  async onDecisionConfirmed(result: CommentModalResult): Promise<void> {
    const status = result.action === 'approve' ? 'Accepted' : 'Rejected';
    this.isSubmitting = true;

    try {
      if (this.isAssignmentMode) {
        if (!this.assignmentId) return;

        const payload = {
          Id: this.assignmentId,
          status,
          comments: result.comment,
        };
        const res: any = await this.interviewService.updateIntervieAssignement(payload);
        if (res?.responsecode === '00') {
          this.closeDecisionModal();
          this.notificationService.success(
            status === 'Accepted'
              ? 'Assignment accepted successfully'
              : 'Assignment rejected successfully'
          );
          this.router.navigate(['/supply/in-person-interview'], {
            state: { activeType: 'ar' },
          });
        } else {
          this.notificationService.error(res?.message ?? 'Failed to update assignment');
        }
      } else {
        const payload = {
          jobId: this.jobId,
          status,
          comments: result.comment,
        };
        const res: any = await this.jobService.submitJobDecision(payload);
        if (res?.responsecode === '00') {
          this.closeDecisionModal();
          this.notificationService.success(
            status === 'Accepted'
              ? 'Job accepted successfully'
              : 'Job declined successfully'
          );
          this.router.navigate(['/supply/my-assignend-jobs'], {
            state: { activeType: 'ar' },
          });
        } else {
          this.notificationService.error(res?.message ?? 'Failed to submit decision');
        }
      }
    } catch (err: any) {
      this.notificationService.error(err?.message ?? 'Failed to submit decision');
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.router.navigate([
      this.isAssignmentMode ? '/supply/my-interview-requests' : '/supply/my-assignend-jobs'],{
          state: { activeType: 'ar' },
        }
    );
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
  // type: string;
}

export interface JobDescriptionDisplay {
  jobSummary: string;
  keyResponsibilities: string[];
  basicQualifications: string[];
  preferredQualifications: string[];
  certificationsRequired: string[];
  languagesRequired: string[];
  educationRequirements: string;
  experienceRequirements: string;
  aboutCompany: string;
}

export interface RecruiterDisplay {
  userName: string;
  email: string;
  assignedAt: string;
  assignedAtFormatted: string;
  initials: string;
  avatarBg: string;
}