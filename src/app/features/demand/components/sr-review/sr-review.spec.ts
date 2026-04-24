import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrReview } from './sr-review';

describe('SrReview', () => {
  let component: SrReview;
  let fixture: ComponentFixture<SrReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
