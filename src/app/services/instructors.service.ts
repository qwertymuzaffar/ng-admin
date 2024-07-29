import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Instructor } from '../model/instructor.model';
import { PageResponse } from '../model/page.response.model';

@Injectable({
  providedIn: 'root',
})
export class InstructorsService {

  #http: HttpClient = inject(HttpClient);

  public searchInstructors(keyword: string, currentPage: number, pageSize: number): Observable<PageResponse<Instructor>> {
    return this.#http.get<PageResponse<Instructor>>(environment.backendHost + '/instructors?keyword=' +
      keyword + '&page=' + currentPage + '&size=' + pageSize);
  }

  public findAllInstructors(): Observable<Array<Instructor>> {
    return this.#http.get<Array<Instructor>>(environment.backendHost + '/instructors/all');
  }

  public deleteInstructor(instructorId: number) {
    return this.#http.delete(environment.backendHost + '/instructors/' + instructorId);
  }

  public saveInstructor(Instructor: Instructor): Observable<Instructor> {
    return this.#http.post<Instructor>(environment.backendHost + '/instructors', Instructor);
  }

  public loadInstructorByEmail(email: string): Observable<Instructor> {
    return this.#http.get<Instructor>(environment.backendHost + '/instructors/find?email=' + email);
  }

  public updateInstructor(instructor: Instructor, instructorId: number): Observable<Instructor> {
    return this.#http.put<Instructor>(environment.backendHost + '/instructors/' + instructorId, instructor);
  }
}
