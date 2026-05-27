import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPlainAprovalComponent } from './interview-plain-aproval.component';

describe('InterviewPlainAprovalComponent', () => {
  let component: InterviewPlainAprovalComponent;
  let fixture: ComponentFixture<InterviewPlainAprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewPlainAprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewPlainAprovalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
