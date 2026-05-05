import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalSrsComponent } from './approval-srs.component';

describe('ApprovalSrsComponent', () => {
  let component: ApprovalSrsComponent;
  let fixture: ComponentFixture<ApprovalSrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalSrsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalSrsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
