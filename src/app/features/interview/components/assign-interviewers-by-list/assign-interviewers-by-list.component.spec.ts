import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignInterviewersByListComponent } from './assign-interviewers-by-list.component';

describe('AssignInterviewersByListComponent', () => {
  let component: AssignInterviewersByListComponent;
  let fixture: ComponentFixture<AssignInterviewersByListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignInterviewersByListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignInterviewersByListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
