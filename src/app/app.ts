import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  constructor(public authService: AuthService, private router: Router) {}

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}