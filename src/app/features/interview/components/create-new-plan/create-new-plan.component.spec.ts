import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewPlanComponent } from './create-new-plan.component';

describe('CreateNewPlanComponent', () => {
  let component: CreateNewPlanComponent;
  let fixture: ComponentFixture<CreateNewPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNewPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNewPlanComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
