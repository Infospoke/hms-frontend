import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { InterviewFormComponent } from '../interview-form/interview-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewServiceService } from '../../service/interview-service.service';

@Component({
  selector: 'app-reschedule-interview',
  imports: [CommonModule, InterviewFormComponent],
  templateUrl: './reschedule-interview.component.html',
  styleUrl: './reschedule-interview.component.scss',
})
export class RescheduleInterviewComponent implements OnInit {
  summary!: any;
  currentSchedule!: any
  interviewId:any;
  private interviewService=inject(InterviewServiceService);
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}
 
  ngOnInit(): void {
   
    this.interviewId = this.route.snapshot.paramMap.get('id');

    
 
    
    this.currentSchedule = {
      interviewDate: '2025-05-20',
      startTime: '11:30 AM',
      endTime: '12:05 PM',
      interviewType: 'Online',
      meetingLink: 'https://meet.google.com/abc-123',
    };
  }
  private loadCandidateDetails(){
    const res:any=this.interviewService.getInterviewCandidateDetails(this.interviewId);
    if(res?.responsecode=='00'){
        const data = res.data;
         this.summary = {
        candidate: {
          name: data.candidateName,
          role: data.jobTitle,
          badge: data.currentStage,
          // avatarUrl: 'assets/avatars/default-avatar.jpg', // Default avatar
          email: data.email,
          phone: data.phone,
          currentOrganization: data.currentOrganization,
          currentLocation: data.currentLocation,
          totalExperience: data.totalExperience,
          noticePeriod: data.noticePeriod,
        },
        job: {
          title: data.jobTitle,
          department: data.department,
          round: data.round,
          interviewType: data.interviewType,
          employmentType: data.employmentType,
          location: data.location,
          workMode: data.workMode,
          experienceRequired: data.experienceRequired,
          salaryRange: data.salaryRange || 'Not Disclosed',
        },
      };
    }
  }
  onCancel(): void {
    this.router.navigate(['/interviews/upcoming']);
  }
 
  onSubmit(newSchedule: any): void {
    console.log('Rescheduling interview:', newSchedule);
    // TODO: call your API service here, e.g.:
    // this.interviewService.reschedule(interviewId, newSchedule).subscribe(...)
    this.router.navigate(['/interviews/upcoming']);
  }
}
