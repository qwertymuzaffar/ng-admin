import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Instructor, PageResponse } from '@core/model';
import { ApiService } from '@core/http-client/api.service';

@Injectable({
  providedIn: 'root',
})
export class InstructorsService {
  #apiService: ApiService = inject(ApiService);

  public searchInstructors(
    keyword: string,
    currentPage: number,
    pageSize: number
  ): Observable<PageResponse<Instructor>> {
    return this.#apiService.get<PageResponse<Instructor>>(
      '/instructors?keyword=' +
        keyword +
        '&page=' +
        currentPage +
        '&size=' +
        pageSize
    );
  }

  public findAllInstructors(): Observable<Array<Instructor>> {
    return this.#apiService.get<Array<Instructor>>('/instructors/all');
  }

  public deleteInstructor(instructorId: number) {
    return this.#apiService.delete('/instructors/' + instructorId);
  }

  public saveInstructor(
    instructor: Omit<Instructor, 'instructorId'>
  ): Observable<Instructor> {
    return this.#apiService.post<Instructor, Omit<Instructor, 'instructorId'>>(
      '/instructors',
      instructor
    );
  }

  public loadInstructorByEmail(email: string): Observable<Instructor> {
    return this.#apiService.get<Instructor>('/instructors/find?email=' + email);
  }

  public updateInstructor(
    instructor: Instructor,
    instructorId: number
  ): Observable<Instructor> {
    return this.#apiService.put<Instructor, Instructor>(
      '/instructors/' + instructorId,
      instructor
    );
  }
}
