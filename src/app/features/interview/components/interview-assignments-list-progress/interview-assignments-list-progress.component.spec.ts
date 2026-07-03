import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewAssignmentsListProgressComponent } from './interview-assignments-list-progress.component';

describe('InterviewAssignmentsListProgressComponent', () => {
  let component: InterviewAssignmentsListProgressComponent;
  let fixture: ComponentFixture<InterviewAssignmentsListProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewAssignmentsListProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewAssignmentsListProgressComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
