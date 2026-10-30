import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { AlertaService } from '../../services/alerta.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { OpinionService } from '../../services/opinion.service';
import { Alerta, Usuario, OpinionPublica } from '../../models/alerta.model';
import { MapaComponent } from '../mapa/mapa';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MapaComponent, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  verTabla: boolean = true;
  verFormulario: boolean = false;
  verFormAlerta: boolean = false;
  
  alertas: Alerta[] = [];
  alertasFiltradas: Alerta[] = [];
  usuariosLista: Usuario[] = [];
  
  alertaSeleccionadaId: any = '';
  alertaSeleccionadaTitulo: string = '';
  nuevoEstado: string = '';
  observacion: string = '';
  private modalRef: any;
  
  nuevoUsuario: Usuario = {
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    rol: 'CIUDADANO'
  };
  
  alertaData: Partial<Alerta> = {
    titulo: '',
    descripcion: '',
    ubicacionTexto: '',
    latitud: 0,
    longitud: 0,
    estado: 'ALERTA'
  };

  latitudMapa: number = 0;
  longitudMapa: number = 0;
  
  isBrowser: boolean;
  usuarioActualId: string | undefined; 

  // Variables para comentarios y evidencia
  alertaSeleccionada: Alerta | null = null;
  comentarios: any[] = [];
  nuevoComentarioTexto: string = '';
  evidenciaSeleccionada: File[] = [];
  evidenciaPreviews: string[] = [];

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private alertaService: AlertaService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private opinionService: OpinionService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.authService.usuarioActual$.subscribe(usuario => {
      if (usuario) {
        this.usuarioActualId = usuario.id;
        
        // 🌟 SOLUCIÓN 1: Retrasar un poco las peticiones para evitar el error NG0100
        setTimeout(() => {
          this.cargarAlertas();
          
          // 🌟 SOLUCIÓN 2: Solo pedir usuarios si es Admin (para evitar el 403)
          if (this.esAdmin()) {
            this.cargarUsuarios();
          }
        }, 100); 
      }
    });
    
    if (this.isBrowser) {
      setInterval(() => {
        const lat = localStorage.getItem('latitudReporte');
        const lng = localStorage.getItem('longitudReporte');
        if (lat && lng) {
          this.latitudMapa = parseFloat(lat);
          this.longitudMapa = parseFloat(lng);
        }
      }, 500);
      
      window.addEventListener('coordenadasActualizadas', ((event: any) => {
        this.latitudMapa = event.detail.latitud;
        this.longitudMapa = event.detail.longitud;
      }) as EventListener);
    }
  }

  obtenerNombreUsuario(): string {
    const usuario = this.authService.obtenerUsuarioActual();
    return usuario?.nombre || 'Usuario';
  }

  esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  cargarAlertas(): void {
    this.alertaService.obtenerTodas().subscribe((data: Alerta[]) => {
      this.alertas = data;
      
      if (this.esAdmin()) {
        this.alertasFiltradas = data;
      } else {
        this.alertasFiltradas = data.filter(a => String((a as any).usuarioId) === String(this.usuarioActualId));
      }
      
      if (this.isBrowser) {
        const alertasParaMapa = data.map(alerta => ({
          id: alerta.id,
          titulo: alerta.titulo,
          descripcion: alerta.descripcion,
          ubicacionTexto: alerta.ubicacionTexto,
          latitud: alerta.latitud,
          longitud: alerta.longitud,
          estado: alerta.estado
        }));
        localStorage.setItem('alertasMapa', JSON.stringify(alertasParaMapa));
      }
      
      this.cdr.detectChanges();
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerTodos().subscribe((data: Usuario[]) => {
      this.usuariosLista = data;
    });
  }

  contarCriticos(): number {
    return this.alertasFiltradas.filter(a => a.estado === 'ALERTA').length;
  }

  contarAtencion(): number {
    return this.alertasFiltradas.filter(a => a.estado === 'ATENCION').length;
  }

  contarResueltos(): number {
    return this.alertasFiltradas.filter(a => a.estado === 'RESUELTO').length;
  }

  getClassEstado(estado: string): string {
    switch(estado) {
      case 'ALERTA': return 'badge bg-danger';
      case 'ATENCION': return 'badge bg-warning text-dark';
      case 'RESUELTO': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  toggleTabla(): void {
    this.verTabla = true;
    this.verFormulario = false;
    this.verFormAlerta = false;
    this.cargarAlertas();
    if (this.esAdmin()) this.cargarUsuarios();
  }

  toggleFormulario(): void {
    this.verFormulario = !this.verFormulario;
    this.verTabla = !this.verFormulario;
  }

  toggleFormAlerta(): void {
    this.verFormAlerta = !this.verFormAlerta;
  }

  abrirModal(content: any, id: any, titulo: string, estadoActual: string): void {
    if (!this.esAdmin()) {
      alert('❌ No tienes permisos para realizar esta acción');
      return;
    }
    
    this.alertaSeleccionadaId = id;
    this.alertaSeleccionadaTitulo = titulo;
    this.observacion = '';
    
    if (estadoActual === 'ALERTA') {
      this.nuevoEstado = 'ATENCION';
    } else if (estadoActual === 'ATENCION') {
      this.nuevoEstado = 'RESUELTO';
    }
    
    this.modalRef = this.modalService.open(content, { centered: true });
  }

  confirmarCambioEstado(): void {
    this.cambiarEstado(this.alertaSeleccionadaId, this.nuevoEstado, this.observacion);
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  registrar(): void {
    if (!this.nuevoUsuario.nombre || this.nuevoUsuario.nombre.trim() === '') {
      alert('❌ El nombre es obligatorio');
      return;
    }
    
    if (!this.nuevoUsuario.correo || this.nuevoUsuario.correo.trim() === '') {
      alert('❌ El correo es obligatorio');
      return;
    }
    
    if (!this.nuevoUsuario.telefono || this.nuevoUsuario.telefono.trim() === '') {
      alert('❌ El teléfono es obligatorio');
      return;
    }
    
    if (!this.nuevoUsuario.password || this.nuevoUsuario.password.trim() === '') {
      alert('❌ La contraseña es obligatoria');
      return;
    }

    this.usuarioService.crear(this.nuevoUsuario).subscribe({
      next: (response) => {
        console.log('✅ Usuario creado:', response);
        this.cargarUsuarios();
        this.nuevoUsuario = { nombre: '', correo: '', telefono: '', password: '', rol: 'CIUDADANO' };
        this.verFormulario = false;
        this.verTabla = true;
        alert('✅ Usuario registrado correctamente');
      },
      error: (err) => {
        console.error('❌ Error al crear usuario:', err);
        alert('❌ Error al registrar usuario');
      }
    });
  }

  registrarAlerta(): void {
    if (!this.alertaData.titulo || this.alertaData.titulo.trim() === '') {
      alert('❌ El título es obligatorio');
      return;
    }
    
    if (!this.alertaData.descripcion || this.alertaData.descripcion.trim() === '') {
      alert('❌ La descripción es obligatoria');
      return;
    }
    
    if (!this.alertaData.ubicacionTexto || this.alertaData.ubicacionTexto.trim() === '') {
      alert('❌ La ubicación es obligatoria');
      return;
    }

    if (this.isBrowser) {
      const latGuardada = localStorage.getItem('latitudReporte');
      const lngGuardada = localStorage.getItem('longitudReporte');
      
      if (latGuardada && lngGuardada) {
        this.alertaData.latitud = parseFloat(latGuardada);
        this.alertaData.longitud = parseFloat(lngGuardada);
      } else {
        alert('❌ Primero haz clic en el mapa para seleccionar la ubicación');
        return;
      }
    }

    const usuarioActual = this.authService.obtenerUsuarioActual();
    if (usuarioActual) {
      (this.alertaData as any).usuarioId = usuarioActual.id;
    }

    this.alertaService.crear(this.alertaData as Alerta).subscribe({
      next: (response) => {
        console.log('✅ Alerta creada:', response);
        
        if (this.isBrowser) {
          const alertasGuardadas = localStorage.getItem('alertasMapa');
          const alertas = alertasGuardadas ? JSON.parse(alertasGuardadas) : [];
          alertas.push({
            id: response.id,
            titulo: response.titulo,
            descripcion: response.descripcion,
            ubicacionTexto: response.ubicacionTexto,
            latitud: response.latitud,
            longitud: response.longitud,
            estado: response.estado
          });
          localStorage.setItem('alertasMapa', JSON.stringify(alertas));
          
          this.cargarAlertas(); 
          window.dispatchEvent(new CustomEvent('alertasActualizadas'));
        }
        
        this.alertaData = { titulo: '', descripcion: '', ubicacionTexto: '', latitud: 0, longitud: 0, estado: 'ALERTA' };
        this.verFormAlerta = false;
        alert('✅ Alerta reportada correctamente');
      },
      error: (err) => {
        console.error('❌ Error al crear alerta:', err);
        alert('❌ Error al reportar alerta');
      }
    });
  }

  cambiarEstado(id: any, nuevoEstado: string, observacion: string): void {
    this.alertaService.actualizar(id, { estado: nuevoEstado } as Alerta).subscribe({
      next: () => {
        console.log(`✅ Alerta ${id} cambiada a ${nuevoEstado}`);
        
        if (observacion && observacion.trim() !== '') {
          const opinion: OpinionPublica = {
            comentario: `[${nuevoEstado}] ${observacion}`,
            verificacion: true,
            fecha: new Date().toISOString(),
            alerta: { id: id } as Alerta,
            usuario: this.authService.obtenerUsuarioActual()!
          };
          
          this.opinionService.crear(opinion).subscribe({
            next: () => console.log('✅ Observación guardada en opiniones_publicas'),
            error: (err) => console.error('❌ Error al guardar observación:', err)
          });
        }
        
        this.cargarAlertas();
        alert(`✅ Alerta ${nuevoEstado === 'ATENCION' ? 'atendida' : 'resuelta'} correctamente`);
      },
      error: (err) => {
        console.error('❌ Error al cambiar estado:', err);
        alert('❌ Error al cambiar el estado de la alerta');
      }
    });
  }

  // =============================================
  // MÉTODOS PARA COMENTARIOS Y EVIDENCIA
  // =============================================

  verDetalleAlerta(alerta: Alerta) {
    const usuarioActual = this.authService.obtenerUsuarioActual();
    
    if (!this.esAdmin() && String((alerta as any).usuarioId) !== String(usuarioActual?.id)) {
      alert('❌ Solo puedes ver los detalles de tus propias alertas');
      return;
    }
    
    this.alertaSeleccionada = alerta;
    this.cargarComentarios(alerta.id!);
  }

  cerrarDetalles() {
    this.alertaSeleccionada = null;
    this.comentarios = [];
  }

  cargarComentarios(alertaId: any) {
    this.http.get<any[]>(`${this.apiUrl}/comentarios/alerta/${alertaId}`)
      .subscribe({
        next: (data) => {
          this.comentarios = data;
        },
        error: (err) => {
          console.error('Error cargando comentarios:', err);
          this.comentarios = [];
        }
      });
  }

  seleccionarEvidencia(event: any) {
    this.evidenciaSeleccionada = Array.from(event.target.files);
    this.evidenciaPreviews = [];
    this.evidenciaSeleccionada.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.evidenciaPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  agregarComentario() {
    if (!this.nuevoComentarioTexto.trim()) {
      alert('❌ Escribe un comentario');
      return;
    }
    
    const promesas = this.evidenciaSeleccionada.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e: any) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(promesas).then(imagenes => {
      const nuevoComentario = {
        texto: this.nuevoComentarioTexto,
        autorNombre: this.obtenerNombreUsuario(),
        autorRol: this.esAdmin() ? 'ADMIN' : 'CIUDADANO',
        alertaId: this.alertaSeleccionada!.id!,
        imagenesUrls: JSON.stringify(imagenes)
      };
      
      this.http.post(`${this.apiUrl}/comentarios`, nuevoComentario)
        .subscribe({
          next: () => {
            this.nuevoComentarioTexto = '';
            this.evidenciaSeleccionada = [];
            this.evidenciaPreviews = [];
            this.cargarComentarios(this.alertaSeleccionada!.id!);
            alert('✅ Comentario guardado');
          },
          error: (err) => {
            console.error('Error al guardar comentario:', err);
            alert('❌ Error al guardar comentario');
          }
        });
    });
  }

  verImagenGrande(imagenUrl: string) {
    window.open(imagenUrl, '_blank');
  }

  parseImagenesUrls(urls: string): string[] {
    if (!urls) return [];
    try {
      const parsed = JSON.parse(urls);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}