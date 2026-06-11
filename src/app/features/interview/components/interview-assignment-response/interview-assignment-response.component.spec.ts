import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewAssignmentResponseComponent } from './interview-assignment-response.component';

describe('InterviewAssignmentResponseComponent', () => {
  let component: InterviewAssignmentResponseComponent;
  let fixture: ComponentFixture<InterviewAssignmentResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewAssignmentResponseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewAssignmentResponseComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
