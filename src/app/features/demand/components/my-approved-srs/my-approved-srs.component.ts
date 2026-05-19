import { Component } from '@angular/core';
import { approvedSrs } from '../../../../shared/constants/reusbale-filter';
import { ApprovedSrsComponent } from "../approved-srs-layout/approved-srs.component";

@Component({
  selector: 'app-my-approved-srs',
  imports: [ApprovedSrsComponent],
  templateUrl: './my-approved-srs.component.html',
  styleUrl: './my-approved-srs.component.scss',
})
export class MyApprovedSrsComponent {

  heading: string = 'All Approved Service Requests';
  subheading: string = 'Create jobs from approved service requests';
  dropDownData = approvedSrs;
  currentPage = 1;
  activeFilters: any;
  searchPlaceholder = 'Search by SR Id, Title..';

  columns = [
    { key: 'srId',       label: 'SR ID',         width: '160px', custom: true },
    { key: 'jobTitle',   label: 'SR Title',       width: '200px', custom: true },
    { key: 'department', label: 'Department',     width: '140px', custom: true },
    { key: 'requestby',  label: 'Requested By',   width: '140px', custom: true },
    { key: 'date',       label: 'Date Range',     width: '140px', custom: true },
    { key: 'action',     label: 'Actions',        width: '140px', custom: true },
  ];

 

  data: any[] = [];
  totalElements: number = 0;
  pageSize = 10;

  filtersResponse(event: any): void {
    this.activeFilters = event;
    this.currentPage = 1;
    // this.loadList();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // this.loadList();
  }

 
}