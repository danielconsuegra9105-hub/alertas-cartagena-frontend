import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Usuario } from '../models/alerta.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  usuarioActual$ = this.usuarioActual.asObservable();
  private isBrowser: boolean;
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'usuario';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      // 1. Intentar cargar el usuario del localStorage
      const stored = localStorage.getItem(this.USER_KEY);
      if (stored) {
        try {
          this.usuarioActual.next(JSON.parse(stored));
          console.log('Usuario cargado desde localStorage:', JSON.parse(stored));
        } catch (e) {
          console.error('Error al parsear usuario:', e);
        }
      } else {
        // 2. SI NO HAY USUARIO, PERO HAY TOKEN (Caso Google/GitHub)
        const token = this.getToken();
        if (token) {
          const payload = this.decodificarToken(token);
          if (payload) {
             // Determinamos el rol desde el token
            const rolExtraido = payload.role ? payload.role.replace('ROLE_', '') : 'CIUDADANO';
            
            const usuarioOAuth: Usuario = {
                id: payload.sub,
                correo: payload.sub,
                nombre: payload.sub.split('@')[0], // Nombre temporal
                rol: rolExtraido,
                telefono: '',
                password: ''
            };
            this.usuarioActual.next(usuarioOAuth);
            localStorage.setItem(this.USER_KEY, JSON.stringify(usuarioOAuth));
            console.log('Usuario creado desde token de OAuth:', usuarioOAuth);
          }
        }
      }
    }
  }

  // Decodifica el JWT para sacar los datos
  private decodificarToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  // LOGIN CON JWT
  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, password }).pipe(
      tap((response: any) => {
        if (this.isBrowser && response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          
          const usuario: Usuario = {
            id: response.id,
            nombre: response.nombre,
            correo: response.correo,
            rol: response.rol,
            telefono: response.telefono || '',
            password: ''
          };
          localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
          this.usuarioActual.next(usuario);
        }
      })
    );
  }

  // REGISTRO
  registrar(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, usuario).pipe(
      tap((response: any) => {
        if (this.isBrowser && response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          
          const usuarioGuardado: Usuario = {
            id: response.id,
            nombre: response.nombre,
            correo: response.correo,
            rol: response.rol,
            telefono: response.telefono || '',
            password: ''
          };
          localStorage.setItem(this.USER_KEY, JSON.stringify(usuarioGuardado));
          this.usuarioActual.next(usuarioGuardado);
        }
      })
    );
  }

  // OBTENER TOKEN
  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // LOGOUT
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.usuarioActual.next(null);
  }

  // OBTENER USUARIO ACTUAL
  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual.value;
  }

  // VERIFICAR SI ES ADMIN
  esAdmin(): boolean {
    const usuario = this.usuarioActual.value;
    return usuario?.rol === 'OPERADOR' || usuario?.rol === 'ADMIN';
  }

  // VERIFICAR SI ESTÁ AUTENTICADO
  estaAutenticado(): boolean {
    if (!this.isBrowser) return false;
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token !== null && token !== '';
  }
}