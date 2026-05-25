import { Component, inject, OnInit } from '@angular/core';
import { RecruiterAssignmentStepComponent } from '../../../job/components/create-job/steps/recruiter-assignment/recruiter-assignment.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assigning-recruiter',
  standalone:true,
  imports: [RecruiterAssignmentStepComponent],
  templateUrl: './assigning-recruiter.component.html',
  styleUrl: './assigning-recruiter.component.scss',
})
export class AssigningRecruiterComponent implements OnInit{
  jobId:any;
  private route = inject(ActivatedRoute);
  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'];
  }

 
}
