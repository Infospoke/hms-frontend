import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOfferComponent } from './view-offer.component';

describe('ViewOfferComponent', () => {
  let component: ViewOfferComponent;
  let fixture: ComponentFixture<ViewOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOfferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOfferComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
