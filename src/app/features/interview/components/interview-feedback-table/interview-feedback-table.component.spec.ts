import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewFeedbackTableComponent } from './interview-feedback-table.component';

describe('InterviewFeedbackTableComponent', () => {
  let component: InterviewFeedbackTableComponent;
  let fixture: ComponentFixture<InterviewFeedbackTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewFeedbackTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewFeedbackTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
