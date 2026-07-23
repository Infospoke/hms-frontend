import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveOfferRequestsComponent } from './approve-offer-requests.component';

describe('ApproveOfferRequestsComponent', () => {
  let component: ApproveOfferRequestsComponent;
  let fixture: ComponentFixture<ApproveOfferRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveOfferRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveOfferRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
