import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { API } from '../../../shared/constants/api-endpoints';
import { first, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CandidateServiceComponent {
  
  private api = inject(ApiService);


  async releaseOffer(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.RELEASE_OFFER,payload))
  }

  async readyToReleaseOffer(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.READY_TO_RELEASE_OFFER_LIST,payload))
  }
  async getRaiseList(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.RAISE_REQUEST_LIST,payload))
  }
  async getCount():Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.CANDIDATE_MANANGEMENT.CARDS_COUNT))
  }

  async getOfferDetails(id:any):Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.CANDIDATE_MANANGEMENT.OFFER_DETAILS_BY_APPLICANT_ID(id)))
  }

  async getCommentsForOfferId(id:any):Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.CANDIDATE_MANANGEMENT.COMMENTS_FOR_OFFER_ID(id)))
  }

  async approveOffer(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.OFFER_APPROVE,payload))
  }


  async getPendingApprovals(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.GET_PENDING_APPROVALS,payload))
  }

  async getOfferApprovalsList(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.OFFER_APPROVALS_LIST,payload))
  }

  async getOfferTemplates():Promise<any>{
    return await firstValueFrom(this.api.hrmsget(API.CANDIDATE_MANANGEMENT.GET_OFFER_TEMPLATED))
  }

  async submitOfferRequest(payload:any):Promise<any>{
    return await firstValueFrom(this.api.hrmspost(API.CANDIDATE_MANANGEMENT.SUBMIT_RISE_OFFER_REQUEST,payload))
  }

  async generateOfferLetter(payload:any):Promise<any>{
    return await firstValueFrom(this.api.aiPostBlob(API.CANDIDATE_MANANGEMENT.GENERATE_OFFER_LETTER,payload))
  }
   async regenerateOfferLetter(payload:any):Promise<any>{
    return await firstValueFrom(this.api.aiPostBlob(API.CANDIDATE_MANANGEMENT.RE_GENERATE_OFFER_LETTER,payload))
  }

  async viewOfferLetter(id:any){
     return await firstValueFrom(
      this.api.viewOffer(API.CANDIDATE_MANANGEMENT.VIEW_OFFER_LETTER(id))
    );
  }

  async getNotiateList(payload:any){
     return await firstValueFrom(
      this.api.hrmspost(API.CANDIDATE_MANANGEMENT.GET_NAGOTIATE_LIST,payload)
    );
  }

  async getCandidateResponse(payload:any){
    return await firstValueFrom(
      this.api.hrmspost(API.CANDIDATE_MANANGEMENT.GET_CANDIDATE_RESPONSE,payload)
    );
  }

  async getNegotiationDetails(id:any):Promise<any>{
    return await firstValueFrom(
      this.api.hrmsget(API.CANDIDATE_MANANGEMENT.NEGOTIATION_DETAILS_BY_APPLICANT_ID(id))
    );
  }

  async reviewNegotiationRequest(payload:any):Promise<any>{
    return await firstValueFrom(
      this.api.hrmspost(API.CANDIDATE_MANANGEMENT.REVIEW_NEGOTIATION_REQUEST,payload)
    );
  }
  async viewDocument(payload:any):Promise<Blob>{
    
    return await firstValueFrom(
      this.api.hrmspostBlob(API.CANDIDATE_MANANGEMENT.VIEW_DOCUMENTS,payload)
    );
  }

  async getReReleaseOfferDetailsById(id:any):Promise<any>{
    return await firstValueFrom(
      this.api.hrmsget(API.CANDIDATE_MANANGEMENT.RERELEASE_OFFER_DETAILS(id))
    );
  }
  

}
