import { Component, inject, OnInit } from '@angular/core';

import { approvedSrs } from '../../../../shared/constants/reusbale-filter';
import { ApprovedSrsComponent } from '../../../demand/components/approved-srs-layout/approved-srs.component';
import { SupplyService } from '../../services/supply-service';

@Component({
  selector: 'app-my-jobs-assignments',
  imports: [ApprovedSrsComponent],
  templateUrl: './my-jobs-assignments.component.html',
  styleUrl: './my-jobs-assignments.component.scss',
})
export class MyJobsAssignmentsComponent implements OnInit{

  heading: string = 'My Job Assignments';
  subHeading: string = 'Review and respond to job assignments allocated to you';
  searchPlaceholder = 'Search by Job Title..';
  activeTab = 'pending';
  currentPage = 1;
  activeFilters: any;
  private supplyService=inject(SupplyService);
  tabs = [
    { key: 'pending',  label: 'Pending',  count: 8  },
    { key: 'accepted', label: 'Accepted', count: 12 },
    { key: 'declined', label: 'Declined', count: 3  },
    { key: 'all',      label: 'All',      count: 23 },
  ];

  cards: any[] = [
    {
      id:'totalAssignments',
      label: 'Total Assignments',
      subLabel: '',
      value: 0,
      iconClass: 'fa-regular fa-clipboard',
      iconBgColor: '#eaf2ff',
      iconColor: '#3b82f6',
    },
    {
      id:"accepted",
      label: 'Accepted',
      subLabel: '',
      value: 0,
      iconClass: 'fa-solid fa-check',
      iconBgColor: '#e8f7ea',
      iconColor: '#22c55e',
    },
    {
      id:'pending',
      label: 'Pending',
      subLabel: '',
      value: 0,
      iconClass: 'fa-regular fa-clock',
      iconBgColor: '#fff4e5',
      iconColor: '#f59e0b',
    },
    {
      id:'declined',
      label: 'Declined',
      subLabel: '',
      value: 0,
      iconClass: 'fa-solid fa-xmark',
      iconBgColor: '#ffe9e9',
      iconColor: '#ef4444',
    },
    {
      id:'totalOpenings',
      label: 'Total Openings',
      subLabel: '',
      value: 0,
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


  ngOnInit(): void {
    Promise.all([this.loadCounts()])
  }

  private loadCounts():void{
    this.supplyService.myAssignedCounts()
    .then((res:any)=>{
      if(res.responsecode=='00'){
        const data=res?.count;
         this.cards = this.cards.map(card => ({
          ...card,
          value: data[card.id] ?? 0,
        }));
      }
    })
  }
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