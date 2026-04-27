import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsCardComponent } from './jobs-card.component';

describe('JobsCardComponent', () => {
  let component: JobsCardComponent;
  let fixture: ComponentFixture<JobsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
