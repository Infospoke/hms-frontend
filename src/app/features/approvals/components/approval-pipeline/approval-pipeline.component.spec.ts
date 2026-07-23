import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalPipelineComponent } from './approval-pipeline.component';

describe('ApprovalPipelineComponent', () => {
  let component: ApprovalPipelineComponent;
  let fixture: ComponentFixture<ApprovalPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalPipelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalPipelineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
