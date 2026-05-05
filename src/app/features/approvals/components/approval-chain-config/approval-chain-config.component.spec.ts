import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalChainConfigComponent } from './approval-chain-config.component';

describe('ApprovalChainConfigComponent', () => {
  let component: ApprovalChainConfigComponent;
  let fixture: ComponentFixture<ApprovalChainConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalChainConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalChainConfigComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
