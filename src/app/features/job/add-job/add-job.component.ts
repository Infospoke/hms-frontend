import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JobService } from '../services/job.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { HeadingContainerComponent } from '../../../shared/components/heading-container/heading-container.component';

@Component({
  selector: 'app-add-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeadingContainerComponent],
  templateUrl: './add-job.component.html',
  styleUrls: ['./add-job.component.scss']
})
export class AddJobComponent implements OnInit {
  isloading: boolean = false;
  private loaderService = inject(LoaderService);
  private notificationService = inject(NotificationService);
  addJobForm!: FormGroup;
  userName: any;
  originalData: any;
  private jobApi = inject(JobService);
  countries = [
    { id: 1, name: 'India' },
    { id: 2, name: 'USA' },
    { id: 3, name: 'Dubai' }
  ];

  startExperience = [
    { id: 0, label: "0 Years" },
    { id: 1, label: "1 Year" },
    { id: 2, label: "2 Years" },
    { id: 3, label: "3 Years" },
    { id: 4, label: "4 Years" },
    { id: 5, label: "5 Years" },
    { id: 6, label: "6 Years" },
    { id: 7, label: "7 Years" },
    { id: 8, label: "8 Years" },
    { id: 9, label: "9 Years" },
    { id: 10, label: "10 Years" },
    { id: 11, label: "11 Years" },
    { id: 12, label: "12 Years" },
    { id: 13, label: "13 Years" },
    { id: 14, label: "14 Years" },
    { id: 15, label: "15 Years" },
    { id: 16, label: "16 Years" },
    { id: 17, label: "17 Years" },
    { id: 18, label: "18 Years" },
    { id: 19, label: "19 Years" },
    { id: 20, label: "20 Years" },
    { id: 21, label: "21 Years" },
    { id: 22, label: "22 Years" },
    { id: 23, label: "23 Years" },
    { id: 24, label: "24 Years" },
    { id: 25, label: "25 Years" }
  ];
  jobTypes = [
    { id: 1, name: 'Full-time' },
    { id: 2, name: 'Contract' }
  ];
  jobModes = [
    { id: 1, name: 'Onsite' },
    { id: 2, name: 'Hybrid' },
    { id: 3, name: 'Remote' },

  ];
  showSkillPopup = false;
  tempSkillForm!: FormGroup;
  weight: any[] = [{ id: 1, name: 1 }, { id: 2, name: 2 }, { id: 3, name: 3 }, { id: 4, name: 4 }, { id: 5, name: 5, }]
  flag: any;
  jobId: any;
  editfield!: boolean;
  viewField: boolean = false;
  jobSkills: any[] = [
  ];
  skillExp: any[] = [];
  constructor(private fb: FormBuilder, private router: Router) {
  }
  ngOnInit(): void {
    this.addJobForm = this.fb.group({
      jobCode: ['', [Validators.required, Validators.maxLength(50)]],
      jobTitle: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      jobType: ['', [Validators.required]],
      jobMode: ['', [Validators.required]],
      //experience: ['', [Validators.required, Validators.maxLength(50)]],
      jobRequirements: ['', [Validators.required, Validators.maxLength(5000)]],
      jobDescription: ['', [Validators.required, Validators.maxLength(5000)]],
      qualification: ['', [Validators.required, Validators.maxLength(255)]],
      //skills: ['', [Validators.required, Validators.maxLength(5000)]],
      jobCountry: ['', [Validators.required]],
      jobLevel: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      jobInfo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      jobLocation: ['', [Validators.required, Validators.maxLength(50)]],
      skills: this.fb.array([]),
      startExp: ['', Validators.required],
      endExp: ['', Validators.required]
    });

    this.tempSkillForm = this.createSkill();
    this.handleGetAllSkills();
    this.jobId = localStorage.getItem('id')
    this.flag = localStorage.getItem('flag')
    if (this.flag) {
      (this.flag == "view") ? (this.viewField = true, this.addJobForm.disable()) : (this.editfield = true);
      this.getJobById(this.jobId);
    }
  }

  async getJobById(id: any) {
    try {
      this.loaderService.show();
      let data: any = await this.jobApi.getJobDetailsById(id);
      this.originalData = data;
      this.addJobForm.patchValue({
        jobCode: data.jobCode,
        jobTitle: data.jobTitle,
        jobType: data.jobType,
        jobMode: data.jobMode,
        //experience: data.experience || data?.jobExperince,
        jobRequirements: data.jobRequirements,
        jobDescription: data.jobDescription,
        qualification: data.qualification,
        // skills: data.skills,
        jobCountry: data?.jobCountry,
        jobLevel: data.jobLevel,
        jobInfo: data.jobInfo,
        jobLocation: data.jobLocation,
      })
      if (data && data?.skills?.length) {
        this.skills.clear();

        data?.skills?.forEach((skill: any) => {
          const group = this.fb.group({
            skillId: [skill.skillId, Validators.required],
            categoryId: [skill.categoryId, Validators.required],
            weightage: [skill.weightage, Validators.required],
            experienceLevel: [skill.experienceLevel, Validators.required]
          });

          if (this.viewField) {
            group.disable();
          }
          this.skills.push(group);
        });
        this.handleExperienceSplit(data?.experience);
        this.loaderService.hide();
      }
    } catch (error) {
      this.loaderService.hide();
      console.log(error);
    }


  }

  async addJob() {
    if (this.addJobForm.valid) {
      const data = this.addJobForm.value;
      if (!data || Object.keys(data).length === 0) {

        return;
      }
      // this.loaderService.show();
      let obj = {
        ...data,
        experience: this.addJobForm.get('startExp')?.value + "-" + this.addJobForm.get('endExp')?.value,
        createdBy: this.userName,
        ...(this.editfield && { jobId: this.jobId, updatedBy: this.userName }),

      }
      obj.createdBy = this.userName;

      try {
        const apiCall = this.editfield
          ? this.jobApi.updateJob(obj)
          : this.jobApi.addJob(obj);

        let res: any = await apiCall;
        console.log(res);
        if (res?.responseCode == 1) {
          // this.loaderService.hide();
          this.notificationService.success(res?.responseMessage || `Job ${this.editfield ? 'updated' : 'added'} successfully`);
          this.handleClose();
        }
        else {
          this.notificationService.error(res?.responseMessage)
        }
      }
      catch (error: any) {
        // this.loaderService.hide();
      }

    }
    else {
      this.isloading = false;
      this.addJobForm.markAllAsTouched();
      return;
    }
  }

  cancelForm() {
    this.handleClose();
  }

  createSkill(): FormGroup {
    return this.fb.group({
      skillId: ['', Validators.required],
      categoryId: ['', Validators.required],
      weightage: ['', Validators.required],
      experienceLevel: ['', Validators.required]
    });
  }


  get skills(): FormArray {
    return this.addJobForm.get('skills') as FormArray;
  }
  addSkill() {
    this.skills.push(this.createSkill());
  }
  removeSkill(index: number) {
    this.skills.removeAt(index);
  }
  isSkillSelected(skillId: string, index: number): boolean {
    return this.skills.controls.some((control: any, i: number) => {
      return i !== index && control.get('skillId')?.value == skillId;
    });
  }


  handleExperience() {
    const start = Number(this.addJobForm.get('startExp')?.value);
    const end = Number(this.addJobForm.get('endExp')?.value);
    if (!isNaN(start) && !isNaN(end)) {
      if (start === end) {

        this.addJobForm.invalid;
      }
      else if (start > end) {
        console.log("is ", start, end)

        this.addJobForm.invalid;
      }
      else {
        this.generateExp(start, end);
      }
    }
  }
  handleExperienceSplit(exp: String) {
    if (exp == '' || exp == null) return;
    let any = exp.split('-');
    this.addJobForm.get('startExp')?.setValue(any[0]);
    this.addJobForm.get('endExp')?.setValue(any[1]);
    console.log(any);
    this.generateExp(Number(any[0]), Number(any[1]));
  }
  async handleGetAllSkills() {
    try {
      const res: any = await this.jobApi.getAllSkills();
      this.jobSkills = res;
    }
    catch (error: any) {
    }

  }
  generateExp(start: any, end: any) {
    this.skillExp = []

    for (let i = start; i <= end; i++) {
      this.skillExp.push({ id: i, name: i });
    }

  }

  getSkillName(id: any) {
    return this.jobSkills.find(s => s.skillId == id)?.skillName;
  }
  openSkillPopup() {
    this.showSkillPopup = true;
    this.tempSkillForm.setValue({
      skillId: '',
      categoryId: '',
      weightage: '',
      experienceLevel: ''
    });
    this.tempSkillForm.markAsUntouched();
  }

  closeSkillPopup() {
    this.showSkillPopup = false;
  }

  saveSkill() {
    if (this.tempSkillForm.invalid) {
      this.tempSkillForm.markAllAsTouched();
      return;
    }

    const exists = this.skills.controls.some(
      (c: any) => c.value.skillId == this.tempSkillForm.value.skillId
    );

    if (exists) return;

    this.skills.push(this.fb.group(this.tempSkillForm.value));
    this.closeSkillPopup();
  }

  handleClose() {
    this.router.navigateByUrl('/jobs/job-details');
  }
}
