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
  jobDetailsBySrIdSignal = signal<any>(null);


  jobs$ = this.jobsListSignal;
  dashboard$ = this.dashboardSignal;
  jobDetails$ = this.jobDetailsSignal;
  applicants$ = this.applicantsSignal;
  candidate$ = this.candidateSignal;
  applicantById$ = this.applicantByIdSignal;
  analysis$ = this.analysisSignal;


  async getJobsList(filters: any = {}) {
    const res: any = await firstValueFrom(
      this.api.hrmspost(API.JOBS.GET_ALL_JOBS, { filters })
    );
    // Normalize new response keys to what templates expect
    const normalized = (res?.data ?? []).map((item: any) => ({
      ...item,
      jobLocation: item.Location ?? item.jobLocation ?? '',
      experience: item.minExperience != null && item.maxExperience != null
        ? `${item.minExperience} - ${item.maxExperience}`
        : (item.experience ?? ''),
      skills: Array.isArray(item.skillsMustHave)
        ? item.skillsMustHave.map((s: string) => ({ skillName: s }))
        : (item.skills ?? []),
      jobMode: item.modeType ?? item.jobMode ?? '',
    }));
    this.jobsListSignal.set(normalized);
    return { ...res, data: normalized };
  }

  async getJobDashboardCount() {
    const res: any = await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_DASHBOARD_DATA)
    );
    this.dashboardSignal.set(res);
    return res;
  }

  async getJobDetailsById(jobId: any) {
    const res: any = await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_JOB_BY_ID(jobId))
    );
    // Return the full nested data; recruiters are excluded in the UI layer
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
      // this.api.websitePost(API.JOBS.ADD_APPLICANT, formData)
      this.api.hrmspost(API.JOBS.ADD_APPLICANT,formData)
    );
  }
  async getjobsByCountry(country: any) {
    return await firstValueFrom(
      this.api.websiteGet(API.JOBS.GET_JOBS_BY_COUNTRY(country))
    );
  }

  async getApplicants(status: any, id: any) {
    const res: any = await firstValueFrom(
      this.api.hrmsget(API.JOBS.GET_ALL_APPLICANTS(), {
        filter: status,
        jobId: id
      })
    );
    this.applicantsSignal.set(res?.data);
    return res;
  }

  async getCandidateById(candidateId: any) {
    const res: any = await firstValueFrom(
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
    const res: any = await firstValueFrom(
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
      this.api.aiPost(API.JOBS.UPDATE_APPLICANT_BY_ID, data)
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
      this.api.aiPost(API.JOBS.ANALYSIS_RESUME, payload)
    );
  }

  async exportByJobId(jobId: any) {
    return await firstValueFrom(
      this.api.aiGetBlob(API.USERS.JOB_BY_EXPORT(jobId))
    );
  }
  async exportByCandidateId(id: any) {
    return await firstValueFrom(
      this.api.aiGetBlob(API.USERS.EXPORT_BY_APPLICANT(id))
    )
  }

  async fetchInterViewAnalysis(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.JOBS.INTERVIEW_ANALYSIS, payload)
    );
  }

  async fetchRoles(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.JOBS.LOAD_ROLES, payload)
    );
  }

  async getRecruiters(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.JOBS.LOAD_RECRUITERS, payload)
    );
  }

  jobDetailsBySrId(srDetails: any) {
    this.jobDetailsBySrIdSignal.set(srDetails);
  }

  async getJobDetailsBySrId(srId: any) {
    return await firstValueFrom(
      this.api.hrmsget(API.JOBS.CREATE_JOB_BY_SR_ID(srId))
    );
  }

  async getAssiendUsers(srId: any) {
    return await firstValueFrom(
      this.api.hrmsget(API.JOBS.CREATE_ASSIGNED_USERS(srId))
    );
  }

  async createNewJob(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.JOBS.CREATE_NEW_JOB, payload)
    );
  }

   async updateAssigness(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.JOBS.UPDATE_ASSIGN_USERS, payload)
    );
  }

  async generateJobDescription(payload: any) {
    return await firstValueFrom(
      this.api.aiPost('/api/admin/generate-job-description', payload)
    );
  }

  
  async updateJobToClose(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmsput(API.JOBS.UPDATE_JOB_TO_CLOSE,payload))
  }

  async agencyList(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.JOBS.AGENCY_LIST,payload))
  }

  async getAgencyCategories():Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.JOBS.AGENCY_CATEGORIES))
  }

  async requestToReUpload(applicantId:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.JOBS.REQUEST_FOR_REUPLOAD(applicantId),{}))
  }

  async getApplicantDetailsById(applicantId:any):Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.JOBS.GET_APPLICANT_DETAILS_BY_ID(applicantId)))
  }
}
