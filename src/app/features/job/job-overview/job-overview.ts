import { Component, inject } from '@angular/core';
import { JobComponent } from '../job.component';
import { PipeLineCardsComponent } from '../../../shared/components/pipe-line-cards/pipe-line-cards.component';
import { CommonModule } from '@angular/common';
import { JobService } from '../services/job.service';
import { ViewJob } from '../view-job/view-job';

@Component({
  selector: 'app-job-overview',
  imports: [JobComponent, PipeLineCardsComponent, CommonModule,ViewJob],
  templateUrl: './job-overview.html',
  styleUrl: './job-overview.scss',
})
export class JobOverview {
  jobsList: any;
  selectedJobId: any;
  stages: any;
  private jobApi = inject(JobService);
  selectedJob: any;
  selectedBackgroundColor: any = 'linear-gradient(135deg, #2563EB,  #60A5FA, #3059cb)';
  normalBackgroundColor: any = '#ffffff';
  constructor() { }

  ngOnInit(): void {
   
  }

  
  handleSelectedJob($event: any) {
    this.selectedJobId = $event;
    this.handleJobDetailsById();
  }

 async handleJobDetailsById() {
    try {
      const res: any = await this.jobApi.getJobDetailsById(this.selectedJobId);
      this.stages = [
        { id: 1, title: "Applied", count: res?.applicantCount, total: res?.applicantCount },
        { id: 2, title: "Screened", count: res?.resumeCount, total: res?.applicantCount },
        { id: 3, title: "Shortlisted", count: res?.shortlisted, total: res?.applicantCount },
        { id: 4, title: "Interview", count: res?.interviewCount, total: res?.applicantCount },
        { id: 5, title: "Offer", count: res?.offerReleased, total: res?.applicantCount },
        { id: 6, title: "Hired", count: res?.hiredCount, total: res?.applicantCount },
      ]
      this.selectedJob = res;
    }
    catch (error) {

    }
  }
}
