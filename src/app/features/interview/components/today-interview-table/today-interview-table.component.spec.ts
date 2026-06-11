import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayInterviewTableComponent } from './today-interview-table.component';

describe('TodayInterviewTableComponent', () => {
  let component: TodayInterviewTableComponent;
  let fixture: ComponentFixture<TodayInterviewTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayInterviewTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayInterviewTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
