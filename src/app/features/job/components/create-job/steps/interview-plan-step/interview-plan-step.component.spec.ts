import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPlanStepComponent } from './interview-plan-step.component';

describe('InterviewPlanStepComponent', () => {
  let component: InterviewPlanStepComponent;
  let fixture: ComponentFixture<InterviewPlanStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewPlanStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewPlanStepComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
