import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTableActionsComponent } from './common-table-actions.component';

describe('CommonTableActionsComponent', () => {
  let component: CommonTableActionsComponent;
  let fixture: ComponentFixture<CommonTableActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonTableActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonTableActionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
