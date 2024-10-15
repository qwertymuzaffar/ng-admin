import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { authActions } from '@app/auth/+state/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf],
})
export class AuthComponent implements OnInit {
  #store: Store = inject(Store);
  #fb: FormBuilder = inject(FormBuilder);

  loginFormGroup!: FormGroup;
  submitted: boolean = false;
  errorMessage!: string;

  ngOnInit(): void {
    this.loginFormGroup = this.#fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    this.submitted = true;
    if (this.loginFormGroup.invalid) return;
    const { username, password } = this.loginFormGroup.value;
    this.#store.dispatch(
      authActions.login({ loginRequest: { username, password } })
    );
  }
}
