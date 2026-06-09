import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureRoundsComponent } from './configure-rounds.component';

describe('ConfigureRoundsComponent', () => {
  let component: ConfigureRoundsComponent;
  let fixture: ComponentFixture<ConfigureRoundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureRoundsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigureRoundsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
