import { FormControl, FormGroup } from '@angular/forms';

export interface StudentForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  level: FormControl<string>;
  user: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;
}
