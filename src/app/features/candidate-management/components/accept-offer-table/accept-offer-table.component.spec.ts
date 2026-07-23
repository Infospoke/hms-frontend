import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptOfferTableComponent } from './accept-offer-table.component';

describe('AcceptOfferTableComponent', () => {
  let component: AcceptOfferTableComponent;
  let fixture: ComponentFixture<AcceptOfferTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceptOfferTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptOfferTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
