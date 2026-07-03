import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { InterviewFormComponent } from '../interview-form/interview-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewServiceService } from '../../service/interview-service.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-reschedule-interview',
  imports: [CommonModule, InterviewFormComponent],
  templateUrl: './reschedule-interview.component.html',
  styleUrl: './reschedule-interview.component.scss',
})
export class RescheduleInterviewComponent implements OnInit {
  summary!: any;
  currentSchedule!: any
  interviewId: any;
  private interviewService = inject(InterviewServiceService);
  private notificationService = inject(NotificationService);
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.interviewId = this.route.snapshot.paramMap.get('id');


    Promise.all([this.loadCandidateDetails(), this.currentScheduleData()])
    ;

  }

  private async currentScheduleData() {
    const res: any = await this.interviewService.getScheduleInterviewDetailsForCandidate(this.interviewId);
    if (res?.responsecode == '00') {
      const data = res?.data;
      this.currentSchedule={
        startTime:data?.startTime,
        endTime:data?.endTime,
        interviewDate:data?.InterviewDate,
        interviewType:data?.InterviewType,
        venueDetails:data?.venueDetails,
        meetingLink:data?.meetingLink
      };

    }
    else {
      this.notificationService.error(res?.message || 'Failed to fetch current schedule');
    }
  }
  private async loadCandidateDetails() {
    const res: any = await this.interviewService.candidateSummaryDetails(this.interviewId);
    if (res?.responsecode == '00') {
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
    this.router.navigate(['/supply/my-interview-requests/'],{state:{activeType:'ui'}});
  }

  async onSubmit(newSchedule: any) {
   
    const payload={
      scheduleId:this.interviewId,
      rescheduleVenueDetails:newSchedule.venueDetails,
      rescheduleMeetingLink:newSchedule.meetingLink,
      rescheduleDate:newSchedule.interviewDate,
      rescheduleStartTime:newSchedule.startTime,
      rescheduleEndTime:newSchedule.endTime
    }
    const res:any=await this.interviewService.rescheduleIntervewForCandidate(payload);
    if(res?.responsecode=='00'){
      this.notificationService.success(res?.message ||res?.responsemessage ||  'Interview rescheduled successfully');
      this.onCancel();
    }
    else{
      this.notificationService.error(res?.message || 'Failed to reschedule interview');
    }
  }
}
