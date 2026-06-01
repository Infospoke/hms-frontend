import { Routes } from '@angular/router';

export const INTERVIEW_ROUTES: Routes = [
    {
        path: 'interview-plan',
        loadComponent:()=>import("../components/interview-plans/interview-plans.component").then(m=>m.InterviewPlansComponent)
    },
    {
        path:"interview-approval-plans",
        loadComponent:()=>import("../components/interview-plain-aproval/interview-plain-aproval.component").then(m=>m.InterviewPlainAprovalComponent)
    },
    {
        path:"interview-plan/create",
        loadComponent:()=>import("../components/interview-plan-create/interview-plan-create.component").then(m=>m.InterviewPlanCreateComponent)
    },
    {
        path:"interview-plan/view/:id",
        loadComponent:()=>import("../components/interview-plan-view/interview-plan-view.component").then(m=>m.InterviewPlanViewComponent)
    },
    {
        path:"interview-approval-plans/review-and-approve/:id",
        loadComponent:()=>import("../components/approve-interview-plan/approve-interview-plan.component").then(m=>m.ApproveInterviewPlanComponent)
    }
]