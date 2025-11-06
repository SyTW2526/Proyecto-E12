export interface Resena {
  id: number;
  propietario_id: number;
  garaje_id: number;
  calificacion: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  fecha_creacion: Date
}