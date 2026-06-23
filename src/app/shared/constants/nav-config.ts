// ─── Shared nav configuration ─────────────────────────────────────────────────
// Single source of truth for the sidebar structure.
// Both SideBarComponent and NavigationService import from here.
// When the backend adds a new module, only update this file.

export interface NavChild {
  label: string;
  icon: string;
  path?: string;
  permissionName?: string;
  children?: NavChild[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  permissionName?: string;
  children?: NavChild[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'demand',
    permissionName: 'DEMAND',
    label: 'Demand',
    icon: 'fa-solid fa-briefcase',
    children: [
      {
        label: "My SR's",
        icon: 'fa-solid fa-file-contract',
        path: '/demand/my-jds',
        permissionName: 'MYSRS',
      },
      {
        label: "Job Requisitions",
        icon: 'fa-solid fa-briefcase',
        path: '/demand/all-approved-srs',
        permissionName: 'JOBREQUISITIONS',
      },
      {
        label: "Recruiter Assignment Management",
        icon: "fa-solid fa-users-gear",
        path: "/demand/recruiter-assignment-management",
        permissionName: "RECRUITERASSIGNMENTMANAGEMENT",
      },
      {
        label: 'Interview Plans Config',
        icon: 'fa-solid fa-user-pen',
        path: '/demand/interview-plan-config',
        permissionName: 'INTERVIEWPLANCONFIG',
      },
      {
        label: 'Assign Interviewers',
        icon: 'fa-solid fa-user-check',
        path: '/demand/assign-interviewers',
        permissionName: 'ASSIGNINTERVIEWERS',
      }
    ],
  },
  {
    id: 'supply',
    permissionName: 'SUPPLY',
    label: 'Supply',
    icon: 'fa-solid fa-layer-group',
    children: [
      {
        label: 'Hiring Dashboard',
        icon: 'fa-solid fa-chart-pie',
        path: '/supply/jobs/dashboard',
        permissionName: 'HIRINGDASHBOARD',
      },
      {
        label: 'Jobs Details',
        icon: 'fa-solid fa-file-lines',
        path: '/supply/jobs/job-details',
        permissionName: 'JOBDETAILS',
      },
      {
        label: 'Kanban',
        icon: 'fa-solid fa-table-columns',
        path: '/supply/kanban',
        permissionName: 'KANBAN',
      },
      {
        label: "My Job Assignments",
        icon: "fa-solid fa-briefcase",
        path: "/supply/my-assignend-jobs",
        permissionName: "MYJOBASSIGNMENTS",
      },
      {
        label: 'My Interview Requests',
        icon: 'fa-solid fa-file-signature',
        path: '/supply/my-interview-requests',
        permissionName: 'MYINTERVIEWREQUESTS',
      },
      {
        label: 'AI Interview Zone',
        icon: 'fa-solid fa-robot',
        path: '/supply/ai-interview-zone',
        permissionName: 'AIINTERVIEWZONE',
      },
      {
        label: 'Candidate Management',
        icon: 'fa-solid fa-users',
        path: '/supply/applicant-management',
        permissionName: 'CANDIDATEMANAGEMENT',
      }
    ],
  },
  {
    id: 'System & Admins',
    permissionName: 'SYSTEM&ADMINS',
    label: 'System & Admins',
    icon: 'fa-solid fa-gear',
    children: [
      {
        label: 'Users',
        icon: 'fa-solid fa-users',
        path: '/users/user-onboard-roles',
        permissionName: 'USERS',
      },
      {
        label: 'Role & Permissions',
        icon: 'fa-solid fa-shield-halved',
        path: '/users/role-permissions',
        permissionName: 'ROLES&PERMISSIONS',
      },
      {
        label: 'Approval Chain Configuration',
        icon: 'fa-solid fa-network-wired',
        path: '/approval/chain-config',
        permissionName: 'APPROVALCHAINCONFIGURATION',
      },
    ],
  },

  {
    id: 'My Approvals',
    permissionName: 'MYAPPROVAL',
    label: 'My Approvals',
    icon: 'fa-solid fa-check-circle',
    children: [
      {
        label: 'SR Approvals',
        icon: 'fa-solid fa-list-check',
        path: '/approval/sr-list',
        permissionName: 'SRAPPROVALS',
      },
      {
        label: 'Hierarchy Approvals',
        icon: 'fa-solid fa-diagram-project',
        path: '/approval/chains',
        permissionName: 'HIERARCHYAPPROVALS',
      },
      {
        label: 'Interview Plan Approval',
        icon: 'fa-solid fa-calendar-check',
        path: '/approval/interview-plan-approval',
        permissionName: 'INTERVIEWPLANAPPROVALS',
      },
    ],
  },
  {
    id: 'interview',
    permissionName: 'INTERVIEW',
    label: 'Interview',
    icon: 'fa-solid fa-people-group',
    children: [


    ],
  },
];
