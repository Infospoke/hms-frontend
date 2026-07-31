import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiringManagerDashboardComponent } from './hiring-manager-dashboard.component';

describe('HiringManagerDashboardComponent', () => {
  let component: HiringManagerDashboardComponent;
  let fixture: ComponentFixture<HiringManagerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiringManagerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiringManagerDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
