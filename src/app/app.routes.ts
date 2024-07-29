import { Routes } from "@angular/router";
import { AuthGuardService } from "./services/auth.guard.service";
import { InstructorStudentGuardService } from "./services/instructor-student.guard.service";

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./components/authentication/authentication.component').then(c => c.AuthenticationComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/authentication/authentication.component').then(c => c.AuthenticationComponent),
  },
  {
    path: 'courses',
    loadComponent: () => import('./components/courses/courses.component').then(c => c.CoursesComponent),
    canActivate: [AuthGuardService],
    data: { role: 'Admin' }
  },
  {
    path: 'students',
    loadComponent: () => import('./components/students/students.component').then(c => c.StudentsComponent),
    canActivate: [AuthGuardService],
    data: { role: 'Admin' }
  },
  {
    path: 'teachers',
    loadComponent: () => import('./components/teachers/teachers.component').then(c => c.TeachersComponent),
    canActivate: [AuthGuardService],
    data: { role: 'Admin' }
  },
  {
    path: 'instructor-courses/:id',
    loadComponent: () => import('./components/courses-instructor/courses-instructor.component').then(c => c.CoursesInstructorComponent),
    canActivate: [AuthGuardService, InstructorStudentGuardService],
    data: { role: 'Instructor' }
  },
  {
    path: 'student-courses/:id',
    loadComponent: () => import('./components/courses-student/courses-student.component').then(c => c.CoursesStudentComponent),
    canActivate: [AuthGuardService, InstructorStudentGuardService],
    data: { role: 'Student' }
  },
]
