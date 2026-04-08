import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { JobService } from './services/job.service';
import { CommonModule } from '@angular/common';
import { JobsCardComponent } from '../../shared/components/jobs-card/jobs-card.component';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';

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
      const res: any = await this.jobApi.getJobsList(true);
      this.jobsListData = res;
      this.selectedJobId = res[0]?.jobId;
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
      this.router.navigate(['/jobs/edit-job', event.data]);
    } else if (event.type === 'delete') {
      this.deleteJob(event.data);
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