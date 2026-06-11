import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedInterviewRequestsTableComponent } from './assigned-interview-requests-table.component';

describe('AssignedInterviewRequestsTableComponent', () => {
  let component: AssignedInterviewRequestsTableComponent;
  let fixture: ComponentFixture<AssignedInterviewRequestsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedInterviewRequestsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedInterviewRequestsTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
