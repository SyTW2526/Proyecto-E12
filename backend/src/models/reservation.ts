export interface Reservation {
  id: number;
  usuario_id: number;
  garaje_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'pendiente' | 'activa' | 'completada' | 'cancelada';
}