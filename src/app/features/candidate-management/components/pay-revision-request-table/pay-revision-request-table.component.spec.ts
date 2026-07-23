import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayRevisionRequestTableComponent } from './pay-revision-request-table.component';

describe('PayRevisionRequestTableComponent', () => {
  let component: PayRevisionRequestTableComponent;
  let fixture: ComponentFixture<PayRevisionRequestTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayRevisionRequestTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayRevisionRequestTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
