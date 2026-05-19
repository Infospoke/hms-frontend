import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyApprovedSrsComponent } from './my-approved-srs.component';

describe('MyApprovedSrsComponent', () => {
  let component: MyApprovedSrsComponent;
  let fixture: ComponentFixture<MyApprovedSrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyApprovedSrsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyApprovedSrsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
