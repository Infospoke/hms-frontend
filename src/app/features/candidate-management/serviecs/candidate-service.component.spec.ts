import { TestBed } from '@angular/core/testing';

import { CandidateServiceComponent } from './candidate-service.component';

describe('CandidateServiceComponent', () => {
  let service: CandidateServiceComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandidateServiceComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
