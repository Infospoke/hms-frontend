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
  ngOnInit(): void {
    this.candidateId=this.route.snapshot.params['id'];
    this.summary = {
      candidate: {
        name: 'Arjan Sharma',
        role: 'Senior Frontend Developer',
        badge: 'Hunters Round',
        avatarUrl: 'assets/avatars/arjan-sharma.jpg',
        email: 'arjan.sharma@email.com',
        phone: '+91 98765 43210',
        currentOrganization: 'Tech Solutions Inc.',
        currentLocation: 'Bangalore, India',
        totalExperience: '6.2 Years',
        noticePeriod: '16 Days',
      },
      job: {
        title: 'Quality Assurance Engineer - L2',
        department: 'Quality Assurance',
        round: 'Technical Interview - 1 Round',
        interviewType: 'Technical Interview',
        employmentType: 'Full-time',
        location: 'Bangalore, Karnataka, India',
        workMode: 'Hybrid',
        experienceRequired: '3-5 Years',
        salaryRange: '₹12 - ₹18 LPA',
      },
    };
  }

  private loadCandidateDetails(){
    const res:any=this.interviewService.getInterviewCandidateDetails(this.candidateId);
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
    this.router.navigate(['/supply/my-interview-requests'],{state:{activeType:'ts'}});
  }

  async onSubmit(schedule: any) {
    console.log('Scheduling interview:', schedule);
    const res:any=await this.interviewService.scheduleInterviewToCandidate(schedule);
    if(res?.responsecode=='00'){
      this.notificationService.success(res?.responsemessage || res?.responseMessage);
      this.onCancel();
    }
    else{
      this.notificationService.error(res?.responsemessage || res?.responseMessage);
    }
    // this.router.navigate(['/schedule/success']);
  }
}