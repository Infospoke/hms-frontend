import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedSrsComponent } from './approved-srs.component';

describe('ApprovedSrsComponent', () => {
  let component: ApprovedSrsComponent;
  let fixture: ComponentFixture<ApprovedSrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedSrsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedSrsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
