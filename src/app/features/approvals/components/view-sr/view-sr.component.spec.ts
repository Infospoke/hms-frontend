import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSrComponent } from './view-sr.component';

describe('ViewSrComponent', () => {
  let component: ViewSrComponent;
  let fixture: ComponentFixture<ViewSrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSrComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
