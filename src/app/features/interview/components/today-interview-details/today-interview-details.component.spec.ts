import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayInterviewDetailsComponent } from './today-interview-details.component';

describe('TodayInterviewDetailsComponent', () => {
  let component: TodayInterviewDetailsComponent;
  let fixture: ComponentFixture<TodayInterviewDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayInterviewDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayInterviewDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
