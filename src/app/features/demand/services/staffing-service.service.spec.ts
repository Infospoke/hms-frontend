import { TestBed } from '@angular/core/testing';

import { StaffingServiceService } from './staffing-service.service';

describe('StaffingServiceService', () => {
  let service: StaffingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
