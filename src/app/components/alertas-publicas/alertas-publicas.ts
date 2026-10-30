import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MapaComponent } from '../mapa/mapa';

@Component({
  selector: 'app-alertas-publicas',
  standalone: true,
  imports: [CommonModule, MapaComponent],
  templateUrl: './alertas-publicas.html',
  styleUrls: ['./alertas-publicas.scss']
})
export class AlertasPublicasComponent implements OnInit {
  alertas: any[] = [];
  isBrowser: boolean; // Pública para el *ngIf del HTML

  private apiUrl = 'http://localhost:8080/api/alertas/publicas';

  constructor(
    private http: HttpClient, 
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarAlertasPublicas();
    }
  }

  cargarAlertasPublicas() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.alertas = data;
        
        // Actualizamos en la NgZone para evitar que Angular borre los datos
        this.ngZone.run(() => {
          if (this.isBrowser) {
            localStorage.setItem('alertasMapa', JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('alertasActualizadas'));
          }
        });
      },
      error: (err) => console.error('Error cargando alertas públicas', err)
    });
  }

  getClassEstado(estado: string): string {
    switch(estado) {
      case 'ALERTA': return 'badge bg-danger';
      case 'ATENCION': return 'badge bg-warning text-dark';
      case 'RESUELTO': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }
}