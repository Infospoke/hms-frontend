import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatePipelineComponent } from './candidate-pipeline.component';

describe('CandidatePipelineComponent', () => {
  let component: CandidatePipelineComponent;
  let fixture: ComponentFixture<CandidatePipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatePipelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatePipelineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
