import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment.prod';
import { API } from '../../../../shared/constants/api-endpoints';
import { ApiService } from '../../../../core/services/api.service';
import { first, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl=environment.hrmsApiUrl;
  private api=inject(ApiService);


  async inviteUser(payload:any){
    return await firstValueFrom(
      this.api.hrmspost(API.USERS.CREATE,payload)
    );
  }

  async getList(payload:any){
    return await firstValueFrom(
      this.api.hrmspost(API.USERS.GET_LIST,payload)
    );
  }

  async getCount(){
    return await firstValueFrom(
      this.api.hrmspost(API.USERS.COUNT,null)
    );
  }

  async getUserById(id:any){
    return await firstValueFrom(
      this.api.hrmsget(API.USERS.USER_DETAILS_BY(id))
    );
  }

  async getCountByStatus(status:any){
    return await firstValueFrom(
      this.api.hrmsget(API.USERS.COUNT_STATUS(status))
    );
  }

  async update(id:any,payload:any){
    return await firstValueFrom(
      this.api.hrmsput(API.USERS.UPDATE_BY_ID(id),payload)
    );
  }



  async getBussinessUnits(){
    return await firstValueFrom(
      this.api.hrmsget(API.USERS.BUSSINESS_UNITS)
    )
  }

  async getDepartments(id:any){
    return await firstValueFrom(
      this.api.hrmsget(API.USERS.DEPARTMENTS(id))
    );
  }

  async getRoles(id:any){
    return await firstValueFrom(
      this.api.hrmsget(API.USERS.ROLES_BY_DEPT(id))
    );
  }

  async getEmployeeTypes(){
    return await firstValueFrom(
      this.api.hrmsget(API.USERS.EMP_TYPES)
    );
  }
   async getUsersTypes(){
    return await firstValueFrom(
      this.api.hrmsget(API.USERS.USER_TYPES)
    );
  }



  async getAllRolesAndPermissions(){
    return await firstValueFrom(
      this.api.hrmsget(API.ROLES.GET_ALL_PERMISSIONS)
    )
  }
  async updatePermission(payload:any){
    return await firstValueFrom(
      this.api.hrmsput(API.ROLES.UPDATE,payload)
    )
  }
  async addRole(payload:any){
    return await firstValueFrom(
      this.api.hrmspost(API.ROLES.ADD_ROLE,payload)
    )
  }

  async getAllModules(){
     return await firstValueFrom(
      this.api.hrmsget(API.ROLES.GET_ALL_MODULES)
    )
  }

    async getRolePermissionMatrix(payload: { page: number; size: number; sortBy: string; direction: string }) {
    return await firstValueFrom(
      this.api.hrmspost(API.ROLES.GET_ROLES_MATRIX, payload)
    );
  }
  
  async getUsersByRoleId(roleId: number, payload: { page: number; size: number; sortBy: string; direction: string }) {
    return await firstValueFrom(
      this.api.hrmspost(API.ROLES.USERS_BY_ROLE_ID(roleId), payload)
    );
  }

  async getPermissionsByRoleId(roleId:any){
    return await firstValueFrom(
      this.api.hrmsget(API.ROLES.GET_PERMISSIONS_BY_ROLE(roleId))
    )
  }


}
