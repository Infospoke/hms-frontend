import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { API } from '../../../shared/constants/api-endpoints';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private api = inject(ApiService);



  private jobsListSignal = signal<any>(null);
  private dashboardSignal = signal<any>(null);
  private jobDetailsSignal = signal<any>(null);
  private applicantsSignal = signal<any>(null);
  private candidateSignal = signal<any>(null);
  private applicantByIdSignal = signal<any>(null);
  private analysisSignal = signal<any>(null);


  jobs$ = this.jobsListSignal;
  dashboard$ = this.dashboardSignal;
  jobDetails$ = this.jobDetailsSignal;
  applicants$ = this.applicantsSignal;
  candidate$ = this.candidateSignal;
  applicantById$ = this.applicantByIdSignal;
  analysis$ = this.analysisSignal;


  async getJobsList(isOpen: boolean) {
    const res:any = await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_ALL_JOBS(isOpen))
    );
    this.jobsListSignal.set(res?.data);
    return res;
  }

  async getJobDashboardCount() {
    const res:any = await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_DASHBOARD_DATA)
    );
    this.dashboardSignal.set(res);
    return res;
  }

  async getJobDetailsById(jobId: any) {
    const res:any = await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_JOB_BY_ID(jobId))
    );
    this.jobDetailsSignal.set(res?.data);
    return res;
  }

  async addJob(data: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.JOBS.ADD_JOB, data)
    );
  }
  async updateJob(data: any) {
    return await firstValueFrom(
      this.api.hrmsput(API.JOBS.UPDATE_JOB, data)
    );
  }

  async getAllSkills() {
    return await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_ALL_SKILLS)
    );
  }
  async getActivityLogs() {
    return await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_ACTIVITY_LOGS)
    );
  }
  async addApplicant(formData: FormData) {
    return await firstValueFrom(
      this.api.websitePost(API.JOBS.ADD_APPLICANT, formData)
    );
  }
  async getjobsByCountry(country: any) {
    return await firstValueFrom(
      this.api.websiteGet(API.JOBS.GET_JOBS_BY_COUNTRY(country))
    );
  }

  async getApplicants(status: any, id: any) {
    const res:any = await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_ALL_APPLICANTS(), {
        filter: status,
        jobId: id
      })
    );
    this.applicantsSignal.set(res?.data);
    return res;
  }

  async getCandidateById(candidateId: any) {
    const res:any = await firstValueFrom(
      this.api.aiGet(API.JOBS.GET_CANDIDATE_BY_ID(), {
        applicationId: candidateId
      })
    );
    this.candidateSignal.set(res?.data);
    return res;
  }

  async scheduleInterview(data: any) {
    return await firstValueFrom(
      this.api.aiPost(API.JOBS.SCHEDULE_INTERVIEW, data)
    );
  }
  async getApplicantById(applicantId: any) {
    const res:any = await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_APPLICANT_BY_ID(applicantId))
    );
    this.applicantByIdSignal.set(res?.data);
    return res?.data;
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

  async moveToInterview(data: any) {
    return await firstValueFrom(
      this.api.aiPost(API.JOBS.MOVE_TO_INTERVIEW, data)
    );
  }

  async updateApplicantStatus(data: any) {
    return await firstValueFrom(
      this.api.aiPut(API.JOBS.UPDATE_APPLICANT_BY_ID, data)
    );
  }

  async viewResume(type: any, user: any, action: any) {
    return await firstValueFrom(
      this.api.websiteGetBlob(
        API.JOBS.VIEW_RESUME(type, user, action)
      )
    );
  }
  getJobsListValue() {
    return this.jobsListSignal();
  }

  getApplicantsValue() {
    return this.applicantsSignal();
  }

  async deleteJob(jobId: any) {
    return await firstValueFrom(
      this.api.hrmsdelete(API.JOBS.DELETE_JOB(jobId))
    );
  }
  async resumeAnalysis(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.JOBS.ANALYSIS_RESUME,payload)
    );
  }

   async exportByJobId(jobId:any) {
    return await firstValueFrom(
      this.api.aiGetBlob(API.USERS.JOB_BY_EXPORT(jobId))
    );
  }
  async exportByCandidateId(id:any) {
    return await firstValueFrom(
      this.api.aiGetBlob(API.USERS.EXPORT_BY_APPLICANT(id))
    )
  }
}
