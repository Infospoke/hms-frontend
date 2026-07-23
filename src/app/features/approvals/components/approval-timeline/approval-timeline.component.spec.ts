import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalTimelineComponent } from './approval-timeline.component';

describe('ApprovalTimelineComponent', () => {
  let component: ApprovalTimelineComponent;
  let fixture: ComponentFixture<ApprovalTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalTimelineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
