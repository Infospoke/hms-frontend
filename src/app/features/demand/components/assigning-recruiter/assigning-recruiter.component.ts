import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RecruiterAssignmentStepComponent } from '../../../job/components/create-job/steps/recruiter-assignment/recruiter-assignment.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assigning-recruiter',
  standalone: true,
  imports: [RecruiterAssignmentStepComponent, ReactiveFormsModule],
  templateUrl: './assigning-recruiter.component.html',
  styleUrl: './assigning-recruiter.component.scss',
})
export class AssigningRecruiterComponent implements OnInit {
  jobId: any;
  form!: FormGroup;

  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'];

    this.form = this.fb.group({
      selectedRecruiterDetails: new FormControl([]),
    });
  }
}