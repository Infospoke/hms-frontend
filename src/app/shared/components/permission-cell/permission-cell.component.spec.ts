import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionCellComponent } from './permission-cell.component';

describe('PermissionCellComponent', () => {
  let component: PermissionCellComponent;
  let fixture: ComponentFixture<PermissionCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionCellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
