import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [HeaderComponent, NavbarComponent, RouterOutlet]
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {
    this.authService.autoLogin();
  }


}
