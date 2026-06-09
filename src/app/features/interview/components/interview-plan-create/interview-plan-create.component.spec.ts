import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPlanCreateComponent } from './interview-plan-create.component';

describe('InterviewPlanCreateComponent', () => {
  let component: InterviewPlanCreateComponent;
  let fixture: ComponentFixture<InterviewPlanCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewPlanCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewPlanCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
