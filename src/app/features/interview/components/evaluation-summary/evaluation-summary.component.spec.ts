import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationSummaryComponent } from './evaluation-summary.component';

describe('EvaluationSummaryComponent', () => {
  let component: EvaluationSummaryComponent;
  let fixture: ComponentFixture<EvaluationSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationSummaryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
