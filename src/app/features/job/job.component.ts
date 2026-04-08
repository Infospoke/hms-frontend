import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { JobService } from './services/job.service';
import { CommonModule } from '@angular/common';
import { JobsCardComponent } from '../../shared/components/jobs-card/jobs-card.component';

@Component({
  selector: 'app-job',
  imports: [CommonModule, JobsCardComponent],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss',
})
export class JobComponent implements OnInit, OnChanges {
  @Input() filteredJobs: any[] | null = null;
  @Output() selectedJobIdChange = new EventEmitter<any>();

  selectedJobId: any;
  jobsListData: any[] = [];

  private jobApi = inject(JobService);

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
}