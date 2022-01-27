import { TestBed } from '@angular/core/testing';

import { DesktopRectService } from './desktop-rect.service';

describe('DesktopRectService', () => {
  let service: DesktopRectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesktopRectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
