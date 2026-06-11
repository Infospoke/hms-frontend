import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewFeedbackFormComponent } from './interview-feedback-form.component';

describe('InterviewFeedbackFormComponent', () => {
  let component: InterviewFeedbackFormComponent;
  let fixture: ComponentFixture<InterviewFeedbackFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewFeedbackFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewFeedbackFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
