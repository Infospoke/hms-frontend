import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseOfferRequestTableComponent } from './raise-offer-request-table.component';

describe('RaiseOfferRequestTableComponent', () => {
  let component: RaiseOfferRequestTableComponent;
  let fixture: ComponentFixture<RaiseOfferRequestTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaiseOfferRequestTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiseOfferRequestTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
