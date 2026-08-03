import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemiCircleGaugeComponent } from './semi-circle-gauge.component';

describe('SemiCircleGaugeComponent', () => {
  let component: SemiCircleGaugeComponent;
  let fixture: ComponentFixture<SemiCircleGaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemiCircleGaugeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemiCircleGaugeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
