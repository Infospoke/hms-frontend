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
    }
}