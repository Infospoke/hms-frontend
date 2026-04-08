import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { API } from '../../../shared/constants/api-endpoints';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private api = inject(ApiService);

  // ================== STATE (Signals) ==================

  private jobsListSignal = signal<any>(null);
  private dashboardSignal = signal<any>(null);
  private jobDetailsSignal = signal<any>(null);
  private applicantsSignal = signal<any>(null);
  private candidateSignal = signal<any>(null);
  private applicantByIdSignal = signal<any>(null);
  private analysisSignal = signal<any>(null);

  // ================== GETTERS ==================

  jobs$ = this.jobsListSignal;
  dashboard$ = this.dashboardSignal;
  jobDetails$ = this.jobDetailsSignal;
  applicants$ = this.applicantsSignal;
  candidate$ = this.candidateSignal;
  applicantById$ = this.applicantByIdSignal;
  analysis$ = this.analysisSignal;

  // ================== API CALLS + AUTO STORE ==================

  async getJobsList(isOpen: boolean){
    const res = await firstValueFrom(
      this.api.get(API.JOBS.GET_ALL_JOBS(isOpen))
    );
    this.jobsListSignal.set(res);
    return res;
  }

  async getJobDashboardCount() {
    const res = await firstValueFrom(
      this.api.get(API.JOBS.GET_DASHBOARD_DATA)
    );
    this.dashboardSignal.set(res);
    return res;
  }

  async getJobDetailsById(jobId: any) {
    const res = await firstValueFrom(
      this.api.get(API.JOBS.GET_JOB_BY_ID(jobId))
    );
    this.jobDetailsSignal.set(res);
    return res;
  }

  async getApplicants(status: any, id: any) {
    const res = await firstValueFrom(
      this.api.get(API.JOBS.GET_ALL_APPLICANTS(), {
        filter: status,
        jobId: id
      })
    );
    this.applicantsSignal.set(res);
    return res;
  }

  async getCandidateById(candidateId: any) {
    const res = await firstValueFrom(
      this.api.aiGet(API.JOBS.GET_CANDIDATE_BY_ID(), {
        applicationId: candidateId
      })
    );
    this.candidateSignal.set(res);
    return res;
  }

  async getApplicantById(applicantId: any) {
    const res = await firstValueFrom(
      this.api.get(API.JOBS.GET_APPLICANT_BY_ID(applicantId))
    );
    this.applicantByIdSignal.set(res);
    return res;
  }

  async getAllAnalysisDetails() {
    const res = await firstValueFrom(
      this.api.aiPost(API.JOBS.GET_ALL_ANALYSIS, {
        experience: [],
        recommendation: [],
        score: 0
      })
    );
    this.analysisSignal.set(res);
    return res;
  }

  // ================== OPTIONAL DIRECT GET METHODS ==================

  getJobsListValue() {
    return this.jobsListSignal();
  }

  getApplicantsValue() {
    return this.applicantsSignal();
  }
}