import { Component, DestroyRef, inject, Signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InstructorsService } from '@core/services/instructors.service';
import { StudentsService } from '@core/services/students.service';
import { RouterLink } from '@angular/router';
import { NgIf, NgClass, AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { authActions } from '@app/auth/+state/auth.actions';
import { authQuery } from '@app/auth/+state/auth.selectors';
import { AuthState } from '@app/auth/+state/auth.reducer';
import { Student } from '@core/model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule, NgClass, AsyncPipe],
})
export class HeaderComponent {
  #destroyRef: DestroyRef = inject(DestroyRef);
  #fb: FormBuilder = inject(FormBuilder);
  #modalService: NgbModal = inject(NgbModal);
  #authStore: Store<AuthState> = inject(Store<AuthState>);
  #instructorService: InstructorsService = inject(InstructorsService);
  #studentService: StudentsService = inject(StudentsService);

  isAuthenticated$ = this.#authStore.select(authQuery.selectIsAuthenticated);

  isInstructor = this.#authStore.selectSignal(authQuery.selectIsInstructor);
  isStudent = this.#authStore.selectSignal(authQuery.selectIsStudent);

  currentInstructor = this.#authStore.selectSignal(authQuery.selectInstructor);
  currentStudent: Signal<Student | undefined> = this.#authStore.selectSignal(
    authQuery.selectStudent
  );

  updateInstructorFormGroup!: FormGroup;
  updateStudentFormGroup!: FormGroup;

  submitted: boolean = false;

  logout() {
    this.#authStore.dispatch(authActions.logout());
  }

  getModal<T>(content: T) {
    this.#modalService.open(content, { size: 'xl' });
    if (this.isInstructor()) {
      this.updateInstructorFormGroup = this.#fb.group({
        instructorId: [
          this.currentInstructor()?.instructorId,
          Validators.required,
        ],
        firstName: [this.currentInstructor()?.firstName, Validators.required],
        lastName: [this.currentInstructor()?.lastName, Validators.required],
        summary: [this.currentInstructor()?.summary, Validators.required],
      });
    } else if (this.isStudent()) {
      this.updateStudentFormGroup = this.#fb.group({
        studentId: [this.currentStudent()?.studentId, Validators.required],
        firstName: [this.currentStudent()?.firstName, Validators.required],
        lastName: [this.currentStudent()?.lastName, Validators.required],
        level: [this.currentStudent()?.level, Validators.required],
      });
    }
  }

  onCloseModal(modal: any) {
    modal.close();
  }

  onUpdateInstructor(modal: any) {
    this.submitted = true;
    if (this.updateInstructorFormGroup.invalid) return;
    this.#instructorService
      .updateInstructor(
        this.updateInstructorFormGroup.value,
        this.updateInstructorFormGroup.value.instructorId
      )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: instructor => {
          alert('Success Updating Profile');
          this.#authStore.dispatch(
            authActions.updateInstructor({ instructor })
          );
          this.submitted = false;
          modal.close();
        },
        error: err => {
          alert(err.message);
        },
      });
  }

  onUpdateStudent(modal: any) {
    this.submitted = true;
    if (this.updateStudentFormGroup.invalid) return;
    this.#studentService
      .updateStudent(
        this.updateStudentFormGroup.value,
        this.updateStudentFormGroup.value.studentId
      )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: student => {
          alert('Success Updating Profile');
          this.#authStore.dispatch(authActions.updateStudent({ student }));
          this.submitted = false;
          modal.close();
        },
        error: err => {
          alert(err.message);
          console.log(err);
        },
      });
  }
}
