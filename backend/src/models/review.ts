export interface Review {
  id: number;
  garaje_id: number;
  usuario_id: number;
  calificacion: number;
  comentario?: string;
  fecha_creacion: string;
}