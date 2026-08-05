import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaCompilanceComponentComponent } from './sla-compilance-component.component';

describe('SlaCompilanceComponentComponent', () => {
  let component: SlaCompilanceComponentComponent;
  let fixture: ComponentFixture<SlaCompilanceComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlaCompilanceComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlaCompilanceComponentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
