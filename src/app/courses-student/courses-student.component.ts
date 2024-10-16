import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { Course, PageResponse } from '@core/model';
import { CoursesService } from '@core/services/courses.service';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-courses-student',
  templateUrl: './courses-student.component.html',
  styleUrls: ['./courses-student.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe],
})
export class CoursesStudentComponent implements OnInit {
  #destroyRef: DestroyRef = inject(DestroyRef);
  #route: ActivatedRoute = inject(ActivatedRoute);
  #courseService: CoursesService = inject(CoursesService);

  studentId!: number;
  pageCourses!: Observable<PageResponse<Course>>;
  pageOtherCourses!: Observable<PageResponse<Course>>;
  currentPage: number = 0;
  otherCoursesCurrentPage: number = 0;
  pageSize: number = 5;
  otherCoursesPageSize: number = 5;
  errorMessage!: string;
  otherCoursesErrorMessage!: string;

  ngOnInit(): void {
    this.studentId = this.#route.snapshot.params['id'];
    this.handleSearchStudentCourses();
    this.handleSearchNonEnrolledInCourses();
  }

  handleSearchStudentCourses() {
    this.pageCourses = this.#courseService
      .getCoursesByStudent(this.studentId, this.currentPage, this.pageSize)
      .pipe(
        catchError(err => {
          this.errorMessage = err.errorMessage;
          return throwError(err);
        })
      );
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchStudentCourses();
  }

  gotoPageForOtherCourses(page: number) {
    this.otherCoursesCurrentPage = page;
    this.handleSearchNonEnrolledInCourses();
  }

  handleSearchNonEnrolledInCourses() {
    this.pageOtherCourses = this.#courseService
      .getNonEnrolledInCoursesByStudent(
        this.studentId,
        this.otherCoursesCurrentPage,
        this.otherCoursesPageSize
      )
      .pipe(
        catchError(err => {
          this.otherCoursesErrorMessage = err.message;
          return throwError(err);
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  enrollIn(c: Course) {
    if (!c.courseId) return;
    this.#courseService
      .enrollStudentInCourse(c.courseId, this.studentId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.handleSearchStudentCourses();
          this.handleSearchNonEnrolledInCourses();
        },
        error: err => {
          alert(err.message);
          console.log(err);
        },
      });
  }
}
