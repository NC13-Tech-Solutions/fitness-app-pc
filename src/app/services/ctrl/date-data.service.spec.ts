import { TestBed } from '@angular/core/testing';

import { DateDataService } from './date-data.service';

describe('DateDataService', () => {
  let service: DateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
