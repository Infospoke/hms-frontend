import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateroleComponent } from './createrole.component';

describe('CreateroleComponent', () => {
  let component: CreateroleComponent;
  let fixture: ComponentFixture<CreateroleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateroleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateroleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
