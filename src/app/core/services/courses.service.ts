import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse, Course } from '@core/model';
import { ApiService } from '@core/http-client/api.service';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  #apiService: ApiService = inject(ApiService);

  public searchCourses(
    keyword: string | undefined,
    currentPage: number,
    pageSize: number
  ): Observable<PageResponse<Course>> {
    return this.#apiService.get<PageResponse<Course>>(
      '/courses?keyword=' +
        keyword +
        '&page=' +
        currentPage +
        '&size=' +
        pageSize
    );
  }

  public deleteCourse(courseId: number) {
    return this.#apiService.delete('/courses/' + courseId);
  }

  public saveCourse(course: Course): Observable<Course> {
    return this.#apiService.post<Course, Course>('/courses', course);
  }

  public updateCourse(course: Course, courseId: number): Observable<Course> {
    return this.#apiService.put<Course, Course>('/courses/' + courseId, course);
  }

  public getCoursesByInstructor(
    instructorId: number,
    currentPage: number,
    pageSize: number
  ): Observable<PageResponse<Course>> {
    return this.#apiService.get<PageResponse<Course>>(
      '/instructors/' +
        instructorId +
        '/courses?page=' +
        currentPage +
        '&size=' +
        pageSize
    );
  }

  public getCoursesByStudent(
    studentId: number,
    currentPage: number,
    pageSize: number
  ): Observable<PageResponse<Course>> {
    return this.#apiService.get<PageResponse<Course>>(
      '/students/' +
        studentId +
        '/courses?page=' +
        currentPage +
        '&size=' +
        pageSize
    );
  }

  public getNonEnrolledInCoursesByStudent(
    studentId: number,
    currentPage: number,
    pageSize: number
  ) {
    return this.#apiService.get<PageResponse<Course>>(
      '/students/' +
        studentId +
        '/other-courses?page=' +
        currentPage +
        '&size=' +
        pageSize
    );
  }

  public enrollStudentInCourse(courseId: number, studentId: number) {
    return this.#apiService.post(
      '/courses/' + courseId + '/enroll/students/' + studentId,
      null
    );
  }
}
