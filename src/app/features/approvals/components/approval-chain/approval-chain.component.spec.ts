import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalChainComponent } from './approval-chain.component';

describe('ApprovalChainComponent', () => {
  let component: ApprovalChainComponent;
  let fixture: ComponentFixture<ApprovalChainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalChainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalChainComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
