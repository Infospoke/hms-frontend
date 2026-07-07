import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedInterviewRequestsComponent } from './assigned-interview-requests.component';

describe('AssignedInterviewRequestsComponent', () => {
  let component: AssignedInterviewRequestsComponent;
  let fixture: ComponentFixture<AssignedInterviewRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedInterviewRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedInterviewRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
