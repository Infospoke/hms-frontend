import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { JobService } from './services/job.service';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { JobsCardComponent } from '../../shared/components/jobs-card/jobs-card.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ConfirmModalComponent } from '../../shared/components/modal-component/confirm-modal.component';

@Component({
  selector: 'app-job',
  imports: [CommonModule, JobsCardComponent],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss',
})
export class JobComponent implements OnInit, OnChanges {
  @Input() filteredJobs: any[] | null = null;
  @Output() selectedJobIdChange = new EventEmitter<any>();
  private job = inject(JobService);
  private router = inject(Router);
  private modal = inject(NzModalService);

  selectedJobId: any;
  jobsListData: any[] = [];

  private jobApi = inject(JobService);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.getJobs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filteredJobs'] && this.filteredJobs?.length) {
      this.jobsListData = this.filteredJobs;
      if (!this.jobsListData.find((j: any) => j.jobId === this.selectedJobId)) {
        this.selectedJobId = this.jobsListData[0]?.jobId;
        this.selectedJobIdChange.emit(this.selectedJobId);
      }
    }
  }

  async getJobs() {
    try {
      const res: any = await this.jobApi.getJobsList();
      this.jobsListData = res?.data;
      this.selectedJobId = res?.data?.[0]?.jobId;
      this.handleSelectedJob(this.selectedJobId);
    } catch (error) {
      console.error(error);
    }
  }

  handleSelectedJob($event: any) {
    this.selectedJobId = $event;
    this.selectedJobIdChange.emit(this.selectedJobId);
  }

  handleJobAction(event: { type: 'edit' | 'delete'; data: any }) {
    if (event.type === 'edit') {
      // This action closes/deactivates the job — confirm with the user
      // before calling the API, instead of firing it immediately.
      this.openConfirmModal('deactivate', event?.data);
    } else if (event.type === 'delete') {
      this.deleteJob(event.data);
    }
  }

  /**
   * Opens the shared confirm modal for the given mode, and only runs the
   * corresponding API call if the user confirms.
   */
  private openConfirmModal(mode: 'activate' | 'deactivate', jobId: any): void {
    const modal = this.modal.create<ConfirmModalComponent>({
      nzContent: ConfirmModalComponent,
      nzData: { mode },
      nzClassName: 'custom-confirm-modal custom-edit-modal',
      nzFooter: null,
      nzCentered: true,
      nzWidth: 360,
      nzClosable: false,
    });

    modal.afterClose.subscribe((result: string) => {
      if (result === 'confirm') {
        this.updateJob(jobId, mode === 'activate');
      }
    });
  }

  async updateJob(jobId: any, isOpen: boolean = false) {
    const obj = {
      jobId: jobId,
      isOpen: isOpen
    }
    const res: any = await this.jobApi.updateJobToClose(obj);
    if (res?.responsecode == '00') {
      this.notification.success(res?.message || res?.responsemessage || res?.responseMessage);
      this.getJobs();
    }
    else {
      this.notification.error(res?.message || res?.responsemessage || res?.responseMessage)
    }
  }

  async deleteJob(jobId: any) {
    try {
      await this.jobApi.deleteJob(jobId);
      console.log('Job deleted successfully');
      this.getJobs();
      this.notification.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      this.notification.error('Error deleting job');
    }
  }
}