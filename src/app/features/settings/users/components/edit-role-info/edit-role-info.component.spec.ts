import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoleInfoComponent } from './edit-role-info.component';

describe('EditRoleInfoComponent', () => {
  let component: EditRoleInfoComponent;
  let fixture: ComponentFixture<EditRoleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRoleInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRoleInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
