import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
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
}
