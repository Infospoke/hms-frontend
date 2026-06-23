import { Routes } from '@angular/router';

export const APPROVAL_ROUTES: Routes = [
  {
    path: 'sr-list',
    loadComponent: () => import("../components/approval-srs/approval-srs.component").then(m => m.ApprovalSrsComponent)
  },
  {
    path: 'view-sr/:srId',
    loadComponent: () => import("../components/view-sr/view-sr.component").then(m => m.ViewSrComponent)
  },
  {
    path:'chain-config',
    loadComponent:()=>import("../components/approval-chain-config/approval-chain-config.component").then(m=>m.ApprovalChainConfigComponent)
  },
  {
    path:'chain-config/new-chain/:type',
    loadComponent:()=>import("../components/create-new-chain/create-new-chain.component").then(m=>m.CreateNewChainComponent)
  },
  {
    path:"chains",
    loadComponent:()=>import("../components/approval-chain/approval-chain.component").then(r=>r.ApprovalChainComponent)
  },
   {
    path:'chains/:type',
    loadComponent:()=>import("../components/create-new-chain/create-new-chain.component").then(m=>m.CreateNewChainComponent)
  },
  {
    path:'interview-plan-approval',
    loadComponent:()=>import("../../interview/components/interview-plain-aproval/interview-plain-aproval.component").then(m=>m.InterviewPlainAprovalComponent)
  },
  {
        path:"interview-approval-plans/review-and-approve/:id",
        loadComponent:()=>import("../../interview/components/approve-interview-plan/approve-interview-plan.component").then(m=>m.ApproveInterviewPlanComponent)
    },
];