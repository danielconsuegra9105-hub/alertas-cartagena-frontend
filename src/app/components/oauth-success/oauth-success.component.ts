import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
selector: 'app-oauth-success',
standalone: true,
template: `
    <div class="container mt-5 text-center">
    <h2>Iniciando sesión...</h2>
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
    <p class="mt-3 text-muted">Validando credenciales. Por favor espera.</p>
    </div>
`
})
export class OAuthSuccessComponent implements OnInit {
constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
) {}

ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
    this.route.queryParams.subscribe(params => {
        const token = params['token'];
        
        if (token) {
        localStorage.setItem('auth_token', token);
          window.location.href = '/'; // Recarga la página para entrar al Home
        } else {
        this.router.navigate(['/login']);
        }
    });
    }
}
}