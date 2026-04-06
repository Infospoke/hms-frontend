import { Component, inject } from '@angular/core';
import { JobService } from './services/job.service';

@Component({
  selector: 'app-job',
  imports: [],
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss',
})
export class JobComponent {
  selectedJobId: any;
  stages: any;
  jobsListData: any;
  private jobApi = inject(JobService)


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
    }
    catch (error) {

    }
  }
  async getJobs() {
    let isOpen = true;
    try {
      const res: any = await this.jobApi.getJobsList(isOpen);
      console.log(res);
      this.jobsListData = res;
      this.selectedJobId = res[0]?.jobId;
      // this.handleSelectedJob()
    }
    catch (error) {

    }
  }
  handleSelectedJob($event: any) {
    this.selectedJobId = $event;
    this.handleJobDetailsById();
  }

 
}
