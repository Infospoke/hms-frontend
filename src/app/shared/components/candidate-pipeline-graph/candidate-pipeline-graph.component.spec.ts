import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatePipelineGraphComponent } from './candidate-pipeline-graph.component';

describe('CandidatePipelineGraphComponent', () => {
  let component: CandidatePipelineGraphComponent;
  let fixture: ComponentFixture<CandidatePipelineGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatePipelineGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatePipelineGraphComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
