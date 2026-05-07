export const filterDropdowns: any = [
  {
    key: 'status',
    label: 'Status',
    selected: '',
    options: [
      { value: '',         label: 'All'      },
      { value: 'active',   label: 'Active'   },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
 
  {
    key: 'dateFilter',
    label: 'Date',
    selected: '',
    isDateFilter: true,        
    options: [
      { value: '',        label: 'All Time'    },
      { value: 'TODAY',   label: 'Today'       },
      { value: 'lastWeek',    label: 'Last Week'   },
      { value: 'lastMonth',   label: 'Last Month'  },
      { value: 'CUSTOM',  label: 'Custom Range' },
    ],
  },
];




export const statusOptions: any = [
  {
    key: 'status',
    label: 'Status',
    selected: '',
    options: [
      { value: '',         label: 'All'      },
      { value: 'in_progress',   label: 'In Progress'   },
      { value: 'Approved', label: 'Approved' },
      { value: 'Rejected', label: 'Rejected' },
    ],
  },
 
  {
    key: 'dateFilter',
    label: 'Date',
    selected: '',
    isDateFilter: true,        
    options: [
      { value: '',        label: 'All Time'    },
      { value: 'TODAY',   label: 'Today'       },
      { value: 'lastWeek',    label: 'Last Week'   },
      { value: 'lastMonth',   label: 'Last Month'  },
      { value: 'CUSTOM',  label: 'Custom Range' },
    ],
  },
];




export const chainOptions: any = [
 
  {
    key: 'dateFilter',
    label: 'Date',
    selected: '',
    isDateFilter: true,        
    options: [
      { value: '',        label: 'All Time'    },
      { value: 'TODAY',   label: 'Today'       },
      { value: 'lastWeek',    label: 'Last Week'   },
      { value: 'lastMonth',   label: 'Last Month'  },
      { value: 'CUSTOM',  label: 'Custom Range' },
    ],
  },
];