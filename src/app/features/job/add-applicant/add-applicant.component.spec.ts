import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddApplicantComponent } from './add-applicant.component';

describe('AddApplicantComponent', () => {
  let component: AddApplicantComponent;
  let fixture: ComponentFixture<AddApplicantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddApplicantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddApplicantComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
