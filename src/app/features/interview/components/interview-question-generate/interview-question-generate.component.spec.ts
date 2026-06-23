import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewQuestionGenerateComponent } from './interview-question-generate.component';

describe('InterviewQuestionGenerateComponent', () => {
  let component: InterviewQuestionGenerateComponent;
  let fixture: ComponentFixture<InterviewQuestionGenerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewQuestionGenerateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewQuestionGenerateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
