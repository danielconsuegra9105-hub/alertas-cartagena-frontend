import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { OAuthSuccessComponent } from './components/oauth-success/oauth-success.component';
import { RegistroComponent } from './components/registro/registro';

export const routes: Routes = [
  
  // 🌟 RUTA NUEVA PARA CAPTURAR EL TOKEN DE GOOGLE/GITHUB
  { path: 'oauth-success', component: OAuthSuccessComponent },

  { 
    path: 'comunidad', 
    // Cargamos la vista pública de forma diferida (Lazy Load) para saltar el SSR
    loadComponent: () => import('./components/alertas-publicas/alertas-publicas').then(m => m.AlertasPublicasComponent)
  },
  
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '**', redirectTo: '' }
  
];