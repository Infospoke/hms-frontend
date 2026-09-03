import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientManagementComponent } from './add-client-management.component';

describe('AddClientManagementComponent', () => {
  let component: AddClientManagementComponent;
  let fixture: ComponentFixture<AddClientManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClientManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClientManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
