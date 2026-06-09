import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPlanViewComponent } from './interview-plan-view.component';

describe('InterviewPlanViewComponent', () => {
  let component: InterviewPlanViewComponent;
  let fixture: ComponentFixture<InterviewPlanViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewPlanViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewPlanViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
