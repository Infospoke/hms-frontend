import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewNotiationReviewComponent } from './review-notiation-review.component';

describe('ReviewNotiationReviewComponent', () => {
  let component: ReviewNotiationReviewComponent;
  let fixture: ComponentFixture<ReviewNotiationReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewNotiationReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewNotiationReviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
