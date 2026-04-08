import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOverview } from './job-overview';

describe('JobOverview', () => {
  let component: JobOverview;
  let fixture: ComponentFixture<JobOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
