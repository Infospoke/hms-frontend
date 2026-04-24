import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrReviewComponent } from './sr-review';

describe('SrReviewComponent', () => {
  let component: SrReviewComponent;
  let fixture: ComponentFixture<SrReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrReviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
