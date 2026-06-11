import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InterviewFormComponent } from '../interview-form/interview-form.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reschedule-interview',
  imports: [CommonModule, InterviewFormComponent],
  templateUrl: './reschedule-interview.component.html',
  styleUrl: './reschedule-interview.component.scss',
})
export class RescheduleInterviewComponent implements OnInit {
  summary!: any;
  currentSchedule!: any
 
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}
 
  ngOnInit(): void {
   
    const interviewId = this.route.snapshot.paramMap.get('id');
    console.log('Loading interview:', interviewId);
 
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
        noticePeriod: '15 Days',
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
 
    // Existing / "current" schedule to display in the read-only section
    this.currentSchedule = {
      interviewDate: '2025-05-20',
      startTime: '11:30 AM',
      endTime: '12:05 PM',
      interviewType: 'Online',
      meetingLink: 'https://meet.google.com/abc-123',
    };
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
