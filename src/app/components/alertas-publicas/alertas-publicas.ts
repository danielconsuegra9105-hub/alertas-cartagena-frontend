import { Component, OnInit, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🌟 Para los filtros
import { RouterModule } from '@angular/router'; // 🌟 Para el botón de volver
import { HttpClient } from '@angular/common/http';
import { MapaComponent } from '../mapa/mapa';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-alertas-publicas',
  standalone: true,
  imports: [CommonModule, FormsModule, MapaComponent, RouterModule], // 🌟 Agregados aquí
  templateUrl: './alertas-publicas.html',
  styleUrls: ['./alertas-publicas.scss']
})
export class AlertasPublicasComponent implements OnInit {
  alertas: any[] = [];
  alertasFiltradas: any[] = [];
  comentarios: any[] = [];
  selectedAlerta: any = null;
  isBrowser: boolean;
  loadingAlertas: boolean = true;
  loadingComentarios: boolean = false;

  // Variables de los filtros
  filtroTexto: string = '';
  filtroEstado: string = 'TODOS';
  filtroTitulo: string = 'TODOS';

  private apiUrlPublic = `${environment.apiUrl}/public`;

  constructor(
    private http: HttpClient, 
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
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
    this.loadingAlertas = true;
    this.http.get<any[]>(`${this.apiUrlPublic}/alertas`).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.alertas = data;
          this.alertasFiltradas = data;
          this.loadingAlertas = false;
          this.cdr.detectChanges();
          
          if (this.isBrowser) {
            localStorage.setItem('alertasMapa', JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('alertasActualizadas'));
          }
        });
      },
      error: (err) => {
        console.error('Error cargando alertas públicas', err);
        this.ngZone.run(() => {
          this.loadingAlertas = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  filtrarAlertasPublicas() {
    let resultado = this.alertas;

    if (this.filtroTexto.trim() !== '') {
      const texto = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(a => 
        a.titulo.toLowerCase().includes(texto) || 
        a.ubicacionTexto.toLowerCase().includes(texto)
      );
    }

    if (this.filtroEstado !== 'TODOS') {
      resultado = resultado.filter(a => a.estado === this.filtroEstado);
    }

    if (this.filtroTitulo !== 'TODOS') {
      resultado = resultado.filter(a => 
        a.titulo.toLowerCase().includes(this.filtroTitulo.toLowerCase())
      );
    }

    this.alertasFiltradas = resultado;
    this.cdr.detectChanges();
  }

  verDetalles(alerta: any) {
    this.selectedAlerta = alerta;
    this.loadingComentarios = true;
    this.comentarios = [];

    this.http.get<any[]>(`${this.apiUrlPublic}/comentarios/${alerta.id}`).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.comentarios = data;
          this.loadingComentarios = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error cargando comentarios', err);
        this.ngZone.run(() => {
          this.loadingComentarios = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  getPrimeraImagen(imagenesUrls: string): string {
    try {
      const imagenes = JSON.parse(imagenesUrls);
      if (Array.isArray(imagenes) && imagenes.length > 0) {
        return imagenes[0];
      }
      return '';
    } catch (e) {
      return '';
    }
  }

  abrirImagenGrande(imagenBase64: string) {
    if (this.isBrowser) {
      const win = window.open();
      if (win) {
        win.document.write(`<title>Evidencia ZonaSoS</title><body style="margin:0; background:#333; display:flex; justify-content:center; align-items:center; height:100vh;"><img src="${imagenBase64}" style="max-width:100%; max-height:100%;" /></body>`);
      }
    }
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