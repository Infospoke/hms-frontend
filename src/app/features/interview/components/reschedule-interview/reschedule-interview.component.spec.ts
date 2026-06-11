import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleInterviewComponent } from './reschedule-interview.component';

describe('RescheduleInterviewComponent', () => {
  let component: RescheduleInterviewComponent;
  let fixture: ComponentFixture<RescheduleInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RescheduleInterviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RescheduleInterviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
