import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { instructorStudentGuard } from './guards/instructor-student.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./components/authentication/authentication.component').then(
        c => c.AuthenticationComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/authentication/authentication.component').then(
        c => c.AuthenticationComponent
      ),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./components/courses/courses.component').then(
        c => c.CoursesComponent
      ),
    canActivate: [authGuard],
    data: { role: 'Admin' },
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./components/students/students.component').then(
        c => c.StudentsComponent
      ),
    canActivate: [authGuard],
    data: { role: 'Admin' },
  },
  {
    path: 'teachers',
    loadComponent: () =>
      import('./components/teachers/teachers.component').then(
        c => c.TeachersComponent
      ),
    canActivate: [authGuard],
    data: { role: 'Admin' },
  },
  {
    path: 'instructor-courses/:id',
    loadComponent: () =>
      import(
        './components/courses-instructor/courses-instructor.component'
      ).then(c => c.CoursesInstructorComponent),
    canActivate: [authGuard, instructorStudentGuard],
    data: { role: 'Instructor' },
  },
  {
    path: 'student-courses/:id',
    loadComponent: () =>
      import('./components/courses-student/courses-student.component').then(
        c => c.CoursesStudentComponent
      ),
    canActivate: [authGuard, instructorStudentGuard],
    data: { role: 'Student' },
  },
];
