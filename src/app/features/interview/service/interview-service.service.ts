import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { first, firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';

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
}
