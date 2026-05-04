import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsPanelComponent } from './permissions-panel.component';

describe('PermissionsPanelComponent', () => {
  let component: PermissionsPanelComponent;
  let fixture: ComponentFixture<PermissionsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
