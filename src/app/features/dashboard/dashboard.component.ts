import { Component, ElementRef, EventEmitter, inject, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';


import { JobService } from '../job/services/job.service';
import { HeadingContainerComponent } from '../../shared/components/heading-container/heading-container.component';
import { PipeLineCardsComponent } from '../../shared/components/pipe-line-cards/pipe-line-cards.component';
import { JobsCardComponent } from '../../shared/components/jobs-card/jobs-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeadingContainerComponent, CommonModule, PipeLineCardsComponent, JobsCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  @Input() list: any;
  @ViewChild('jobList', { static: false }) jobList!: ElementRef;
  @Input() jobsListData: any[] = [];
  @Input() selectedJobId!: any;
  @Input() selectedJob!: any;
  @Input() activityList: any = [];

  @Input() pipeLineDetails!: any;
  @Output() emitSelectedJobId = new EventEmitter<any>();
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

  handleSelectedJob($event: any) {
    this.emitSelectedJobId.emit($event);
  }


  getTimeAgo(timeStamp: string): string {
    console.log(timeStamp, 'timestamp')
    const now = new Date();
    const past = new Date(timeStamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / 86400);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
  getHirePercentage(): number {
    const hired = this.stages?.find((s: any) => s.title === 'Hired')?.count || 0;
    const totalApplied = this.stages?.find((s: any) => s.title === 'Applied')?.count || 0;
    if (!totalApplied) return 0;
    return (hired / totalApplied) * 100;
  }

}
