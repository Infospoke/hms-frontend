import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitersAndResponseComponent } from './recruiters-and-response.component';

describe('RecruitersAndResponseComponent', () => {
  let component: RecruitersAndResponseComponent;
  let fixture: ComponentFixture<RecruitersAndResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitersAndResponseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitersAndResponseComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
