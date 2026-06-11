import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignInterviewersComponent } from './assign-interviewers.component';

describe('AssignInterviewersComponent', () => {
  let component: AssignInterviewersComponent;
  let fixture: ComponentFixture<AssignInterviewersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignInterviewersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignInterviewersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
