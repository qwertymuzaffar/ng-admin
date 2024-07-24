import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { catchError, Observable, throwError } from "rxjs";
import { PageResponse } from "../../model/page.response.model";
import { Student } from "../../model/student.model";
import { StudentsService } from "../../services/students.service";
import { UsersService } from "../../services/users.service";
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
// import {EmailExistsValidator} from "../../validators/emailexists.validator";

@Component({
    selector: 'app-students',
    templateUrl: './students.component.html',
    styleUrls: ['./students.component.scss'],
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, NgFor, NgClass, AsyncPipe]
})


export class StudentsComponent implements OnInit {


  searchFormGroup!: FormGroup;
  studentFormGroup!: FormGroup;
  pageStudents!: Observable<PageResponse<Student>>;
  errorMessage!: string;
  currentPage: number = 0;
  pageSize: number = 5;
  submitted: boolean = false;


  // constructor() { }
  constructor(private modalService: NgbModal, private studentService: StudentsService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    });
    this.studentFormGroup = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      level: ["", Validators.required],
      user: this.fb.group({
        // email: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")], [EmailExistsValidator.validate(this.userService)]],
        email: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
        password: ["", Validators.required],
      })
    })

    this.handleSearchStudents();
  }


  getModal(content: any) {
    this.modalService.open(content, { size: 'xl' })
    this.submitted = false
  }


  handleSearchStudents() {
    let keyword = this.searchFormGroup.value.keyword;
    console.log(this.pageStudents)
    this.pageStudents = this.studentService.searchStudents(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err);
      })
    )

  }

  handleDeleteStudent(student: Student) {
    let conf = confirm("Are you sure?");
    if (!conf) return;
    this.studentService.deleteStudent(student.studentId).subscribe({
      next: () => {
        this.handleSearchStudents()
      },
      error: err => {
        alert(err.message)
        console.log(err);
      }
    })
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchStudents();

  }

  onSaveStudent(modal: any) {
    this.submitted = true;
    if (this.studentFormGroup.invalid) return;
    this.studentService.saveStudent(this.studentFormGroup.value).subscribe({
      next: () => {
        alert("success Saving Student");
        this.handleSearchStudents();
        this.studentFormGroup.reset();
        this.submitted = false;
        modal.close();
      }, error: err => {
        alert(err.message)
      }
    })

  }

  onCloseModal(modal: any) {
    modal.close();
    this.studentFormGroup.reset();
  }
}
