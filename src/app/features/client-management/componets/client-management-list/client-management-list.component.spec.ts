import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientManagementListComponent } from './client-management-list.component';

describe('ClientManagementListComponent', () => {
  let component: ClientManagementListComponent;
  let fixture: ComponentFixture<ClientManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientManagementListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientManagementListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
