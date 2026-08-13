import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { ReusableTableComponent, TableColumn } from '../../../../shared/components/reusable-table/reusable-table.component';
import { JobInfoCardComponent, JobInfo } from '../job-info-card/job-info-card.component';
import { UserService } from '../../../settings/users/servics/user-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InterviewServiceService } from '../../service/interview-service.service';
import { NotificationService } from '../../../../core/services/notification.service';

export interface Interviewer {
  id: string | number;
  name?: string;
  username?: string;
  roleName?: string;
  email?: string;
  userId?:string |number
}

export interface InterviewRound {
  id: string;
  roundId?: number; 
  stageTypeId?: number;      // server stage type id
  label: string;
  colorClass: string;
  name: string;
  description: string;
  type: string;
  duration: string;
  interviewer: Interviewer | null;
  dropdownOpen: boolean;
  searchText: string;
  filteredUsers: Interviewer[];
  showDropdown: boolean;
  // fixed-position coords for the dropdown portal
  dropdownTop: number;
  dropdownLeft: number;
  dropdownWidth: number;
  // reassign-mode flags
  isRejected?: boolean;     // true  → editable in reassign mode
  isReadonly?: boolean;     // true  → locked chip, no interaction
}

// ── Shape of the row stored in localStorage ─────────────────────────────────
interface StoredRow {
  jobId: number;
  jobTitle: string;
  deptName: string;
  planId: number;
  planName: string;
  rounds: number;
  createdAt: string;
  assignmentStatus: { roundId: number; status: string }[];
}

// ── Reassign API response shape ──────────────────────────────────────────────
interface AssignmentHistory {
  assignmentId: number;
  interviewerUserId: number;
  interviewerName: string;
  roleName: string;
  status: string;           // 'PENDING' | 'REJECTED' | …
  comments: string | null;
  respondedAt: string | null;
}

interface ReassignRound {
  roundId: number;
  stageName: string;
  stageType: string;
  currentStatus: string;
  assignmentHistory: AssignmentHistory[];
}

interface ReassignApiResponse {
  data: { rounds: ReassignRound[] };
  message: string;
  responsecode: string;
}

const ROUND_COLORS = ['blue', 'purple', 'orange', 'green', 'teal', 'red'];

@Component({
  selector: 'app-assign-interviewers-by-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HeadingComponent, ReusableTableComponent, JobInfoCardComponent],
  templateUrl: './assign-interviewers-by-list.component.html',
  styleUrl: './assign-interviewers-by-list.component.scss',
})
export class AssignInterviewersByListComponent implements OnInit {

  assignmentNotes = '';
  pageMode: 'assign' | 'reassign' = 'assign';

  private jobId!: number;
  private planId!: number;

  private userService = inject(UserService);
  private ngZone = inject(NgZone);
  private http = inject(HttpClient);
  private interviewService = inject(InterviewServiceService);
  private notificationService = inject(NotificationService);
  allUsers: Interviewer[] = [];

  job: JobInfo = {
    title: '',
    id: '',
    status: 'Active',
    department: '',
    planName: '',
    totalRounds: 0,
    createdOn: '',
  };

  columns: TableColumn[] = [
    { key: 'round', label: 'Round', width: '80px', custom: true },
    { key: 'details', label: 'Round Name & Description', width: '300px', custom: true },
    { key: 'detailsType', label: 'Round Type', width: '300px', custom: true },
    { key: 'interviewer', label: 'Interviewer *', width: '280px', custom: true },
  ];

  rounds: InterviewRound[] = [];

  constructor(private router: Router) { }

  // ✅ Always available in ngOnInit
  ngOnInit(): void {
    const state = history.state as { type?: string; id?: number };

    const type = state?.type ?? 'assign';
    this.pageMode = type === 'reassign' ? 'reassign' : 'assign';

    if (this.pageMode === 'assign') {
      const jobId = state?.id;
      this.initFromLocalStorage();
      this.loadUsers();
      
    } else {
      const jobId = state?.id;
      if (jobId) {
        this.jobId = jobId;
        this.initFromLocalStorage();
        this.loadReassignData(jobId);
      }
    }
  }

  // ── ASSIGN mode ─────────────────────────────────────────────────────────────

  private initFromLocalStorage(): void {
    const raw = localStorage.getItem('details');
    if (!raw) return;

    try {
      const row: any = JSON.parse(raw);
      console.log(row);
      this.jobId = row.jobId;
      this.planId = row.planId;

      this.job = {
        title: row.jobTitle,
        id: ``,
        status: '',
        department: row.deptName,
        planName: row.planName,
        totalRounds: row.rounds,
        createdOn: new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };

      this.rounds = row.assignmentStatus.map((s: any, i: any) => ({
        id: `r${i + 1}`,
        roundId: s.roundId,
        stageTypeId: s?.stageTypeId,
        label: `R${i + 1}`,
        colorClass: ROUND_COLORS[i % ROUND_COLORS.length],
        name: s?.roundName,        // will be overridden after API load if available
        description: s?.roundName,
        type: s?.roundType,
        duration: '',
        interviewer: null,
        dropdownOpen: false,
        searchText: '',
        filteredUsers: [],
        showDropdown: false,
        dropdownTop: 0,
        dropdownLeft: 0,
        dropdownWidth: 0,
        isRejected: false,
        isReadonly: false,
      }));
    } catch {
      console.error('Failed to parse localStorage details');
    }
  }

  // ── REASSIGN mode ────────────────────────────────────────────────────────────

  private async loadReassignData(jobId: any): Promise<void> {
    try {
      const res: any = await this.interviewService.getInterviewAssignmentDetails(jobId);

      const apiRounds = res?.data?.rounds ?? [];

      this.rounds = apiRounds.map((r: any, i: any) => {

        // assignmentHistory is ordered oldest → newest, so the last entry is the latest one.
        const assignmentHistory: AssignmentHistory[] = r.assignmentHistory ?? [];
        const latestHistory = assignmentHistory.at(assignmentHistory.length - 1) ?? null;
        const isRejected = latestHistory?.status === 'Rejected';

        const prefilledInterviewer: Interviewer | null = latestHistory && !isRejected
          ? {
            id: latestHistory.interviewerUserId,
            name: latestHistory.interviewerName,
            roleName: latestHistory.roleName,
          }
          : null;

        return {
          id: `r${i + 1}`,
          roundId: r.roundId,
          stageTypeId: r.stageTypeId,
          label: `R${i + 1}`,
          colorClass: ROUND_COLORS[i % ROUND_COLORS.length],
          name: r.stageName,
          description: r.stageType,
          type: r.stageType,
          duration: '',
          interviewer: prefilledInterviewer,
          dropdownOpen: false,
          searchText: '',
          filteredUsers: [],
          showDropdown: false,
          dropdownTop: 0,
          dropdownLeft: 0,
          dropdownWidth: 0,
          isRejected,
          isReadonly: !isRejected,   // non-rejected rounds are locked
        };
      });

      // Load users only for editable (rejected) rounds
      if (this.rounds.some(r => r.isRejected)) {
        await this.loadUsers();
      }
    } catch {
      console.error('Failed to load reassign data');
    }
  }

  private async loadUsers(): Promise<void> {
    try {
      const obj = { page: 0, size: 10, sortBy: 'id', direction: 'DESC', filters: {} };
      const firstPage: any = await this.userService.getList({ ...obj, page: 0, size: 10 });
      const totalElements: number = firstPage?.data?.totalElements ?? 0;
      const res: any = totalElements <= 10
        ? firstPage
        : await this.userService.getList({ ...obj, page: 0, size: totalElements });
      this.allUsers = res?.content ?? res?.data?.users ?? [];
      this.rounds.forEach(r => (r.filteredUsers = [...this.allUsers]));
    } catch {
      console.error('Failed to load users');
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  getDisplayName(user: Interviewer): string {
    return user.name || user.username || '';
  }

  getInitials(user: Interviewer): string {
    const n = this.getDisplayName(user);
    if (!n) return '?';
    return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  isEditable(round: InterviewRound): boolean {
    if (this.isAiInterview(round)) return false;
    if (this.pageMode === 'assign') return true;
    return !!round.isRejected;
  }

  /** AI Interview rounds are automated — no interviewer needs to be picked. */
  isAiInterview(round: InterviewRound): boolean {
    const type = (round.type || '').trim().toLowerCase();
    console.log(type);
    return type === 'ai ' || type.includes('ai interview round');
  }

  /**
   * An interviewer should only be assigned to one round. Returns true if
   * `user` is already selected on some *other* round than `round`.
   */
  isAssignedElsewhere(user: Interviewer, round: InterviewRound): boolean {
    const uid = user.userId ?? user.id;
    if (uid === undefined || uid === null) return false;
    return this.rounds.some(
      (r) => r.id !== round.id && !!r.interviewer && (r.interviewer.userId ?? r.interviewer.id) === uid
    );
  }

  /** Label (e.g. "R1") of the other round `user` is already assigned to, for display in the dropdown. */
  assignedRoundLabel(user: Interviewer, round: InterviewRound): string {
    const uid = user.userId ?? user.id;
    const match = this.rounds.find(
      (r) => r.id !== round.id && !!r.interviewer && (r.interviewer.userId ?? r.interviewer.id) === uid
    );
    return match?.label ?? '';
  }

  // ── Dropdown ─────────────────────────────────────────────────────────────────

  openDropdown(round: InterviewRound, anchorEl: HTMLElement): void {
    if (!this.isEditable(round)) return;
    this.closeAllDropdowns();
    round.filteredUsers = [...this.allUsers];

    const rect = anchorEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownH = Math.min(220, round.filteredUsers.length * 52 + 8);
    const openUpward = spaceBelow < dropdownH && rect.top > dropdownH;

    round.dropdownTop = openUpward ? rect.top - dropdownH - 4 : rect.bottom + 4;
    round.dropdownLeft = rect.left;
    round.dropdownWidth = rect.width;
    round.showDropdown = true;
  }

  onSearchInterviewer(round: InterviewRound, anchorEl: HTMLElement): void {
    const term = round.searchText?.toLowerCase() || '';
    round.filteredUsers = this.allUsers.filter(u =>
      (u.username?.toLowerCase().includes(term) || u.name?.toLowerCase().includes(term))
    );
    if (!round.showDropdown) this.openDropdown(round, anchorEl);
  }

  hideRoundDropdown(round: InterviewRound): void {
    setTimeout(() => { round.showDropdown = false; }, 200);
  }

  selectInterviewer(round: InterviewRound, user: Interviewer): void {
    if (this.isAssignedElsewhere(user, round)) {
      this.notificationService.error(
        `${this.getDisplayName(user)} is already assigned to ${this.assignedRoundLabel(user, round)}. An interviewer can only be assigned to one round.`
      );
      return;
    }
    console.log(user);
    round.interviewer = user;
    round.searchText = '';
    round.showDropdown = false;
    round.filteredUsers = [...this.allUsers];
  }

  removeInterviewer(round: InterviewRound): void {
    if (!this.isEditable(round)) return;
    round.interviewer = null;
    round.searchText = '';
    round.filteredUsers = [...this.allUsers];
  }

  closeAllDropdowns(): void {
    this.rounds.forEach(r => (r.showDropdown = false));
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  onCancel(): void {
    this.router.navigate(['/demand/assign-interviewers']);
  }

  onSaveAssignments(): void {
    // In reassign mode only rejected rounds need a new interviewer.
    // AI Interview rounds never need one — they're automated in either mode.
    const roundsToValidate = (
      this.pageMode === 'reassign'
        ? this.rounds.filter(r => r.isRejected)
        : this.rounds
    ).filter(r => !this.isAiInterview(r));

    if (roundsToValidate.some(r => r.interviewer === null)) {
      alert('Please assign an interviewer to every required round before saving.');
      return;
    }
    console.log(roundsToValidate)
    const payload = {
      jobId: this.jobId,
      planId: this.planId,
      assignments: roundsToValidate.map(r => ({
        stageTypeId: r.stageTypeId,
        interviewerUserId: r.interviewer!.userId,
        interviewerName: r.interviewer!.name || r.interviewer!.username || '',
        roleName: r.interviewer!.roleName || '',
      })),
    };

    console.log('Payload:', payload);

    this.interviewService.updateAssignInterviwers(payload)
      .then((res: any) => {
        if (res?.responsecode == '00') {
          this.notificationService.success(res?.responsemessage || res?.message)
          this.router.navigate(['/demand/assign-interviewers']);
        }
        else {
          this.notificationService.error( res?.errors?.[0] || res?.responsemessage || res?.message)
        }
      })
      .catch((error: any) => {
        console.error('Save failed:', error);
        alert('Failed to save assignments. Please try again.');
      });
  }
}