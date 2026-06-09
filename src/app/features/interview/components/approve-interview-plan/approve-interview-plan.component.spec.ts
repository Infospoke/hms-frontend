import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveInterviewPlanComponent } from './approve-interview-plan.component';

describe('ApproveInterviewPlanComponent', () => {
  let component: ApproveInterviewPlanComponent;
  let fixture: ComponentFixture<ApproveInterviewPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveInterviewPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveInterviewPlanComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
