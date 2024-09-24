import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { AuthStore } from './store';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf],
})
export class AuthenticationComponent implements OnInit {
  #authStore: AuthStore = inject(AuthStore);
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
    this.#authStore.login(this.loginFormGroup.value);
  }
}
