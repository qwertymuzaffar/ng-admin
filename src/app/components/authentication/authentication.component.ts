import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-authentication',
    templateUrl: './authentication.component.html',
    styleUrls: ['./authentication.component.scss'],
    standalone: true,
    imports: [ReactiveFormsModule, NgClass, NgIf]
})
export class AuthenticationComponent implements OnInit {

  #destroyRef: DestroyRef = inject(DestroyRef);
  #fb: FormBuilder = inject(FormBuilder);
  #authService: AuthService = inject(AuthService);

  loginFormGroup!: FormGroup;
  submitted: boolean = false;
  errorMessage!: string;

  ngOnInit(): void {
    this.loginFormGroup = this.#fb.group({
      username: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      password: ["", Validators.required]
    })
  }

  onLogin() {
    this.submitted = true;
    if (this.loginFormGroup.invalid) return;
    this.#authService.login(this.loginFormGroup.value)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: loginResponse => {
          this.#authService.saveToken(loginResponse);
        },
        error: err => {
          console.log(err);
          this.errorMessage = "An error occurred";
        }
    })
  }

}
