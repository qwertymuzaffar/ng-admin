import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { instructorStudentGuard } from '@core/guards/instructor-student.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('@app/auth/auth.component').then(c => c.AuthComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/auth/auth.component').then(c => c.AuthComponent),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('@app/courses/courses.component').then(c => c.CoursesComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' },
  },
  {
    path: 'students',
    loadComponent: () =>
      import('@app/students/students.component').then(c => c.StudentsComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' },
  },
  {
    path: 'teachers',
    loadComponent: () =>
      import('@app/teachers/teachers.component').then(c => c.TeachersComponent),
    canActivate: [authGuard],
    data: { role: 'Admin' },
  },
  {
    path: 'instructor-courses/:id',
    loadComponent: () =>
      import('@app/courses-instructor/courses-instructor.component').then(
        c => c.CoursesInstructorComponent
      ),
    canActivate: [authGuard, instructorStudentGuard],
    data: { role: 'Instructor' },
  },
  {
    path: 'student-courses/:id',
    loadComponent: () =>
      import('@app/courses-student/courses-student.component').then(
        c => c.CoursesStudentComponent
      ),
    canActivate: [authGuard, instructorStudentGuard],
    data: { role: 'Student' },
  },
  {
    path: '**',
    loadComponent: () =>
      import('@app/auth/auth.component').then(c => c.AuthComponent),
  },
];
