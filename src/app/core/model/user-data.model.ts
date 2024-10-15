import { Student } from './student.model';
import { Instructor } from './instructor.model';

export interface UserData {
  username: string;
  roles: string[];
  _token: string;
  _expiration: Date;
  student: Student | undefined;
  instructor: Instructor | undefined;
}
