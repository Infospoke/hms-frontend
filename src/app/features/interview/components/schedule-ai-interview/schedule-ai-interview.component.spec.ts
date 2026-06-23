import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAiInterviewComponent } from './schedule-ai-interview.component';

describe('ScheduleAiInterviewComponent', () => {
  let component: ScheduleAiInterviewComponent;
  let fixture: ComponentFixture<ScheduleAiInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleAiInterviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleAiInterviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
