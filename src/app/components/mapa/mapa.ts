import { Component, AfterViewInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.scss']
})
export class MapaComponent implements AfterViewInit {
  
  private map: any;
  private markersLayer: any; 
  isBrowser: boolean;
  
  private readonly CARTAGENA = { lat: 10.4217, lng: -75.5505 };

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.cargarLeaflet();
      
      window.addEventListener('alertasActualizadas', () => {
        const L = (window as any).L;
        if (L && this.map) {
          this.cargarAlertasEnMapa(L);
        }
      });
    }
  }

  cargarLeaflet() {
    if (!this.isBrowser) return;

    if ((window as any).L) {
      setTimeout(() => this.iniciarMapa(), 200);
      return;
    }
    
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setTimeout(() => this.iniciarMapa(), 200);
    document.head.appendChild(script);
  }

  iniciarMapa() {
    if (!this.isBrowser) return;
    const L = (window as any).L;
    if (!L) return;
    
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
    (mapDiv as any)._leaflet_id = null;
    mapDiv.innerHTML = '';
    
    // Crear mapa con todas las interacciones
    this.map = L.map('map', {
      dragging: true, scrollWheelZoom: true, doubleClickZoom: true,
      boxZoom: true, keyboard: true, zoomControl: true
    }).setView([this.CARTAGENA.lat, this.CARTAGENA.lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 19
    }).addTo(this.map);
    
    this.markersLayer = L.layerGroup().addTo(this.map);
    let marker: any;
    
    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      if (marker) this.map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(this.map);
      marker.bindPopup(`<strong>📍 Ubicación seleccionada</strong>`).openPopup();
      
      localStorage.setItem('latitudReporte', lat.toString());
      localStorage.setItem('longitudReporte', lng.toString());
      
      window.dispatchEvent(new CustomEvent('coordenadasActualizadas', {
        detail: { latitud: lat, longitud: lng }
      }));
    });
    
    this.cargarAlertasEnMapa(L);

    // EL TRUCO PARA QUE SE MUEVA EL MOUSE
    this.ngZone.runOutsideAngular(() => {
      let intentos = 0;
      const interval = setInterval(() => {
        if (this.map) this.map.invalidateSize();
        intentos++;
        if (intentos > 5) clearInterval(interval);
      }, 300);
    });
  }
  
  cargarAlertasEnMapa(L: any) {
    if (!this.markersLayer) return;
    this.markersLayer.clearLayers();

    const alertasGuardadas = localStorage.getItem('alertasMapa');
    if (alertasGuardadas) {
      const alertas = JSON.parse(alertasGuardadas);
      alertas.forEach((alerta: any) => {
        if (!alerta.latitud || !alerta.longitud) return;
        let color = '#6c757d';
        let iconSize = 18;
        switch (alerta.estado) {
          case 'ALERTA': color = '#dc3545'; break;
          case 'ATENCION': color = '#fd7e14'; break;
          case 'RESUELTO': color = '#28a745'; iconSize = 14; break;
        }
        
        const alertIcon = L.divIcon({
          className: 'alert-marker',
          html: `<div style="background-color: ${color}; width: ${iconSize}px; height: ${iconSize}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
          iconSize: [iconSize, iconSize], popupAnchor: [0, -9]
        });
        
        L.marker([alerta.latitud, alerta.longitud], { icon: alertIcon })
          .addTo(this.markersLayer)
          .bindPopup(`
            <div style="padding:10px; min-width: 200px;">
              <h5 style="margin:0 0 5px 0;">${alerta.titulo}</h5>
              <p><strong>Estado:</strong> ${alerta.estado}</p>
              <p><strong>Ubicación:</strong> ${alerta.ubicacionTexto}</p>
            </div>
          `);
      });
    }
  }
}