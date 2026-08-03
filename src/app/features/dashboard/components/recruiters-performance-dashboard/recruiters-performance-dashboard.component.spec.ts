import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitersPerformanceDashboardComponent } from './recruiters-performance-dashboard.component';

describe('RecruitersPerformanceDashboardComponent', () => {
  let component: RecruitersPerformanceDashboardComponent;
  let fixture: ComponentFixture<RecruitersPerformanceDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitersPerformanceDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitersPerformanceDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
