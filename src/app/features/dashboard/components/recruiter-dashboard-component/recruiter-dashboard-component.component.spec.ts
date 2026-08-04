import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterDashboardComponentComponent } from './recruiter-dashboard-component.component';

describe('RecruiterDashboardComponentComponent', () => {
  let component: RecruiterDashboardComponentComponent;
  let fixture: ComponentFixture<RecruiterDashboardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterDashboardComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterDashboardComponentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
