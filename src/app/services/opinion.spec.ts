import { TestBed } from '@angular/core/testing';

import { Opinion } from './opinion';

describe('Opinion', () => {
  let service: Opinion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Opinion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
