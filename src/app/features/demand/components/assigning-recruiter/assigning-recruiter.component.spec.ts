import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigningRecruiterComponent } from './assigning-recruiter.component';

describe('AssigningRecruiterComponent', () => {
  let component: AssigningRecruiterComponent;
  let fixture: ComponentFixture<AssigningRecruiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssigningRecruiterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssigningRecruiterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
