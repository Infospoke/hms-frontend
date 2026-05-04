import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersByRoleComponent } from './users-by-role.component';

describe('UsersByRoleComponent', () => {
  let component: UsersByRoleComponent;
  let fixture: ComponentFixture<UsersByRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersByRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersByRoleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
