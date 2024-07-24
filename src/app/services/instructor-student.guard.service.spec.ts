import { TestBed } from '@angular/core/testing';

import { InstructorStudentGuardService } from './instructor-student.guard.service';

describe('InstructorStudentGuardService', () => {
  let service: InstructorStudentGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstructorStudentGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
