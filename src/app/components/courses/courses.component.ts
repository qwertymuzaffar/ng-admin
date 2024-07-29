import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CoursesService } from 'src/app/services/courses.service';
import { Observable, catchError, throwError } from 'rxjs';
import { PageResponse } from 'src/app/model/page.response.model';
import { Course } from '../../model/course.model';
import { InstructorsService } from 'src/app/services/instructors.service';
import { Instructor } from 'src/app/model/instructor.model';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgFor, NgClass, AsyncPipe],
})
export class CoursesComponent implements OnInit {
  #destroyRef: DestroyRef = inject(DestroyRef);
  #modalService: NgbModal = inject(NgbModal);
  #fb: FormBuilder = inject(FormBuilder);
  #courseService: CoursesService = inject(CoursesService);
  #instructorService: InstructorsService = inject(InstructorsService);

  searchFormGroup!: FormGroup;
  courseFormGroup!: FormGroup;
  updateCourseFormGroup!: FormGroup;
  pageCourses$!: Observable<PageResponse<Course>>;
  instructors$!: Observable<Array<Instructor>>;
  currentPage: number = 0;
  pageSize: number = 5;
  errorMessage!: string;
  errorInstructorMessage!: string;
  submitted: boolean = false;
  defaultInstructor!: Instructor;

  ngOnInit(): void {
    this.searchFormGroup = this.#fb.group({
      keyword: this.#fb.control(''),
    });
    this.courseFormGroup = this.#fb.group({
      courseName: ['', Validators.required],
      courseDuration: ['', Validators.required],
      courseDescription: ['', Validators.required],
      instructor: [null, Validators.required],
    });
    this.handleSearchCourses();
  }

  getModal(content: any) {
    this.submitted = false;
    this.fetchInstructors();
    this.#modalService.open(content, { size: 'xl' });
  }

  handleSearchCourses() {
    const keyword = this.searchFormGroup.value.keyword;
    this.pageCourses$ = this.#courseService
      .searchCourses(keyword, this.currentPage, this.pageSize)
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
    this.handleSearchCourses();
  }

  handleDeleteCourse(c: Course) {
    const conf = confirm('Are you sure?');
    if (!conf) return;
    this.#courseService
      .deleteCourse(c.courseId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.handleSearchCourses();
        },
        error: err => {
          alert(err.message);
          console.log(err);
        },
      });
  }

  fetchInstructors() {
    this.instructors$ = this.#instructorService.findAllInstructors().pipe(
      catchError(err => {
        this.errorInstructorMessage = err.message;
        return throwError(err);
      }),
      takeUntilDestroyed(this.#destroyRef)
    );
  }

  onCloseModal(modal: any) {
    modal.close();
    this.courseFormGroup.reset();
  }

  onSaveCourse(modal: any) {
    this.submitted = true;
    if (this.courseFormGroup.invalid) return;
    // console.log(this.courseFormGroup.value);
    this.#courseService
      .saveCourse(this.courseFormGroup.value)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          alert('Success Saving Course');
          this.handleSearchCourses();
          this.courseFormGroup.reset();
          this.submitted = false;
          modal.close();
        },
        error: err => {
          alert(err.message);
        },
      });
  }

  getUpdateModel(c: Course, updateContent: any) {
    this.fetchInstructors();
    this.updateCourseFormGroup = this.#fb.group({
      courseId: [c.courseId, Validators.required],
      courseName: [c.courseName, Validators.required],
      courseDuration: [c.courseDuration, Validators.required],
      courseDescription: [c.courseDescription, Validators.required],
      instructor: [c.instructor, Validators.required],
    });
    this.defaultInstructor =
      this.updateCourseFormGroup.controls['instructor'].value;
    this.#modalService.open(updateContent, { size: 'xl' });
  }

  onUpdateCourse(updateModal: any) {
    this.submitted = true;
    if (this.updateCourseFormGroup.invalid) return;
    this.#courseService
      .updateCourse(
        this.updateCourseFormGroup.value,
        this.updateCourseFormGroup.value.courseId
      )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          alert('Success updating course');
          this.handleSearchCourses();
          this.submitted = false;
          updateModal.close();
        },
        error: err => {
          alert(err.message);
        },
      });
  }
}
