import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundDetailComponent } from './round-detail.component';

describe('RoundDetailComponent', () => {
  let component: RoundDetailComponent;
  let fixture: ComponentFixture<RoundDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
