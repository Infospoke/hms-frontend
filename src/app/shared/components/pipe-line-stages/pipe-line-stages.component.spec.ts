import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeLineStagesComponent } from './pipe-line-stages.component';

describe('PipeLineStagesComponent', () => {
  let component: PipeLineStagesComponent;
  let fixture: ComponentFixture<PipeLineStagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipeLineStagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipeLineStagesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
