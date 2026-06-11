import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssignRecruterResponseComponent } from './view-assign-recruter-response.component';

describe('ViewAssignRecruterResponseComponent', () => {
  let component: ViewAssignRecruterResponseComponent;
  let fixture: ComponentFixture<ViewAssignRecruterResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAssignRecruterResponseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAssignRecruterResponseComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
