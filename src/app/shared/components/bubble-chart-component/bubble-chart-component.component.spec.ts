import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleChartComponentComponent } from './bubble-chart-component.component';

describe('BubbleChartComponentComponent', () => {
  let component: BubbleChartComponentComponent;
  let fixture: ComponentFixture<BubbleChartComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubbleChartComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BubbleChartComponentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
