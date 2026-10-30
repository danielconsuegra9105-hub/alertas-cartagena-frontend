import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // URLs publicas que NO necesitan token
    const publicUrls = ['/auth/login', '/auth/registro', '/public/'];
    const isPublic = publicUrls.some(url => req.url.includes(url));

    // Si hay token y NO es publica, agregar Authorization
    const authReq = (token && !isPublic)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        // 401 = token expirado o invalido
        if (error.status === 401) {
          console.warn('Sesion expirada. Cerrando sesion y redirigiendo al login...');

          // 1. Cerrar sesion (metodo real de tu AuthService)
          this.authService.logout();

          // 2. Redirigir al login (solo en navegador)
          if (isPlatformBrowser(this.platformId)) {
            this.router.navigate(['/login']);
          }
        }

        return throwError(() => error);
      })
    );
  }
}