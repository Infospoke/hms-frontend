import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeadingContainerComponent } from '../../../shared/components/heading-container/heading-container.component';
import { JobService } from '../services/job.service';
import { first } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-applicant',
  imports: [ReactiveFormsModule, CommonModule, HeadingContainerComponent],
  templateUrl: './add-applicant.component.html',
  styleUrl: './add-applicant.component.scss',
})
export class AddApplicantComponent implements OnInit {
  applicationForm: FormGroup;

  countries = ['India', 'USA', 'UK', 'Canada'];
  jobRoles:any[]=[];
  additionalFileName = '';
  resumeFileName = '';
  private jobApi=inject(JobService);
  private notificationService=inject(NotificationService);
  private router=inject(Router);
  selectedJob:any;
  constructor(private fb: FormBuilder) {
    this.applicationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      country: ['', [Validators.required]],
      jobRole: ['', [Validators.required]],
      additionalFile: [null],
      resume: [null, Validators.required],
      coverLetter: ['']
    });
  }
  ngOnInit(): void {
   this.applicationForm.get('country')?.valueChanges.subscribe(country=>{
    this.getJobByCountry(country);
   });
  }
  async getJobByCountry(country: string) {
    try {
      const data: any = await this.jobApi.getjobsByCountry(country);
      this.jobRoles=Object.values(data).map((job:any)=>({jobId:job.jobId, jobTitle:job.jobTitle,jobCode:job.jobCode, jobLocation:job.jobLocation}));
    }
    catch (error) {
      console.error('Error fetching job list:', error);
    }
  }
  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (!file) return;
     const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize= 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Invalid file type. Please upload a PDF or Word document.');
        return;
    }
    if (file.size > maxSize) {
        this.notificationService.error('File size exceeds the 5MB limit. Please upload a smaller file.');
        return;
    }
    if (type === 'additional') {
      this.additionalFileName = file.name;
      this.applicationForm.patchValue({ additionalFile: file });
    }

    if (type === 'resume') {
      this.resumeFileName = file.name;
      this.applicationForm.patchValue({ resume: file });
    }
  }

  async onSubmit() {
    if (this.applicationForm.valid) {
      const formData = new FormData();
      let obj={
        firstName:this.applicationForm.value.firstName,
        lastName:this.applicationForm.value.lastName,
        email:this.applicationForm.value.email,
        phNo:this.applicationForm.value.phone,
        coverLetterDescription:this.applicationForm.value.coverLetter,
        jobId:this.applicationForm.value.jobRole,
        jobRole:this.selectedJob?.jobTitle,
        jobCode:this.selectedJob?.jobCode,
        jobTitle:this.selectedJob?.jobTitle,
        location: this.selectedJob?.jobLocation,
        privacyEnabled:true,
        contactMeEnable:true
      }
       if (this.applicationForm.value.resume) {
        formData.append('cv', this.applicationForm.value.resume);
      }

      if (this.applicationForm.value.additionalFile) {
        formData.append('additionalFile', this.applicationForm.value.additionalFile);

      }
       formData.append(
        'data',
        new Blob([JSON.stringify(obj)], { type: 'application/json' })
      );

      let res:any= await this.jobApi.addApplicant(formData);
      if(res && res?.responseCode==1){
        this.applicationForm.reset();
        this.additionalFileName = '';
        this.resumeFileName = '';
        this.notificationService.success(res?.responseMessage || 'Application submitted successfully');
        this.handleClose();
      }else{
        this.notificationService.error(res?.responseMessage || 'Failed to submit application. Please try again.');
      }
    } else {
      this.applicationForm.markAllAsTouched();
    }
  }
  handleJobChange($event:any){
    const jobId = $event.target.value;
    this.selectedJob=this.jobRoles.find(job=>job.jobId==jobId);
  }

  handleClose(){
    this.router.navigateByUrl('/jobs/job-details',{state:{activeTab:'applicants'}})
  }
}
