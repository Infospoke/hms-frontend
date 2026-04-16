import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffingRequisitionsComponent } from './staffing-requisitions.component';

describe('StaffingRequisitionsComponent', () => {
  let component: StaffingRequisitionsComponent;
  let fixture: ComponentFixture<StaffingRequisitionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffingRequisitionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffingRequisitionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
