import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  correo: string = '';
  password: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.correo || !this.password) {
      this.error = 'Por favor ingresa correo y contraseña';
      return;
    }

    this.authService.login(this.correo, this.password).subscribe({
      next: (response) => {
        if (response && response.token) {
          this.router.navigate(['/']);
        } else {
          this.error = 'Correo o contraseña incorrectos';
        }
      },
      error: (err) => {
        console.error('Error de login:', err);

        // ✅ Mostrar el mensaje del backend si existe
        if (err.error && typeof err.error === 'string') {
          this.error = err.error;
        } else if (err.status === 401) {
          this.error = 'Credenciales inválidas';
        } else {
          this.error = 'Error al iniciar sesión';
        }
      }
    });
  }
}