import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyAssignmentComponent } from './agency-assignment.component';

describe('AgencyAssignmentComponent', () => {
  let component: AgencyAssignmentComponent;
  let fixture: ComponentFixture<AgencyAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgencyAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgencyAssignmentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
