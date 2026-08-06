import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewFormComponent } from '../interview-form/interview-form.component';
import { InterviewServiceService } from '../../service/interview-service.service';
import { NotificationService } from '../../../../core/services/notification.service';


@Component({
  selector: 'app-schedule-interview',
  standalone: true,
  imports: [CommonModule, InterviewFormComponent],
  templateUrl:"./schedule-interview.component.html",
  styleUrl:"./schedule-interview.component.scss"
})
export class ScheduleInterviewComponent implements OnInit {
  summary!: any;
  private candidateId:any;
  constructor(private router: Router,private route:ActivatedRoute) {}
  private interviewService=inject(InterviewServiceService);
  private notificationService=inject(NotificationService);
  roundId:any;
  ngOnInit(): void {
    this.candidateId=this.route.snapshot.params['id'];
    this.loadCandidateDetails();
  }

  private async loadCandidateDetails(){
    const res:any=await this.interviewService.candidateSummaryDetails(this.candidateId);
    if(res?.responsecode=='00'){
      console.log(res);
        const data = res.data;
        this.roundId=data?.roundId || null;
         this.summary = {
        
        candidate: {
          name: data.candidateName,
          role: data.jobTitle,
          badge: data.currentStage,
          interviewMode:data?.interviewMode,
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
    this.router.navigate(['/candidate-management/in-person-interview'],{state:{activeType:'ts'}});
  }

  async onSubmit(schedule: any) {
    console.log('Scheduling interview:', schedule);
    schedule.roundId=this.roundId;
    schedule.applicantId=this.candidateId;
    const res:any=await this.interviewService.scheduleInterviewToCandidate(schedule);
    if(res?.responsecode=='00'){
      this.notificationService.success(res?.responsemessage || res?.responseMessage);
      this.onCancel();
    }
    else{
      this.notificationService.error(res?.errors?.[0] || res?.responsemessage || res?.responseMessage);
    }
    // this.router.navigate(['/schedule/success']);
  }
}