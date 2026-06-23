import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewScheduleAiTableComponent } from './interview-schedule-ai-table.component';

describe('InterviewScheduleAiTableComponent', () => {
  let component: InterviewScheduleAiTableComponent;
  let fixture: ComponentFixture<InterviewScheduleAiTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewScheduleAiTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewScheduleAiTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
