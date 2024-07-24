import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { variationPlacements } from '@popperjs/core';
import { Subscription } from 'rxjs';
import { Instructor } from 'src/app/model/instructor.model';
import { LoggedUser } from 'src/app/model/logged-user.model';
import { Student } from 'src/app/model/student.model';
import { AuthService } from 'src/app/services/auth.service';
import { InstructorsService } from 'src/app/services/instructors.service';
import { StudentsService } from 'src/app/services/students.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  userSub!: Subscription;
  isAuthenticated = false;
  isInstructor = false;
  isStudent = false;
  name!: string | undefined;
  currentInstructor!: Instructor | undefined;
  currentStudent!: Student | undefined;
  updateInstructorFormGroup!: FormGroup;
  updateStudentFormGroup!: FormGroup;
  
  submitted: boolean = false;

  constructor(private authService: AuthService, private fb: FormBuilder, private modalService: NgbModal,
    private instructorService: InstructorsService, private studentService: StudentsService) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(loggedUser => {
      this.isAuthenticated = !!LoggedUser;
      this.isInstructor = !!loggedUser?.instructor;
      this.isStudent = !!loggedUser?.student;
      if (this.isInstructor) {
        this.name = loggedUser?.instructor?.firstName + " " + loggedUser?.instructor?.lastName;
        this.currentInstructor = loggedUser?.instructor;
      } else if(this.isStudent) {
        this.name = loggedUser?.student?.firstName + " " + loggedUser?.student?.lastName;
        this.currentStudent = loggedUser?.student;
      }
    })
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  getModal(content: any) {
    this.modalService.open(content, {size: 'xl'});
    if (this.isInstructor) {
      this.updateInstructorFormGroup = this.fb.group({
        instructorId: [this.currentInstructor?.instructorId, Validators.required],
        firstName: [this.currentInstructor?.firstName, Validators.required],
        lastName: [this.currentInstructor?.lastName, Validators.required],
        summary: [this.currentInstructor?.summary, Validators.required]
      })
    } else if(this.isStudent) {
      this.updateStudentFormGroup = this.fb.group({
        studentId: [this.currentStudent?.studentId, Validators.required],
        firstName: [this.currentStudent?.firstName, Validators.required],
        lastName: [this.currentStudent?.lastName, Validators.required],
        level: [this.currentStudent?.level, Validators.required],
      })
    }
  }

  onCloseModal(modal: any) {
    modal.close();
  }

  onUpdateInstructor(modal: any) {
    this.submitted = true;
    if(this.updateInstructorFormGroup.invalid) return;
    this.instructorService.updateInstructor(this.updateInstructorFormGroup.value, this.updateInstructorFormGroup.value.instructorId).subscribe({
      next:(instructor) => {
        alert("Success Updating Profile");
        this.authService.refreshInstructor(instructor);
        this.submitted = false;
        modal.close();
      }, error: err => {
        alert(err.message)
      }
    })
  }

  onUpdateStudent(modal: any) {
    this.submitted = true;
    if(this.updateStudentFormGroup.invalid) return;
    this.studentService.updateStudent(this.updateStudentFormGroup.value, this.updateStudentFormGroup.value.studentId).subscribe({
      next:(student) => {
        alert("Success Updating Profile");
        this.authService.refreshStudent(student);
        this.submitted = false;
        modal.close();
      }, error: err => {
        alert(err.message);
        console.log(err);
      }
    })
  }

}
