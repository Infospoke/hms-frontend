import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeLineCardsComponent } from './pipe-line-cards.component';

describe('PipeLineCardsComponent', () => {
  let component: PipeLineCardsComponent;
  let fixture: ComponentFixture<PipeLineCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipeLineCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipeLineCardsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
