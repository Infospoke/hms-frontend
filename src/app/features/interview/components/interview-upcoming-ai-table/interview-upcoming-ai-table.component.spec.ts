import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewUpcomingAiTableComponent } from './interview-upcoming-ai-table.component';

describe('InterviewUpcomingAiTableComponent', () => {
  let component: InterviewUpcomingAiTableComponent;
  let fixture: ComponentFixture<InterviewUpcomingAiTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewUpcomingAiTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewUpcomingAiTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
