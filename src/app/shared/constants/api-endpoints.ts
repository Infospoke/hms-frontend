export const API = {
    AUTH : {
        LOGIN: '/user/login',
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
       GET_ALL_ANALYSIS : '/api/resume/analysis'
    }
}