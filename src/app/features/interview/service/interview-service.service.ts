import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { first, firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';
import { FrameImpl } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root',
})
export class InterviewServiceService {
  
  private api = inject(ApiService);

   async createInterviewPlan(payload: any): Promise<any> {
      return await firstValueFrom(
        this.api.hrmspost(API.INTERVIEW.CREATE_CONFIG, payload)
      );
    }
     async plansList(payload: any): Promise<any> {
      return await firstValueFrom(
        this.api.hrmspost(API.INTERVIEW.INTERVIEW_PLAN_LIST, payload)
      );
    }
     async plansCount(): Promise<any> {
      return await firstValueFrom(
        this.api.hrmsget(API.INTERVIEW.INTERVIEW_PLAN_COUNT)
      );
    }
     async createdByList(): Promise<any> {
      return await firstValueFrom(
        this.api.hrmsget(API.INTERVIEW.CREATED_BY_LIST)
      );
    }

    async plansListForApproval(payload: any): Promise<any> {
      return await firstValueFrom(
        this.api.hrmspost(API.INTERVIEW.INTERVIEW_PLAN_LIST_FOR_APPROVAL, payload)
      );
    }

    async planDetailsByID(id:any): Promise<any> {
      return await firstValueFrom(
        this.api.hrmsget(API.INTERVIEW.PLAN_DETAILS_BY(id))
      );
    }

    

     async updateInterviewPlanStatus(payload: any): Promise<any> {
      return await firstValueFrom(
        this.api.hrmsput(API.INTERVIEW.UPDATE_CONFIG, payload)
      );
    }

    async getPlansList():Promise<any>{
      return await firstValueFrom(
        this.api.hrmsget(API.INTERVIEW.PLANS_LIST)
      )
    }

    async getInterviewAssignedList(payload:any):Promise<any>{
       return await firstValueFrom(
        this.api.hrmspost(API.INTERVIEW.INTERVIEW_ASSIGNED_LIST, payload)
      );
    }

    async getInterviewAssignmentDetails(id:any):Promise<any>{
      return await firstValueFrom(
        this.api.hrmsget(API.INTERVIEW.GET_INTERVIEW_ASSIGNMENT_DETAILS(id))
      )
    }

    async updateAssignInterviwers(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.INTERVIEW_UPDATE,payload))
    }

    async getInterviewAssignementCount():Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.INTERVIEW_ASSIGNMENT_COUNTS))
    }


    async getInterviewListByAssignment(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.GET_ASSIGN_INTERVIEW_LIST,payload))
    }

    async getInterviewRequestAssignmentDetails(id:any):Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.GET_INTERVIEW_ASSIGNEMENT_BY_ID(id)))
    }

    async updateIntervieAssignement(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmsput(API.INTERVIEW.UPDATE_INTERVIEW_ASSIGN,payload))
    }


    async getJobDetailsById(id:any):Promise<any>{
      console.log(id);
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.GET_JOB_DETAILS_BYID(id)))
    }


     async getInterviewCandidateDetails(payload:any):Promise<any>{
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.INTERVIEW_CANDIDATE_DETAILS,payload))
    }


    async getAiInterviewZoneCounts():Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.GET_AI_INTERVEW_ZONE_COUNTS))
    }

    async getAIInterviewZoneJobs():Promise<any>{
       return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.GET_AI_INTERVEW_ZONE_JOBS))
    }

    async getAIInterviewZoneList(payload:any):Promise<any>{
       return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.GET_AI_INTERVEW_ZONE_LIST,payload))
    }


    async getAiInterviewZoneScheduleAIInterview(payload:any):Promise<any>{
       return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.GET_AI_INTERVEW_SCHEDULE_INTERVIEW,payload))
    }

    async getAIInterviewPLANSLIST():Promise<any>{
       return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.GET_AI_INTERVIEW_PLANS_LIST))
    }

    async getUpcommingAIInterviewList(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.GET_UPCOMMING_LIST,payload))
    }
     async getUpcommingAIInterviewInAssignedInterview(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.GET_UPCOMMING_REQUEST_LIST,payload))
    }

    async getApplicantDetailsById(id: any): Promise<any> {
      return await firstValueFrom(this.api.hrmsget(API.JOBS.GET_APPLICANT_DETAILS_BY_ID(id)));
    }

    async createInterviewSession(payload: any): Promise<any> {
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.CREATE_INTERVIEW_SESSION, payload));
    }

    async generateAIQuestions(payload:any):Promise<any>{
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.GENERATE_AI_QUESTIONS,payload))
    }

    async addCustomQuestion(payload:any):Promise<any>{
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.CUSTOM_QUESTION,payload))
    }

    async finalizeQuestions(payload:any):Promise<any>{
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.FINALIZE_QUESTIONS,payload))
    }

    async updateMoveToSchedule(payload:any):Promise<any>{
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.UPDATE_MOVE_TO_SCHEDULE,payload))
    }


    async getInterviewDetails(id:any):Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.AI_INTERVIEW_DETAILS(id)))
    }

    async scheduleInterviewTime(payload:any):Promise<any>{
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.SCHEDULE_USER,payload))
    }

    async getCandidateOverview(id:any):Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.SCHEDULE_CANDIDATE_OVERVIEW(id)))
    }

    async provideInterviewFeedBack(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.INTERVIEW_PROVIDE_FEEDBACK,payload))
    }


    async getInterviewRoundsList():Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.ROUNDS_LIST))
    }

    async submitTheInterviewFeedBack(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.SUBMIT_FEED_BACK,payload))
    }

    async getTodayInterviewDetails(id:any):Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.TODAY_INTERVIEW_DETAILS(id)))
    }

    async getTodayInterviewList(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.GET_TODAY_INTERVIEW_LIST,payload))
    }

     async getFeedBackList(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.GET_FEED_BACK_LIST,payload))
    }
     async getScheduleList(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.GET_SCHEDULE_LIST,payload))
    }


    async loadFinalizedQuestions(id:any):Promise<any>{
      return await firstValueFrom(this.api.aiGet(API.INTERVIEW.LOAD_FINALISED_QUESTIONS(id)))
    }


    async candidateMangementList(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.CANDIDATE_MANAGEMENT_LIST,payload))
    }

     async candidateMangementCount():Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.CANDIDATE_MANAGEMENT_LISt_COUNT))
    }

     async candidateSummaryDetails(id:any):Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.CANDIDATE_SUMMARY_DETAILS(id)))
    }

    async getAIFeedBackDetails(payload:any):Promise<any>{
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.AI_INTERVIEW_FEED_BACK,payload))
    }

    async scheduleInterviewToCandidate(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.SCHEDULE_INTERVIEW_TO_CANDIDATE,payload))
    }


    async rescheduleIntervewForCandidate(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.RESCHEDULE_INTERVIEW_FOR_CANDIDATE,payload))
    }

    async getScheduleInterviewDetailsForCandidate(id:any):Promise<any>{
      return await firstValueFrom(this.api.hrmsget(API.INTERVIEW.SCHEDULE_INTERVIEW_DETAILS_FOR_CANDIDATE(id)))
    }

    async getEvaluationSummaryForCandidate(id:any):Promise<any>{
      return await firstValueFrom(this.api.aiGet(API.INTERVIEW.AI_EVALUATION_SUMMARY(id)))
    }

    async calculateEvaluationSummaryForCandidate(payload:any):Promise<any>{
      return await firstValueFrom(this.api.aiPost(API.INTERVIEW.CALCULATE_EVALUATION_SUMMARY,payload))
    }

    async updateInterviewCompletionStatus(payload:any):Promise<any>{
      return await firstValueFrom(this.api.hrmspost(API.INTERVIEW.UPDATE_INTERVIEW_COMPLETE,payload))
    }
}
