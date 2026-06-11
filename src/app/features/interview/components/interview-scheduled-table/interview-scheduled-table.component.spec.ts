import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewscheduledTableComponent } from './interview-scheduled-table.component';

describe('InterviewscheduledTableComponent', () => {
  let component: InterviewscheduledTableComponent;
  let fixture: ComponentFixture<InterviewscheduledTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewscheduledTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewscheduledTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
