import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/alerta.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class RegistroComponent {
  usuario: Usuario = {
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    rol: 'CIUDADANO'
  };
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  registrar(): void {
    this.authService.registrar(this.usuario).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'Error al registrar usuario';
      }
    });
  }
}