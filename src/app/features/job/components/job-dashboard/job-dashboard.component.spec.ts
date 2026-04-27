import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDashboardComponent } from './job-dashboard.component';

describe('JobDashboardComponent', () => {
  let component: JobDashboardComponent;
  let fixture: ComponentFixture<JobDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
