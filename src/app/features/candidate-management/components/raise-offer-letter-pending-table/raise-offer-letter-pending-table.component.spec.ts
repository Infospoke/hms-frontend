import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseOfferLetterPendingTableComponent } from './raise-offer-letter-pending-table.component';

describe('RaiseOfferLetterPendingTableComponent', () => {
  let component: RaiseOfferLetterPendingTableComponent;
  let fixture: ComponentFixture<RaiseOfferLetterPendingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaiseOfferLetterPendingTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiseOfferLetterPendingTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
