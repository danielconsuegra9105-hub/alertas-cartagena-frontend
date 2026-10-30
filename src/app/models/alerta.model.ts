export interface Alerta {
  id?: string; // 🌟 Cambiado de number a string
  titulo: string;
  descripcion: string;
  estado: string;
  ubicacionTexto: string;
  latitud: number;
  longitud: number;
  fechaHoraCreacion?: string;
  fechaHoraAtencion?: string;
  fechaHoraResolucion?: string;
  usuario?: Usuario;
  usuarioId?: string; // 🌟 Añadido para que coincida con el backend
  tipoEmergencia?: TipoEmergencia;
  ciudad?: Ciudad;
}

export interface Usuario {
  id?: string; // 🌟 Cambiado de number a string
  nombre: string;
  correo: string;
  telefono: string;
  password: string;
  rol: string;
  fechaRegistro?: string;
}

export interface Ciudad {
  id?: string;
  nombre: string;
  departamento: string;
}

export interface TipoEmergencia {
  id?: string;
  nombre: string;
  descripcion: string;
}

export interface OpinionPublica {
  id?: string;
  comentario: string;
  verificacion: boolean;
  fecha?: string;
  alerta?: Alerta;
  usuario?: Usuario;
}

// Comentario para alertas (con evidencia)
export interface Comentario {
  id?: string;
  texto: string;
  fecha: string;
  autorNombre: string;
  autorRol: string;
  alertaId: string; // 🌟 Cambiado a string
  imagenesUrls?: string;
}