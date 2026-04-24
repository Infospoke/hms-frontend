import { inject, Injectable } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment.prod';
import { firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class StaffingServiceService {
  private apiUrl=environment.hrmsApiUrl;
  private atsURL=environment.atsUrl;
  private api=inject(ApiService);

  async createStaffing(payload:any){
      return await firstValueFrom(
        this.api.hrmspost(API.SRS.STAFFING_CREATION,payload)
      );
  }


   async mustHaveSkills(payload:any){
      return await firstValueFrom(
        this.api.aiPost(API.ROLE_AND_REQUIREMENTS.MUST_HAVE_SKILLS,payload)
      );
  }


    async niceHaveSkills(payload:any){
      return await firstValueFrom(
        this.api.aiPost(API.ROLE_AND_REQUIREMENTS.NICE_SKILLS,payload)
      );
  }

  async certificate(payload:any){
      return await firstValueFrom(
        this.api.aiPost(API.ROLE_AND_REQUIREMENTS.CERTIFICATE,payload)
      );
  }

   async language(payload:any){
      return await firstValueFrom(
        this.api.aiPost(API.ROLE_AND_REQUIREMENTS.LANGUAGE,payload)
      );
  }

   async CTC(payload:any){
      return await firstValueFrom(
        this.api.aiPost(API.ROLE_AND_REQUIREMENTS.CTC,payload)
      );
  }
    async qualification(payload:any){
      return await firstValueFrom(
        this.api.aiPost(API.ROLE_AND_REQUIREMENTS.QUALIFICATION,payload)
      );
  }
   async education(payload:any){
      return await firstValueFrom(
        this.api.aiPost(API.ROLE_AND_REQUIREMENTS.EDUCATION_REQUIREMENTS,payload)
      );
  }

  async  getSeniority(){
    return await firstValueFrom(
      this.api.hrmsget(API.SRS.SENIORITY)
    )
  }
   async  getTravel(){
    return await firstValueFrom(
      this.api.hrmsget(API.SRS.TRAVEL)
    )
  }
   async  getAllSRS(payload:any){
    return await firstValueFrom(
      this.api.hrmspost(API.SRS.ALL_SRS,payload)
    )
  }

  async  getSrById(payload:any){
    return await firstValueFrom(
      this.api.hrmspost(API.SRS.ALL_SRS,payload)
    )
  }
}
