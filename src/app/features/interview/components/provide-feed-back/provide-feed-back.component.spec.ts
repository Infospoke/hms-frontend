import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvideFeedBackComponent } from './provide-feed-back.component';

describe('ProvideFeedBackComponent', () => {
  let component: ProvideFeedBackComponent;
  let fixture: ComponentFixture<ProvideFeedBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvideFeedBackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProvideFeedBackComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
