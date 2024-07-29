import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, catchError, throwError } from 'rxjs';
import { Course } from '../../model/course.model';
import { Instructor } from '../../model/instructor.model';
import { PageResponse } from '../../model/page.response.model';
import { CoursesService } from '../../services/courses.service';
import { InstructorsService } from '../../services/instructors.service';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss'],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor, NgClass, AsyncPipe],
})
export class TeachersComponent implements OnInit {
  #destroyRef: DestroyRef = inject(DestroyRef);
  #fb: FormBuilder = inject(FormBuilder);
  #modalService: NgbModal = inject(NgbModal);
  #instructorService: InstructorsService = inject(InstructorsService);
  #courseService: CoursesService = inject(CoursesService);

  searchFormGroup!: FormGroup;
  instructorFormGroup!: FormGroup;
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
    this.instructorFormGroup = this.#fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      summary: ['', Validators.required],
      user: this.#fb.group({
        email: [
          '',
          [
            Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ],
        ],
        password: ['', Validators.required],
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

  handleDeleteInstructor(i: Instructor) {
    const conf = confirm('Are you sure?');
    if (!conf) return;

    this.#instructorService
      .deleteInstructor(i.instructorId)
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
    console.log(modal);
  }

  onSaveInstructor(modal: any) {
    this.submitted = true;
    if (this.instructorFormGroup.invalid) return;
    this.#instructorService
      .saveInstructor(this.instructorFormGroup.value)
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

  getCoursesModal(i: Instructor, courseContent: any) {
    this.coursesCurrentPage = 0;
    this.modalInstructor = i;
    this.handleSearchCourses(i);
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
