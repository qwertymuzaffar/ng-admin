import { Component } from '@angular/core';
import { HeaderComponent } from '@app/layout/header/header.component';
import { NavbarComponent } from '@app/layout/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  standalone: true,
  imports: [HeaderComponent, NavbarComponent, RouterOutlet],
})
export class LayoutComponent {}
