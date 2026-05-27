import { Routes } from '@angular/router';

export const INTERVIEW_ROUTES: Routes = [
    {
        path: 'interview-plans',
        loadComponent:()=>import("../components/interview-plans/interview-plans.component").then(m=>m.InterviewPlansComponent)
    },
    {
        path:"interview-plan-approval",
        loadComponent:()=>import("../components/interview-plain-aproval/interview-plain-aproval.component").then(m=>m.InterviewPlainAprovalComponent)
    }
]