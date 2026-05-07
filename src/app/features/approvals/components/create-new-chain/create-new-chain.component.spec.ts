import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewChainComponent } from './create-new-chain.component';

describe('CreateNewChainComponent', () => {
  let component: CreateNewChainComponent;
  let fixture: ComponentFixture<CreateNewChainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNewChainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNewChainComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
