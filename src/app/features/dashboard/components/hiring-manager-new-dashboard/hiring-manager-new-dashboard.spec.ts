import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiringManagerNewDashboard } from './hiring-manager-new-dashboard';

describe('HiringManagerNewDashboard', () => {
  let component: HiringManagerNewDashboard;
  let fixture: ComponentFixture<HiringManagerNewDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiringManagerNewDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiringManagerNewDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
