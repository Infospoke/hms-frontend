export const API = {
    AUTH : {
        LOGIN: '/hms/login/user-login',
        PROFILE:`/hms/login/profile`,
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        FORCED_LOGOUT: '/user/forceful-logout'
    },

    MODULES : {
        GET_ALL : '/user/modules',
    },
    JOBS:{
       GET_ALL_JOBS:(id:any)=>`/jobs/get-all-jobs/${id}`,
       GET_DASHBOARD_DATA:"/jobs/get-all-jobs-dashboard-counts",
       GET_JOB_BY_ID:(id:any)=>`/jobs/get-job-details-by-id/${id}`
       ,ADD_JOB:`/jobs/add-new-job`,
       UPDATE_JOB:`/jobs/update-job-details` ,
       GET_ALL_SKILLS:`/jobs/get-all-skills`,
       GET_ACTIVITY_LOGS:`/job-overview/activity-feed`,
        ADD_APPLICANT:`/job/application`,
       GET_JOBS_BY_COUNTRY:(country:any)=>`/job/get-all-jobs-by-country?jobCountry=${country}`,
    //    GET_JOB_BY_ID:(id:any)=>`/jobs/get-job-details-by-id/${id}`,
       GET_ALL_APPLICANTS:() => `/jobs/get-all-jobs-applicants`,
       GET_CANDIDATE_BY_ID:() => `/jobs/get-candidate-by-id`,
       GET_APPLICANT_BY_ID:(id:any) => `/jobs/view-applicant-by-id/${id}`,
       GET_ALL_ANALYSIS : '/api/resume/analysis',
       MOVE_TO_INTERVIEW: `/api/interview/create-interview-session`,
       UPDATE_APPLICANT_BY_ID:'/api/interview/update-final-candidate-decision',
       SCHEDULE_INTERVIEW : '/api/interview/admin-schedule-interview',
       DELETE_JOB :(id:any) => `/jobs/delete-job-by-id/${id}`,
       VIEW_RESUME : (type:any, user:any, action:any) => `/job/download/${type}?appId=${user}&action=${action}`,
    },
    USERS:{
        CREATE:'/hms/user/create',
        GET_LIST:`/hms/user/list`,
        COUNT:'/hms/user/count',
        COUNT_ROLE:(role:any)=>`/hms/user/count/role/${role}`,
        COUNT_STATUS:(status:any)=>`/hms/user/count/status?status=${status}`,
        USER_DETAILS_BY:(id:any)=>`/hms/user/details/${id}`,
        UPDATE_BY_ID:(id:any)=>`/hms/user/update/${id}`,
        BUSSINESS_UNITS:'/hms/configurations/business-units',
        DEPARTMENTS:(bussinessId:any)=>`/hms/configurations/departments/${bussinessId}`,
        ROLES_BY_DEPT:(departmentId:any)=>`/hms/configurations/roles/${departmentId}`,
        EMP_TYPES:`/hms/configurations/employment-types`,
        USER_TYPES:`/hms/configurations/user-types`,
    },
    ROLES:{
        ADD_ROLE:`/hms/role/add-role`,
        UPDATE:`/hms/role/update-role-permissions`,
        GET_ALL_PERMISSIONS:`/hms/role/get-all-role-permissions`,
        GET_ALL_MODULES:`/hms/configurations/get-all-modules`
    }
}