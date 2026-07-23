import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

export type ConfirmMode =
  | 'activate'
  | 'deactivate'
  | 'replace-jd'
  | 'submit-job'
  | 'complete-interview'
  | 'approve-offer'
  | 'reject-offer';

interface ConfirmConfig {
  icon: string;
  iconClass: string;
  title: string;
  desc: string;
  okLabel: string;
  okClass: string;
}

const CONFIGS: Record<ConfirmMode, ConfirmConfig> = {
  activate: {
    icon: 'fas fa-circle-check',
    iconClass: 'icon-activate',
    title: 'Activate',
    desc: 'Are you sure you want to activate this user?',
    okLabel: 'Activate',
    okClass: 'btn-activate',
  },
  deactivate: {
    icon: 'fas fa-circle-exclamation',
    iconClass: 'icon-deactivate',
    title: 'Deactivate',
    desc: 'Are you sure you want to deactivate this user?',
    okLabel: 'De Activate',
    okClass: 'btn-deactivate',
  },
  'replace-jd': {
    icon: 'fas fa-rotate',
    iconClass: 'icon-warn',
    title: 'Replace Oldest Version?',
    desc: 'You already have 3 saved versions. Creating a new JD will replace the oldest version (Version 1). Continue?',
    okLabel: 'Yes, Generate',
    okClass: 'btn-primary-blue',
  },
  'submit-job': {
    icon: 'fas fa-paper-plane',
    iconClass: 'icon-primary',
    title: 'Submit Job?',
    desc: 'Are you sure you want to submit this job for approval? This action cannot be undone.',
    okLabel: 'Yes, Submit',
    okClass: 'btn-primary-blue',
  },
  'complete-interview': {
    icon: 'fas fa-check-circle',
    iconClass: 'icon-activate',
    title: 'Complete Interview?',
    desc: 'Are you sure you want to mark this interview as completed? This action cannot be undone.',
    okLabel: 'Yes, Complete',
    okClass: 'btn-primary-blue',
  },
  'approve-offer': {
    icon: 'fas fa-circle-check',
    iconClass: 'icon-activate',
    title: 'Approve Offer?',
    desc: 'Are you sure you want to approve this offer? This action cannot be undone.',
    okLabel: 'Yes, Approve',
    okClass: 'btn-activate',
  },
  'reject-offer': {
    icon: 'fas fa-circle-exclamation',
    iconClass: 'icon-deactivate',
    title: 'Reject Offer?',
    desc: 'Are you sure you want to reject this offer? This action cannot be undone.',
    okLabel: 'Yes, Reject',
    okClass: 'btn-deactivate',
  },
};

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {
  mode: ConfirmMode = 'deactivate';
  loading = false;
  config: ConfirmConfig;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: any
  ) {
    this.mode = data.mode;
    this.config = CONFIGS[this.mode] ?? CONFIGS['deactivate'];
  }

  onConfirm(): void {
    this.modalRef.close('confirm');
  }

  onCancel(): void {
    this.modalRef.close('cancel');
  }
}