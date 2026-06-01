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
        label: "All Approved SR's",
        icon: 'fa-solid fa-file-circle-check',
        path: '/demand/all-approved-srs',
        permissionName: 'ALLAPPROVEDSRS',
      },
      {
        label: "All Jobs",
        icon: "fa-solid fa-briefcase",
        path: "/demand/all-jobs",
        permissionName: "ALLJOBS",
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

    ],
  },
   {
    id: 'interview',
    permissionName: 'INTERVIEW',
    label: 'Interview',
    icon: 'fa-solid fa-people-group',
    children: [
      {
        label: 'Interview Plans',
        icon: 'fa-solid fa-user-pen',
        path: '/interview/interview-plan',
        permissionName: 'INTERVIEWPLAN',
      },
      {
        label: 'Interview Plan Approval',
        icon: 'fa-solid fa-user-shield',
        path: '/interview/interview-approval-plans',
        permissionName: 'INTERVIEWAPPROVALS',
      }
    ],
  },
];
