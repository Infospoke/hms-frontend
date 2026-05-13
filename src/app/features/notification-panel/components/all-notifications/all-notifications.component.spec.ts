import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllNotificationsComponent } from './all-notifications.component';

describe('AllNotificationsComponent', () => {
  let component: AllNotificationsComponent;
  let fixture: ComponentFixture<AllNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllNotificationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
