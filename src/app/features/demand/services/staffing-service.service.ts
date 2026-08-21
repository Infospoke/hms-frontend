import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment.prod';
import { firstValueFrom } from 'rxjs';
import { API } from '../../../shared/constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class StaffingServiceService {
  private apiUrl = environment.hrmsApiUrl;
  private atsURL = environment.atsUrl;
  private api = inject(ApiService);
  private http = inject(HttpClient);

  private readonly COUNTRIES_API = 'https://countriesnow.space/api/v0.1/countries/positions';
  private readonly CITIES_API = 'https://countriesnow.space/api/v0.1/countries/cities';

  async createStaffing(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.SRS.STAFFING_CREATION, payload)
    );
  }


  async mustHaveSkills(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.ROLE_AND_REQUIREMENTS.MUST_HAVE_SKILLS, payload)
    );
  }


  async niceHaveSkills(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.ROLE_AND_REQUIREMENTS.NICE_SKILLS, payload)
    );
  }

  async certificate(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.ROLE_AND_REQUIREMENTS.CERTIFICATE, payload)
    );
  }

  async language(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.ROLE_AND_REQUIREMENTS.LANGUAGE, payload)
    );
  }

  async CTC(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.ROLE_AND_REQUIREMENTS.CTC, payload)
    );
  }
  async qualification(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.ROLE_AND_REQUIREMENTS.QUALIFICATION, payload)
    );
  }
  async education(payload: any) {
    return await firstValueFrom(
      this.api.aiPost(API.ROLE_AND_REQUIREMENTS.EDUCATION_REQUIREMENTS, payload)
    );
  }

  async getSeniority() {
    return await firstValueFrom(
      this.api.hrmsget(API.SRS.SENIORITY)
    )
  }
  async getTravel() {
    return await firstValueFrom(
      this.api.hrmsget(API.SRS.TRAVEL)
    )
  }
  async getAllSRS(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.SRS.ALL_SRS, payload)
    )
  }

  async getSrById(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.SRS.ALL_SRS, payload)
    )
  }

  async getBySrId(srId: string) {
    return await firstValueFrom(
      this.api.hrmsget(API.SRS.BY_SR_ID, { request: srId })
    );
  }

  async getMySrsCount() {
    return await firstValueFrom(
      this.api.hrmsget(API.SRS.MY_SRS_COUNT)
    );
  }

  async getRequestedBy() {
    return await firstValueFrom(
      this.api.hrmsget(API.SRS.REQUESTED_BY)
    );
  }


  async getAllApprovedSRS(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.SRS.APPROVED_SRS, payload)
    )
  }

  async getRecruiterList(payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.RECRUITER_TRACKING.LIST, payload)
    )
  }

  async getRecruiterCount() {
    return await firstValueFrom(
      this.api.hrmsget(API.RECRUITER_TRACKING.RECRUITER_COUNT)
    );
  }


  async getAssignmentListById(id: any, payload: any) {
    return await firstValueFrom(
      this.api.hrmspost(API.RECRUITER_TRACKING.DETAILS_BY_ID(id), payload)
    );
  }

  async getCount(id: any) {

    return await firstValueFrom(
      this.api.hrmsget(API.RECRUITER_TRACKING.COUNT(id))
    );
  }
  async searchJobTitles(jobTitle:string):Promise<any>{
    return await firstValueFrom(
      this.api.aiGet(API.SRS.SEARCH_JOB(jobTitle))
    );
  }

 
  async getCountries(): Promise<any> {
    return await firstValueFrom(
      this.http.get<any>(this.COUNTRIES_API)
    );
  }

  /**
   * Fetches the list of cities for a given country from the free
   * Countries Now API. Used to populate the Location dropdown once
   * a Country has been selected.
   */
  async getCitiesByCountry(country: string): Promise<any> {
    return await firstValueFrom(
      this.http.post<any>(this.CITIES_API, { country })
    );
  }
}