export interface Alerta {
  id?: string;
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
  usuarioId?: string;
  tipoEmergencia?: TipoEmergencia;
  ciudad?: Ciudad;
}

export interface Usuario {
  id?: string;
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

// 🌟 ACTUALIZADO: Ahora usa IDs simples para evitar errores de DBRef en Mongo
export interface OpinionPublica {
  id?: string;
  comentario: string;
  verificacion: boolean;
  fecha?: string;
  alertaId?: string;      // ID de la alerta como string
  usuarioId?: string;     // ID del usuario como string
  usuarioNombre?: string; // Nombre del usuario para mostrarlo fácil
  imagenesUrls?: string;
}

// Comentario para alertas (con evidencia) - Ya no se usa pero lo dejo por si acaso
export interface Comentario {
  id?: string;
  texto: string;
  fecha: string;
  autorNombre: string;
  autorRol: string;
  alertaId: string;
  imagenesUrls?: string;
}