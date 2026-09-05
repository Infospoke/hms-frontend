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
import { NotificationService } from '../../../../core/services/notification.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilService } from '../../../../shared/util.service';
import { CandidateServiceComponent } from '../../../candidate-management/serviecs/candidate-service.component';
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
    CandidateDetailComponent,
  ],
  templateUrl: './job-overview.html',
  styleUrl: './job-overview.scss',
})
export class JobOverview {
  private jobApi = inject(JobService);
  private candidateService=inject(CandidateServiceComponent);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  util = inject(UtilService);

  jobsList: any[] = [];
  filteredJobsList: any[] = [];
  selectedJobId: any = null;
  selectedJob: any = null;
  stages: any[] = [];
  activeTab: any = 'all-jobs';
  selectedCandidateForDetail: any;
  selectedApplicantStatus: any = 'APPLIED';
  pdfSrc: any;
  filtersData: any = {};
  selectedFilters: any = {};
  // Tracks which filter sections are expanded — all open by default
  expandedFilters: Record<string, boolean> = {};
  isVisible = false;
  pdfUrl: any;
  isPdfVisible = false;
  activeFilterSection: string = '';
  tempActiveChips: { key: string; label: string }[] = [];
  constructor(private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    this.loadJobs();
    const activeTab = history.state?.activeTab;
    if (activeTab === 'applicants' || activeTab === 'job-details') {
      this.activeTab = activeTab;
    }
  }

  async loadJobs() {
    try {
      const res = await this.jobApi.getJobsList();
      this.jobsList = this.jobApi.jobs$() || [];
      this.filteredJobsList = [...this.jobsList];
    } catch (error) {
      console.error(error);
    }
  }

  handleSelectedJob($event: any) {
    this.selectedJobId = $event;
    // Reset the detail panel immediately so stale data from the previous job
    // never shows while the new applicants are loading
    this.selectedCandidateForDetail = null;
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
      const data=res?.data?.applicantsCount;
     
      this.stages = [
        { id: 1, title: 'Applied', count: data?.applicantCount, total: data?.applicantCount },
        { id: 2, title: 'Screened', count: data?.resumeCount, total:data?.applicantCount },
        { id: 3, title: 'Shortlisted', count: data?.shortlisted, total: data?.applicantCount },
        { id: 4, title: 'Interview', count: data?.interviewCount, total: data?.applicantCount },
        { id: 5, title: 'Offer', count: data?.offerCount, total: data?.applicantCount },
        { id: 6, title: 'Hired', count: data?.hiredCount, total: data?.applicantCount },
      ];
      this.selectedJob = res?.data;
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

  async onCandidateSelected(candidate: any) {
    let data: any;
    
    if (candidate?.status === 'COMPLETED' || candidate?.status === 'OFFER' || candidate?.status === 'HIRED') {
      const payload = { application_id: candidate?.id };
      data = await this.jobApi.fetchInterViewAnalysis(payload);
    }
    console.log(candidate);
    // Use null (not {}) so the interviewData getter can detect "no data" correctly
    this.selectedCandidateForDetail = { ...candidate, interviewData: data?.data ?? null };
  }

  getStatus(status: any) {
    // Clear detail panel when switching status tabs (Applied / Screening / etc.)
    this.selectedCandidateForDetail = null;
    this.selectedApplicantStatus = status;
    this.loadApplicants(status, this.selectedJobId);
  }

  async handleCandidateAction(event: any) {

    try {
      let res: any;
      console.log('Action event received in overview:', event);
      switch (event.type) {
        case 'interview':
          res = await this.jobApi.moveToInterview({
            application_id: event?.candidate?.id,
            question_type: 'AI',
          });
          break;

        case 'hire':
        case 'reject':
          res = await this.jobApi.updateApplicantStatus({
            application_id: event.candidate.id,
            decision: event?.type === 'hire' ? 'HIRED' : 'REJECTED',
            comment: event?.reason,
          });
          break;

        case 'viewResume':
          // res = await this.jobApi.viewResume('resume', event.candidate.id, 'view');
          res = await this.candidateService.viewDocument({ filePath: event.candidate.resumeUrl });
          break;
        case 'reupload':
          res=await this.jobApi.requestToReUpload(event.candidate.id);
          break;
        case 'schedule':
          break;
        default:
          console.log(event,"this is default..!");
          return;
      }

      if (event.type === 'viewResume') {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const safeUrl = url + '#toolbar=0&navpanes=0&scrollbar=0';

        // sanitize AFTER building full url
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(safeUrl);
        this.isPdfVisible = true;
        return;
      }
      if(event?.type==='reupload'){
        if(res?.responsecode=='00'){
          this.notificationService.success(res?.responsemessage || res?.message)
        }
        else{
          this.notificationService.error(res?.errors?.[0]  || res?.message || res?.message || res?.erros?.[0])
        }
        return;
      }
      if (res?.success) {
        this.notificationService.success(
          'Success',
          `Candidate ${event.type === 'hire'
            ? 'hired'
            : event.type === 'reject'
              ? 'rejected'
              : 'moved to interview'
          } successfully`,
        );
      }
      this.handleJobDetailsById();
      this.loadApplicants(this.selectedApplicantStatus, this.selectedJobId);
      this.selectedCandidateForDetail = null;  
    } catch (error) {
      console.error('Error occurred while updating applicant status:', error);
    }
  }
 
  async openPopup() {
    if (!this.jobsList.length) {
      await this.loadJobs();
    }
    this.filtersData = this.getFilters(this.jobsList);
    // All sections collapsed by default — user expands what they need
    this.expandedFilters = Object.keys(this.filtersData).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {}
    );
    const keys = Object.keys(this.filtersData);
    if (keys.length) {
      this.activeFilterSection = this.filterKey(keys[0]);
    }
    this.syncChips();
    this.isVisible = true;
  }

  toggleFilterSection(key: string): void {
    this.expandedFilters[key] = !this.expandedFilters[key];
  }

  // keyvalue pipe types key as string | number | symbol — symbol cannot be used
  // as an index type in strict mode, so we normalise it to string here.
  filterKey(key: string | number | symbol): string {
    return String(key);
  }

  handleApply() {
    this.filteredJobsList = this.applyFiltersToJobs(this.jobsList, this.selectedFilters);
    this.isVisible = false;
  }

  handleReset() {
    this.selectedFilters = {};
    this.tempActiveChips = [];
    this.filteredJobsList = [...this.jobsList];
  }
  removeTempChip(key: string) {
    delete this.selectedFilters[key];
    this.syncChips();
  }
  handleCancel() {
    this.isVisible = false;
  }

  onCheckboxChange(key: any, value: any, checked: boolean) {
    this.selectedFilters[key] = this.selectedFilters[key] || {};
    this.selectedFilters[key][value] = checked;
    this.syncChips();
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
    const allowedKeys = ['jobCountry', 'jobMode', 'jobType'];

    // Default seed values — always present even when jobs list is empty
    const defaultValues: Record<string, string[]> = {
      jobCountry: ['India', 'USA'],
      jobType:    ['Full-time', 'Part-time', 'Contract', 'Internship'],
      jobMode:    ['Hybrid', 'Remote', 'Onsite'],
    };

    // Initialise filters with defaults using Sets for dedup
    const filterSets: Record<string, Set<string>> = {};
    for (const key of allowedKeys) {
      filterSets[key] = new Set(defaultValues[key] ?? []);
    }

    // Merge in values from actual job data
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!allowedKeys.includes(key)) return;
        if (typeof item[key] === 'string' || typeof item[key] === 'number') {
          filterSets[key].add(item[key].toString());
        }
      });
    });

    // Convert Sets → arrays, preserving key order from allowedKeys
    const filters: any = {};
    for (const key of allowedKeys) {
      filters[key] = Array.from(filterSets[key]);
    }

    return filters;
  }

  handleCreateJob() {
    this.router.navigate(['/demand/all-approved-srs/create-job']);
  }
  private syncChips() {
    this.tempActiveChips = [];
    for (const key of Object.keys(this.selectedFilters)) {
      const selected = Object.entries(this.selectedFilters[key])
        .filter(([_, checked]) => checked)
        .map(([val]) => val);
      if (selected.length) {
        this.tempActiveChips.push({
          key,
          label: `${this.util.camelToNormal(key)}: ${selected.join(', ')}`
        });
      }
    }
  }
}