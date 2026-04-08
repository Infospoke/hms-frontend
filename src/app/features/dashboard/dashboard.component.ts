import { Component, ElementRef, EventEmitter, inject, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';


import { JobService } from '../job/services/job.service';
import { HeadingContainerComponent } from '../../shared/components/heading-container/heading-container.component';
import { PipeLineCardsComponent } from '../../shared/components/pipe-line-cards/pipe-line-cards.component';
import { JobsCardComponent } from '../../shared/components/jobs-card/jobs-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeadingContainerComponent, CommonModule, PipeLineCardsComponent,JobsCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  @Input() list: any;
  @ViewChild('jobList', { static: false }) jobList!: ElementRef;
  @Input() jobsListData: any[] = [];
  @Input() selectedJobId!:any;
  @Input() selectedJob!:any;
  activityList: any = [];
  activityLogs = [
    { user: 'Venkat', action: 'created a new job posting', time: '2 mins ago' },
    { user: 'Ravi', action: 'moved candidate to Interview stage', time: '10 mins ago' },
    { user: 'Anjali', action: 'approved hiring request', time: '30 mins ago' },
    { user: 'HR Team', action: 'closed a job position', time: '1 hour ago' },
    { user: 'Venkat', action: 'created a new job posting', time: '2 mins ago' },
    { user: 'Ravi', action: 'moved candidate to Interview stage', time: '10 mins ago' },
    { user: 'Anjali', action: 'approved hiring request', time: '30 mins ago' },
    { user: 'HR Team', action: 'closed a job position', time: '1 hour ago' },
    { user: 'Venkat', action: 'created a new job posting', time: '2 mins ago' },
    { user: 'Ravi', action: 'moved candidate to Interview stage', time: '10 mins ago' },
    { user: 'Anjali', action: 'approved hiring request', time: '30 mins ago' },

  ];
  @Input() pipeLineDetails!: any;
  @Output() emitSelectedJobId=new EventEmitter<any>();
  selectedBackgroundColor: any = 'linear-gradient(135deg, #2563EB,  #60A5FA, #3059cb)';
  normalBackgroundColor: any = '#ffffff';
  @Input() stages!: any;
  isMobile: boolean = false;


  ngOnInit(): void {
    window.addEventListener('resize', () => this.checkScreen());
    
  }
  
  checkScreen() {
    this.isMobile = window.innerWidth <= 768;
  }
  

  scrollLeft() {
    let scroll = this.isMobile ? -250 : -400
    this.jobList.nativeElement.scrollBy({
      left: scroll,
      behavior: 'smooth'
    });
  }
  scrollRight() {
    let scroll = this.isMobile ? 250 : 400
    this.jobList.nativeElement.scrollBy({
      left: scroll,
      behavior: 'smooth'
    });
  }

  handleSelectedJob($event:any){
  this.emitSelectedJobId.emit($event);
  }

 

 
}
