import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalLayoutComponent } from './approval-layout.component';

describe('ApprovalLayoutComponent', () => {
  let component: ApprovalLayoutComponent;
  let fixture: ComponentFixture<ApprovalLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
