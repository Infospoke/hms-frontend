import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPlansComponent } from './interview-plans.component';

describe('InterviewPlansComponent', () => {
  let component: InterviewPlansComponent;
  let fixture: ComponentFixture<InterviewPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewPlansComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
