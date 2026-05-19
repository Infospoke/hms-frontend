import { Component } from '@angular/core';

import { approvedSrs } from '../../../../shared/constants/reusbale-filter';
import { ApprovedSrsComponent } from '../approved-srs-layout/approved-srs.component';

@Component({
  selector: 'app-my-jobs-assignments',
  imports: [ApprovedSrsComponent],
  templateUrl: './my-jobs-assignments.component.html',
  styleUrl: './my-jobs-assignments.component.scss',
})
export class MyJobsAssignmentsComponent {

  heading: string = 'My Job Assignments';
  subHeading: string = 'Review and respond to job assignments allocated to you';
  searchPlaceholder = 'Search by Job Title..';
  activeTab = 'pending';
  currentPage = 1;
  activeFilters: any;

  tabs = [
    { key: 'pending',  label: 'Pending',  count: 8  },
    { key: 'accepted', label: 'Accepted', count: 12 },
    { key: 'declined', label: 'Declined', count: 3  },
    { key: 'all',      label: 'All',      count: 23 },
  ];

  cards: any[] = [
    {
      label: 'Total Assignments',
      subLabel: '',
      value: 0,
      iconClass: 'fa-regular fa-clipboard',
      iconBgColor: '#eaf2ff',
      iconColor: '#3b82f6',
    },
    {
      label: 'Accepted',
      subLabel: '',
      value: 12,
      iconClass: 'fa-solid fa-check',
      iconBgColor: '#e8f7ea',
      iconColor: '#22c55e',
    },
    {
      label: 'Pending',
      subLabel: '',
      value: 8,
      iconClass: 'fa-regular fa-clock',
      iconBgColor: '#fff4e5',
      iconColor: '#f59e0b',
    },
    {
      label: 'Declined',
      subLabel: '',
      value: 3,
      iconClass: 'fa-solid fa-xmark',
      iconBgColor: '#ffe9e9',
      iconColor: '#ef4444',
    },
    {
      label: 'Total Openings',
      subLabel: '',
      value: 32,
      iconClass: 'fa-solid fa-users',
      iconBgColor: '#f4e8ff',
      iconColor: '#a855f7',
    },
  ];

  dropDownData: any =approvedSrs;
  data:any=[];
  totalElements=0;
  pageSize=10;
  columns = [
    { key: 'srId',       label: 'SR ID',         width: '160px', custom: true },
    { key: 'jobTitle',   label: 'SR Title',       width: '200px', custom: true },
    { key: 'department', label: 'Department',     width: '140px', custom: true },
    { key: 'requestby',  label: 'Requested By',   width: '140px', custom: true },
    { key: 'date',       label: 'Date Range',     width: '140px', custom: true },
    { key: 'action',     label: 'Actions',        width: '140px', custom: true },
  ];
  filtersResponse(event: any): void {
    this.activeFilters = event;
    this.currentPage = 1;
    // this.loadList();
  }

  onTabChange(key: string): void {
    this.activeTab = key;
    this.currentPage = 1;
    // this.loadList();
  }
}