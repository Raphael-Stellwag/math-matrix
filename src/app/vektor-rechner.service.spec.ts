import { TestBed } from '@angular/core/testing';

import { VektorRechnerService } from './vektor-rechner.service';

describe('VektorRechnerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VektorRechnerService = TestBed.get(VektorRechnerService);
    expect(service).toBeTruthy();
  });
});
