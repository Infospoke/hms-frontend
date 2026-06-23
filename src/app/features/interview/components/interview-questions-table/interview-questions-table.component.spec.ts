import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewQuestionsTableComponent } from './interview-questions-table.component';

describe('InterviewQuestionsTableComponent', () => {
  let component: InterviewQuestionsTableComponent;
  let fixture: ComponentFixture<InterviewQuestionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewQuestionsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewQuestionsTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
