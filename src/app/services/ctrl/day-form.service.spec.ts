import { TestBed } from '@angular/core/testing';

import { DayFormService } from './day-form.service';

describe('DayFormService', () => {
  let service: DayFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DayFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
