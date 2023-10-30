import { TestBed } from '@angular/core/testing';

import { FileSharingService } from './file-sharing.service';

describe('FileSharingService', () => {
  let service: FileSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
