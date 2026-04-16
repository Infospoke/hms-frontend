import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AduitLogsComponent } from './aduit-logs.component';

describe('AduitLogsComponent', () => {
  let component: AduitLogsComponent;
  let fixture: ComponentFixture<AduitLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AduitLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AduitLogsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
