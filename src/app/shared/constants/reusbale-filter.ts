export const filterDropdowns: any = [
  {
    key: 'status',
    label: 'Status',
    selected: '',
    options: [
      { value: '', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },

  {
    key: 'dateFilter',
    label: 'Date',
    selected: '',
    isDateFilter: true,
    options: [
      { value: '', label: 'All Time' },
      { value: 'TODAY', label: 'Today' },
      { value: 'thisWeek', label: 'This Week' },
      { value: 'thisMonth', label: 'This Month' },
      { value: 'CUSTOM', label: 'Custom Range' },
    ],
  },
];




export const statusOptions: any = [
  {
    key: 'status',
    label: 'Functionality',
    selected: '',
    options: [],
    // options: [
    //   { value: '',         label: 'All'      },
    //   { value: 'in_progress',   label: 'In Progress'   },
    //   { value: 'Approved', label: 'Approved' },
    //   { value: 'Rejected', label: 'Rejected' },
    // ],
  },

  {
    key: 'dateFilter',
    label: 'Date',
    selected: '',
    isDateFilter: true,
    options: [
      { value: '', label: 'All Time' },
      { value: 'TODAY', label: 'Today' },
      { value: 'thisWeek', label: 'This Week' },
      { value: 'thisMonth', label: 'This Month' },
      { value: 'CUSTOM', label: 'Custom Range' },
    ],
  },
];




export const chainOptions: any = [

  {
    key: 'dateFilter',
    label: 'Date',
    selected: 'thisMonth',
    isDateFilter: true,
    options: [
      // { value: '',        label: 'All Time'    },
      { value: 'TODAY', label: 'Today' },
      { value: 'thisWeek', label: 'This Week' },
      { value: 'thisMonth', label: 'This Month' },
      { value: 'CUSTOM', label: 'Custom Range' },
    ],
  },
];





export const approvedSrs: any = [
  {
    key: 'department',
    label: 'Department',
    selected: '',
    options: [
     
      
    ],



  },
  {
    key: 'requestedBy',
    label: 'Requested By',
    selected: '',
    options: [

   
    ],

  },
  {
    key: 'dateFilter',
    label: 'Date',
    selected: 'thisMonth',
    isDateFilter: true,
    options: [
      // { value: '',        label: 'All Time'    },
      { value: 'TODAY', label: 'Today' },
      { value: 'thisWeek', label: 'This Week' },
      { value: 'thisMonth', label: 'This Month' },
      { value: 'CUSTOM', label: 'Custom Range' },
    ],
  },
];