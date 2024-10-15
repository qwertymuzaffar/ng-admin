import { FormControl } from '@angular/forms';
import { Instructor } from '@core/model';

export interface CourseForm {
  courseName: FormControl<string>;
  courseDuration: FormControl<string>;
  courseDescription: FormControl<string>;
  instructor?: FormControl<Instructor>;
  courseId?: FormControl<number>;
}
