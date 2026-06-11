import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewFormComponent } from './interview-form.component';

describe('InterviewFormComponent', () => {
  let component: InterviewFormComponent;
  let fixture: ComponentFixture<InterviewFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
