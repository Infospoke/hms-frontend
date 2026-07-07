import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiInterviewZoneComponent } from './ai-interview-zone.component';

describe('AiInterviewZoneComponent', () => {
  let component: AiInterviewZoneComponent;
  let fixture: ComponentFixture<AiInterviewZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiInterviewZoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiInterviewZoneComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
