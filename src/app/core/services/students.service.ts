import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse, Student } from '@core/model';
import { ApiService } from '@core/http-client/api.service';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  #apiService: ApiService = inject(ApiService);

  public searchStudents(
    keyword: string | undefined,
    currentPage: number,
    pageSize: number
  ): Observable<PageResponse<Student>> {
    return this.#apiService.get<PageResponse<Student>>(
      '/students?keyword=' +
        keyword +
        '&page=' +
        currentPage +
        '&size=' +
        pageSize
    );
  }

  public deleteStudent(studentId: number) {
    return this.#apiService.delete('/students/' + studentId);
  }

  public saveStudent(student: Omit<Student, 'studentId'>): Observable<Student> {
    return this.#apiService.post<Student, Omit<Student, 'studentId'>>(
      '/students',
      student
    );
  }

  public loadStudentByEmail(email: string): Observable<Student> {
    return this.#apiService.get<Student>('/students/find?email=' + email);
  }

  public updateStudent(
    student: Student,
    studentId: number
  ): Observable<Student> {
    return this.#apiService.put<Student, Student>(
      '/students/' + studentId,
      student
    );
  }
}
