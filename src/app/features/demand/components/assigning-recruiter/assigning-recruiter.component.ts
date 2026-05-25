import { Component, inject } from '@angular/core';
import { RecruiterAssignmentStepComponent } from '../../../job/components/create-job/steps/recruiter-assignment/recruiter-assignment.component';

@Component({
  selector: 'app-assigning-recruiter',
  standalone:true,
  imports: [RecruiterAssignmentStepComponent],
  templateUrl: './assigning-recruiter.component.html',
  styleUrl: './assigning-recruiter.component.scss',
})
export class AssigningRecruiterComponent {


}
