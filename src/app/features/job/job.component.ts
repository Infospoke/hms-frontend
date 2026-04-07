import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { JobService } from './services/job.service';
import { CommonModule } from '@angular/common';
import { JobsCardComponent } from '../../shared/components/jobs-card/jobs-card.component';

@Component({
  selector: 'app-job',
  imports: [CommonModule,JobsCardComponent],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss',
})
export class JobComponent implements OnInit{
  selectedJobId: any;
  stages: any;
  jobsListData: any;

  @Output() selectedJobIdChange = new EventEmitter<any>();
  private jobApi = inject(JobService)

  ngOnInit(): void {
    this.getJobs();
  }

  
  async getJobs() {
    let isOpen = true;
    try {
      const res: any = await this.jobApi.getJobsList(isOpen);
      console.log(res);
      this.jobsListData = res;
      this.selectedJobId = res[0]?.jobId;
      this.handleSelectedJob(this.selectedJobId);
    }
    catch (error) {

    }
  }
  handleSelectedJob($event: any) {
    this.selectedJobId = $event;
    this.selectedJobIdChange.emit(this.selectedJobId);
    
  }

 
}
