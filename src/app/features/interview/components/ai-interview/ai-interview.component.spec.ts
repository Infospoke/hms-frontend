import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiInterviewComponent } from './ai-interview.component';

describe('AiInterviewComponent', () => {
  let component: AiInterviewComponent;
  let fixture: ComponentFixture<AiInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiInterviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiInterviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
