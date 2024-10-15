import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule, NonNullableFormBuilder,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, catchError, throwError } from 'rxjs';
import { Course, PageResponse, Instructor } from '@core/model';
import { CoursesService } from '@core/services/courses.service';
import { InstructorsService } from '@core/services/instructors.service';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Confirmable } from '@core/decorators/confirm';
import { InstructorForm } from '@app/teachers/model';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss'],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor, NgClass, AsyncPipe],
})
export class TeachersComponent implements OnInit {
  #destroyRef: DestroyRef = inject(DestroyRef);
  #fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  #modalService: NgbModal = inject(NgbModal);
  #instructorService: InstructorsService = inject(InstructorsService);
  #courseService: CoursesService = inject(CoursesService);

  searchFormGroup!: FormGroup;
  instructorFormGroup!: FormGroup<InstructorForm>;
  pageInstructors!: Observable<PageResponse<Instructor>>;
  pageCourses$!: Observable<PageResponse<Course>>;
  modalInstructor!: Instructor;
  errorMessage!: string;
  coursesErrorMessage!: string;
  currentPage: number = 0;
  pageSize: number = 5;
  coursesCurrentPage: number = 0;
  coursespageSize: number = 5;
  submitted: boolean = false;

  ngOnInit(): void {
    this.searchFormGroup = this.#fb.group({
      keyword: this.#fb.control(''),
    });
    this.instructorFormGroup = this.#fb.group<InstructorForm>({
      firstName: this.#fb.control('', Validators.required),
      lastName: this.#fb.control('', Validators.required),
      summary: this.#fb.control('', Validators.required),
      user: this.#fb.group({
        email: this.#fb.control('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
        password: this.#fb.control('', Validators.required),
      }),
    });
    this.handleSearchInstructors();
  }

  getModal(content: any) {
    this.submitted = false;
    this.#modalService.open(content, { size: 'xl' });
  }

  handleSearchInstructors() {
    const keyword = this.searchFormGroup.value.keyword;
    this.pageInstructors = this.#instructorService
      .searchInstructors(keyword, this.currentPage, this.pageSize)
      .pipe(
        catchError(err => {
          this.errorMessage = err.message;
          return throwError(err);
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchInstructors();
  }

  @Confirmable()
  handleDeleteInstructor(instructor: Instructor) {
    this.#instructorService
      .deleteInstructor(instructor.instructorId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.handleSearchInstructors();
        },
        error: err => {
          alert(err.message);
          console.log(err);
        },
      });
  }

  onCloseModal(modal: any) {
    modal.close();
  }

  onSaveInstructor(modal: any) {
    this.submitted = true;
    if (this.instructorFormGroup.invalid) return;

    const instructorData = this.instructorFormGroup.getRawValue();
    this.#instructorService
      .saveInstructor(instructorData)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          alert('success Saving Instructor');
          this.handleSearchInstructors();
          this.instructorFormGroup.reset();
          this.submitted = false;
          modal.close();
        },
        error: err => {
          alert(err.message);
          console.log(err);
        },
      });
  }

  getCoursesModal<T>(instructor: Instructor, courseContent: T) {
    this.coursesCurrentPage = 0;
    this.modalInstructor = instructor;
    this.handleSearchCourses(instructor);
    this.#modalService.open(courseContent, { size: 'xl' });
  }

  handleSearchCourses(i: Instructor) {
    this.pageCourses$ = this.#courseService
      .getCoursesByInstructor(
        i.instructorId,
        this.coursesCurrentPage,
        this.coursespageSize
      )
      .pipe(
        catchError(err => {
          this.coursesErrorMessage = err.message;
          return throwError(err);
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  gotoCoursesPage(page: number) {
    this.coursesCurrentPage = page;
    this.handleSearchCourses(this.modalInstructor);
  }
}
