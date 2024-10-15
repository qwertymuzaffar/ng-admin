import { FormControl, FormGroup } from '@angular/forms';

export interface InstructorForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  summary: FormControl<string>;
  user: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;
}
