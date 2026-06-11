import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewCandidateInfoComponent } from './interview-candidate-info.component';

describe('InterviewCandidateInfoComponent', () => {
  let component: InterviewCandidateInfoComponent;
  let fixture: ComponentFixture<InterviewCandidateInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewCandidateInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewCandidateInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
