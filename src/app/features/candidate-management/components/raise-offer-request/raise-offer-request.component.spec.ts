import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseOfferRequestComponent } from './raise-offer-request.component';

describe('RaiseOfferRequestComponent', () => {
  let component: RaiseOfferRequestComponent;
  let fixture: ComponentFixture<RaiseOfferRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaiseOfferRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiseOfferRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
