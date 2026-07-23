import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalStatusTableComponent } from './approval-status-table.component';

describe('ApprovalStatusTableComponent', () => {
  let component: ApprovalStatusTableComponent;
  let fixture: ComponentFixture<ApprovalStatusTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalStatusTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalStatusTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
