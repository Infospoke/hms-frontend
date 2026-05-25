import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApprovalDetailComponent } from './job-approval-detail.component';

describe('JobApprovalDetailComponent', () => {
  let component: JobApprovalDetailComponent;
  let fixture: ComponentFixture<JobApprovalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobApprovalDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobApprovalDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
