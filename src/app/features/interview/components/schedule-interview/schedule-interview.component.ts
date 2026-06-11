import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InterviewFormComponent } from '../interview-form/interview-form.component';


@Component({
  selector: 'app-schedule-interview',
  standalone: true,
  imports: [CommonModule, InterviewFormComponent],
  templateUrl:"./schedule-interview.component.html",
  styleUrl:"./schedule-interview.component.scss"
})
export class ScheduleInterviewComponent implements OnInit {
  summary!: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    /**
     * In a real app, fetch this from a service / route resolver.
     * Shown here as static mock data matching the design screenshots.
     */
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

  onCancel(): void {
    this.router.navigate(['/schedule']);
  }

  onSubmit(schedule: any): void {
    console.log('Scheduling interview:', schedule);
    
    this.router.navigate(['/schedule/success']);
  }
}