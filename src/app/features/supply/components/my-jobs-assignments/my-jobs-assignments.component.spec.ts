import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyJobsAssignmentsComponent } from './my-jobs-assignments.component';

describe('MyJobsAssignmentsComponent', () => {
  let component: MyJobsAssignmentsComponent;
  let fixture: ComponentFixture<MyJobsAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyJobsAssignmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyJobsAssignmentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
