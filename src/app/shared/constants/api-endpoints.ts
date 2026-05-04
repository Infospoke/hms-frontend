export const API = {
    AUTH : {
        LOGIN: '/hms/login/user-login',
        PROFILE:`/hms/login/profile`,
        FORGOT_PASSWORD: '/hms/login/forgot-password',
        CHANGE_PASSWORD:'/hms/login/change-password',
        REFRESH:'/hms/login/refresh',
        LOGOUT:`/hms/login/logout`,
        
    },

    MODULES : {
        GET_ALL : '/user/modules',
    },
    JOBS:{
       GET_ALL_JOBS:(id:any)=>`/hms/jobs/get-all-jobs/${id}`,
       GET_DASHBOARD_DATA:"/hms/jobs/get-all-jobs-dashboard-counts",
       GET_JOB_BY_ID:(id:any)=>`/hms/jobs/get-job-details-by-id/${id}`
       ,ADD_JOB:`/hms/jobs/add-new-job`,
       UPDATE_JOB:`/hms/jobs/update-job-details` ,
       GET_ALL_SKILLS:`/hms/jobs/get-all-skills`,
       GET_ACTIVITY_LOGS:`/hms/job-overview/activity-feed`,
        ADD_APPLICANT:`/job/application`,
       GET_JOBS_BY_COUNTRY:(country:any)=>`/job/get-all-jobs-by-country?jobCountry=${country}`,
    //    GET_JOB_BY_ID:(id:any)=>`/jobs/get-job-details-by-id/${id}`,
       GET_ALL_APPLICANTS:() => `/hms/jobs/get-all-jobs-applicant`,
       GET_CANDIDATE_BY_ID:() => `/hms/jobs/get-candidate-by-id`,
       GET_APPLICANT_BY_ID:(id:any) => `/hms/jobs/view-applicant-by-id/${id}`,
       GET_ALL_ANALYSIS : '/api/resume/analysis',
       MOVE_TO_INTERVIEW: `/api/interview/create-interview-session`,
       UPDATE_APPLICANT_BY_ID:'/api/interview/update-final-candidate-decision',
       SCHEDULE_INTERVIEW : '/api/interview/admin-schedule-interview',
       DELETE_JOB :(id:any) => `/hms/jobs/delete-job-by-id/${id}`,
       VIEW_RESUME : (type:any, user:any, action:any) => `/job/download/${type}?appId=${user}&action=${action}`,
       ANALYSIS_RESUME:`/api/resume/analyze/batch`,
       INTERVIEW_ANALYSIS:`/api/interview/fetch-interview-analysis`
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
        JOB_BY_EXPORT:(jobId:any)=>`/api/admin/generate-applicants-report/${jobId}`,
        EXPORT_BY_APPLICANT:(id:any)=>`/api/admin/report/${id}`
    },
    ROLES:{
        ADD_ROLE:`/hms/role/add-role`,
        UPDATE:`/hms/role/update-role-permissions`,
        GET_ALL_PERMISSIONS:`/hms/role/get-all-role-permissions`,
        GET_ALL_MODULES:`/hms/configurations/get-all-modules`,
        GET_ROLES_MATRIX:`/hms/role/get-role-permission-matrix`,
        USERS_BY_ROLE_ID:(id:any)=>`/hms/role/usernames-by-roleid/${id}`,
        GET_PERMISSIONS_BY_ROLE:(id:any)=>`/hms/role/get-permissions-by-role/${id}`
    },
    ROLE_AND_REQUIREMENTS:{
        MUST_HAVE_SKILLS:`/api/admin/ai-suggest-must-have-skills`,
        NICE_SKILLS:`/api/admin/ai-suggest-nice-to-have-skills`,
        EDUCATION_REQUIREMENTS:`/api/admin/qualifications-suggestions`,
        CERTIFICATE:`/api/admin/certifications-suggestions`,
        LANGUAGE:`/api/admin/language-suggestions`,
        QUALIFICATION:`/api/admin/qualifications-suggestions`,
        CTC:`/api/admin/ctc-review`
    },
    SRS:{
        STAFFING_CREATION:`/hms/staffing-requisition/new-staffing-requisition`,
        SENIORITY:`/hms/configurations/position-basic-seniority-levels`,
        TRAVEL:`/hms/configurations/travel-requirements`,
        ALL_SRS:`/hms/staffing-requisition/sr-list`,
        BY_SR_ID:`/hms/staffing-requisition/by-sr-id`
    },
    SUPPLY:{
        KANBAN:`/hms/kanban/filter`
    }
}