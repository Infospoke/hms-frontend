import { Component, inject } from '@angular/core';
import { JobComponent } from '../../job.component';
import { PipeLineCardsComponent } from '../../../../shared/components/pipe-line-cards/pipe-line-cards.component';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';
import { ViewJob } from '../view-job/view-job';
import { AppliedCandidatesComponent } from '../applied-candidates/applied-candidates.component';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CandidateDetailComponent } from '../candidate-detail/candidate-detail.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-overview',
  imports: [
    FormsModule,
    CommonModule,
    NzModalModule,
    NzCheckboxModule,
    NzButtonModule,
    JobComponent,
    PipeLineCardsComponent,
    ViewJob,
    AppliedCandidatesComponent,
    CandidateDetailComponent
  ],
  templateUrl: './job-overview.html',
  styleUrl: './job-overview.scss',
})
export class JobOverview {
  private jobApi = inject(JobService);
  private router = inject(Router);
  jobsList: any[] = [];
  filteredJobsList: any[] = [];
  selectedJobId: any = null;
  selectedJob: any = null;
  stages: any[] = [];
  activeTab: any = 'all-jobs';
  selectedCandidateForDetail: any = null;
  selectedApplicantStatus: any = 'APPLIED';

  filtersData: any = {};
  selectedFilters: any = {};
  isVisible = false;

  ngOnInit(): void {
    this.loadJobs();
    const activeTab = history.state?.activeTab;
    if (activeTab === 'applicants' || activeTab === 'job-details') {
      this.activeTab = activeTab;
    }
  }

  async loadJobs() {
    try {
      const res = await this.jobApi.getJobsList(true);
      this.jobsList = this.jobApi.jobs$() || [];
      this.filteredJobsList = [...this.jobsList];
    } catch (error) {
      console.error(error);
    }
  }

  handleSelectedJob($event: any) {
    this.selectedJobId = $event;
    this.handleJobDetailsById();
    if (this.activeTab === 'applicants') {
      this.loadApplicants(this.selectedApplicantStatus, this.selectedJobId);
    }
  }

  async loadApplicants(status: string, jobId: any) {
    if (!jobId) return;
    try {
      await this.jobApi.getApplicants(status, jobId);
      await this.jobApi.getAllAnalysisDetails();
    } catch (error) {
      console.error(error);
    }
  }

  async handleJobDetailsById() {
    if (!this.selectedJobId) return;
    try {
      const res: any = await this.jobApi.getJobDetailsById(this.selectedJobId);
      this.stages = [
        { id: 1, title: 'Applied', count: res?.applicantCount, total: res?.applicantCount },
        { id: 2, title: 'Screened', count: res?.resumeCount, total: res?.applicantCount },
        { id: 3, title: 'Shortlisted', count: res?.shortlisted, total: res?.applicantCount },
        { id: 4, title: 'Interview', count: res?.interviewCount, total: res?.applicantCount },
        { id: 5, title: 'Offer', count: res?.offerReleased, total: res?.applicantCount },
        { id: 6, title: 'Hired', count: res?.hiredCount, total: res?.applicantCount },
      ];
      this.selectedJob = res;
    } catch (error) {
      console.error(error);
    }
  }

  handleTab(tabName: any) {
    this.activeTab = tabName;
    this.selectedCandidateForDetail = null;
    if (tabName === 'applicants' && this.selectedJobId) {
      this.loadApplicants(this.selectedApplicantStatus, this.selectedJobId);
    }
  }

  onCandidateSelected(candidate: any) {
    this.selectedCandidateForDetail = candidate;
  }

  getStatus(status: any) {
    this.selectedApplicantStatus = status;
    this.loadApplicants(status, this.selectedJobId);
  }

  handleCandidateAction(event: any) {
    console.log('Candidate action:', event.type, event.candidate);
  }

  async openPopup() {
    if (!this.jobsList.length) {
      await this.loadJobs();
    }
    this.filtersData = this.getFilters(this.jobsList);
    this.isVisible = true;
  }

  handleApply() {
    this.filteredJobsList = this.applyFiltersToJobs(this.jobsList, this.selectedFilters);
    this.isVisible = false;
  }

  handleReset() {
    this.selectedFilters = {};
    this.filteredJobsList = [...this.jobsList];
  }

  handleCancel() {
    this.isVisible = false;
  }

  onCheckboxChange(key: any, value: any, checked: boolean) {
    this.selectedFilters[key] = this.selectedFilters[key] || {};
    this.selectedFilters[key][value] = checked;
  }

  applyFiltersToJobs(jobs: any[], filters: any): any[] {
    const activeFilters: Record<string, string[]> = {};
    for (const key of Object.keys(filters)) {
      const selected = Object.entries(filters[key])
        .filter(([_, checked]) => checked)
        .map(([val]) => val);
      if (selected.length) activeFilters[key] = selected;
    }

    if (!Object.keys(activeFilters).length) return [...jobs];

    return jobs.filter((job) => {
      return Object.entries(activeFilters).every(([key, values]) => {
        if (key === 'skills') {
          const jobSkills = (job.skills || []).map((s: any) => s.skillName);
          return values.some((v) => jobSkills.includes(v));
        }
        return values.includes(job[key]?.toString());
      });
    });
  }

  getFilters(data: any[]): any {
    const filters: any = {};
    const allowedKeys = ['jobCountry', 'jobLevel', 'jobMode', 'jobType', 'skills', 'jobLocation'];

    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!allowedKeys.includes(key)) return;
        if (key === 'skills') {
          item.skills?.forEach((s: any) => {
            filters['skills'] = filters['skills'] || new Set();
            filters['skills'].add(s.skillName);
          });
        } else if (typeof item[key] === 'string' || typeof item[key] === 'number') {
          filters[key] = filters[key] || new Set();
          filters[key].add(item[key]);
        }
      });
    });

    Object.keys(filters).forEach((k) => {
      filters[k] = Array.from(filters[k]);
    });

    return filters;
  }

  handleCreateJob() {
    this.router.navigate(['/jobs/add-job']);
  }
}