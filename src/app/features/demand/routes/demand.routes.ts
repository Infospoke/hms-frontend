import { Routes } from '@angular/router';

export const DEMAND_ROUTES: Routes = [
  {
    path: 'my-jds',
    loadComponent: () => import("../components/staffing-requisitions/staffing-requisitions.component").then(m => m.StaffingRequisitionsComponent)
  },
  {path:"create",
    loadComponent:()=>import("../components/create-staff/create-staff.component").then(e=>e.CreateStaffComponent)
  },
  {
    path:'all-approved-srs',
    loadComponent:()=>import("../components/my-approved-srs/my-approved-srs.component").then(e=>e.MyApprovedSrsComponent)
  },
  {
    path:'my-jds/view-sr/:srId',
    loadComponent:()=>import("../../approvals/components/view-sr/view-sr.component").then(m=>m.ViewSrComponent)
  },
  {
    path:"recruiter-assignment-management",
    loadComponent:()=>import("../components/all-jobs/all-jobs.component").then(m=>m.AllJobsComponent)
  },
  {
    path:'recruiter-assignment-management/recruiter-and-response/:id/:srId',
    loadComponent:()=>import("../components/recruiters-and-response/recruiters-and-response.component").then(m=>m.RecruitersAndResponseComponent)
  },
  {
    path:"recruiter-assignment-management/recruiter-assignment/:id/:srId",
    loadComponent:()=>import("../components/assigning-recruiter/assigning-recruiter.component").then(m=>m.AssigningRecruiterComponent)
  },
  {
    path: 'all-approved-srs/create-job',
    loadComponent: () => import('../../job/components/create-job/create-job.component').then(c => c.CreateJobComponent)
  },
  {
    path:'assign-interviewers',
    loadComponent:()=>import("../../interview/components/assign-interviewers/assign-interviewers.component").then(m=>m.AssignInterviewersComponent)
  },
  {
        path:"assign-interviewers/new-assign",
        loadComponent:()=>import("../../interview/components/assign-interviewers-by-list/assign-interviewers-by-list.component").then(m=>m.AssignInterviewersByListComponent)
    },
    {
        path:"assign-interviewers/view",
        loadComponent:()=>import("../../interview/components/view-assign-recruter-response/view-assign-recruter-response.component").then(m=>m.ViewAssignRecruterResponseComponent)
    },
    {
      path:'interview-plan-config',
      loadComponent:()=>import("../../interview/components/interview-plans/interview-plans.component").then(m=>m.InterviewPlansComponent)
    },
    {
        path:"interview-plan-config/create",
        loadComponent:()=>import("../../interview/components/interview-plan-create/interview-plan-create.component").then(m=>m.InterviewPlanCreateComponent)
    },
    {
        path:"interview-plan-config/view/:id",
        loadComponent:()=>import("../../interview/components/interview-plan-view/interview-plan-view.component").then(m=>m.InterviewPlanViewComponent)
    },
    {
      path:"recruiter-assignment-management/view-assignes",
      loadComponent:()=>import("../../settings/users/components/users-by-role/users-by-role.component").then(m=>m.UsersByRoleComponent)
    }
];