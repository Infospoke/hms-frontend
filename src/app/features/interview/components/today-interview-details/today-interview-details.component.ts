import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadingComponent } from "../../../../shared/components/heading/heading.component";

interface InterviewInfo {
  interviewId: string;
  jobTitle: string;
  interviewType: string;
  scheduledTime: string;
  candidateName: string;
  department: string;
  interviewMode: string;
  duration: string;
  candidateId: string;
  interviewRound: string;
  meetingPlatform: string;
}

interface Experience {
  years: string;
  currentCompany: string;
  currentRole: string;
  company: string;
  role: string;
  duration: string;
}

interface Project {
  name: string;
  role: string;
  technologies: string;
  description: string;
}

interface Document {
  name: string;
  type: string;
  size: string;
  color: string;
}

@Component({
  selector: 'app-today-interview-details',
  standalone: true,
  imports: [CommonModule, HeadingComponent],
  templateUrl: './today-interview-details.component.html',
  styleUrl: './today-interview-details.component.scss',
})
export class TodayInterviewDetailsComponent {
  interviewInfo: InterviewInfo = {
    interviewId: 'INT-2025-0142',
    jobTitle: 'Software Engineer - L2',
    interviewType: 'Technical',
    scheduledTime: '30 May 2025, 10:30 AM',
    candidateName: 'Rohit Sharma',
    department: 'Engineering',
    interviewMode: 'Online',
    duration: '45 Minutes',
    candidateId: 'NSW-1023',
    interviewRound: 'Round 1',
    meetingPlatform: 'Google Meet',
  };

  experiences: Experience[] = [
    {
      years: '3.0 Years',
      currentCompany: 'ABC Technologies',
      currentRole: 'Software Engineer',
      company: 'ABC Technologies',
      role: 'Software Engineer',
      duration: 'Jun 2021 – Present (1.4 Years)',
    },
    {
      years: '',
      currentCompany: '',
      currentRole: '',
      company: 'PQ Solutions',
      role: 'Associate Software Engineer',
      duration: 'Jul 2021 – Dec 2022 (1.5 Years)',
    },
    {
      years: '',
      currentCompany: '',
      currentRole: '',
      company: 'TechNova Systems',
      role: 'Intern',
      duration: 'Jan 2021 – Jun 2021 (6 Months)',
    },
  ];

  totalExperience = '3.0 Years';
  currentCompany = 'ABC Technologies';
  currentRole = 'Software Engineer';

  projects: Project[] = [
    {
      name: 'E-Commerce Platform',
      role: 'Developer',
      technologies: 'Java, Spring Boot, MySQL, AWS',
      description:
        'Developed a full-stack e-commerce platform with user authentication, product management, order processing and payment integration.',
    },
    {
      name: 'Employee Management System',
      role: 'Developer',
      technologies: 'Spring Boot, PostgreSQL, Angular',
      description:
        'Built an internal tool for employee data management, attendance tracking, leave management, and reporting.',
    },
    {
      name: 'Task Management App',
      role: 'Developer',
      technologies: 'Spring Boot, MongoDB, MySQL, Docker',
      description:
        'Designed and developed a task management application with real-time updates, team collaboration, and notification system.',
    },
  ];

  documents: Document[] = [
    { name: 'Resume', type: 'PDF', size: '256.5 kB', color: '#e53935' },
    { name: 'Portfolio', type: 'PDF', size: '112.8 kB', color: '#e53935' },
    { name: 'Certifications', type: 'PDF', size: '98.2 kB', color: '#e53935' },
  ];

  onBack() {}
  onViewJobDetails() {}
  onStartInterview() {}
  onComplete() {}
  onCancel() {}
}