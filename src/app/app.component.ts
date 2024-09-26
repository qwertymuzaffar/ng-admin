import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeaderComponent } from './components/header/header.component';
import { AuthStore } from './components/authentication/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [HeaderComponent, NavbarComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
  #authStore: AuthStore = inject(AuthStore);

  ngOnInit(): void {
    this.#authStore.autoLogin();
  }
}
