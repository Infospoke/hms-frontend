import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseOfferLetterReadyTableComponent } from './raise-offer-letter-ready-table.component';

describe('RaiseOfferLetterReadyTableComponent', () => {
  let component: RaiseOfferLetterReadyTableComponent;
  let fixture: ComponentFixture<RaiseOfferLetterReadyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaiseOfferLetterReadyTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiseOfferLetterReadyTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
