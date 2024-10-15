import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  NonNullableFormBuilder,
} from '@angular/forms';
import { catchError, Observable, throwError } from 'rxjs';
import { PageResponse, SearchFormModel, Student } from '@core/model';
import { StudentsService } from '@core/services/students.service';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Confirmable } from '@core/decorators/confirm';
import { StudentForm } from '@app/students/model';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor, NgClass, AsyncPipe],
})
export class StudentsComponent implements OnInit {
  #destroyRef: DestroyRef = inject(DestroyRef);
  #fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  #modalService: NgbModal = inject(NgbModal);
  #studentService: StudentsService = inject(StudentsService);

  searchFormGroup!: FormGroup<SearchFormModel>;
  studentFormGroup!: FormGroup<StudentForm>;
  pageStudents$!: Observable<PageResponse<Student>>;
  errorMessage!: string;
  currentPage: number = 0;
  pageSize: number = 5;
  submitted: boolean = false;

  ngOnInit(): void {
    this.searchFormGroup = this.#fb.group<SearchFormModel>({
      keyword: this.#fb.control(''),
    });
    this.studentFormGroup = this.#fb.group<StudentForm>({
      firstName: this.#fb.control('', Validators.required),
      lastName: this.#fb.control('', Validators.required),
      level: this.#fb.control('', Validators.required),
      user: this.#fb.group({
        email: this.#fb.control('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
        password: this.#fb.control('', Validators.required),
      }),
    });

    this.handleSearchStudents();
  }

  getModal(content: any) {
    this.#modalService.open(content, { size: 'xl' });
    this.submitted = false;
  }

  handleSearchStudents() {
    const keyword = this.searchFormGroup.value.keyword;
    this.pageStudents$ = this.#studentService
      .searchStudents(keyword, this.currentPage, this.pageSize)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message;
          return throwError(err);
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  @Confirmable('Are you sure you want to delete this student?')
  handleDeleteStudent(student: Student) {
    this.#studentService
      .deleteStudent(student.studentId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.handleSearchStudents();
        },
        error: err => {
          alert(err.message);
          console.log(err);
        },
      });
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchStudents();
  }

  onSaveStudent(modal: any) {
    this.submitted = true;
    if (this.studentFormGroup.invalid) return;

    const studentData = this.studentFormGroup.getRawValue();
    this.#studentService
      .saveStudent(studentData)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          alert('success Saving Student');
          this.handleSearchStudents();
          this.studentFormGroup.reset();
          this.submitted = false;
          modal.close();
        },
        error: err => {
          alert(err.message);
        },
      });
  }

  onCloseModal(modal: any) {
    modal.close();
    this.studentFormGroup.reset();
  }
}
