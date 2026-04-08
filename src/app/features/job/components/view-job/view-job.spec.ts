import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJob } from './view-job';

describe('ViewJob', () => {
  let component: ViewJob;
  let fixture: ComponentFixture<ViewJob>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewJob]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewJob);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
