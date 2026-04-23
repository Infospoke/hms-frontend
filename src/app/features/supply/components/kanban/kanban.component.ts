import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

type Stage = 'Applied' | 'Screened' | 'Shortlisted' | 'Interview' | 'Offer' | 'Hired';
type SlaStatus = 'BREACHED' | 'WARNING' | 'OK';

interface Candidate {
  id: number;
  name: string;
  sla: SlaStatus;
  days: number;
  percent?: number;
  ref?: boolean;
  jr?: string;       // Job Requisition badge e.g. "QAT-01"
  selected: boolean;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, NzModalModule],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
})
export class KanbanComponent {
  private modalRef?: NzModalRef;
  constructor(private modal: NzModalService) {}

  @ViewChild('showRejectConfirm', { static: true }) rejectConfirmModal!: TemplateRef<any>;
  @ViewChild('moveConfirmModal', { static: true }) moveConfirmModal!: TemplateRef<any>;

  stages: Stage[] = ['Applied', 'Screened', 'Shortlisted', 'Interview', 'Offer', 'Hired'];

  candidates: Record<Stage, Candidate[]> = {
    Applied: [
      { id: 1, name: 'Venkat R.',  sla: 'BREACHED', days: 8,  percent: 133, ref: true,  jr: 'QAT-01', selected: false },
      { id: 2, name: 'Arun C.',    sla: 'WARNING',  days: 5,  percent: 83,               jr: 'QAT-02', selected: false },
      { id: 3, name: 'Sri V.',     sla: 'OK',       days: 2,  percent: 22,               jr: 'QAT-01', selected: false }
    ],
    Screened: [
      { id: 4, name: 'Pooja K.',  sla: 'OK',      days: 1, percent: 15, ref: true, jr: 'QAT-03', selected: false },
      { id: 5, name: 'Rahul B.',  sla: 'WARNING', days: 4, percent: 70,            jr: 'QAT-02', selected: false }
    ],
    Shortlisted: [
      { id: 6, name: 'Ajay S.',   sla: 'OK',      days: 3, percent: 40, jr: 'QAT-01', selected: false }
    ],
    Interview: [],
    Offer: [],
    Hired: []
  };

  notifications = [
    { type: 'breach', title: 'SLA Breach — Venkat R.',   sub: 'Applied · 8d · 133%',       dismissable: true  },
    { type: 'warn',   title: 'SLA Warning — Arun C.',    sub: 'Applied · 5d · 83%',         dismissable: true  },
    { type: 'success',title: 'Referral received',         sub: 'Rahul T. submitted a referral', dismissable: false },
  ];

  selectedStage: Stage | null = null;
  pendingMoveStage: Stage | null = null;

  // ─── Avatar helpers ───────────────────────────────────
  avatarPalette     = ['#FEE2E2','#DBEAFE','#DCFCE7','#FEF3C7','#EDE9FE','#FCE7F3','#E0F2FE','#F0FDF4'];
  avatarTextPalette = ['#DC2626','#2563EB','#16A34A','#D97706','#7C3AED','#DB2777','#0284C7','#15803D'];

  getAvatarBg(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarPalette[Math.abs(hash) % this.avatarPalette.length];
  }

  getAvatarText(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarTextPalette[Math.abs(hash) % this.avatarTextPalette.length];
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  // ─── Stage color helpers ──────────────────────────────
  getStageColor(stage: Stage): string {
    const map: Record<Stage, string> = {
      Applied: '#2563EB', Screened: '#16A34A', Shortlisted: '#D97706',
      Interview: '#7C3AED', Offer: '#0891B2', Hired: '#15803D'
    };
    return map[stage];
  }

  getStageHeaderBg(stage: Stage): string {
    const map: Record<Stage, string> = {
      Applied: '#EFF6FF', Screened: '#F0FDF4', Shortlisted: '#FFFBEB',
      Interview: '#F5F3FF', Offer: '#ECFEFF', Hired: '#F0FDF4'
    };
    return map[stage];
  }

  getStageDotColor(stage: Stage): string {
    if (this.candidates[stage].length === 0) return '';
    const breached = this.candidates[stage].some(c => c.sla === 'BREACHED');
    const warned   = this.candidates[stage].some(c => c.sla === 'WARNING');
    if (breached) return '#EF4444';
    if (warned)   return '#F59E0B';
    return '#22C55E';
  }

  // ─── Bulk selection ───────────────────────────────────
  toggleSelect(stage: Stage, candidate: Candidate) {
    if (this.selectedStage && this.selectedStage !== stage) return;
    this.selectedStage = stage;
    candidate.selected = !candidate.selected;
    if (!this.candidates[stage].some(c => c.selected)) this.selectedStage = null;
  }

  getSelected(): Candidate[] {
    if (!this.selectedStage) return [];
    return this.candidates[this.selectedStage].filter(c => c.selected);
  }

  getSelectedCount(): number {
    return this.getSelected().length;
  }

  getNextStages(): Stage[] {
    if (!this.selectedStage) return [];
    const index = this.stages.indexOf(this.selectedStage);
    return this.stages.slice(index + 1);
  }

  // ─── Move stage ───────────────────────────────────────
  onMoveStageSelect(value: string) {
    if (!value) return;
    this.pendingMoveStage = value as Stage;
    this.modalRef = this.modal.create({
      nzTitle: 'Move Stage',
      nzContent: this.moveConfirmModal,
      nzFooter: [
        { label: 'Cancel',       onClick: () => this.cancelMove()   },
        { label: 'Confirm Move', type: 'primary', onClick: () => this.confirmMove() }
      ]
    });
  }

  confirmMove() {
    if (!this.selectedStage || !this.pendingMoveStage) return;
    const selected = this.getSelected();
    this.candidates[this.selectedStage] = this.candidates[this.selectedStage].filter(c => !c.selected);
    selected.forEach(c => { c.selected = false; this.candidates[this.pendingMoveStage!].push(c); });
    this.selectedStage = null;
    this.pendingMoveStage = null;
    this.modalRef?.destroy();
  }

  cancelMove() { this.modalRef?.destroy(); }

  // ─── Reject ───────────────────────────────────────────
  rejectSelected() {
    this.modalRef = this.modal.create({
      nzTitle: 'Reject Candidates',
      nzContent: this.rejectConfirmModal,
      nzFooter: [
        { label: 'Cancel',          onClick: () => this.cancelReject()  },
        { label: 'Confirm Reject',  danger: true, type: 'primary', onClick: () => this.confirmReject() }
      ]
    });
  }

  confirmReject() {
    if (!this.selectedStage) return;
    this.candidates[this.selectedStage] = this.candidates[this.selectedStage].filter(c => !c.selected);
    this.selectedStage = null;
    this.modalRef?.destroy();
  }

  cancelReject() { this.modalRef?.destroy(); }

  // ─── Notifications ────────────────────────────────────
  dismissNotification(i: number) {
    this.notifications.splice(i, 1);
  }

  // ─── Drag & Drop ─────────────────────────────────────
  dragData: Candidate | null = null;
  dragFrom: Stage | null = null;
  dragOverStage: Stage | null = null;

  onDragStart(stage: Stage, candidate: Candidate) {
    this.dragData = candidate;
    this.dragFrom = stage;
  }

  onDragOver(event: DragEvent, stage: Stage) {
    event.preventDefault();
    this.dragOverStage = stage;
  }

  onDragLeave() {
    this.dragOverStage = null;
  }

  onDrop(stage: Stage) {
    if (!this.dragData || !this.dragFrom) return;
    const fromIndex = this.stages.indexOf(this.dragFrom);
    const toIndex   = this.stages.indexOf(stage);
    if (toIndex <= fromIndex) {
      this.dragData = null; this.dragFrom = null; this.dragOverStage = null;
      return;
    }
    this.candidates[this.dragFrom] = this.candidates[this.dragFrom].filter(c => c.id !== this.dragData!.id);
    this.candidates[stage].push(this.dragData);
    this.dragData = null;
    this.dragFrom = null;
    this.dragOverStage = null;
  }
}