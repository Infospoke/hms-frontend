import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewUpcommingTableComponent} from './interview-upcomming-table.component';

describe('InterviewUpcommingTableComponent', () => {
  let component: InterviewUpcommingTableComponent;
  let fixture: ComponentFixture<InterviewUpcommingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewUpcommingTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewUpcommingTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
