import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiInterviewDetailsComponent } from './ai-interview-details.component';

describe('AiInterviewDetailsComponent', () => {
  let component: AiInterviewDetailsComponent;
  let fixture: ComponentFixture<AiInterviewDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiInterviewDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiInterviewDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
