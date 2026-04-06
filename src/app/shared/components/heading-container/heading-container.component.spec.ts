import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingContainerComponent } from './heading-container.component';

describe('HeadingContainerComponent', () => {
  let component: HeadingContainerComponent;
  let fixture: ComponentFixture<HeadingContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadingContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadingContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
