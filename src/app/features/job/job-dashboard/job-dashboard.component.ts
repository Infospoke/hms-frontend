import { Component, inject, OnInit } from '@angular/core';
import { JobService } from '../services/job.service';
import { DashboardComponent } from "../../dashboard/dashboard.component";

@Component({
  selector: 'app-job-dashboard',
  imports: [DashboardComponent],
  templateUrl: './job-dashboard.component.html',
  styleUrl: './job-dashboard.component.scss',
})
export class JobDashboardComponent implements OnInit {

  private jobApi = inject(JobService)
  list: any;
  stages: any;
  pipeLineDetails: any;
  jobsListData:any;
  selectedJobId:any;
  selectedJob:any;
  activityList:any;
  ngOnInit(): void {
    this.getJobs();
    this.getDashboardCount();
    this.getActityvityLogs();
  }

  async getDashboardCount() {
    try {
      const res: any = await this.jobApi.getJobDashboardCount();
      this.list = [
        { title: 'Open Jobs', count: res.openJobs, icon: 'fa-solid fa-briefcase' },
        { title: 'Candidates', count: res.candidates, icon: 'fa-solid fa-user' },
        { title: 'Interviews', count: res.interviews, icon: 'fa-solid fa-calendar-check' },
        { title: 'Offers Accepted', count: res.offersAccepted, icon: 'fa-solid fa-circle-check' }
      ]
    }
    catch (error: any) {

    }

  }

  async getJobs() {
    let isOpen = true;
    try {
      const res: any = await this.jobApi.getJobsList(isOpen);
      console.log(res);
      this.jobsListData = res;
      this.selectedJobId = res?.[0]?.jobId;
      this.handleJobSelection();
    }
    catch (error) {

    }

  }

  async getActityvityLogs(){
    try {
      const res: any = await this.jobApi.getActivityLogs();
      this.activityList = res;
      console.log(this.activityList);
    }
    catch (error) {

    }
  }
  handleSelectedJob($event: any) {
    this.selectedJobId = $event;
    this.handleJobSelection();
  }

  handleJobSelection() {
    this.selectedJob = this.jobsListData.find((item:any) => item.jobId === this.selectedJobId);
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
    }
    catch (error) {

    }
  }

}
