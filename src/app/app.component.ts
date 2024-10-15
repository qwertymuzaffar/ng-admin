import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@app/layout/navbar/navbar.component';
import { HeaderComponent } from '@app/layout/header/header.component';
import { Store } from '@ngrx/store';
import { authActions } from '@app/auth/+state/auth.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [HeaderComponent, NavbarComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
  readonly #store: Store = inject(Store);

  ngOnInit() {
    this.#store.dispatch(authActions.autoLogin());
  }
}
